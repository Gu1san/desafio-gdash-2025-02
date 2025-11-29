import { IsNumber, IsString } from "class-validator";

export class CreateWeatherLogDto {
  @IsNumber()
  temperature!: number;

  @IsNumber()
  humidity!: number;

  @IsString()
  source!: string;
}
