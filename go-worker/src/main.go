package main

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	// Carrega .env para ambiente local
	_ = godotenv.Load()

	rabbitURL := getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	queue := getenv("QUEUE_NAME", "weather.raw")
	nestURL := getenv("NEST_API_URL", "http://nest-api:3000/api/weather")

	log.Printf("[Worker] Iniciando... Rabbit: %s | Queue: %s | Nest: %s\n",
		rabbitURL, queue, nestURL,
	)

	// Inicia o consumidor
	if err := StartConsumer(rabbitURL, queue, nestURL); err != nil {
		log.Fatalf("[Worker] Falha ao iniciar o consumer: %v", err)
	}
}

// ----------------------------------------------------------------------------
// Funções auxiliares
// ----------------------------------------------------------------------------

func connectWithRetry(url string) (*amqp.Connection, error) {
	var conn *amqp.Connection
	var err error

	for i := 1; i <= 10; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			log.Println("[RabbitMQ] Conectado com sucesso!")
			return conn, nil
		}

		log.Printf("[RabbitMQ] Não disponível (tentativa %d/10). Retentando em 3s...", i)
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
