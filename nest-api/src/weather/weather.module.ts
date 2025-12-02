import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import {
  WeatherInsights,
  WeatherInsightsSchema,
} from './schemas/insights.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
      { name: WeatherInsights.name, schema: WeatherInsightsSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
