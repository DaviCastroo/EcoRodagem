from django.shortcuts import render
from . import models
from .models import Veiculo, Abastecer
from django.shortcuts import render, redirect
from django.contrib import messages

# Define a view para as estatisticas do dashboard
def dashboard(request):
    # Estatísticas para o dashboard
    total_veiculos = Veiculo.objects.count()
    ultimo_abastecimento = Abastecer.objects.order_by('-data_abastecimento').first()

    context = {
        'total_veiculos': total_veiculos,
        'ultimo_abastecimento': ultimo_abastecimento,
        # Adicione mais dados conforme necessário
    }
    return render(request, 'app_name/dashboard.html', context)

def veiculos(request):
    veiculos = Veiculo.objects.all()
    context = {
        'veiculos': veiculos,
    }
    return render(request, 'app_name/veiculos.html', context)

def cadastrar_veiculo(request):
    if request.method == 'POST':
        messages.success(request, 'Veículo cadastrado com sucesso!')
        return redirect('veiculos')
    return render(request, 'app_name/cadastrar_veiculo.html')



#FUNÇÃO PARA ADICIONAR VEÍCULOS JA COM TRATAMENTO DE ERRO/ EXCEÇÃO
lista_veiculos = []
def adicionar_veiculo(lista_veiculos):
    placa = input("Digite a placa do veículo: ").strip().upper()
    # verifica se já há algum veículo com a mesma placa
    for v in lista_veiculos:
        if v.placa == placa:
            print("Placa já cadastrada. Deseja tentar cadastrar outro veículo? (Sim/Não)")
            resposta = input().strip().lower()
            if resposta == "sim":
                return adicionar_veiculo(lista_veiculos)
            else:
                print("Cadastro cancelado.")
                return None

    apelido = input("Digite o apelido do veículo: ")
    marca = input("Digite a marca do veículo: ")
    modelo = input("Digite o modelo do veículo: ")
    cor = input("Digite a cor do veículo: ")
    ano = input("Digite o ano do veículo (Ex.: 2015/2016): ")
    hodometro = input("Digite a quilometragem atual do veículo: ")
    tanqueComb = input("Digite a capacidade do tanque de combustível (em litros): ")

    novo_veiculo = Veiculo(apelido.title(), modelo.title(), marca.title(), cor.title(), ano, hodometro, tanqueComb, placa.upper())
    #
    lista_veiculos.append(novo_veiculo)

    print("\nVeículo cadastrado com sucesso!")
    print(novo_veiculo)
    return novo_veiculo

def listar_veiculos(lista_veiculos):
    if not lista_veiculos:
        print("Nenhum veículo cadastrado.")
    else:
        print("\nVeículos cadastrados:")
        for v in lista_veiculos:
            print(v)


#FUNÇÃO PARA ADICIONAR ABASTECIMENTOS
lista_abastecimentos = []
def adicionar_abastecimento(lista_abastecimentos):
    placa = input("Digite a placa do veículo que foi abastecido: ").strip().upper()
    # verifica se há algum veículo com a placa informada
    veiculo_encontrado = None
    for v in Veiculo.lista_veiculos:
        if v.placa == placa:
            veiculo_encontrado = v
            break
        else:
            print("Veiculo não encontrado. Deseja cadastra-lo? (Sim/Não)")
            resposta = input().strip().lower()
            if resposta == "sim":
                return adicionar_veiculo(lista_veiculos)

    combustivel = input("Digite o tipo de combustível (Gasolina, Etanol, Diesel, GNV): ")
    valor_total = input("Digite o valor total do abastecimento (em R$): ")
    litros = input("Digite a quantidade de litros abastecidos: ")
    loc_posto = input("Digite o local do posto de combustível: ")
    data_abastecimento = input("Digite a data do abastecimento (DD/MM/AAAA): ")
    novo_abastecimento = Abastecer(combustivel.title(), valor_total, litros, loc_posto.title(), data_abastecimento, placa.upper(), veiculo_encontrado)
    lista_abastecimentos.append(novo_abastecimento)

    print("\nAbastecimento registrado com sucesso!")
    print(novo_abastecimento)
    return novo_abastecimento


#MOSTRA OS ABASTECIMENTOS
def listar_abastecimentos(lista_abastecimentos):
    if not lista_abastecimentos:
        print("Nenhum abastecimento registrado.")
    else:
        print("\nAbastecimentos registrados:")
        for a in lista_abastecimentos:
            print(a)
