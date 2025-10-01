from django.urls import path
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from .views import dashboard, veiculos, cadastrar_veiculo


urlpatterns = [
    path('admin/', admin.site.urls),
    # path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/', include("django.contrib.auth.urls")),
    path('dashboard/', dashboard.dashboard, name='dashboard'),
    path('veiculos/', veiculos.veiculos, name='veiculos'),
    path('cadastrar-veiculo/', cadastrar_veiculo.cadastrar_veiculo, name='cadastrar_veiculo'),
    # path('login/', registration.login , name='login'),

    # Adicione mais URLs conforme necessário
    # path('abastecimentos/', views.abastecimentos, name='abastecimentos'),
    # path('cadastrar-abastecimento/', views.cadastrar_abastecimento, name='cadastrar_abastecimento'),
    # path('relatorios/', views.relatorios, name='relatorios'),
]