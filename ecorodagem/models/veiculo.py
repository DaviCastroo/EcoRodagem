from django.db import models

class Veiculo(models.Model):
    apelido = models.CharField(max_length=50)
    placa = models.CharField(max_length=10, unique=True, blank=False, null=False) 
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    cor = models.CharField(max_length=50, blank=True)
    ano = models.CharField(max_length=11, blank=True)
    hodometro = models.FloatField()
    tanque_comb = models.DecimalField(max_digits=3, decimal_places=2)
    
    def __str__(self):
        return f"{self.apelido.title()} - ({self.marca.title()} {self.modelo.title()}) | Placa: {self.placa.upper()}"

    class meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"
