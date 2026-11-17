package ecorodagem.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AiDiagnosticsResponseDTO(
        String resumoExecutivo,
        BigDecimal economiaEstimadaMensal,
        BigDecimal percentualOtimizacaoPotencial,
        DestaqueVeiculoDTO veiculoMaisEficiente,
        DestaqueVeiculoDTO pontoAtencao,
        List<RecomendacaoIaDTO> recomendacoes,
        String fonteIa,
        long latenciaMs
) {
    public record DestaqueVeiculoDTO(
            String apelido,
            String placa,
            String propulsao,
            BigDecimal custoPorKm,
            BigDecimal mediaConsumo,
            String unidadeConsumo,
            String observacao
    ) {
    }

    public record RecomendacaoIaDTO(
            String titulo,
            String descricao,
            String impacto,
            String categoria
    ) {
    }
}
