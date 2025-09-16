from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Veiculo, Abastecer


def dashboard(request):
    total_veiculos = Veiculo.objects.count()
    total_abastecimentos = Abastecer.objects.count()
    ultimo_abastecimento = Abastecer.objects.order_by('-data_abastecimento').first()

    context = {
        'total_veiculos': total_veiculos,
        'total_abastecimentos': total_abastecimentos,
        'ultimo_abastecimento': ultimo_abastecimento,
    }
    return render(request, 'polls/templates/dashboard.html', context)


def veiculos(request):
    veiculos = Veiculo.objects.all()
    context = {
        'veiculos': veiculos,
    }
    return render(request, 'polls/templates/veiculos.html', context)


def cadastrar_veiculo(request):
    if request.method == 'POST':
        messages.success(request, 'Veículo cadastrado com sucesso!')
        return redirect('polls:veiculos')
    return render(request, 'polls/cadastrar_veiculo.html')