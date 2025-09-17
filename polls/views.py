from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Veiculo, Abastecer

# DASHBOARD
def dashboard(request):
    total_veiculos = Veiculo.objects.count()
    ultimo_abastecimento = Abastecer.objects.order_by('-data_abastecimento').first()

    context = {
        'total_veiculos': total_veiculos,
        'ultimo_abastecimento': ultimo_abastecimento,
    }
    return render(request, 'polls/dashboard.html', context)


# LISTAR VEÍCULOS
def veiculos(request):
    veiculos = Veiculo.objects.all()  # busca do banco
    context = {
        'veiculos': veiculos,
    }
    return render(request, 'polls/veiculos.html', context)


# CADASTRAR VEÍCULO (simples, sem formulário ainda)
def cadastrar_veiculo(request):
    if request.method == 'POST':
        placa = request.POST.get("placa")
        apelido = request.POST.get("apelido")
        marca = request.POST.get("marca")
        modelo = request.POST.get("modelo")
        cor = request.POST.get("cor")
        ano = request.POST.get("ano")
        hodometro = request.POST.get("hodometro")
        tanqueComb = request.POST.get("tanqueComb")

        Veiculo.objects.create(
            placa=placa.upper(),
            apelido=apelido,
            marca=marca,
            modelo=modelo,
            cor=cor,
            ano=ano,
            hodometro=hodometro,
            tanqueComb=tanqueComb
        )
        messages.success(request, 'Veículo cadastrado com sucesso!')
        return redirect('veiculos')

    return render(request, 'polls/cadastrar_veiculo.html')