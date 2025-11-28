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
	// Não fechamos a conexão aqui: deixamos o processo rodando
	ch, err := conn.Channel()
	if err != nil {
		return err
	}

	// Garante que a fila existe
	_, err = ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return err
	}

	msgs, err := ch.Consume(
		queueName,
		"",    // consumer
		false, // autoAck = false -> faremos ack manual
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,
	)
	if err != nil {
		return err
	}

	log.Println("Consumer iniciado. Aguardando mensagens...")

	// Processa mensagens sequencialmente (para começar). Para paralelismo, roda workers em goroutines.
	for d := range msgs {
		log.Printf("Mensagem recebida: %s", string(d.Body))

		// Parse JSON -> model intermediário
		var raw map[string]interface{}
		if err := json.Unmarshal(d.Body, &raw); err != nil {
			log.Printf("JSON inválido: %v. NACK sem requeue.", err)
			_ = d.Nack(false, false) // erro permanente: descarta ou vai para DLQ
			continue
		}

		// Validação / transformação
		normalized, err := ProcessWeather(raw)
		if err != nil {
			log.Printf("Validação falhou: %v. NACK sem requeue.", err)
			_ = d.Nack(false, false)
			continue
		}

		// Envia para API NestJS (com retry local)
		err = PostToNestWithRetry(nestURL, normalized)
		if err != nil {
			// após retries locais, se ainda falhar, Nack com requeue pra tentar novamente
			log.Printf("Falha ao enviar para NestAPI: %v. NACK com requeue.", err)
			_ = d.Nack(false, true)
			continue
		}

		// Se tudo ok, confirma a mensagem
		if err := d.Ack(false); err != nil {
			log.Printf("Erro no ACK: %v", err)
			// não sabemos o estado, mas já enviamos pra API; em caso extremo, duplicação pode ocorrer
		} else {
			log.Println("Mensagem processada com sucesso e ACK enviada.")
		}

		// Pequena pausa para evitar burst (opcional)
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}
