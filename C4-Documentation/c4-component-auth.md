# C4 Component: Autenticação & Perfis (`IdentityAndAuth`)

## 1. Overview
- **Name**: Autenticação & Perfis (`IdentityAndAuth`)
- **Description**: Gerencia autenticação de usuários (login, logout, registro) e isolamento multi-tenant dos dados (cada usuário visualiza e gerencia apenas seus próprios veículos e abastecimentos).
- **Type**: Security & Identity Component
- **Technology**: `django.contrib.auth`, Django Sessions & CSRF Middleware.

## 2. Purpose
Garantir que múltiplos usuários possam utilizar o sistema EcoRodagem com privacidade, mantendo suas frotas e históricos de abastecimento isolados.

## 3. Software Features
- **Login / Logout de Usuário**: Autenticação baseada em sessão via `django.contrib.auth.views`.
- **Cadastro de Conta (Sign-up)**: Formulário de registro de novos motoristas/usuários.
- **Proteção de Rotas (`@login_required`)**: Restrição de acesso às telas de Dashboard, Veículos e Abastecimentos para usuários autenticados.

## 4. Code Elements
- [c4-code-ecorodagem-models.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-ecorodagem-models.md) (`ecorodagem/models/registro.py`)
- [c4-code-config-and-legacy.md](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/C4-Documentation/c4-code-config-and-legacy.md) (`templates/registration/login.html`, `config/settings.py`)

## 5. Interfaces
- `GET | POST /accounts/login/` -> Tela de autenticação.
- `POST /accounts/logout/` -> Encerramento de sessão.
- `GET | POST /accounts/registrar/` *(To-Be)* -> Criação de nova conta de usuário.
