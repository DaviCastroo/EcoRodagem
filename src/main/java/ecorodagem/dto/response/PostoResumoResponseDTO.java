package ecorodagem.dto.response;

import java.math.BigDecimal;

public record PostoResumoResponseDTO(
        String locPosto,
        long totalAbastecimentos,
        BigDecimal precoMedioLitro,
        BigDecimal totalGasto
) {
}
