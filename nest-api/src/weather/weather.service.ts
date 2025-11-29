import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WeatherLog } from "./schemas/weather-log.schema";
import { CreateWeatherLogDto } from "./dto/create-weather-log.dto";

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLog>
  ) {}

  async create(dto: CreateWeatherLogDto): Promise<WeatherLog> {
    return this.weatherModel.create(dto);
  }

  async findAll(): Promise<WeatherLog[]> {
    return this.weatherModel.find().exec();
  }
}
