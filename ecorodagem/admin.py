<<<<<<< Updated upstream:polls/admin.py
from polls.models.veiculos import *
from polls.models.abastecer import *
=======
from .models.veiculo import Veiculo
from .models.abastecimento import Abastecer
>>>>>>> Stashed changes:ecorodagem/admin.py
from django.contrib import admin

admin.site.register(Veiculo)
admin.site.register(Abastecer)
