package main

import "log"

// Aqui você coloca qualquer outra operação que ocorre DEPOIS do Nest receber os dados.
func processOtherRoutes(payload *WeatherPayload) error {

	log.Println("Executando rotas adicionais...")

	// Exemplos:
	// - enviar para outro microserviço
	// - publicar em outra fila
	// - salvar em outra base de dados
	// - enviar para analytics

	// no momento, só log
	log.Printf("Dados recebidos para rotas adicionais: %+v", payload)

	return nil
}
