from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('veiculos/', views.veiculos, name='veiculos'),
    path('cadastrar-veiculo/', views.cadastrar_veiculo, name='cadastrar_veiculo'),
    # Adicione mais rotas conforme necessário
]