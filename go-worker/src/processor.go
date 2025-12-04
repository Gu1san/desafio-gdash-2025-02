package main

import (
	"errors"
	"strconv"
	"time"
)

// WeatherPayload representa o corpo que enviaremos ao NestJS
type WeatherPayload struct {
    City               string  `json:"city,omitempty"`
    Latitude           float64 `json:"latitude,omitempty"`
    Longitude          float64 `json:"longitude,omitempty"`
    Timestamp          int64   `json:"timestamp,omitempty"`
    Temperature        float64 `json:"temperature"`
    Humidity           float64 `json:"humidity"`
    WindSpeed          float64 `json:"wind_speed"`
    CloudCover         float64 `json:"cloud_cover"`
    Precipitation      float64 `json:"precipitation"`
    ApparentTemperature float64 `json:"apparent_temperature"`
    Source             string  `json:"source,omitempty"`
    Raw                any     `json:"raw,omitempty"`
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
	wind, _ := getFloatKey("wind_speed")
	cloud, _ := getFloatKey("cloud_cover")
	precip, _ := getFloatKey("precipitation")
	apparent, _ := getFloatKey("apparent_temperature")

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
		WindSpeed:   wind,
		CloudCover:  cloud,
		Precipitation: precip,
		ApparentTemperature: apparent,
		Source:      "python-producer",
		Raw:         raw,
	}

	return payload, nil
}
