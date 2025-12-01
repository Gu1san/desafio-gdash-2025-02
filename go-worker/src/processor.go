package main

import (
	"errors"
	"strconv"
	"time"
)

// WeatherPayload representa o corpo que enviaremos ao NestJS
type WeatherPayload struct {
	City        string  `json:"city,omitempty"`
	Latitude    float64 `json:"latitude,omitempty"`
	Longitude   float64 `json:"longitude,omitempty"`
	Timestamp   int64   `json:"timestamp,omitempty"`
	Temperature float64 `json:"temperature,omitempty"`
	Humidity    float64 `json:"humidity,omitempty"`
	Rain        float64 `json:"rain,omitempty"`
	WindSpeed   float64 `json:"wind_speed,omitempty"`
	CloudCover  float64 `json:"cloud_cover,omitempty"`
	Source      string  `json:"source,omitempty"`
	Raw         any     `json:"raw,omitempty"`
}

func ProcessWeather(raw map[string]interface{}) (*WeatherPayload, error) {

	getFloat := func(v any) (float64, bool) {
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
			return 0, false
		default:
			return 0, false
		}
	}

	getFloatKey := func(key string) (float64, bool) {
		if v, ok := raw[key]; ok {
			return getFloat(v)
		}
		return 0, false
	}

	city, _ := raw["city"].(string)
	lat, _ := getFloatKey("latitude")
	lon, _ := getFloatKey("longitude")
	temp, hasTemp := getFloatKey("temperature")
	humidity, _ := getFloatKey("humidity")
	rain, _ := getFloatKey("rain")
	wind, _ := getFloatKey("wind_speed")
	cloud, _ := getFloatKey("cloud_cover")

	// timestamp
	var ts int64
	switch t := raw["timestamp"].(type) {
	case float64:
		ts = int64(t)
	case int64:
		ts = t
	case string:
		parsed, err := strconv.ParseInt(t, 10, 64)
		if err == nil {
			ts = parsed
		}
	}
	if ts == 0 {
		ts = time.Now().Unix()
	}

	if !hasTemp {
		return nil, errors.New("campo 'temperature' ausente ou inválido")
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
