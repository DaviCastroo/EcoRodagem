from django.db import models
from django.dispatch import receiver
from django.template.defaultfilters import upper


# Classe que define a tabela de veículos no banco de dados
class Veiculo(models.Model):
    apelido = models.CharField(max_length=50)
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    cor = models.CharField(max_length=50)
    ano = models.CharField(max_length=11)
    hodometro = models.FloatField()
    tanque_comb = models.FloatField()
    placa = models.CharField(max_length=10, unique=True) # É uma boa prática garantir que a placa seja única
    def __str__(self):
         return f"{self.apelido} - ({self.marca} {self.modelo}) | Placa: {self.placa}"

#Classe que define a tabela de abastecimentos no banco de dados
class Abastecer(models.Model):
    COMBUSTIVEL_CHOICES = [
        ('gasolina', 'Gasolina'),
        ('etanol', 'Etanol'),
        ('diesel', 'Diesel'),
        ('gnv', 'GNV'),
        ('elétrrioco', 'Elétrico'),
    ]
    combustivel = models.CharField(max_length=20, choices=COMBUSTIVEL_CHOICES, default='gasolina')
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    litros = models.FloatField()
    loc_posto = models.CharField(max_length=100, blank=True, null=True)
    data_abastecimento = models.DateField()
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)

    def __str__(self):
        return f"Abastecimento de {self.veiculo.apelido} em {self.data_abastecimento}"