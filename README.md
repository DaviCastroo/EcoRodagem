# EcoRodagem API

API REST desenvolvida em **Java (Spring Boot 3.4)** com **PostgreSQL** e **Flyway** para gerenciamento de frota pessoal, registro de abastecimentos (valor, preço do litro, local/posto) e cálculo automático de média de consumo (`km/L`).

---

## Estrutura de Diretórios

```text
EcoRodagem/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/ecorodagem/
│   │   │   ├── EcoRodagemApplication.java
│   │   │   ├── config/
│   │   │   │   └── CorsAndOpenApiConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AbastecimentoController.java
│   │   │   │   ├── DashboardController.java
│   │   │   │   └── VeiculoController.java
│   │   │   ├── domain/
│   │   │   │   ├── enums/
│   │   │   │   │   └── TipoCombustivel.java
│   │   │   │   └── model/
│   │   │   │       ├── Abastecimento.java
│   │   │   │       └── Veiculo.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── AbastecimentoRequestDTO.java
│   │   │   │   │   └── VeiculoRequestDTO.java
│   │   │   │   └── response/
│   │   │   │       ├── AbastecimentoResponseDTO.java
│   │   │   │       ├── DashboardResponseDTO.java
│   │   │   │       ├── PostoResumoResponseDTO.java
│   │   │   │       └── VeiculoResponseDTO.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── RecursoNaoEncontradoException.java
│   │   │   │   └── RegraNegocioException.java
│   │   │   ├── repository/
│   │   │   │   ├── AbastecimentoRepository.java
│   │   │   │   └── VeiculoRepository.java
│   │   │   └── service/
│   │   │       ├── AbastecimentoService.java
│   │   │       ├── DashboardService.java
│   │   │       └── VeiculoService.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   │           └── V1__create_initial_schema.sql
│   └── test/
│       ├── java/ecorodagem/service/
│       │   └── AbastecimentoServiceTest.java
│       └── resources/
│           └── application-test.yml
```

---

## Configuração do Banco de Dados (PostgreSQL)

Por padrão, a aplicação conecta em `jdbc:postgresql://localhost:5432/ecorodagem` (configurável via variáveis de ambiente `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` em [`application.yml`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/src/main/resources/application.yml)).

Ao iniciar a aplicação, o **Flyway** executa automaticamente a migração [`V1__create_initial_schema.sql`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/src/main/resources/db/migration/V1__create_initial_schema.sql).

---

## Principais Endpoints REST

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Resumo geral (total de veículos, gasto no mês, consumo médio `km/L`, último abastecimento e séries para gráficos). |
| `GET` | `/api/veiculos` | Lista todos os veículos com suas médias de consumo (`km/L`). |
| `GET` | `/api/veiculos/{id}` | Detalhes de um veículo por ID. |
| `POST` | `/api/veiculos` | Cadastra um novo veículo. |
| `PUT` | `/api/veiculos/{id}` | Atualiza dados de um veículo. |
| `DELETE` | `/api/veiculos/{id}` | Remove um veículo e seu histórico. |
| `GET` | `/api/abastecimentos` | Lista abastecimentos (filtros opcionais: `?veiculoId=` e `?combustivel=`). |
| `POST` | `/api/abastecimentos` | Registra abastecimento, calcula preço/litro, distância percorrida e média (`km/L`), e atualiza o hodômetro do veículo. |
| `DELETE` | `/api/abastecimentos/{id}` | Exclui um abastecimento. |
| `GET` | `/api/abastecimentos/postos` | Agrupa histórico por local/posto com preço médio do litro e total gasto. |
| `GET` | `/swagger-ui.html` | Documentação interativa OpenAPI / Swagger UI. |
