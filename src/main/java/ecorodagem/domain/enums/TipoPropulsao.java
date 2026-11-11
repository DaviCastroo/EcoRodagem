package ecorodagem.domain.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

@Getter
@RequiredArgsConstructor
public enum TipoPropulsao {
    COMBUSTAO(
            "Combustão (Gasolina / Etanol / Diesel)",
            Set.of(TipoCombustivel.GASOLINA, TipoCombustivel.ETANOL, TipoCombustivel.DIESEL),
            true,
            false,
            false
    ),
    FLEX(
            "Flex (Gasolina / Etanol)",
            Set.of(TipoCombustivel.GASOLINA, TipoCombustivel.ETANOL),
            true,
            false,
            false
    ),
    BI_FUEL_GNV(
            "Bi-Combustível + GNV",
            Set.of(TipoCombustivel.GASOLINA, TipoCombustivel.ETANOL, TipoCombustivel.GNV),
            true,
            true,
            false
    ),
    HIBRIDO_HEV(
            "Híbrido Convencional (HEV)",
            Set.of(TipoCombustivel.GASOLINA, TipoCombustivel.ETANOL, TipoCombustivel.DIESEL),
            true,
            false,
            false
    ),
    HIBRIDO_PHEV(
            "Híbrido Plug-in (PHEV)",
            Set.of(TipoCombustivel.GASOLINA, TipoCombustivel.ETANOL, TipoCombustivel.ELETRICO),
            true,
            false,
            true
    ),
    ELETRICO_BEV(
            "100% Elétrico (BEV)",
            Set.of(TipoCombustivel.ELETRICO),
            false,
            false,
            true
    );

    private final String descricao;
    private final Set<TipoCombustivel> combustiveisAceitos;
    private final boolean requerTanqueLiquido;
    private final boolean requerCilindroGnv;
    private final boolean requerBateriaKwh;

    public boolean aceitaCombustivel(TipoCombustivel combustivel) {
        return combustiveisAceitos.contains(combustivel);
    }
}
