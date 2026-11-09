# Weather Dashboard

<p align="center">
  Dashboard meteorológico com processamento assíncrono, API REST e visualização de dados em tempo real.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/NestJS-Backend-E0234E?logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Go-Worker-00ADD8?logo=go&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-Producer-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerization-2496ED?logo=docker&logoColor=white" />
</p>

## Sobre o projeto

O **Weather Dashboard** é uma aplicação full-stack para coleta, processamento, armazenamento e visualização de informações meteorológicas.

O projeto utiliza uma arquitetura baseada em serviços independentes, integrando diferentes tecnologias para demonstrar um fluxo completo de processamento de dados: desde a obtenção de informações de uma API externa até sua disponibilização em um dashboard interativo.

Os dados meteorológicos são coletados pelo serviço Python, enviados para uma fila RabbitMQ e processados por um worker desenvolvido em Go. Em seguida, são encaminhados para uma API REST construída com NestJS, responsável pela persistência no MongoDB e pela disponibilização dos dados ao frontend.

O frontend, desenvolvido com React e TypeScript, apresenta informações climáticas, previsões e gráficos para facilitar a análise dos dados.

## Funcionalidades

### Dashboard meteorológico
- Visualização das condições meteorológicas atuais.
- Exibição da previsão para os próximos dias.
- Gráficos interativos de temperatura, umidade, velocidade do vento, precipitação e cobertura de nuvens.
- Visualização de dados meteorológicos coletados e armazenados pela aplicação.

### Exploração de dados
- Consulta de registros meteorológicos.
- Visualização de informações históricas.
- Análise de diferentes variáveis climáticas.

### Insights
- Exibição de análises e resumos meteorológicos.
- Identificação do dia com maior temperatura.
- Análise de tendências de temperatura e precipitação.
- Possibilidade de regenerar os insights.

### Exportação
- Exportação dos dados meteorológicos em CSV.
- Exportação em planilhas XLSX.

### Autenticação e gerenciamento
- Autenticação de usuários.
- Proteção de rotas e funcionalidades restritas.
- Área de gerenciamento de usuários.

## Arquitetura

A aplicação é dividida em serviços independentes, cada um com uma responsabilidade específica.

```mermaid
flowchart TD
    A["Open-Meteo API"] --> B["Python Producer"]
    B --> C["RabbitMQ"]
    C --> D["Go Worker"]
    D --> E["NestJS REST API"]
    E --> F[("MongoDB")]
    G["React + TypeScript"] --> E
    E --> G
    G --> H["Dashboard"]
```

### Fluxo de processamento

1. **Coleta:** o serviço Python consulta a API Open-Meteo e organiza as informações meteorológicas.
2. **Mensageria:** os dados coletados são publicados na fila `weather.raw`, utilizando RabbitMQ.
3. **Processamento:** o worker em Go consome as mensagens e encaminha os dados para a API NestJS.
4. **Persistência:** a API valida e armazena os registros meteorológicos no MongoDB.
5. **Disponibilização:** o frontend consulta a API REST e apresenta as informações em gráficos e componentes visuais.

A utilização de mensageria desacopla a coleta do processamento e da persistência, permitindo que os serviços trabalhem de forma independente.

O worker também possui mecanismo de novas tentativas para lidar com falhas temporárias durante o envio dos dados à API.

## Tecnologias utilizadas

| Tecnologia | Aplicação no projeto |
|---|---|
| React 19 | Construção da interface |
| TypeScript | Tipagem estática no frontend |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS 4 | Estilização |
| shadcn/ui e Radix UI | Componentes de interface |
| Recharts | Gráficos meteorológicos |
| Axios | Comunicação com a API |
| React Router | Navegação entre páginas |
| Python | Coleta de dados meteorológicos |
| Open-Meteo | Fonte dos dados climáticos |
| RabbitMQ | Mensageria e comunicação assíncrona |
| Go | Worker responsável pelo processamento das mensagens |
| NestJS | Construção da API REST |
| MongoDB | Persistência dos registros |
| Docker e Docker Compose | Containerização e orquestração dos serviços |

## Estrutura do projeto

```text
desafio-gdash-2025-02/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Contextos e gerenciamento de estado
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Comunicação com a API
│   │   ├── styles/           # Estilos
│   │   └── types/            # Tipagens TypeScript
│   └── package.json
│
├── python-producer/          # Coleta e publicação dos dados
│
├── go-worker/                # Consumo e processamento das mensagens
│
├── nest-api/                 # API REST e persistência
│
├── docker-compose.yml        # Orquestração dos serviços
└── README.md
```

