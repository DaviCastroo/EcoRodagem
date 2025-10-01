from django import forms
from django.forms import ModelForm
from django.shortcuts import render, redirect
from polls.models.veiculos import *
from polls.models.abastecer import *
#from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib.auth.forms import UserCreationForm


def dashboard(request):
    """Dashboard principal com estatísticas"""
    total_veiculos = Veiculo.objects.count()
    total_abastecimentos = Abastecer.objects.count()
    ultimo_abastecimento = Abastecer.objects.order_by('-data_abastecimento').first()

    # Calcular gasto total (se houver campo valor_total no modelo)
    gasto_total = 0
    try:
        abastecimentos = Abastecer.objects.all()
        gasto_total = sum(float(a.valor_total) for a in abastecimentos if hasattr(a, 'valor_total') and a.valor_total)
    except:
        gasto_total = 0

    context = {
        'total_veiculos': total_veiculos,
        'total_abastecimentos': total_abastecimentos,
        'ultimo_abastecimento': ultimo_abastecimento,
        'gasto_total': f"{gasto_total:.2f}".replace('.', ','),
    }
    return render(request, 'polls/dashboard.html', context)