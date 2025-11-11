<<<<<<< Updated upstream:polls/views/veiculos.py
from polls.models.veiculos import *
from polls.models.abastecer import *
from django.shortcuts import render, redirect
from django.contrib import messages

def veiculos(request):
    """Lista todos os veículos cadastrados"""
=======
from django.shortcuts import render, redirect
from ..forms import VeiculoForm
from django.contrib import messages
from ..models.veiculo import Veiculo

def veiculos(request):
>>>>>>> Stashed changes:ecorodagem/views/veiculos.py
    veiculos = Veiculo.objects.all()
    context = {
        'veiculos': veiculos,
    }
<<<<<<< Updated upstream:polls/views/veiculos.py
    return render(request, 'polls/veiculos.html', context)


=======
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

    def update(self, request, pk=None):
        response = super().update(request, pk)
        if response.status.code == status.HTTP_200_OK:
            return response({
                "detail": 'Veículo atualizado com sucesso!',
                "data": response.data
            }, status = status.HTTP_200_OK)
        return response
    
>>>>>>> Stashed changes:ecorodagem/views/veiculos.py
