from django.urls import path
from django.shortcuts import redirect
from .views import dashboard, veiculos, cadastrar_veiculo

urlpatterns = [
    path('', lambda request: redirect('/dashboard/'), name='home'),  # ← Adicione isso
    path('dashboard/', dashboard.dashboard, name='dashboard'),
    path('veiculos/', veiculos.veiculos, name='veiculos'),
    path('cadastrar-veiculo/', cadastrar_veiculo.cadastrar_veiculo, name='cadastrar_veiculo'),
]