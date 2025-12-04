import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  latitude!: number;

  @Prop({ required: true })
  longitude!: number;

  @Prop({ required: true })
  timestamp!: number;

  @Prop({ required: true })
  temperature!: number;

  @Prop({ required: true })
  humidity!: number;

  @Prop({ required: true })
  wind_speed!: number;

  @Prop({ required: true })
  cloud_cover!: number;

  @Prop({ required: true })
  precipitation!: number;

  @Prop({ required: true })
  apparent_temperature!: number;

  @Prop({ required: true })
  source!: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
