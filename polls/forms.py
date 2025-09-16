from django import forms
from .models import Veiculo, Abastecer

class VeiculoForm(forms.ModelForm):
    class Meta:
        model = Veiculo
        fields = '__all__'

class AbastecimentoForm(forms.ModelForm):
    class Meta:
        model = Abastecer
        fields = '__all__'