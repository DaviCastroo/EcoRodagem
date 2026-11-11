package ecorodagem.dto.response;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoPropulsao;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponseDTO(
        long totalVeiculos,
        long totalAbastecimentos,
        BigDecimal gastoTotalMesAtual,
        BigDecimal consumoMedioFrotaKmPorLitro,
        BigDecimal custoMedioFrotaPorKm,
        AbastecimentoResponseDTO ultimoAbastecimento,
        List<GastoMensalDTO> gastosPorMes,
        List<ConsumoVeiculoDTO> consumoPorVeiculo
) {
    public record GastoMensalDTO(
            String anoMes,
            BigDecimal valorTotal
    ) {
    }

    public record ConsumoVeiculoDTO(
            Long veiculoId,
            String apelido,
            String placa,
            CategoriaVeiculo categoria,
            TipoPropulsao propulsao,
            BigDecimal mediaConsumo,
            String unidadeConsumo,
            BigDecimal custoMedioPorKm
    ) {
    }
}
