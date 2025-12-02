import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherInsights extends Document {
  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  hottestDay!: string;

  @Prop({ required: true })
  rainProbability!: number;

  @Prop({ required: true })
  tempTrend!: string;
}

export const WeatherInsightsSchema =
  SchemaFactory.createForClass(WeatherInsights);