## Como executar localmente

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (versão compatível com o Vite 7)
- npm
- Git

O Docker Desktop deve estar em execução.

### 1. Clonar o repositório

```bash
git clone https://github.com/Gu1san/desafio-gdash-2025-02.git

cd desafio-gdash-2025-02
```

### 2. Configurar as variáveis de ambiente

Crie o arquivo `.env` dentro de `nest-api/`:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/weatherdb

JWT_SECRET=seu_segredo_aleatorio
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=defina_uma_senha_segura

AI_ENABLED=false
LOG_LEVEL=debug
OPENAI_API_KEY=
MODEL_WEATHER=
```

Crie também `go-worker/.env`:

```env
RABBITMQ_URL=amqp://weather_user:weather_pass_dev@rabbitmq:5672/
QUEUE_NAME=weather.raw

NEST_API_URL=http://nest-api:3000/api/weather/logs

HTTP_TIMEOUT_SECONDS=10
POST_RETRIES=3
POST_RETRY_DELAY_SECONDS=2
```

As credenciais do RabbitMQ devem corresponder às configurações definidas no `docker-compose.yml`.

O produtor Python utiliza as seguintes variáveis de ambiente, configuradas pelo Docker Compose:

```env
RABBITMQ_HOST=rabbitmq
RABBITMQ_USER=weather_user
RABBITMQ_PASS=weather_pass_dev
```

> **Importante:** os valores acima são exemplos para desenvolvimento local. Utilize credenciais próprias e seguras em outros ambientes. Não versione arquivos `.env` ou chaves de API.

### 3. Iniciar os serviços com Docker Compose

Na raiz do projeto, execute:

```bash
docker compose up --build -d
```

Esse comando constrói as imagens e inicia os seguintes serviços:

- RabbitMQ
- Python Producer
- MongoDB
- NestJS API
- Go Worker

Para acompanhar os logs:

```bash
docker compose logs -f
```

Para acompanhar um serviço específico:

```bash
docker compose logs -f python-producer
docker compose logs -f go-worker
docker compose logs -f nest-api
```

### 4. Verificar a API

Com os serviços iniciados, a API estará disponível em:

```text
http://localhost:3000/api
```

Endpoint de verificação de saúde:

```text
GET http://localhost:3000/api/health
```

Endpoint de consulta dos registros meteorológicos:

```text
GET http://localhost:3000/api/weather/logs
```

O painel de gerenciamento do RabbitMQ estará disponível em:

```text
http://localhost:15672
```

Utilize as credenciais configuradas no `docker-compose.yml`.

### 5. Executar o frontend

Abra outro terminal e acesse a pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Opcionalmente, crie um arquivo `.env.local` para definir o endereço da API:

```env
VITE_API_URL=http://localhost:3000/api
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite disponibilizará a aplicação no endereço:

```text
http://localhost:5173
```

Pronto! Com os serviços em execução, o produtor Python começará a coletar e publicar os dados, o worker Go os encaminhará à API e o dashboard poderá consultar os registros armazenados.

## Diferenciais técnicos

Algumas decisões arquiteturais e implementações importantes deste projeto:

- **Arquitetura desacoplada:** coleta, processamento, persistência e apresentação são responsabilidades separadas.
- **Processamento assíncrono:** RabbitMQ permite a comunicação entre produtor e consumidor sem acoplamento direto.
- **Integração entre linguagens:** utilização de Python, Go e TypeScript em serviços com responsabilidades distintas.
- **Resiliência no processamento:** mecanismo de retry no worker para lidar com falhas temporárias de comunicação.
- **Persistência de dados:** MongoDB armazena os registros meteorológicos para consultas posteriores.
- **API REST:** NestJS centraliza o acesso aos dados e a comunicação com o frontend.
- **Containerização:** Docker Compose simplifica a inicialização e integração do ambiente completo.
- **Frontend componentizado:** React e TypeScript organizam a interface em componentes reutilizáveis.

## Melhorias futuras

- Implementação de filtros avançados para exploração do histórico meteorológico.
- Aprimoramento da atualização automática dos dados no dashboard.
- Expansão das análises e insights meteorológicos.
- Melhorias de observabilidade e monitoramento dos serviços.
- Implementação de testes automatizados e integração contínua.

## Autor

**Guilherme**

Desenvolvedor de Software | Full Stack

- GitHub: [@Gu1san](https://github.com/Gu1san)

---

Projeto desenvolvido como desafio técnico e estudo prático de arquitetura full-stack, integração entre serviços, mensageria e visualização de dados.
