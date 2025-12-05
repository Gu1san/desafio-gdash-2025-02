package main

import (
	"errors"
	"strconv"
)

// ------------------------------
// Tradução dos códigos climáticos
// ------------------------------
var weatherTranslations = map[int]string{
	0:  "Céu limpo",
	1:  "Principalmente limpo",
	2:  "Parcialmente nublado",
	3:  "Nublado",
	45: "Nevoeiro",
	48: "Nevoeiro depositante",
	51: "Garoa leve",
	53: "Garoa moderada",
	55: "Garoa densa",
	61: "Chuva fraca",
	63: "Chuva moderada",
	65: "Chuva forte",
	71: "Neve leve",
	73: "Neve moderada",
	75: "Neve forte",
	77: "Granizo",
	80: "Aguaceiros fracos",
	81: "Aguaceiros moderados",
	82: "Aguaceiros fortes",
	95: "Tempestade",
	96: "Tempestade com granizo leve",
	99: "Tempestade com granizo forte",
}

func translateWeatherCode(code float64) string {
	return weatherTranslations[int(code)]
}

type WeatherPayload struct {
	City      string  `json:"city,omitempty"`
	Latitude  float64 `json:"latitude,omitempty"`
	Longitude float64 `json:"longitude,omitempty"`

	Current map[string]interface{}   `json:"current,omitempty"`
	Hourly  []map[string]interface{} `json:"hourly,omitempty"`
	Daily   []map[string]interface{} `json:"daily,omitempty"`

	Source string      `json:"source,omitempty"`
	Raw    interface{} `json:"raw,omitempty"`
}

// ------------------------------
// Helper para converter número
// ------------------------------
func getFloat(v any) (float64, bool) {
	switch t := v.(type) {
	case float64:
		return t, true
	case float32:
		return float64(t), true
	case int:
		return float64(t), true
	case int64:
		return float64(t), true
	case string:
		f, err := strconv.ParseFloat(t, 64)
		if err == nil {
			return f, true
		}
	}
	return 0, false
}

// -----------------------------------------------------------
// PROCESSADOR COMPLETO (current + hourly(24h) + daily + raw)
// -----------------------------------------------------------
func ProcessWeather(raw map[string]interface{}) (*WeatherPayload, error) {

	city, _ := raw["city"].(string)
	lat, _ := getFloat(raw["latitude"])
	lon, _ := getFloat(raw["longitude"])

	// ------------------------
	// CURRENT
	// ------------------------
	currentRaw, ok := raw["current"].(map[string]interface{})
	if !ok {
		return nil, errors.New("payload não contém bloco 'current'")
	}

	current := make(map[string]interface{})
	for k, v := range currentRaw {
		current[k] = v
	}
	// traduz códigos atuais
	if code, ok := current["weather_code"]; ok {
		if f, ok := getFloat(code); ok {
			current["weather_description"] = translateWeatherCode(f)
		}
	}

	// timestamp
	if tsRaw, ok := current["timestamp"]; ok {
		switch t := tsRaw.(type) {
		case float64:
			current["timestamp"] = int64(t)
		case int64:
			// já está ok
		case string:
			if parsed, err := strconv.ParseInt(t, 10, 64); err == nil {
				current["timestamp"] = parsed
			}
		}
	}

	// ------------------------
	// HOURLY — PRIMEIRAS 24H
	// ------------------------
	hourlyRaw, ok := raw["hourly"].([]interface{})
	if !ok {
		return nil, errors.New("payload não contém bloco 'hourly' no formato esperado")
	}

	hourly := make([]map[string]interface{}, 0, len(hourlyRaw))
	limit := 24
	for i, item := range hourlyRaw {
		if i >= limit {
			break
		}
		rec, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		// traduz códigos
		if code, ok := rec["weather_code"]; ok {
			if f, ok := getFloat(code); ok {
				rec["weather_description"] = translateWeatherCode(f)
			}
		}
		hourly = append(hourly, rec)
	}

	// ------------------------
	// DAILY
	// ------------------------
	dailyRaw, ok := raw["daily"].([]interface{})
	if !ok {
		return nil, errors.New("payload não contém bloco 'daily'")
	}

	daily := make([]map[string]interface{}, 0, len(dailyRaw))
	for _, item := range dailyRaw {
		rec, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		// traduz códigos
		if code, ok := rec["weather_code"]; ok {
			if f, ok := getFloat(code); ok {
				rec["weather_description"] = translateWeatherCode(f)
			}
		}
		daily = append(daily, rec)
	}

	// ------------------------
	// MONTAR PAYLOAD FINAL
	// ------------------------
	payload := &WeatherPayload{
		City:    city,
		Latitude:  lat,
		Longitude: lon,
		Current: current,
		Hourly:  hourly,
		Daily:   daily,
		Source:  "python-producer",
		Raw:     raw,
	}

	return payload, nil
}
