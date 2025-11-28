package main

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	// Load .env if present (local dev convenience)
	_ = godotenv.Load()

	rabbitURL := getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	queue := getenv("QUEUE_NAME", "weather.raw")
	nestURL := getenv("NEST_API_URL", "http://nest-api:3000/api/weather/logs")

	log.Printf("Worker starting. Rabbit: %s queue: %s -> Nest: %s\n", rabbitURL, queue, nestURL)

	// Start consumer
	err := StartConsumer(rabbitURL, queue, nestURL)
	if err != nil {
		log.Fatalf("failed to start consumer: %v", err)
	}
}

func connectWithRetry(url string) (*amqp.Connection, error) {
	var conn *amqp.Connection
	var err error

	for i := 1; i <= 10; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			return conn, nil
		}

		log.Printf("RabbitMQ não disponível ainda (tentativa %d/10)...", i)
		time.Sleep(3 * time.Second)
	}

	return nil, err
}


func getenv(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}
