package main

import (
	"errors"
	"fmt"
	"time"
)

// WeatherPayload representa o corpo que enviaremos ao NestJS
type WeatherPayload struct {
	City       string  `json:"city,omitempty"`
	Latitude   float64 `json:"latitude,omitempty"`
	Longitude  float64 `json:"longitude,omitempty"`
	Timestamp  int64   `json:"timestamp,omitempty"` // epoch
	Temperature float64 `json:"temperature,omitempty"`
	Humidity    float64 `json:"humidity,omitempty"`
	Rain        float64 `json:"rain,omitempty"`
	WindSpeed   float64 `json:"wind_speed,omitempty"`
	CloudCover  float64 `json:"cloud_cover,omitempty"`
	Source      string  `json:"source,omitempty"`
	Raw         any     `json:"raw,omitempty"` // opcional: guarda raw para debug
}

// ProcessWeather valida e normaliza o raw recebido do Python
func ProcessWeather(raw map[string]interface{}) (*WeatherPayload, error) {
	// Exemplo: extrair campos e converter tipos com segurança
	getFloat := func(key string) (float64, bool) {
		v, ok := raw[key]
		if !ok || v == nil {
			return 0, false
		}
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
			// tenta parse simplificado (não implementado aqui)...
			return 0, false
		default:
			return 0, false
		}
	}

	// city
	city := ""
	if v, ok := raw["city"].(string); ok {
		city = v
	}

	lat, _ := getFloat("latitude")
	lon, _ := getFloat("longitude")
	temp, hasTemp := getFloat("temperature")
	humidity, _ := getFloat("humidity")
	rain, _ := getFloat("rain")
	wind, _ := getFloat("wind_speed")
	cloud, _ := getFloat("cloud_cover")

	// timestamp: pode vir como número (epoch) ou string. Tratamos o caso numérico.
	var ts int64
	if t, ok := raw["timestamp"].(float64); ok {
		ts = int64(t)
	} else if t, ok := raw["timestamp"].(int64); ok {
		ts = t
	} else {
		// se não existir timestamp, atribui agora
		ts = time.Now().Unix()
	}

	// validação simples: temperatura e latitude/longitude são importantes
	if !hasTemp {
		return nil, errors.New("campo 'temperature' ausente ou inválido")
	}
	if lat == 0 && lon == 0 {
		// permite mas avisa
		return nil, fmt.Errorf("latitude/longitude ausentes ou zero")
	}

	payload := &WeatherPayload{
		City:        city,
		Latitude:    lat,
		Longitude:   lon,
		Timestamp:   ts,
		Temperature: temp,
		Humidity:    humidity,
		Rain:        rain,
		WindSpeed:   wind,
		CloudCover:  cloud,
		Source:      "python-producer",
		Raw:         raw,
	}

	return payload, nil
}
