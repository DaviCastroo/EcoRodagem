# C4 Code Level: `ecorodagem/views/` & `ecorodagem/views.py`

## 1. Overview
- **Name**: EcoRodagem Views & Controllers (`ecorodagem/views`)
- **Description**: Controladores HTTP (Function-Based Views) responsáveis por processar requisições de dashboard e gestão de veículos.
- **Location**: [`ecorodagem/views/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views) e [`ecorodagem/views.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py)
- **Language**: Python 3 / Django
- **Purpose**: Orquestrar a busca de dados nos modelos `Veiculo` e `Abastecer` e renderizar os templates HTML em `principal/`.

---

## 2. Code Elements

> [!WARNING]
> **Conflito Estrutural Detectado**: O diretório [`ecorodagem/views/`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views) (pacote Python com `__init__.py` vazio) coexiste no mesmo nível que o módulo [`ecorodagem/views.py`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py). No Python, um pacote (diretório com `__init__.py`) tem precedência sobre um módulo de mesmo nome (`views.py`), fazendo com que `from .views import dashboard, veiculos, cadastrar_veiculo` em `ecorodagem/urls.py` falhe ao tentar importar `cadastrar_veiculo` do pacote vazio `ecorodagem/views/__init__.py`.

### 2.1 Functions

#### [`dashboard(request: HttpRequest) -> HttpResponse`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py#L7-L17)
- **Locations**:
  - [`ecorodagem/views.py#L7-L17`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py#L7-L17)
  - [`ecorodagem/views/dashboard.py#L6-L16`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views/dashboard.py#L6-L16)
- **Description**: Calcula contadores gerais (`total_veiculos`, `total_abastecimentos`) e busca o `ultimo_abastecimento` ordenado por `-data_abastecimento`. Renderiza `principal/dashboard.html`.
- **Dependencies**: `Veiculo`, `Abastecer`, `django.shortcuts.render`.

#### [`veiculos(request: HttpRequest) -> HttpResponse`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py#L19-L24)
- **Locations**:
  - [`ecorodagem/views.py#L19-L24`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py#L19-L24)
  - [`ecorodagem/views/veiculos.py#L6-L11`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views/veiculos.py#L6-L11)
- **Description**: Lista todos os registros de `Veiculo` (`Veiculo.objects.all()`) e renderiza `principal/veiculos.html`.
- **Dependencies**: `Veiculo`, `django.shortcuts.render`.

#### [`cadastrar_veiculo(request: HttpRequest) -> HttpResponse`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py#L26-L35)
- **Locations**:
  - [`ecorodagem/views.py#L26-L35`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views.py#L26-L35)
  - [`ecorodagem/views/veiculos.py#L13-L22`](file:///c:/Users/davic/OneDrive/Documentos/GitHub/EcoRodagem/ecorodagem/views/veiculos.py#L13-L22)
- **Description**: Exibe (`GET`) e processa (`POST`) o formulário `VeiculoForm`. Quando válido, salva o veículo, adiciona mensagem de sucesso e redireciona para `ecorodagem:veiculos`.
- **Dependencies**: `VeiculoForm`, `django.contrib.messages`, `django.shortcuts.render`, `django.shortcuts.redirect`.

---

## 3. Dependencies
- **Internal**:
  - `ecorodagem.models.veiculo.Veiculo`
  - `ecorodagem.models.abastecimento.Abastecer`
  - `ecorodagem.forms.VeiculoForm`
- **External**:
  - `django.shortcuts` (`render`, `redirect`)
  - `django.contrib.messages`
