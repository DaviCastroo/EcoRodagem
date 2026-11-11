# C4 Component: Controle de Abastecimentos & Consumo (`FuelingAndConsumption`)

## 1. Overview
- **Name**: Controle de Abastecimentos & Consumo (`FuelingAndConsumption`)
- **Description**: Registra os abastecimentos realizados em cada veículo (combustível, litros, valor total, preço/litro, posto, data, hodômetro e tanque cheio) e calcula a média de consumo (`km/L`) e custo por quilômetro (`R$/km`).
- **Type**: Django Domain Component & Calculation Engine
- **Technology**: Python 3, Django 5.2, Decimal Arithmetic.

## 2. Purpose
Atender ao requisito central da EcoRodagem: permitir que o usuário registre onde, quando e por quanto abasteceu, atualizando automaticamente o hodômetro do veículo e calculando com precisão a eficiência energética (`km/L`) de cada veículo e combustível.

## 3. Software Features
- **Registro de Abastecimento**: Captura veículo, data, tipo de combustível (`gasolina`, `etanol`, `diesel`, `gnv`), litros, valor total, posto/localização (`loc_posto`), hodômetro no momento do abastecimento e flag `tanque_cheio`.
- **Cálculo Automático de Preço por Litro**:
  $$\text{Preço por Litro} = \frac{\text{Valor Total}}{\text{Litros}}$$
- **Cálculo de Média de Consumo (`km/L`)**:
  - **Método Direto (Entre Abastecimentos consecutivos)**:
    $$\text{Consumo Médio} = \frac{\text{Hodômetro}_{\text{atual}} - \text{Hodômetro}_{\text{anterior}}}{\text{Litros}_{\text{abastecidos}}}$$
  - **Método Tanque-a-Tanque (Mais preciso)**: Soma os litros de abastecimentos parciais até encontrar o próximo abastecimento com `tanque_cheio = True` e divide a distância percorrida desde o último `tanque_cheio = True` pelo total de litros acumulados.
- **Histórico e Gestão de Postos**: Agrupamento de abastecimentos por local (`loc_posto`) para comparar preços médios de combustível por posto.

## 4. Code Elements
- [c4-code-ecorodagem-models.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-models.md) (`ecorodagem/models/abastecimento.py`)
- [c4-code-ecorodagem-core.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-core.md) (`ecorodagem/forms.py` -> `AbastecimentoForm`)

## 5. Interfaces
- `GET /abastecimentos/` *(To-Be)* -> Lista histórico de abastecimentos com filtros por veículo, combustível e período.
- `GET | POST /abastecimentos/cadastrar/` *(To-Be)* -> Registra novo abastecimento e atualiza o hodômetro do `Veiculo`.
- `DELETE | POST /abastecimentos/<int:pk>/excluir/` *(To-Be)* -> Remove um registro de abastecimento.

## 6. Dependencies
- **Internal**: Componente `VehicleManagement` (`Veiculo` model).
- **External**: Banco de dados SQLite via Django ORM.
