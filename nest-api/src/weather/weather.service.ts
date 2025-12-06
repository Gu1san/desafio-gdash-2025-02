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

  async getLatest(): Promise<WeatherLog | null> {
    return this.weatherModel.findOne().sort({ createdAt: -1 }).lean();
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
    const logs = await this.getLatest();
    if (logs == null) return { error: 'No data available yet' };

    if (!logs.current) throw new Error("Registro não possui bloco 'current'.");

    if (!logs.hourly || !Array.isArray(logs.hourly))
      throw new Error("Registro não possui bloco 'hourly' válido.");

    if (!logs.daily || !Array.isArray(logs.daily))
      throw new Error("Registro não possui bloco 'daily' válido.");

    /* ============================================================
      1) NORMALIZAÇÃO DO DATASET PARA A IA
     ============================================================ */

    const currentData = {
      timestamp: logs.current.timestamp,
      temperature: logs.current.temperature,
      humidity: logs.current.humidity,
      wind_speed: logs.current.wind_speed,
      cloud_cover: logs.current.cloud_cover,
      precipitation: logs.current.precipitation,
      apparent_temperature: logs.current.apparent_temperature,
    };

    const hourlyData = logs.hourly.map((h: any) => ({
      timestamp: h.timestamp,
      temperature: h.temperature,
      humidity: h.humidity,
      wind_speed: h.wind_speed,
      cloud_cover: h.cloud_cover,
      precipitation: h.precipitation,
      apparent_temperature: h.apparent_temperature,
    }));

    const dailyData = logs.daily.map((d: any) => ({
      timestamp: d.timestamp,
      temp_max: d.temp_max,
      temp_min: d.temp_min,
      weather_code: d.weather_code,
      weather_description: d.weather_description,
    }));

    /* ============================================================
      2) MONTA PROMPT PARA A IA
     ============================================================ */

    const dataForAI = {
      city: logs.city,
      current: currentData,
      hourly: hourlyData,
      daily: dailyData,
    };

    const prompt = `
    Você é um especialista em climatologia.
    Gere insights úteis e acionáveis com base no dataset abaixo.

    Retorne APENAS um JSON no formato:

    {
      "summary": string,
      "hottestDay": string,
      "precipitation": number,
      "tempTrend": "Alta" | "Moderada" | "Baixa",
      "apparentTemperature": number
    }

    DATASET:
    ${JSON.stringify(dataForAI, null, 2)}
  `;

    /* ============================================================
      3) CHAMADA PARA OPENAI
     ============================================================ */

    const aiResponse = await this.openai.chat.completions.create({
      model: process.env.MODEL_WEATHER ?? 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = aiResponse?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI response has no textual content to parse.');
    }

    const parsed = JSON.parse(content);

    /* ============================================================
      4) SALVA NO BANCO
     ============================================================ */

    const insights = await this.insightsModel.create({
      summary: parsed.summary,
      hottestDay: parsed.hottestDay,
      precipitation: parsed.precipitation,
      tempTrend: parsed.tempTrend,
      apparentTemperature: parsed.apparentTemperature,
    });

    return insights;
  }

  async exportCsv(): Promise<string> {
    const logs = await this.weatherModel.find().lean();

    const flattened: any[] = [];

    logs.forEach((log) => {
      // CURRENT
      if (log.current) {
        flattened.push({
          type: 'current',
          city: log.city,
          latitude: log.latitude,
          longitude: log.longitude,
          timestamp: log.current.timestamp,
          temperature: log.current.temperature,
          humidity: log.current.humidity,
          wind_speed: log.current.wind_speed,
          cloud_cover: log.current.cloud_cover,
          precipitation: log.current.precipitation,
          apparent_temperature: log.current.apparent_temperature,
          source: 'current',
          createdAt: log.createdAt,
        });
      }

      // HOURLY
      log.hourly?.forEach((item: any) => {
        flattened.push({
          type: 'hourly',
          city: log.city,
          latitude: log.latitude,
          longitude: log.longitude,
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity,
          wind_speed: item.wind_speed,
          cloud_cover: item.cloud_cover,
          precipitation: item.precipitation,
          apparent_temperature: item.apparent_temperature,
          source: 'hourly',
          createdAt: log.createdAt,
        });
      });

      // DAILY
      log.daily?.forEach((item: any) => {
        flattened.push({
          type: 'daily',
          city: log.city,
          latitude: log.latitude,
          longitude: log.longitude,
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity,
          wind_speed: item.wind_speed,
          cloud_cover: item.cloud_cover,
          precipitation: item.precipitation,
          apparent_temperature: item.apparent_temperature,
          source: 'daily',
          createdAt: log.createdAt,
        });
      });
    });

    const fields = [
      'type',
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

    return json2csv.parse(flattened, { fields });
  }

  async exportXlsx() {
    const logs = await this.weatherModel.find().lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weather Data');

    sheet.columns = [
      { header: 'Type', key: 'type', width: 10 },
      { header: 'City', key: 'city', width: 18 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Timestamp', key: 'timestamp', width: 18 },
      { header: 'Temperature', key: 'temperature', width: 14 },
      { header: 'Humidity', key: 'humidity', width: 12 },
      { header: 'Wind Speed', key: 'wind_speed', width: 14 },
      { header: 'Cloud Cover', key: 'cloud_cover', width: 14 },
      { header: 'Precipitation', key: 'precipitation', width: 14 },
      { header: 'Apparent Temp', key: 'apparent_temperature', width: 16 },
      { header: 'Source', key: 'source', width: 14 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];

    logs.forEach((log) => {
      // CURRENT
      if (log.current) {
        sheet.addRow({
          type: 'current',
          city: log.city,
          latitude: log.latitude,
          longitude: log.longitude,
          timestamp: log.current.timestamp,
          temperature: log.current.temperature,
          humidity: log.current.humidity,
          wind_speed: log.current.wind_speed,
          cloud_cover: log.current.cloud_cover,
          precipitation: log.current.precipitation,
          apparent_temperature: log.current.apparent_temperature,
          source: 'current',
          createdAt: log.createdAt,
        });
      }

      // HOURLY
      log.hourly?.forEach((item: any) =>
        sheet.addRow({
          type: 'hourly',
          city: log.city,
          latitude: log.latitude,
          longitude: log.longitude,
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity,
          wind_speed: item.wind_speed,
          cloud_cover: item.cloud_cover,
          precipitation: item.precipitation,
          apparent_temperature: item.apparent_temperature,
          source: 'hourly',
          createdAt: log.createdAt,
        }),
      );

      // DAILY
      log.daily?.forEach((item: any) =>
        sheet.addRow({
          type: 'daily',
          city: log.city,
          latitude: log.latitude,
          longitude: log.longitude,
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity,
          wind_speed: item.wind_speed,
          cloud_cover: item.cloud_cover,
          precipitation: item.precipitation,
          apparent_temperature: item.apparent_temperature,
          source: 'daily',
          createdAt: log.createdAt,
        }),
      );
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer };
  }
}
