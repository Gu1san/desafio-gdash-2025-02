import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateWeatherLogDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  current?: Record<string, any>; // ou interface específica

  @IsOptional()
  @IsArray()
  @Type(() => Object)
  @IsObject({ each: true })
  hourly?: any[];

  @IsOptional()
  @IsArray()
  @Type(() => Object)
  @IsObject({ each: true })
  daily?: any[];

  // 🔹 Payload completo bruto
  @IsOptional()
  @IsObject()
  raw?: any;

  @IsOptional()
  @IsString()
  source?: string;
}
