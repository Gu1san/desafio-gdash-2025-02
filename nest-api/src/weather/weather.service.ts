import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as json2csv from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherInsights } from './schemas/insights.schema';
import OpenAI from 'openai';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLog>,
    @InjectModel(WeatherInsights.name)
    private insightsModel: Model<WeatherInsights>,
  ) {}

  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  async create(dto: CreateWeatherLogDto): Promise<WeatherLog> {
    return this.weatherModel.create(dto);
  }

  async findAll(): Promise<WeatherLog[]> {
    return this.weatherModel.find().exec();
  }

  async getInsights() {
    const last = await this.insightsModel
      .findOne()
      .sort({ createdAt: -1 })
      .lean();
    if (last) return last;
    return this.generateInsights(); // se não existe, gera
  }

  async generateInsights() {
    const logs = await this.weatherModel.find().lean();
    if (!logs.length) return { error: 'No data available yet' };

    // Mantém apenas registros válidos contendo "current"
    const validLogs = logs.filter(
      (l) =>
        l &&
        l.current &&
        typeof l.current.temperature === 'number' &&
        typeof l.current.timestamp !== 'undefined',
    );

    if (validLogs.length === 0) {
      throw new Error('Nenhum registro válido encontrado para gerar insights.');
    }

    // Prepara dataset que será enviado para a IA
    const dataForAI = validLogs.map((l) => ({
      city: l.city,
      timestamp: l.current!.timestamp,
      temperature: l.current!.temperature,
      humidity: l.current!.humidity,
      wind_speed: l.current!.wind_speed,
      cloud_cover: l.current!.cloud_cover,
      precipitation: l.current!.precipitation,
      apparent_temperature: l.current!.apparent_temperature,
    }));

    const prompt = `
    Você é um especialista em climatologia.
    Com base no dataset abaixo, gere insights acionáveis.

    Retorne APENAS um JSON no seguinte formato:

    {
      "summary": string,
      "hottestDay": string (ISO date),
      "precipitation": number,
      "tempTrend": "Alta" | "Moderada" | "Baixa",
      "apparentTemperature": number
    }

    DATASET:
    ${JSON.stringify(dataForAI, null, 2)}
  `;

    const aiResponse = await this.openai.chat.completions.create({
      model: process.env.MODEL_WEATHER ?? 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = aiResponse?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI response has no textual content to parse.');
    }

    const insightsJSON = JSON.parse(content);

    const insights = await this.insightsModel.create({
      summary: insightsJSON.summary,
      hottestDay: insightsJSON.hottestDay,
      precipitation: insightsJSON.precipitation,
      tempTrend: insightsJSON.tempTrend,
      apparentTemperature: insightsJSON.apparentTemperature,
    });

    return insights;
  }

  async exportCsv(): Promise<string> {
    const logs = await this.weatherModel.find().lean();

    const fields = [
      'city',
      'latitude',
      'longitude',
      'timestamp',
      'temperature',
      'humidity',
      'wind_speed',
      'cloud_cover',
      'precipitation',
      'apparent_temperature',
      'source',
      'createdAt',
    ];

    return json2csv.parse(logs, { fields });
  }

  async exportXlsx() {
    const logs = await this.weatherModel.find().lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weather Data');

    sheet.columns = [
      { header: 'City', key: 'city', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Timestamp', key: 'timestamp', width: 15 },
      { header: 'Temperature', key: 'temperature', width: 14 },
      { header: 'Humidity', key: 'humidity', width: 10 },
      { header: 'Wind Speed', key: 'wind_speed', width: 12 },
      { header: 'Cloud Cover', key: 'cloud_cover', width: 12 },
      { header: 'Precipitation', key: 'precipitation', width: 10 },
      {
        header: 'Appearent Temperature',
        key: 'apparent_temperature',
        width: 12,
      },
      { header: 'Source', key: 'source', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];

    logs.forEach((log) => sheet.addRow(log));

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer };
  }
}
