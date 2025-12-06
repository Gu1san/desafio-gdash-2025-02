import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({
  timestamps: true,
})
export class WeatherLog {
  @Prop()
  city?: string;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop({ type: Object })
  current?: Record<string, any>;

  @Prop({ type: [Object] })
  hourly?: Record<string, any>[];

  @Prop({ type: [Object] })
  daily?: Record<string, any>[];

  @Prop({ type: Object })
  raw?: any;

  @Prop()
  source?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
