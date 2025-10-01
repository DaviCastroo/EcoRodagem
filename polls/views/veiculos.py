from polls.models.veiculos import *
from polls.models.abastecer import *
from django.shortcuts import render, redirect
from django.contrib import messages

def veiculos(request):
    """Lista todos os veículos cadastrados"""
    veiculos = Veiculo.objects.all()
    context = {
        'veiculos': veiculos,
    }
    return render(request, 'polls/veiculos.html', context)


