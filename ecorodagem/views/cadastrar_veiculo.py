from polls.models.veiculos import *
from polls.models.abastecer import *
from django.shortcuts import render, redirect
from django.contrib import messages

def cadastrar_veiculo(request):
    """Cadastra um novo veículo"""
    if request.method == 'POST':
        try:
            # Capturar dados do formulário
            placa = request.POST.get('placa', '').strip().upper()
            apelido = request.POST.get('apelido', '').strip()
            marca = request.POST.get('marca', '').strip()
            modelo = request.POST.get('modelo', '').strip()
            cor = request.POST.get('cor', '').strip()
            ano = request.POST.get('ano', '').strip()
            hodometro = request.POST.get('hodometro', '0')
            tanqueComb = request.POST.get('tanqueComb', '0')

            # Validações básicas
            if not all([placa, apelido, marca, modelo, ano, hodometro, tanqueComb]):
                messages.error(request, 'Por favor, preencha todos os campos obrigatórios.')
                return render(request, 'polls/cadastrar_veiculo.html')

            # Verificar se a placa já existe
            if Veiculo.objects.filter(placa=placa).exists():
                messages.error(request, f'Já existe um veículo cadastrado com a placa {placa}.')
                return render(request, 'polls/cadastrar_veiculo.html')

            # Construtor
            veiculo = Veiculo.objects.create(
                placa=placa,
                apelido=apelido,
                marca=marca,
                modelo=modelo,
                cor=cor,
                ano=ano,
                hodometro=int(hodometro),
                tanqueComb=int(tanqueComb)
            )

            messages.success(request, f'Veículo "{apelido}" cadastrado com sucesso!')
            return redirect('veiculos')

        except ValueError as e:
            messages.error(request, 'Erro nos dados numéricos. Verifique quilometragem e capacidade do tanque.')
            return render(request, 'polls/cadastrar_veiculo.html')
        except Exception as e:
            messages.error(request, f'Erro ao cadastrar veículo: {str(e)}')
            return render(request, 'polls/cadastrar_veiculo.html')

    return render(request, 'polls/cadastrar_veiculo.html')