# C4 Component: Dashboard & Analytics (`DashboardAndReports`)

## 1. Overview
- **Name**: Dashboard & Analytics (`DashboardAndReports`)
- **Description**: Consolida indicadores-chave de desempenho (KPIs), séries históricas de gastos mensais e comparativos de consumo médio entre veículos.
- **Type**: Presentation & Analytics Component
- **Technology**: Python 3 / Django ORM Aggregations (`Sum`, `Avg`, `Count`, `TruncMonth`), Chart.js, Tailwind CSS.

## 2. Purpose
Fornecer ao usuário uma visão executiva imediata de sua frota: quanto gastou no mês atual vs. mês anterior, qual a média geral de consumo (`km/L`), quais foram os últimos abastecimentos e gráficos interativos de evolução.

## 3. Software Features
- **Cards de KPIs**: Total de veículos, Gasto Total no Mês (`R$`), Consumo Médio da Frota (`km/L`) e Último Abastecimento.
- **Gráfico de Gastos por Mês (`#expenseChart`)**: Série temporal dos últimos 6 ou 12 meses somando `valor_total` por mês.
- **Gráfico de Consumo por Veículo (`#consumptionChart`)**: Comparativo em barras/radar do consumo médio (`km/L`) de cada veículo do usuário.
- **Feed de Atividades Recentes**: Timeline combinando últimos abastecimentos e veículos recém-cadastrados.

## 4. Code Elements
- [c4-code-ecorodagem-views.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-views.md) (`ecorodagem/views/dashboard.py`)
- [c4-code-ecorodagem-core.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-core.md) (`ecorodagem/templates/principal/dashboard.html`, `ecorodagem/static/js/charts.js`)

## 5. Interfaces
- `GET /` (ou `/dashboard/`) -> Renderiza o painel principal com dados consolidados e JSON injetado para o Chart.js.
- `GET /api/analytics/resumo/` *(Opcional / To-Be)* -> Endpoint JSON para atualização dinâmica dos gráficos (filtro 6M / 1A).

## 6. Dependencies
- **Internal**: `VehicleManagement`, `FuelingAndConsumption`.
- **External**: Chart.js (CDN), SQLite3.
