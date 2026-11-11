package ecorodagem.dto.request;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoPropulsao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record VeiculoRequestDTO(
        @NotBlank(message = "O apelido do veículo é obrigatório")
        @Size(max = 50, message = "O apelido deve ter no máximo 50 caracteres")
        String apelido,

        @NotBlank(message = "A placa é obrigatória")
        @Pattern(
                regexp = "^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$",
                message = "Formato de placa inválido (use ABC-1234 ou padrão Mercosul ABC1D23)"
        )
        String placa,

        @NotBlank(message = "A marca é obrigatória")
        @Size(max = 50)
        String marca,

        @NotBlank(message = "O modelo é obrigatório")
        @Size(max = 50)
        String modelo,

        @Size(max = 50)
        String cor,

        @Size(max = 11)
        String ano,

        CategoriaVeiculo categoria,

        TipoPropulsao propulsao,

        @NotNull(message = "O hodômetro inicial é obrigatório")
        @PositiveOrZero(message = "O hodômetro não pode ser negativo")
        BigDecimal hodometro,

        @Positive(message = "A capacidade do tanque líquido deve ser maior que zero")
        BigDecimal tanqueComb,

        @Positive(message = "A capacidade do cilindro GNV (m³) deve ser maior que zero")
        BigDecimal capacidadeGnvM3,

        @Positive(message = "A capacidade da bateria (kWh) deve ser maior que zero")
        BigDecimal capacidadeBateriaKwh
) {
    public VeiculoRequestDTO(
            String apelido,
            String placa,
            String marca,
            String modelo,
            String cor,
            String ano,
            BigDecimal hodometro,
            BigDecimal tanqueComb
    ) {
        this(apelido, placa, marca, modelo, cor, ano, CategoriaVeiculo.CARRO, TipoPropulsao.FLEX, hodometro, tanqueComb, null, null);
    }
}
