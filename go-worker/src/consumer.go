package main

import (
	"encoding/json"
	"log"
	"time"
)

// StartConsumer conecta no RabbitMQ e começa a consumir mensagens
func StartConsumer(amqpURL, queueName, nestURL string) error {
	conn, err := connectWithRetry(amqpURL)
	if err != nil {
		return err
	}

	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	// Garante que a fila existe
	_, err = ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	msgs, err := ch.Consume(
		queueName,
		"",
		false, // autoAck = false -> ack manual
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

		// Parse
		var raw map[string]interface{}
		if err := json.Unmarshal(d.Body, &raw); err != nil {
			log.Printf("JSON inválido: %v. NACK sem requeue.", err)
			_ = d.Nack(false, false)
			continue
		}

		// Normalização
		normalized, err := ProcessWeather(raw)
		if err != nil {
			log.Printf("Validação falhou: %v. NACK sem requeue.", err)
			_ = d.Nack(false, false)
			continue
		}

		// 1️⃣ PRIMEIRO: Envia pro Nest (com retry)
		err = PostToNestWithRetry(nestURL, normalized)
		if err != nil {
			log.Printf("Falha ao enviar para NestAPI: %v. NACK com requeue.", err)
			_ = d.Nack(false, true)
			continue
		}

		log.Println("✔ Nest recebeu os dados com sucesso. Prosseguindo para outras rotas...")

		// 2️⃣ DEPOIS: processa outras rotas
		err = processOtherRoutes(normalized)
		if err != nil {
			log.Printf("Erro ao processar outras rotas: %v", err)
			// Aqui você decide:
			// - Ou ignora (não requeue) porque o Nest já recebeu
			// - Ou manda para DLQ manual
			// - Ou só loga e segue
		}

		// ACK final
		if err := d.Ack(false); err != nil {
			log.Printf("Erro no ACK: %v", err)
		} else {
			log.Println("Mensagem marcada como processada (ACK).")
		}

		time.Sleep(100 * time.Millisecond)
	}

	return nil
}
