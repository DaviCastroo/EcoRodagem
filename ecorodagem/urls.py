from django.urls import path
from .views import dashboard, veiculos, cadastrar_veiculo

app_name = 'ecorodagem'

urlpatterns = [
<<<<<<< Updated upstream
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('polls.urls')),  # ← Isso já inclui todas as URLs do polls
=======
    path('', dashboard, name='dashboard'),                    
    path('veiculos/', veiculos, name='veiculos'),            
    path('veiculos/cadastrar/', cadastrar_veiculo, name='cadastrar_veiculo'),  
>>>>>>> Stashed changes
]