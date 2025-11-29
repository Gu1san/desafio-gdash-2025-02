import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  temperature!: number;

  @Prop({ required: true })
  humidity!: number;

  @Prop({ required: true })
  source!: string; // python-producer, go-worker, api-external…
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
