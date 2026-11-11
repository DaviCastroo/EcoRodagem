package ecorodagem.service;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoCombustivel;
import ecorodagem.domain.enums.TipoPropulsao;
import ecorodagem.dto.request.AbastecimentoRequestDTO;
import ecorodagem.dto.request.VeiculoRequestDTO;
import ecorodagem.dto.response.AbastecimentoResponseDTO;
import ecorodagem.dto.response.DashboardResponseDTO;
import ecorodagem.dto.response.VeiculoResponseDTO;
import ecorodagem.exception.RegraNegocioException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AbastecimentoServiceTest {

    @Autowired
    private VeiculoService veiculoService;

    @Autowired
    private AbastecimentoService abastecimentoService;

    @Autowired
    private DashboardService dashboardService;

    @Test
    @DisplayName("Deve cadastrar veículo Flex, registrar abastecimentos e calcular preço/L, km/L e R$/km")
    void deveCalcularMediaDeConsumoEPrecoLitroCorretamente() {
        VeiculoRequestDTO veiculoReq = new VeiculoRequestDTO(
                "Meu Civic",
                "ABC-1234",
                "Honda",
                "Civic",
                "Prata",
                "2022/2023",
                new BigDecimal("10000.0"),
                new BigDecimal("50.00")
        );
        VeiculoResponseDTO veiculo = veiculoService.cadastrar(veiculoReq);
        assertThat(veiculo.id()).isNotNull();
        assertThat(veiculo.categoria()).isEqualTo(CategoriaVeiculo.CARRO);
        assertThat(veiculo.propulsao()).isEqualTo(TipoPropulsao.FLEX);
        assertThat(veiculo.hodometroAtual()).isEqualByComparingTo("10000.0");

        // 1º abastecimento: rodou 480 km e abasteceu 40 L por R$ 240,00 -> 12.00 km/L e R$ 0.500/km
        AbastecimentoRequestDTO abast1Req = new AbastecimentoRequestDTO(
                veiculo.id(),
                TipoCombustivel.GASOLINA,
                true,
                new BigDecimal("40.00"),
                new BigDecimal("240.00"),
                new BigDecimal("10480.0"),
                "Posto Shell Centro",
                LocalDate.now()
        );
        AbastecimentoResponseDTO abast1 = abastecimentoService.registrar(abast1Req);

        assertThat(abast1.precoLitro()).isEqualByComparingTo("6.000");
        assertThat(abast1.kmPercorridos()).isEqualByComparingTo("480.0");
        assertThat(abast1.mediaConsumoKmPorLitro()).isEqualByComparingTo("12.00");
        assertThat(abast1.custoPorKm()).isEqualByComparingTo("0.500");
        assertThat(abast1.unidadeMedida()).isEqualTo("L");
        assertThat(abast1.unidadeConsumo()).isEqualTo("km/L");

        // 2º abastecimento: rodou 390 km e abasteceu 30 L por R$ 174,00 -> 13.00 km/L
        AbastecimentoRequestDTO abast2Req = new AbastecimentoRequestDTO(
                veiculo.id(),
                TipoCombustivel.GASOLINA,
                true,
                new BigDecimal("30.00"),
                new BigDecimal("174.00"),
                new BigDecimal("10870.0"),
                "Posto Ipiranga Sul",
                LocalDate.now()
        );
        AbastecimentoResponseDTO abast2 = abastecimentoService.registrar(abast2Req);

        assertThat(abast2.precoLitro()).isEqualByComparingTo("5.800");
        assertThat(abast2.kmPercorridos()).isEqualByComparingTo("390.0");
        assertThat(abast2.mediaConsumoKmPorLitro()).isEqualByComparingTo("13.00");

        VeiculoResponseDTO veiculoAtualizado = veiculoService.buscarPorId(veiculo.id());
        assertThat(veiculoAtualizado.hodometroAtual()).isEqualByComparingTo("10870.0");
        assertThat(veiculoAtualizado.consumoMedio()).isEqualByComparingTo("12.50");

        DashboardResponseDTO dashboard = dashboardService.obterResumoDashboard();
        assertThat(dashboard.totalVeiculos()).isEqualTo(1);
        assertThat(dashboard.totalAbastecimentos()).isEqualTo(2);
        assertThat(dashboard.gastoTotalMesAtual()).isEqualByComparingTo("414.00");
        assertThat(dashboard.consumoMedioFrotaKmPorLitro()).isEqualByComparingTo("12.50");
    }

    @Test
    @DisplayName("Deve suportar veículo 100% Elétrico (BEV) com bateria em kWh e bloquear gasolina")
    void deveSuportarVeiculoEletricoEBloquearGasolina() {
        VeiculoRequestDTO bydDolphinReq = new VeiculoRequestDTO(
                "BYD Dolphin",
                "ELE1A23",
                "BYD",
                "Dolphin GS",
                "Cinza",
                "2025",
                CategoriaVeiculo.CARRO,
                TipoPropulsao.ELETRICO_BEV,
                new BigDecimal("5000.0"),
                null,
                null,
                new BigDecimal("44.90")
        );
        VeiculoResponseDTO eletrico = veiculoService.cadastrar(bydDolphinReq);
        assertThat(eletrico.unidadeConsumoPrincipal()).isEqualTo("km/kWh");

        // Recarga elétrica: rodou 300 km com 40 kWh pagando R$ 60,00 -> 7.50 km/kWh e R$ 0.200/km
        AbastecimentoResponseDTO recarga = abastecimentoService.registrar(new AbastecimentoRequestDTO(
                eletrico.id(),
                TipoCombustivel.ELETRICO,
                true,
                new BigDecimal("40.00"),
                new BigDecimal("60.00"),
                new BigDecimal("5300.0"),
                "Eletroposto Tupinambá Shopping",
                LocalDate.now()
        ));

        assertThat(recarga.unidadeMedida()).isEqualTo("kWh");
        assertThat(recarga.unidadeConsumo()).isEqualTo("km/kWh");
        assertThat(recarga.mediaConsumoKmPorLitro()).isEqualByComparingTo("7.50");
        assertThat(recarga.custoPorKm()).isEqualByComparingTo("0.200");

        // Tentar abastecer Gasolina em veículo 100% elétrico deve lançar erro de regra de negócio
        assertThatThrownBy(() -> abastecimentoService.registrar(new AbastecimentoRequestDTO(
                eletrico.id(),
                TipoCombustivel.GASOLINA,
                true,
                new BigDecimal("20.00"),
                new BigDecimal("120.00"),
                new BigDecimal("5500.0"),
                "Posto Comum",
                LocalDate.now()
        )))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("não aceita abastecimento/recarga do tipo GASOLINA");
    }

    @Test
    @DisplayName("Deve suportar veículo Bi-Fuel GNV com cilindro em m³")
    void deveSuportarVeiculoGnv() {
        VeiculoResponseDTO sienaGnv = veiculoService.cadastrar(new VeiculoRequestDTO(
                "Siena GNV",
                "GNV9B88",
                "Fiat",
                "Grand Siena",
                "Branco",
                "2020",
                CategoriaVeiculo.CARRO,
                TipoPropulsao.BI_FUEL_GNV,
                new BigDecimal("80000.0"),
                new BigDecimal("48.00"),
                new BigDecimal("15.00"),
                null
        ));

        // Abastecimento de 12.5 m³ de GNV após rodar 175 km -> 14.00 km/m³
        AbastecimentoResponseDTO abastGnv = abastecimentoService.registrar(new AbastecimentoRequestDTO(
                sienaGnv.id(),
                TipoCombustivel.GNV,
                true,
                new BigDecimal("12.50"),
                new BigDecimal("60.00"),
                new BigDecimal("80175.0"),
                "Posto GNV Rodovia",
                LocalDate.now()
        ));

        assertThat(abastGnv.unidadeMedida()).isEqualTo("m³");
        assertThat(abastGnv.unidadeConsumo()).isEqualTo("km/m³");
        assertThat(abastGnv.mediaConsumoKmPorLitro()).isEqualByComparingTo("14.00");
    }
}
