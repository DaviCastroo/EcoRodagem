from django.db import models

# Classe que define a tabela de veículos no banco de dados
class Veiculo(models.Model):
    apelido = models.CharField(max_length=50)
    placa = models.CharField(max_length=10, unique=True, blank=False, null=False) # A placa de um carro é unica.
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    cor = models.CharField(max_length=50, blank=True)
    ano = models.CharField(max_length=11, blank=True)
    hodometro = models.FloatField()
    tanque_comb = models.DecimalField(max_digits=5, decimal_places=2)
    def __str__(self):
         return f"{self.apelido.title()} - ({self.marca.title()} {self.modelo.title()}) | Placa: {self.placa.upper()}"

#Classe que define a tabela de abastecimentos no banco de dados
class Abastecer(models.Model):
    COMBUSTIVEL_CHOICES = [
        ('gasolina', 'Gasolina'),
        ('etanol', 'Etanol'),
        ('diesel', 'Diesel'),
        ('gnv', 'GNV'),
    ]

    combustivel = models.CharField(max_length=20, choices=COMBUSTIVEL_CHOICES, default='gasolina')
    tanque_cheio = models.BooleanField(default=False, help_text="Marque se o tanque foi cheio no abastecimento.")
    litros = models.DecimalField(max_digits=10, decimal_places=2, help_text="Digie a quantidade de litros abasteecidos mostrado na bomba de combustível.")
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    loc_posto = models.CharField(max_length=100, blank=True, null=True)
    data_abastecimento = models.DateField()
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)

    @property
    def preco_litro(self):
        if self.litros > 0:
            from decimal import Decimal
            return self.valor_total / self.litros
        return 0

    def __str__(self):
        return f"Abastecimento de {self.veiculo.apelido.title()} em {self.data_abastecimento}"