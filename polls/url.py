from django.urls import path
from . import views

app_name = 'polls'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),                    # Dashboard principal
    path('veiculos/', views.veiculos, name='veiculos'),            # Lista de veículos
    path('veiculos/cadastrar/', views.cadastrar_veiculo, name='cadastrar_veiculo'),  # Cadastrar veículo
]