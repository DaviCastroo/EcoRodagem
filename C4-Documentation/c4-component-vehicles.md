# C4 Component: Gestão de Frota (`VehicleManagement`)

## 1. Overview
- **Name**: Gestão de Frota (`VehicleManagement`)
- **Description**: Gerencia o ciclo de vida dos veículos do usuário (cadastro, listagem, edição, exclusão e acompanhamento de hodômetro).
- **Type**: Django Domain Component
- **Technology**: Python 3, Django 5.2 (Models, ModelForms, Function-Based Views), Tailwind CSS.

## 2. Purpose
Permite que um usuário cadastre múltiplos veículos (com apelido, placa única, marca, modelo, ano, cor, capacidade do tanque e hodômetro inicial/atual) e vincule cada veículo ao seu proprietário (`User`).

## 3. Software Features
- **Listagem de Veículos**: Exibe a frota do usuário com busca em tempo real, filtro por marca e ordenação por coluna.
- **Cadastro de Veículo**: Valida placa única e formato brasileiro (`ABC-1234` ou Mercosul `ABC1D23`), capacidade do tanque e hodômetro.
- **Edição e Exclusão de Veículo** *(Planejado/To-Be)*: Atualização cadastral e exclusão com modal de confirmação (`DELETE /veiculos/<id>/delete/`).

## 4. Code Elements
- [c4-code-ecorodagem-models.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-models.md) (`ecorodagem/models/veiculo.py`)
- [c4-code-ecorodagem-views.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-views.md) (`ecorodagem/views/veiculos.py`)
- [c4-code-ecorodagem-core.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-core.md) (`ecorodagem/forms.py`, `ecorodagem/templates/principal/veiculos.html`, `cadastrar_veiculo.html`)

## 5. Interfaces
- `GET /veiculos/` -> Renderiza lista de veículos do usuário logado.
- `GET | POST /veiculos/cadastrar/` -> Exibe e processa formulário de novo veículo.
- `GET | POST /veiculos/<int:pk>/editar/` *(To-Be)* -> Edição de veículo existente.
- `DELETE | POST /veiculos/<int:pk>/excluir/` *(To-Be)* -> Exclusão de veículo.

## 6. Dependencies
- **Internal**: Componente `IdentityAndAuth` (vínculo `usuario = ForeignKey(User)`), Componente `FuelingAndConsumption` (exibição da média de consumo por veículo na tabela).
- **External**: Banco de dados SQLite via Django ORM.
