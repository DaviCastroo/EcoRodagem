# EcoRodagem — Gestão Inteligente de Frota, Combustíveis e Mobilidade Elétrica

![Java 21](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot 3.4](https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Python FastAPI](https://img.shields.io/badge/FastAPI_AI-Python_3.12-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google Gemini LLM](https://img.shields.io/badge/LLM-Google_Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)
![Angular 19](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17%2F18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

O **EcoRodagem** é uma plataforma Full-Stack com **Copiloto de Inteligência Artificial integrado (Microsserviço Python FastAPI + LLM)** para gerenciamento de veículos, controle de abastecimentos e recargas elétricas, análise de eficiência energética (`km/L`, `km/m³`, `km/kWh`), cálculo universal de **custo por quilômetro (`R$/km`)** e ranking econômico de postos e eletropostos.

---

## Sumário

1. [Visão Geral e Diferenciais](#1-visão-geral-e-diferenciais)
2. [Categorias e Matriz de Propulsão](#2-categorias-e-matriz-de-propulsão)
3. [Princípios de UX/UI e Acessibilidade](#3-princípios-de-uxui-e-acessibilidade)
4. [Arquitetura e Stack Tecnológica](#4-arquitetura-e-stack-tecnológica)
5. [Estrutura do Projeto](#5-estrutura-do-projeto)
6. [Guia de Instalação e Execução](#6-guia-de-instalação-e-execução)
7. [Dados Fictícios Inclusos (Seed Automático)](#7-dados-fictícios-inclusos-seed-automático)
8. [Referência da API REST](#8-referência-da-api-rest)

---

## 1. Visão Geral e Diferenciais

Diferente de controles tradicionais focados apenas em veículos a combustão líquida, o **EcoRodagem** foi projetado para suportar toda a matriz de transporte moderna:

- **Múltiplas Categorias de Veículos**: Carros de passeio, Motocicletas, Utilitários/Vans e Caminhões pesados.
- **Suporte Multi-Energia Nativo**: Combustíveis líquidos (**Gasolina, Etanol, Diesel** em `L`), gás natural (**GNV** em `m³`) e mobilidade elétrica (**Recargas** em `kWh`).
- **Métrica Universal de Eficiência (`R$/km`)**: Permite comparar diretamente o custo por quilômetro rodado entre um veículo elétrico, um modelo com kit GNV, uma motocicleta flex ou um caminhão a diesel.
- **Calculadora de Prévia em Tempo Real**: Ao lançar um abastecimento ou recarga no front-end, o sistema calcula instantaneamente a distância percorrida (`Δ km`), o preço unitário, a média estimada e o custo por km antes da persistência.
- **Ranking Econômico de Postos e Eletropostos**: Consolida automaticamente os estabelecimentos onde a frota abastece ou recarrega, classificando-os pelo menor preço médio unitário e exibindo faixa de preço e participação financeira.
- **Copiloto IA de Eficiência e Logística (Python FastAPI + Google Gemini LLM)**: Microsserviço dedicado de Inteligência Artificial que analisa a telemetria consolidada do PostgreSQL para gerar diagnósticos executivos da frota, estimativa de economia mensal e responder perguntas em linguagem natural (*Context-Augmented Generation / RAG* sobre dados tabulares) com fallback analítico determinístico.

---

## 2. Categorias e Matriz de Propulsão

O domínio da aplicação valida automaticamente quais fontes de energia são compatíveis com cada tipo de motorização:

| Propulsão | Código | Energias Permitidas | Unidades | Exemplo Real |
| :--- | :--- | :--- | :--- | :--- |
| **Combustão Tradicional** | `COMBUSTAO` | Gasolina, Etanol, Diesel | `L` | Toyota Hilux Diesel, Volvo FH 540 |
| **Flex (Gasolina / Etanol)** | `FLEX` | Gasolina, Etanol | `L` | Honda Civic Touring, Yamaha Fazer 250 |
| **Bi-Combustível / Kit GNV** | `BI_FUEL_GNV` | Gasolina, Etanol, **GNV** | `L` e `m³` | Fiat Grand Siena 1.4 Tetrafuel / GNV |
| **Híbrido (HEV)** | `HIBRIDO_HEV` | Gasolina, Etanol *(bateria autorrecarregável)* | `L` | Toyota Corolla Altis Hybrid |
| **Híbrido Plug-in (PHEV)** | `HIBRIDO_PHEV` | Gasolina, Etanol, **Energia Elétrica** | `L` e `kWh` | GWM Haval H6 PHEV |
| **100% Elétrico (BEV)** | `ELETRICO_BEV` | **Energia Elétrica** | `kWh` | BYD Dolphin GS, Voltz EVS |

---

## 3. Princípios de UX/UI e Acessibilidade

O Front-end foi construído seguindo diretrizes clássicas de Design de Interação e Acessibilidade:

- **Lei de Fitts (Clareza nas Ações)**: Destaque de apenas um CTA primário por seção, com áreas de clique confortáveis e rótulos orientados à ação (*"Cadastrar veículo"*, *"Registrar abastecimento"*).
- **Lei de Hick e Divulgação Progressiva**: No cadastro de veículos, o formulário exibe apenas os campos de capacidade compatíveis com a propulsão selecionada (ocultando cilindro `m³` ou bateria `kWh` quando não aplicáveis) e agrupa atributos opcionais em seções expansíveis.
- **Lei de Miller**: Cartões e resumos agrupados em blocos visuais de 3 a 5 indicadores-chave para leitura rápida.
- **Lei de Jakob (Familiaridade)**: Barra lateral esquerda retrátil no desktop e barra de navegação inferior (*Bottom Nav*) em dispositivos móveis.
- **Heurísticas de Nielsen (Feedback e Prevenção de Erros)**: Estados de carregamento (*Skeletons*), validação de hodômetro em tempo real com indicação do valor mínimo aceito e notificações *Toast* semânticas.
- **Acessibilidade (WCAG 2.2 AA)**: Alto contraste (`Slate-900` sobre `Slate-50`), suporte completo à navegação por teclado (`focus-visible`, *Skip-to-content*) e atributos semânticos (`aria-live`, `aria-invalid`, `role="dialog"`).

---

## 4. Arquitetura e Stack Tecnológica

### Back-end Orquestrador (`src/main/java/ecorodagem/`)
- **Java 21** + **Spring Boot 3.4.2**
- **Spring Data JPA / Hibernate** + **PostgreSQL**
- **Flyway Migration** (versionamento automático de schema e carga inicial de dados)
- **Bean Validation (Jakarta Validation)** para integridade de contratos REST
- **SpringDoc OpenAPI 2.8 (Swagger UI)** para documentação interativa da API
- **JUnit 5 + Mockito** para testes automatizados de regras de negócio e integração

### Microsserviço de IA (`ai-service/`)
- **Python 3.12+** + **FastAPI** + **Pydantic v2**
- **Integração com LLMs (Google Gemini API)** utilizando *Structured Outputs* (`application/json`) e *Context-Augmented Generation (RAG)* sobre os dados operacionais da frota
- **Motor Analítico Determinístico (Fallback)**: garante disponibilidade contínua e respostas imediatas mesmo sem chave de API externa configurada

### Front-end (`frontend/`)
- **Angular 19** (*Standalone Components*, `ChangeDetectionStrategy.OnPush`, **Angular Signals**)
- **Reactive Forms** fortemente tipados com validadores cruzados customizados
- **Tailwind CSS 3.4** com paleta semântica por matriz energética
- **HttpClient Functional Interceptors** para tratamento centralizado de erros

---

## 5. Estrutura do Projeto

```text
EcoRodagem/
├── pom.xml                                  # Configuração Maven (Java 21 / Spring Boot 3.4)
├── docker-compose-example.yaml              # Exemplo de container PostgreSQL + pgAdmin
├── ai-service/                              # Microsserviço de IA em Python (FastAPI + Gemini LLM)
│   ├── main.py                              # Endpoints /api/v1/diagnostics e /api/v1/chat + Motor Analítico
│   ├── test_main.py                         # Testes automatizados do microsserviço (Pytest)
│   ├── requirements.txt                     # Dependências Python (FastAPI, Pydantic, HTTPX, Uvicorn)
│   ├── .env.example                         # Modelo de variáveis de ambiente para GEMINI_API_KEY
│   └── Dockerfile                           # Containerização com usuário não-root
├── database/
│   └── ecorodagem_postgres.sql              # Script SQL completo (DDL + Dados Fictícios)
├── C4-Documentation/                        # Documentação de Arquitetura no modelo C4
├── src/
│   ├── main/
│   │   ├── java/ecorodagem/
│   │   │   ├── config/                      # Configuração de CORS e OpenAPI (Swagger)
│   │   │   ├── controller/                  # Controllers REST (Veículos, Abastecimentos, Dashboard, IA)
│   │   │   ├── domain/                      # Entidades JPA e Enums (CategoriaVeiculo, TipoPropulsao, etc.)
│   │   │   ├── dto/                         # Records de Request e Response
│   │   │   ├── exception/                   # Tratamento global de exceções (GlobalExceptionHandler)
│   │   │   ├── repository/                  # Repositórios Spring Data JPA
│   │   │   └── service/                     # Regras de negócio, cálculos e orquestração do Copiloto IA
│   │   └── resources/
│   │       ├── application-example.yml      # Modelo de configuração da aplicação
│   │       └── db/migration/                # Migrações Flyway (V1, V2 e V3 com dados fictícios)
│   └── test/                                # Testes automatizados de serviço (JUnit 5)
└── frontend/                                # Aplicação SPA em Angular 19 + Tailwind CSS
    ├── proxy.conf.json                      # Proxy reverso local (/api -> localhost:8080)
    └── src/app/
        ├── core/                            # Models, Serviços HTTP, Interceptor, Toast e Layout (AppShell)
        ├── shared/                          # Badges semânticos, Modal de confirmação e Validadores
        └── features/                        # Páginas: Dashboard (com Copiloto IA), Veículos, Abastecimentos e Postos
```

---

## 6. Guia de Instalação e Execução

### Pré-requisitos
- **Java JDK 21+** e **Maven 3.9+**
- **PostgreSQL 15+** (local ou via Docker)
- **Python 3.11+** e **pip** (para o microsserviço `ai-service`)
- **Node.js 20+** e **npm**

---

### Passo 1: Preparar o Banco de Dados PostgreSQL

**Opção A — Usando PostgreSQL Local:**
Crie o banco de dados `ecorodagem`:
```sql
CREATE DATABASE ecorodagem;
```

**Opção B — Usando Docker Compose:**
1. Copie o arquivo de exemplo:
   ```bash
   cp docker-compose-example.yaml docker-compose.yaml
   ```
2. Defina sua senha no `docker-compose.yaml` e inicie o container:
   ```bash
   docker compose up -d
   ```

---

### Passo 2: Iniciar o Microsserviço de IA (Python FastAPI — Porta `8000`)

1. Acesse a pasta `ai-service` e instale as dependências:
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```
2. *(Opcional)* Para utilizar a geração com o modelo **Google Gemini (`gemini-2.5-flash`)**, crie o arquivo `.env` a partir de `.env.example` e informe sua chave `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   ```
   > Caso não configure a variável `GEMINI_API_KEY`, o microsserviço operará automaticamente com o **Motor Analítico Determinístico** sem necessidade de chave externa.
3. Inicie o servidor FastAPI na porta `8000`:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   - Healthcheck: `http://localhost:8000/health`
   - Documentação OpenAPI do serviço de IA: `http://localhost:8000/docs`

---

### Passo 3: Configurar e Iniciar o Back-end (Spring Boot — Porta `8080`)

1. Na raiz do projeto, crie o arquivo `src/main/resources/application.yml` a partir do modelo:
   ```bash
   cp src/main/resources/application-example.yml src/main/resources/application.yml
   ```
2. Em `src/main/resources/application.yml`, informe as credenciais do seu PostgreSQL:
   ```yaml
   spring:
     datasource:
       url: ${DB_URL:jdbc:postgresql://localhost:5432/ecorodagem}
       username: ${DB_USERNAME:postgres}
       password: ${DB_PASSWORD:sua_senha_aqui}

   ai:
     service:
       url: ${AI_SERVICE_URL:http://localhost:8000}
   ```
3. Inicie a API Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   > Ao iniciar, o **Flyway** aplica automaticamente as migrações `V1`, `V2` e `V3` (frota fictícia e histórico de abastecimentos).
   > Caso o microsserviço Python na porta `8000` não esteja em execução, o `AiAdvisorService` do Spring Boot aciona automaticamente o fallback analítico local sem interromper a aplicação.
   - API REST: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`

---

### Passo 4: Iniciar o Front-end (Angular 19 — Porta `4200`)

Em outro terminal, acesse o diretório `frontend/`, instale as dependências (se necessário) e inicie o servidor de desenvolvimento:

```bash
cd frontend
npm install
npm start
```

Acesse a aplicação no navegador: **`http://localhost:4200`**

---

## 7. Dados Fictícios Inclusos (Seed Automático)

A migração `V3__seed_sample_data.sql` insere automaticamente **9 veículos** e **29 registros de abastecimento/recarga** cobrindo todas as categorias e propulsões:

- **Carros (`CARRO`)**:
  - *Meu Civic Touring* (`ABC1D23`) — **Flex** (Gasolina e Etanol em `L`)
  - *BYD Dolphin Elétrico* (`ELE4A88`) — **100% Elétrico BEV** (Recargas em `kWh`)
  - *Siena do Dia a Dia* (`GNV7B55`) — **Bi-Combustível GNV** (GNV em `m³` e Gasolina em `L`)
  - *Haval H6 Plug-in* (`PHV9C11`) — **Híbrido Plug-in PHEV** (Recargas em `kWh` e Gasolina em `L`)
  - *Corolla Hybrid* (`HEV2E44`) — **Híbrido HEV** (Gasolina e Etanol em `L`)
- **Motos (`MOTO`)**:
  - *Fazer 250 Urbana* (`MOT3F90`) — **Flex** (Gasolina e Etanol em `L`)
  - *Voltz EVS Delivery* (`MEV6J22`) — **100% Elétrica BEV** (Recargas em `kWh`)
- **Utilitários (`UTILITARIO`)**:
  - *Hilux 4x4 Frota* (`UTI5G77`) — **Combustão Diesel** (`L`)
- **Caminhões (`CAMINHAO`)**:
  - *Volvo FH 540 Matriz* (`CAM8H12`) — **Combustão Diesel Pesado** (`L`)

---

## 8. Referência da API REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Retorna KPIs consolidados da frota, médias por unidade (`km/L`, `km/m³`, `km/kWh`), `R$/km` global e resumos por veículo e período. |
| `GET` | `/api/ia/diagnostico` | Gera o diagnóstico executivo de eficiência da frota, estimativa de economia e recomendações via microsserviço Python (FastAPI + LLM). |
| `POST` | `/api/ia/chat` | Responde perguntas em linguagem natural sobre veículos, motos de delivery, combustíveis e postos usando RAG sobre a telemetria da frota. |
| `GET` | `/api/veiculos` | Lista todos os veículos cadastrados com suas respectivas médias e custos por km. |
| `GET` | `/api/veiculos/{id}` | Retorna os detalhes de um veículo específico. |
| `POST` | `/api/veiculos` | Cadastra um novo veículo (valida categoria, propulsão e capacidades). |
| `PUT` | `/api/veiculos/{id}` | Atualiza os dados cadastrais de um veículo. |
| `DELETE` | `/api/veiculos/{id}` | Remove um veículo e seu histórico de abastecimentos. |
| `GET` | `/api/abastecimentos` | Lista o histórico de abastecimentos/recargas (filtros opcionais: `?veiculoId=` e `?combustivel=`). |
| `POST` | `/api/abastecimentos` | Registra um abastecimento/recarga, valida compatibilidade energética e calcula preço unitário, distância, média e `R$/km`. |
| `DELETE` | `/api/abastecimentos/{id}` | Exclui um registro de abastecimento/recarga. |
| `GET` | `/api/abastecimentos/postos` | Retorna o ranking de postos e eletropostos ordenado pelo menor preço médio unitário. |
| `GET` | `/swagger-ui.html` | Interface interativa OpenAPI 3 / Swagger UI. |
