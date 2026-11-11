package ecorodagem.domain.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TipoCombustivel {
    GASOLINA("Gasolina", "L", "km/L"),
    ETANOL("Etanol", "L", "km/L"),
    DIESEL("Diesel", "L", "km/L"),
    GNV("GNV", "m³", "km/m³"),
    ELETRICO("Elétrico (Recarga)", "kWh", "km/kWh");

    private final String descricao;
    private final String unidadeVolume;
    private final String unidadeConsumo;
}
