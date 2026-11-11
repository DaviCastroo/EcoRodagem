# C4 Code Level: `ecorodagem/` (Core App, Templates & Static)

## 1. Overview
- **Name**: EcoRodagem Application Core (`ecorodagem`)
- **Description**: Configuração do aplicativo principal Django, roteamento de URLs, formulários ModelForm, registro no Django Admin, migrações, arquivos estáticos e templates de interface (Tailwind CSS).
- **Location**: [`ecorodagem/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem)
- **Language**: Python 3, HTML5 (Django Templates), JavaScript, CSS
- **Purpose**: Integrar modelos, views, formulários e interface visual do usuário.

---

## 2. Code Elements

### 2.1 Configuração e Admin
- **[`EcorodagemConfig`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/apps.py#L3-L5)** ([`ecorodagem/apps.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/apps.py)): Define `name = 'ecorodagem'` e `default_auto_field = 'django.db.models.BigAutoField'`.
- **[`admin.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/admin.py#L1-L6)**: Registra os modelos `Veiculo` e `Abastecer` no painel administrativo do Django (`admin.site.register`).

### 2.2 Formulários ([`ecorodagem/forms.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/forms.py))
- **[`VeiculoForm(forms.ModelForm)`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/forms.py#L5-L8)**: Formulário baseado no modelo `Veiculo` (`fields = '__all__'`).
- **[`AbastecimentoForm(forms.ModelForm)`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/forms.py#L10-L13)**: Formulário baseado no modelo `Abastecer` (`fields = '__all__'`).

### 2.3 Roteamento de URLs ([`ecorodagem/urls.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/urls.py))
- `app_name = 'ecorodagem'`
- `''` -> `dashboard` (`name='dashboard'`)
- `'veiculos/'` -> `veiculos` (`name='veiculos'`)
- `'veiculos/cadastrar/'` -> `cadastrar_veiculo` (`name='cadastrar_veiculo'`)

### 2.4 Templates ([`ecorodagem/templates/principal/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/templates/principal))
- **[`base.html`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/templates/principal/base.html)**: Layout principal em Tailwind CSS com Sidebar responsiva, Topbar, container de Toasts e importação do Chart.js e FontAwesome.
- **[`dashboard.html`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/templates/principal/dashboard.html)**: Exibe 4 cartões de KPIs (Total de Veículos, Gasto Total no Mês, Consumo Médio, Último Abastecimento), gráficos (`#expenseChart`, `#consumptionChart`), Atividades Recentes e Ações Rápidas.
- **[`veiculos.html`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/templates/principal/veiculos.html)**: Tabela interativa de veículos com busca client-side, filtro por marca, ordenação por coluna, status e botões de ação (Ver, Editar, Abastecer, Excluir).
- **[`cadastrar_veiculo.html`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/templates/principal/cadastrar_veiculo.html)**: Renderiza o `VeiculoForm` (`{{ form.as_p }}`) dentro do layout base.

### 2.5 Arquivos Estáticos ([`ecorodagem/static/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/static))
- **[`js/main.js`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/static/js/main.js)**: Contém funções client-side (`initializeApp`, `initializeNavigation`, `initializeForms`, `validateForm`, `initializeModals`, `showToast`, `filterTable`, `sortTable`, `deleteItem`). *(Nota de diagnóstico: o arquivo contém código Python `main_js_content = """..."""` ao redor do código JS, causando `SyntaxError` no navegador).*
- **[`js/charts.js`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/static/js/charts.js)** e **[`css/style.css`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/static/css/style.css)**: Arquivos atualmente vazios (`0 bytes`).

### 2.6 Migrações ([`ecorodagem/migrations/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/migrations))
- **[`0001_initial.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/migrations/0001_initial.py)**: Cria tabelas `Veiculo` e `Abastecer`.
- **[`0010_alter_abastecer_litros_alter_abastecer_tanque_cheio.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/migrations/0010_alter_abastecer_litros_alter_abastecer_tanque_cheio.py)**: Migração legada que depende de `('polls', '0009_...')`, gerando `NodeNotFoundError` ao rodar `manage.py migrate`.

---

## 3. Dependencies
- **Internal**: `ecorodagem.models`, `ecorodagem.views`.
- **External**: Django (`django.urls`, `django.forms`, `django.contrib.admin`), Tailwind CSS CDN, Chart.js CDN, FontAwesome CDN.
