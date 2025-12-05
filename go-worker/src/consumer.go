package main

import (
	"encoding/json"
	"log"
	"time"
)

func StartConsumer(amqpURL, queueName, nestURL string) error {
	conn, err := connectWithRetry(amqpURL)
	if err != nil {
		return err
	}

	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	_, err = ch.QueueDeclare(queueName, true, false, false, false, nil)
	if err != nil {
		return err
	}

	msgs, err := ch.Consume(
		queueName,
		"",
		false, // manual ack
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	log.Println("Consumer iniciado. Aguardando mensagens...")

	for d := range msgs {
		log.Printf("Mensagem recebida: %s", string(d.Body))

		var raw map[string]interface{}
		if err := json.Unmarshal(d.Body, &raw); err != nil {
			log.Printf("JSON inválido: %v", err)
			_ = d.Nack(false, false)
			continue
		}

		normalized, err := ProcessWeather(raw)
		if err != nil {
			log.Printf("Erro ao processar weather: %v", err)
			_ = d.Nack(false, false)
			continue
		}

		// Envia ao Nest
		err = PostToNestWithRetry(nestURL, normalized)
		if err != nil {
			log.Printf("Falha ao enviar ao Nest: %v", err)
			_ = d.Nack(false, true)
			continue
		}

		log.Println("✔ Dados enviados ao Nest com sucesso.")

		// outras rotas poderiam vir aqui…

		_ = d.Ack(false)
		time.Sleep(50 * time.Millisecond)
	}

	return nil
}
