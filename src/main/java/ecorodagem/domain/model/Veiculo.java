package ecorodagem.domain.model;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoPropulsao;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "veiculo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String apelido;

    @Column(nullable = false, unique = true, length = 10)
    private String placa;

    @Column(nullable = false, length = 50)
    private String marca;

    @Column(nullable = false, length = 50)
    private String modelo;

    @Column(length = 50)
    private String cor;

    @Column(length = 11)
    private String ano;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CategoriaVeiculo categoria = CategoriaVeiculo.CARRO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TipoPropulsao propulsao = TipoPropulsao.FLEX;

    @Column(name = "hodometro_inicial", nullable = false, precision = 10, scale = 1)
    private BigDecimal hodometroInicial;

    @Column(name = "hodometro_atual", nullable = false, precision = 10, scale = 1)
    private BigDecimal hodometroAtual;

    @Column(name = "tanque_comb", precision = 5, scale = 2)
    private BigDecimal tanqueComb;

    @Column(name = "capacidade_gnv_m3", precision = 5, scale = 2)
    private BigDecimal capacidadeGnvM3;

    @Column(name = "capacidade_bateria_kwh", precision = 6, scale = 2)
    private BigDecimal capacidadeBateriaKwh;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Abastecimento> abastecimentos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) {
            criadoEm = OffsetDateTime.now();
        }
        if (hodometroAtual == null && hodometroInicial != null) {
            hodometroAtual = hodometroInicial;
        }
        if (categoria == null) {
            categoria = CategoriaVeiculo.CARRO;
        }
        if (propulsao == null) {
            propulsao = TipoPropulsao.FLEX;
        }
    }
}
