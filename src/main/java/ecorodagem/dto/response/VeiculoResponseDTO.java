package ecorodagem.dto.response;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoPropulsao;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record VeiculoResponseDTO(
        Long id,
        String apelido,
        String placa,
        String marca,
        String modelo,
        String cor,
        String ano,
        CategoriaVeiculo categoria,
        TipoPropulsao propulsao,
        BigDecimal hodometroInicial,
        BigDecimal hodometroAtual,
        BigDecimal tanqueComb,
        BigDecimal capacidadeGnvM3,
        BigDecimal capacidadeBateriaKwh,
        BigDecimal consumoMedio,
        String unidadeConsumoPrincipal,
        BigDecimal custoMedioPorKm,
        boolean ativo,
        OffsetDateTime criadoEm
) {
}
