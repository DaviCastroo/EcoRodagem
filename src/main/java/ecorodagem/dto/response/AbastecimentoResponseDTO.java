package ecorodagem.dto.response;

import ecorodagem.domain.enums.TipoCombustivel;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AbastecimentoResponseDTO(
        Long id,
        Long veiculoId,
        String veiculoApelido,
        String veiculoPlaca,
        TipoCombustivel combustivel,
        String unidadeMedida,
        String unidadeConsumo,
        boolean tanqueCheio,
        BigDecimal litros,
        BigDecimal valorTotal,
        BigDecimal precoLitro,
        BigDecimal hodometro,
        BigDecimal kmPercorridos,
        BigDecimal mediaConsumoKmPorLitro,
        BigDecimal custoPorKm,
        String locPosto,
        LocalDate dataAbastecimento,
        OffsetDateTime criadoEm
) {
}
