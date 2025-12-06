import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudMoon,
  CloudMoonRain,
  CloudSunRain,
} from "lucide-react";
import { cloneElement } from "react";
import type { JSX } from "react";

interface WeatherIconProps {
  code: number;
  size?: number;
  className?: string;
}

const iconMap: Record<number, JSX.Element> = {
  0: <Sun />, // Céu limpo

  1: <CloudSun />, // Poucas nuvens
  2: <CloudSun />, // Parcialmente nublado
  3: <Cloud />, // Nublado

  45: <CloudFog />, // Nevoeiro
  48: <CloudFog />, // Nevoeiro com gelo

  51: <CloudDrizzle />, // Garoa
  53: <CloudDrizzle />,
  55: <CloudDrizzle />,
  56: <CloudHail />, // Garoa congelante (aprox)
  57: <CloudHail />,

  61: <CloudRain />, // Chuva leve
  63: <CloudRain />, // Chuva moderada
  65: <CloudRain />, // Chuva forte

  66: <CloudHail />, // Chuva congelante
  67: <CloudHail />,

  71: <CloudSnow />, // Neve
  73: <CloudSnow />,
  75: <CloudSnow />,
  77: <CloudSnow />, // Grãos de neve

  80: <CloudSunRain />, // Pancadas leves
  81: <CloudSunRain />, // Pancadas moderadas
  82: <CloudSunRain />, // Pancadas fortes

  85: <CloudSnow />, // Neve forte
  86: <CloudSnow />,

  95: <CloudLightning />, // Trovoada
  96: <CloudLightning />, // Trovoada com granizo
  99: <CloudLightning />,
};

export default function WeatherIcon({
  code,
  size = 32,
  className = "",
}: WeatherIconProps) {
  const icon = iconMap[code] ?? <Cloud />;
  return (
    <div className={`text-gray-700 dark:text-gray-200 ${className}`}>
      {cloneElement(icon, { size })}
    </div>
  );
}
