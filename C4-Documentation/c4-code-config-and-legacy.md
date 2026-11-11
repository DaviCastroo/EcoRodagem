# C4 Code Level: `config/` & Legados (`polls/`, `templates/`)

## 1. Overview
- **Name**: Project Configuration & Legacy Modules (`config`, `polls`, `templates`)
- **Description**: Configurações globais do projeto Django (`settings.py`, `urls.py`, `wsgi.py`, `asgi.py`) e artefatos remanescentes da migração do antigo app `polls` para `ecorodagem`.
- **Location**: [`config/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/config), [`polls/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/polls), [`templates/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/templates)
- **Language**: Python 3, HTML5
- **Purpose**: Inicializar o servidor WSGI/ASGI, configurar banco de dados SQLite, internacionalização (`pt-br`), rotas raiz e armazenar templates de autenticação/legados.

---

## 2. Code Elements

### 2.1 Configuração do Projeto (`config/`)
- **[`config/settings.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/config/settings.py)**:
  - `INSTALLED_APPS`: Inclui apps padrão do Django e `'ecorodagem.apps.EcorodagemConfig'`.
  - `DATABASES`: Configura `sqlite3` apontando para `BASE_DIR / 'db.sqlite3'`.
  - `LANGUAGE_CODE = 'pt-br'`, `TIME_ZONE = 'America/Sao_Paulo'`.
  - `STATICFILES_DIRS`: Aponta para `BASE_DIR / 'ecorodagem' / 'static'`.
- **[`config/urls.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/config/urls.py)**:
  - `'admin/'` -> `admin.site.urls`
  - `''` -> `include('ecorodagem.urls')`
- **[`config/wsgi.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/config/wsgi.py)** & **[`config/asgi.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/config/asgi.py)**: Entrypoints padrão de deploy WSGI e ASGI.

### 2.2 Artefatos Legados e Autenticação (`polls/`, `templates/`)
- **[`polls/urls.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/polls/urls.py)**: Antigo arquivo de rotas de quando o app se chamava `polls`. Não está mais incluído em `config/urls.py`.
- **[`templates/polls/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/templates/polls)**: Templates antigos em Bootstrap (`base.html`, `dashboard.html`, `veiculos.html`, `cadastrar_veiculo.html`) que possuem formulários ricos e máscaras de input úteis como referência de design.
- **[`templates/registration/login.html`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/templates/registration/login.html)**: Template de login para o sistema de autenticação do Django (`django.contrib.auth`).

---

## 3. Dependencies
- **Internal**: `ecorodagem.urls`, `ecorodagem.apps.EcorodagemConfig`.
- **External**: `django.contrib.admin`, `django.urls`, `django.core.wsgi`, `django.core.asgi`, `pathlib.Path`.
