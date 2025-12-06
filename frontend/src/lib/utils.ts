import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDay(timestamp: number) {
  const date = new Date(timestamp * 1000);

  const day = date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });

  return day.charAt(0).toUpperCase() + day.slice(1);
}
