from django.shortcuts import render, redirect
from rest_framework.viewsets import ViewSet
from forms import VeiculoForm
from django.contrib import messages
from rest_framework import status
from models import abastecimento

def AbastecerViewSet(ViewSet):
    def create(request):
        response = super().create(request)
        if response.status.code == status.HTTP_201_CREATED:
            messages.success(request, 'Abastecimento registrado com sucesso!')
        return response
    
    def update(self, request, pk=None):
        response = super().update(request, pk)
        if response.status.code == status.HTTP_200_OK:
            return response({
                "detail": 'Abastecimento atualizado com sucesso!',
                "data": response.data
            }, status = status.HTTP_200_OK)
        return response
    
    def list(self, request):
        abastecimentos = abastecimento.objects.all()
        context = {'abastecimentos': abastecimentos,}