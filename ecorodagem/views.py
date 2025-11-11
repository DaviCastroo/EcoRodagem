from django.shortcuts import render, redirect
from .models.veiculo import Veiculo
from .models.abastecimento import Abastecer
from .forms import VeiculoForm
from django.contrib import messages

def dashboard(request):
    total_veiculos = Veiculo.objects.count()
    total_abastecimentos = Abastecer.objects.count()
    ultimo_abastecimento = Abastecer.objects.order_by('-data_abastecimento').first()

    context = {
        'total_veiculos': total_veiculos,
        'total_abastecimentos': total_abastecimentos,
        'ultimo_abastecimento': ultimo_abastecimento,
    }
    return render(request, 'principal/dashboard.html', context)

def veiculos(request):
    veiculos = Veiculo.objects.all()
    context = {
        'veiculos': veiculos,
    }
    return render(request, 'principal/veiculos.html', context)

def cadastrar_veiculo(request):
    if request.method == 'POST':
        form = VeiculoForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Veículo cadastrado com sucesso!')
            return redirect('ecorodagem:veiculos')
    else:
        form = VeiculoForm()
    return render(request, 'principal/cadastrar_veiculo.html', {'form': form})