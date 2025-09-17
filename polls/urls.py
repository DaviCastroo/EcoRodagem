from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('veiculos/', views.veiculos, name='veiculos'),
    path('cadastrar-veiculo/', views.cadastrar_veiculo, name='cadastrar_veiculo'),
    # Adicione mais URLs conforme necessário
    # path('abastecimentos/', views.abastecimentos, name='abastecimentos'),
    # path('cadastrar-abastecimento/', views.cadastrar_abastecimento, name='cadastrar_abastecimento'),
    # path('relatorios/', views.relatorios, name='relatorios'),
]