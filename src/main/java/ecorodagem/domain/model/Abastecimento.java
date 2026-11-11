package ecorodagem.domain.model;

import ecorodagem.domain.enums.TipoCombustivel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "abastecimento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Abastecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCombustivel combustivel;

    @Column(name = "unidade_medida", nullable = false, length = 10)
    private String unidadeMedida;

    @Column(name = "tanque_cheio", nullable = false)
    @Builder.Default
    private boolean tanqueCheio = false;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal litros;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "preco_litro", nullable = false, precision = 8, scale = 3)
    private BigDecimal precoLitro;

    @Column(nullable = false, precision = 10, scale = 1)
    private BigDecimal hodometro;

    @Column(name = "km_percorridos", precision = 10, scale = 1)
    private BigDecimal kmPercorridos;

    @Column(name = "media_consumo", precision = 8, scale = 2)
    private BigDecimal mediaConsumo;

    @Column(name = "custo_por_km", precision = 8, scale = 3)
    private BigDecimal custoPorKm;

    @Column(name = "loc_posto", length = 100)
    private String locPosto;

    @Column(name = "data_abastecimento", nullable = false)
    private LocalDate dataAbastecimento;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) {
            criadoEm = OffsetDateTime.now();
        }
        if (unidadeMedida == null && combustivel != null) {
            unidadeMedida = combustivel.getUnidadeVolume();
        }
    }
}
