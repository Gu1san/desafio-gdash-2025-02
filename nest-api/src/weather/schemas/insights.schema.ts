import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherInsights extends Document {
  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  hottestDay!: string;

  @Prop({ required: true })
  precipitation!: number;

  @Prop({ required: true })
  tempTrend!: string;

  @Prop({ required: true })
  apparentTemperature!: number;
}

export const WeatherInsightsSchema =
  SchemaFactory.createForClass(WeatherInsights);
