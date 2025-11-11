from django.db import models
from django import forms

class registro(forms.Form):
    username = forms.CharField(max_length=15)
    email = forms.EmailField()
    telefone = forms.charField(max_length=11)
    cpf = forms.charField(max_length=11)
    genero_choices = [
        ('Masculino', 'Feminino')
        ('Prefiro não informar', 'Outro')]
    password = forms.CharField(min_length=6, max_length=15)

