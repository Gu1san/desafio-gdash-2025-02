FROM golang:1.20-alpine AS builder

# Criar diretório de build
WORKDIR /app

# Copiar go.mod e go.sum para baixar dependências antes do resto
COPY go.mod go.sum ./
RUN go mod download

# Copiar todo o código do worker
COPY . .

# Entra na pasta onde está o main.go
WORKDIR /app/src

# Compila o binário
RUN go build -o /go-worker .

# ---------------------------
# Runtime image
# ---------------------------
FROM alpine:3.18
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copiar binário
COPY --from=builder /go-worker /app/go-worker

# Expor porta somente se o worker tiver HTTP (provavelmente não tem)
EXPOSE 8080

CMD ["/app/go-worker"]
