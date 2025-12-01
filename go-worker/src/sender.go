package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func PostToNestWithRetry(url string, payload *WeatherPayload) error {
	retries := getenvInt("POST_RETRIES", 3)
	delay := getenvInt("POST_RETRY_DELAY_SECONDS", 2)

	var lastErr error
	for i := 0; i < retries; i++ {

		if i > 0 {
			sleep := time.Duration(delay*(1<<uint(i-1))) * time.Second
			log.Printf("[NestRetry] Aguardando %v antes da próxima tentativa...", sleep)
			time.Sleep(sleep)
		}

		if err := postToNest(url, payload); err == nil {
			return nil
		} else {
			lastErr = err
			log.Printf("[NestRetry] Tentativa %d/%d falhou: %v", i+1, retries, err)
		}
	}

	return fmt.Errorf("falha após %d tentativas: %w", retries, lastErr)
}

func postToNest(url string, payload *WeatherPayload) error {
	client := &http.Client{
		Timeout: time.Duration(getenvInt("HTTP_TIMEOUT_SECONDS", 10)) * time.Second,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("[Nest] OK %d", resp.StatusCode)
		return nil
	}

	if resp.StatusCode >= 400 && resp.StatusCode < 500 {
		return fmt.Errorf("erro permanente: %d", resp.StatusCode)
	}

	return fmt.Errorf("erro temporário: %d", resp.StatusCode)
}

func getenvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
