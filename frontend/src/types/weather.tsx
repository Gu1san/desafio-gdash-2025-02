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
  current: IWeatherCurrent;
  hourly: IWeatherHour[];
  daily: IWeatherDay[];
}

export interface IWeatherCurrent {
  apparent_temperature: number;
  humidity: number;
  temperature: number;
  timestamp: number;
  weather_code: number;
  weather_description: string;
  wind_speed: number;
}

export interface IWeatherHour {
  apparent_temperature: number;
  cloud_cover: number;
  humidity: number;
  precipitation: number;
  temperature: number;
  timestamp: number;
  weather_code: number;
  weather_description: string;
  wind_speed: number;
}

export interface IWeatherDay {
  temp_max: number;
  temp_min: number;
  timestamp: number;
  weather_code: number;
  weather_description: string;
}

export interface IWeatherForecastResponse {
  city: string;
  latitude: number;
  longitude: number;
  hours: IWeatherHour[];
}
