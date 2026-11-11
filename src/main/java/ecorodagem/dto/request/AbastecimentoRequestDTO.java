package ecorodagem.dto.request;

import ecorodagem.domain.enums.TipoCombustivel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AbastecimentoRequestDTO(
        @NotNull(message = "O ID do veículo é obrigatório")
        Long veiculoId,

        @NotNull(message = "O tipo de combustível é obrigatório")
        TipoCombustivel combustivel,

        boolean tanqueCheio,

        @NotNull(message = "A quantidade de litros é obrigatória")
        @Positive(message = "A quantidade de litros deve ser maior que zero")
        BigDecimal litros,

        @NotNull(message = "O valor total do abastecimento é obrigatório")
        @Positive(message = "O valor total deve ser maior que zero")
        BigDecimal valorTotal,

        @NotNull(message = "O hodômetro no momento do abastecimento é obrigatório")
        @Positive(message = "O hodômetro deve ser maior que zero")
        BigDecimal hodometro,

        @Size(max = 100, message = "O local do posto deve ter no máximo 100 caracteres")
        String locPosto,

        @NotNull(message = "A data do abastecimento é obrigatória")
        LocalDate dataAbastecimento
) {
}
