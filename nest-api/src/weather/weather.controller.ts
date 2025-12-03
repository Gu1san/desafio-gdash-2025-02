import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog } from './schemas/weather-log.schema';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async createLog(@Body() dto: CreateWeatherLogDto): Promise<WeatherLog> {
    return this.weatherService.create(dto);
  }

  @Get('logs')
  async findAll(): Promise<WeatherLog[]> {
    return this.weatherService.findAll();
  }

  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.weatherService.exportCsv();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.csv');
    res.send(csv);
  }

  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    const { buffer } = await this.weatherService.exportXlsx();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader('Content-Disposition', 'attachment; filename=weather.xlsx');
    res.send(buffer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('insights')
  async getInsights() {
    return this.weatherService.getInsights();
  }

  @Post('insights')
  async generateInsights() {
    return this.weatherService.generateInsights();
  }
}
