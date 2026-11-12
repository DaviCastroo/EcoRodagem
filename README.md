# 🌿 EcoRodagem — Gestão Inteligente de Frota, Combustíveis e Mobilidade Elétrica

![Java 21](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot 3.4](https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Angular 19](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17%2F18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

O **EcoRodagem** é uma plataforma Full-Stack moderna para gerenciamento de veículos, controle de abastecimentos e recargas elétricas, análise de eficiência energética (`km/L`, `km/m³`, `km/kWh`), cálculo universal de **custo por quilômetro (`R$/km`)** e ranking econômico de postos e eletropostos.

---

## Sumário

1. [Visão Geral e Diferenciais](#-1-visão-geral-e-diferenciais)
2. [Categorias e Matriz de Propulsão](#-2-categorias-e-matriz-de-propulsão)
3. [Princípios de UX/UI e Acessibilidade](#-3-princípios-de-uxui-e-acessibilidade)
4. [Arquitetura e Stack Tecnológica](#-4-arquitetura-e-stack-tecnológica)
5. [Estrutura do Projeto](#-5-estrutura-do-projeto)
6. [Guia Passo a Passo: Como Executar](#-6-guia-passo-a-passo-como-executar)
7. [Dados Fictícios Inclusos (Seed Automático)](#-7-dados-fictícios-inclusos-seed-automático)
8. [Referência da API REST](#-8-referência-da-api-rest)

---

## 🚀 1. Visão Geral e Diferenciais

Diferente de planilhas ou controles tradicionais focados apenas em carros a gasolina, o **EcoRodagem** foi projetado para suportar **toda a matriz de transporte moderna**:

- **Múltiplas Categorias de Veículos**: Carros de passeio, Motocicletas, Utilitários/Vans e Caminhões pesados.
- **Suporte Multi-Energia Nativo**: Combustíveis líquidos (**Gasolina, Etanol, Diesel** em `L`), gás natural (**GNV** em `m³`) e mobilidade elétrica (**Recargas** em `kWh`).
- **Métrica Universal de Eficiência (`R$/km`)**: Permite comparar de forma justa quanto custa rodar 1 km em um carro elétrico, em um veículo com kit GNV, em uma moto flex ou em um caminhão a diesel.
- **Calculadora de Prévia em Tempo Real**: Ao lançar um abastecimento ou recarga no front-end, o sistema calcula instantaneamente a distância percorrida (`Δ km`), o preço unitário, a média estimada e o custo por km antes mesmo de salvar.
- **Ranking Econômico de Postos e Eletropostos**: Agrupa automaticamente os locais onde você abastece ou recarrega e classifica do menor para o maior preço médio unitário.

---

## 🚗 2. Categorias e Matriz de Propulsão

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

## 🎨 3. Princípios de UX/UI e Acessibilidade

O Front-end foi construído seguindo rigorosamente leis clássicas de Design de Interação e Acessibilidade:

- **Lei de Fitts (Clareza nas Ações)**: Apenas **1 CTA primário** em destaque por seção, com áreas de clique mínimas de `44x44px` e rótulos orientados à ação (*"Cadastrar veículo"*, *"Registrar abastecimento"*).
- **Lei de Hick & Divulgação Progressiva**: No cadastro de veículos, o formulário exibe apenas os campos de capacidade compatíveis com a propulsão escolhida (ocultando cilindro `m³` ou bateria `kWh` quando não aplicáveis) e agrupa atributos opcionais em seções expansíveis.
- **Lei de Miller**: Cartões e resumos agrupados em blocos visuais de 3 a 5 indicadores-chave para leitura rápida.
- **Lei de Jakob (Familiaridade)**: Navegação lateral esquerda fixa no desktop e barra inferior (*Bottom Nav*) no mobile.
- **Heurísticas de Nielsen (Feedback e Prevenção de Erros)**: Skeletons animados durante o carregamento, validação de hodômetro em tempo real com indicação do valor mínimo aceito e notificações *Toast* semânticas.
- **Acessibilidade (WCAG 2.2 AA)**: Alto contraste (`Slate-900` sobre `Slate-50`), suporte completo a teclado (`focus-visible`, *Skip-to-content*) e atributos `aria-live`, `aria-invalid` e `role="dialog"`.

---

## 🛠️ 4. Arquitetura e Stack Tecnológica

### Back-end (`src/main/java/ecorodagem/`)
- **Java 21** + **Spring Boot 3.4.2**
- **Spring Data JPA / Hibernate** + **PostgreSQL**
- **Flyway Migration** (versionamento automático de schema e carga inicial de dados)
- **Bean Validation (Jakarta Validation)** para integridade de contratos REST
- **SpringDoc OpenAPI 2.8 (Swagger UI)** para documentação interativa da API
- **JUnit 5 + Mockito** para testes automatizados de regras de negócio

### Front-end (`frontend/`)
- **Angular 19** (*100% Standalone Components*, `ChangeDetectionStrategy.OnPush`, **Angular Signals**)
- **Reactive Forms** fortemente tipados com validadores cruzados customizados
- **Tailwind CSS 3.4** com design system semântico por matriz energética
- **HttpClient Functional Interceptors** para tratamento global de erros

---

## 📂 5. Estrutura do Projeto

```text
EcoRodagem/
├── pom.xml                                  # Configuração Maven (Java 21 / Spring Boot 3.4)
├── docker-compose-example.yaml              # Exemplo de container PostgreSQL + pgAdmin
├── database/
│   └── ecorodagem_postgres.sql              # Script SQL completo (DDL + Dados Fictícios)
├── C4-Documentation/                        # Documentação de Arquitetura no modelo C4
├── src/
│   ├── main/
│   │   ├── java/ecorodagem/
│   │   │   ├── config/                      # Configuração de CORS e OpenAPI (Swagger)
│   │   │   ├── controller/                  # Controllers REST (Veículos, Abastecimentos, Dashboard)
│   │   │   ├── domain/                      # Entidades JPA e Enums (CategoriaVeiculo, TipoPropulsao, etc.)
│   │   │   ├── dto/                         # Records de Request e Response
│   │   │   ├── exception/                   # Tratamento global de exceções (GlobalExceptionHandler)
│   │   │   ├── repository/                  # Repositórios Spring Data JPA
│   │   │   └── service/                     # Regras de negócio e cálculos de eficiência
│   │   └── resources/
│   │       ├── application-example.yml      # Modelo de configuração da aplicação
│   │       └── db/migration/                # Migrações Flyway (V1, V2 e V3 com dados fictícios)
│   └── test/                                # Testes automatizados de serviço
└── frontend/                                # Aplicação SPA em Angular 19 + Tailwind CSS
    ├── proxy.conf.json                      # Proxy reverso local (/api -> localhost:8080)
    └── src/app/
        ├── core/                            # Models, Serviços HTTP, Interceptor, Toast e Layout (AppShell)
        ├── shared/                          # Badges semânticos, Modal de confirmação e Validadores
        └── features/                        # Páginas: Dashboard, Veículos, Abastecimentos e Postos
```

---

## ⚙️ 6. Guia Passo a Passo: Como Executar

### Pré-requisitos
- **Java JDK 21+** e **Maven 3.9+**
- **PostgreSQL 15+** (local ou via Docker)
- **Node.js 20+** e **npm**

---

### Passo 1: Preparar o Banco de Dados PostgreSQL

Você pode usar uma instância local do PostgreSQL ou subir via Docker:

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

### Passo 2: Configurar e Iniciar o Back-end (Spring Boot)

1. Crie o arquivo `src/main/resources/application.yml` a partir do arquivo de exemplo:
   ```bash
   cp src/main/resources/application-example.yml src/main/resources/application.yml
   ```
2. No arquivo `src/main/resources/application.yml`, informe o usuário e a senha do seu PostgreSQL:
   ```yaml
   spring:
     datasource:
       url: ${DB_URL:jdbc:postgresql://localhost:5432/ecorodagem}
       username: ${DB_USERNAME:postgres}
       password: ${DB_PASSWORD:sua_senha_aqui}
   ```
3. Execute a API Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   > **Nota:** Ao iniciar, o **Flyway** criará automaticamente todas as tabelas (`V1` e `V2`) e populará a frota fictícia completa (`V3`).
   > A API ficará disponível em `http://localhost:8080` e o Swagger UI em `http://localhost:8080/swagger-ui.html`.

---

### Passo 3: Instalar e Iniciar o Front-end (Angular 19)

Em um segundo terminal, acesse a pasta `frontend/`, instale as dependências (caso ainda não tenha instalado) e inicie o servidor de desenvolvimento:

```bash
cd frontend
npm install
npm start
```

Acesse no navegador: **`http://localhost:4200`**

---

## 📊 7. Dados Fictícios Inclusos (Seed Automático)

A migração `V3__seed_sample_data.sql` insere automaticamente **9 veículos** e **29 registros de abastecimento/recarga** para que você possa explorar todos os gráficos, filtros e indicadores imediatamente:

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

## 🔌 8. Referência da API REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Retorna KPIs consolidados da frota, médias por unidade (`km/L`, `km/m³`, `km/kWh`), `R$/km` global e resumos por veículo e combustível. |
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
