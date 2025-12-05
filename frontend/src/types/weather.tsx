export interface IAIInsights {
  summary: string;
  hottestDay: string;
  precipitation: string;
  tempTrend: string;
}

export interface IWeatherLog {
  _id: string;
  city: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  precipitation: number;
  apparent_temperature: number;
  createdAt: string;
}

export interface IWeatherHour {
  timestamp: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  precipitation: number;
  apparent_temperature: number;
}

export interface IWeatherForecastResponse {
  city: string;
  latitude: number;
  longitude: number;
  hours: IWeatherHour[];
}
