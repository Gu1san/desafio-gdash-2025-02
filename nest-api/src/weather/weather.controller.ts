import { Controller, Get, Post, Body } from "@nestjs/common";
import { WeatherService } from "./weather.service";
import { CreateWeatherLogDto } from "./dto/create-weather-log.dto";
import { WeatherLog } from "./schemas/weather-log.schema";

@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post("logs")
  async createLog(@Body() dto: CreateWeatherLogDto): Promise<WeatherLog> {
    return this.weatherService.create(dto);
  }

  @Get("logs")
  async findAll(): Promise<WeatherLog[]> {
    return this.weatherService.findAll();
  }
}
