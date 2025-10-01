from django.urls import path
from .views import dashboard, veiculos, cadastrar_veiculo

app_name = 'polls'

urlpatterns = [
    path('dashboard/', dashboard.dashboard, name='dashboard'),
    path('veiculos/', veiculos.veiculos, name='veiculos'),
    path('cadastrar-veiculo/', cadastrar_veiculo.cadastrar_veiculo, name='cadastrar_veiculo'),
]