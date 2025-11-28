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
			sleep := time.Duration(delay*(1<<uint(i-1))) * time.Second // backoff exponencial
			log.Printf("Aguardando %v antes da próxima tentativa...", sleep)
			time.Sleep(sleep)
		}
		err := postToNest(url, payload)
		if err == nil {
			return nil
		}
		lastErr = err
		log.Printf("Tentativa %d/%d falhou: %v", i+1, retries, err)
	}
	return fmt.Errorf("falha após %d tentativas: %w", retries, lastErr)
}

func postToNest(url string, payload *WeatherPayload) error {
	client := &http.Client{
		Timeout: time.Duration(getenvInt("HTTP_TIMEOUT_SECONDS", 10)) * time.Second,
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	// Se sua API exigir autenticação, adicione aqui: req.Header.Set("Authorization", "Bearer ...")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("POST para Nest OK (status %d).", resp.StatusCode)
		return nil
	}

	// Se status 4xx -> erro permanente (não retry local)
	if resp.StatusCode >= 400 && resp.StatusCode < 500 {
		return fmt.Errorf("erro permanente do servidor: %d", resp.StatusCode)
	}

	// 5xx -> erro temporário (retry local)
	return fmt.Errorf("status inesperado: %d", resp.StatusCode)
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
