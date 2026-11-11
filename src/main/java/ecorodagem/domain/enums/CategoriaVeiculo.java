package ecorodagem.domain.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CategoriaVeiculo {
    CARRO("Carro"),
    MOTO("Moto"),
    UTILITARIO("Utilitário / Picape / Van"),
    CAMINHAO("Caminhão");

    private final String descricao;
}
