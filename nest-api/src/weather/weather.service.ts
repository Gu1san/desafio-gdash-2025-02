import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as json2csv from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherInsights } from './schemas/insights.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLog>,
    @InjectModel(WeatherInsights.name)
    private insightsModel: Model<WeatherInsights>,
  ) {}

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

    const validLogs = logs.filter(
      (l) =>
        l &&
        typeof l.temperature === 'number' &&
        typeof l.timestamp !== 'undefined',
    );

    if (validLogs.length === 0) {
      throw new Error('Nenhum registro válido encontrado para gerar insights.');
    }

    // ---- MOCK DE IA / PLACEHOLDER ----
    // Regra simples só para ter funcionamento real
    const avgTemp =
      logs.reduce((sum, l) => sum + l.temperature, 0) / logs.length;

    const rainDays = logs.filter((l) => l.rain > 0).length;
    const rainProb = Math.round((rainDays / logs.length) * 100);

    const hottest = validLogs.reduce((a, b) =>
      a.temperature > b.temperature ? a : b,
    );

    const ts = Number(hottest.timestamp);

    if (!ts || Number.isNaN(ts)) {
      throw new Error(`Timestamp inválido recebido: ${hottest.timestamp}`);
    }

    const date = new Date(ts * 1000).toISOString();

    const insights = await this.insightsModel.create({
      summary: `Temperatura média: ${avgTemp.toFixed(
        1,
      )}°C. Probabilidade de chuva: ${rainProb}%.`,
      hottestDay: new Date(date).toISOString(),
      rainProbability: rainProb,
      tempTrend: avgTemp >= 25 ? 'Alta' : avgTemp >= 18 ? 'Moderada' : 'Baixa',
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
      'rain',
      'wind_speed',
      'cloud_cover',
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
      { header: 'Rain', key: 'rain', width: 10 },
      { header: 'Wind Speed', key: 'wind_speed', width: 12 },
      { header: 'Cloud Cover', key: 'cloud_cover', width: 12 },
      { header: 'Source', key: 'source', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];

    logs.forEach((log) => sheet.addRow(log));

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer };
  }
}
