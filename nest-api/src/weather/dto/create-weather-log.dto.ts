import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateWeatherLogDto {
  @IsString()
  city!: string;

  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @Type(() => Number)
  @IsNumber()
  timestamp!: number;

  @Type(() => Number)
  @IsNumber()
  temperature!: number;

  @Type(() => Number)
  @IsNumber()
  humidity!: number;

  @Type(() => Number)
  @IsNumber()
  rain!: number;

  @Type(() => Number)
  @IsNumber()
  wind_speed!: number;

  @Type(() => Number)
  @IsNumber()
  cloud_cover!: number;

  @IsString()
  source!: string;

  @IsOptional()
  @IsObject()
  raw?: any;
}
