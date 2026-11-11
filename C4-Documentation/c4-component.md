# C4 Component Level: Master Component Index (`EcoRodagem`)

## 1. Visão Geral dos Componentes do Sistema

O container principal **EcoRodagem Web Application (Django Monolith)** é decomposto em **4 componentes lógicos** que estruturam tanto o código atual (As-Is) quanto a evolução planejada (To-Be):

| Componente | Tipo | Tecnologia | Status Atual | Documentação |
| :--- | :--- | :--- | :--- | :--- |
| **1. Gestão de Frota (`VehicleManagement`)** | Django Module (Views, Forms, ORM) | Python / Django 5.2 | Parcialmente implementado | [c4-component-vehicles.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-component-vehicles.md) |
| **2. Controle de Abastecimentos & Consumo (`FuelingAndConsumption`)** | Django Module + Domain Service | Python / Django 5.2 | Modelo base criado; Views e cálculo de média pendentes | [c4-component-fueling.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-component-fueling.md) |
| **3. Dashboard & Analytics (`DashboardAndReports`)** | Django Views + Chart.js UI | Python / Django / Chart.js | UI pronta com dados estáticos; agregações pendentes | [c4-component-dashboard.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-component-dashboard.md) |
| **4. Autenticação & Perfis (`IdentityAndAuth`)** | Django Auth Module | `django.contrib.auth` | Template de login e esboço de form criados | [c4-component-auth.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-component-auth.md) |

---

## 2. Diagrama de Componentes (C4 Level 3)

```mermaid
flowchart TB
    subgraph Browser["Navegador Web (Cliente)"]
        UI["Templates HTML + Tailwind CSS + Chart.js"]
    end

    subgraph DjangoApp["Container: EcoRodagem Web Application (Django 5.2)"]
        URLRouter["URL Router\n(config/urls.py & ecorodagem/urls.py)"]

        subgraph CompAuth["Componente: Identity & Auth"]
            AuthViews["Auth Views & Middleware\n(django.contrib.auth)"]
            RegForm["Registro Form\n(models/registro.py)"]
        end

        subgraph CompVehicles["Componente: Gestão de Frota (Vehicles)"]
            VehViews["Veículos Views\n(veiculos, cadastrar_veiculo)"]
            VehForm["VeiculoForm\n(forms.py)"]
            VehModel["Model: Veiculo\n(models/veiculo.py)"]
        end

        subgraph CompFueling["Componente: Abastecimentos & Consumo (Fueling)"]
            FuelViews["Abastecimento Views\n(listar, cadastrar, editar, excluir)"]
            FuelForm["AbastecimentoForm\n(forms.py)"]
            ConsumptionCalc["Serviço de Cálculo de Consumo\n(km/L, R$/L, R$/km)"]
            FuelModel["Model: Abastecer\n(models/abastecimento.py)"]
        end

        subgraph CompDashboard["Componente: Dashboard & Analytics"]
            DashView["Dashboard View\n(views/dashboard.py)"]
            AnalyticsService["Agregador de Métricas\n(Gasto Mensal, Consumo por Carro)"]
        end
    end

    subgraph Database["Container: Banco de Dados"]
        SQLite[("SQLite3\n(db.sqlite3)")]
    end

    UI -->|"HTTP GET / POST"| URLRouter
    URLRouter --> AuthViews
    URLRouter --> VehViews
    URLRouter --> FuelViews
    URLRouter --> DashView

    VehViews --> VehForm
    VehForm --> VehModel

    FuelViews --> FuelForm
    FuelForm --> FuelModel
    FuelViews --> ConsumptionCalc
    ConsumptionCalc --> FuelModel
    ConsumptionCalc --> VehModel

    DashView --> AnalyticsService
    AnalyticsService --> VehModel
    AnalyticsService --> FuelModel
    AnalyticsService --> ConsumptionCalc

    VehModel -->|"Django ORM"| SQLite
    FuelModel -->|"Django ORM"| SQLite
    AuthViews -->|"Django ORM"| SQLite
```
