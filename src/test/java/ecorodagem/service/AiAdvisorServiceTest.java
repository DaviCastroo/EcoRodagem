package ecorodagem.service;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoCombustivel;
import ecorodagem.domain.enums.TipoPropulsao;
import ecorodagem.dto.request.AbastecimentoRequestDTO;
import ecorodagem.dto.request.VeiculoRequestDTO;
import ecorodagem.dto.response.AiChatResponseDTO;
import ecorodagem.dto.response.AiDiagnosticsResponseDTO;
import ecorodagem.dto.response.VeiculoResponseDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AiAdvisorServiceTest {

    @Autowired
    private VeiculoService veiculoService;

    @Autowired
    private AbastecimentoService abastecimentoService;

    @Autowired
    private AiAdvisorService aiAdvisorService;

    @Test
    @DisplayName("Deve gerar diagnóstico inteligente da frota e responder perguntas sobre motos de delivery")
    void deveGerarDiagnosticoEResponderChatComPrecisao() {
        VeiculoResponseDTO motoEletrica = veiculoService.cadastrar(new VeiculoRequestDTO(
                "Voltz EVS Delivery",
                "MEV6J22",
                "Voltz",
                "EVS",
                "Preta",
                "2025",
                CategoriaVeiculo.MOTO,
                TipoPropulsao.ELETRICO_BEV,
                new BigDecimal("1000.0"),
                null,
                null,
                new BigDecimal("10.00")
        ));

        VeiculoResponseDTO carroCombustao = veiculoService.cadastrar(new VeiculoRequestDTO(
                "Civic Frota",
                "ABC1D23",
                "Honda",
                "Civic",
                "Prata",
                "2023",
                CategoriaVeiculo.CARRO,
                TipoPropulsao.FLEX,
                new BigDecimal("20000.0"),
                new BigDecimal("50.00"),
                null,
                null
        ));

        // Recarga elétrica na moto: 200 km com 6 kWh por R$ 12,00 -> R$ 0.060/km
        abastecimentoService.registrar(new AbastecimentoRequestDTO(
                motoEletrica.id(),
                TipoCombustivel.ELETRICO,
                true,
                new BigDecimal("6.00"),
                new BigDecimal("12.00"),
                new BigDecimal("1200.0"),
                "Eletroposto Hub iFood",
                LocalDate.now()
        ));

        // Abastecimento no carro: 400 km com 40 L por R$ 240,00 -> R$ 0.600/km
        abastecimentoService.registrar(new AbastecimentoRequestDTO(
                carroCombustao.id(),
                TipoCombustivel.GASOLINA,
                true,
                new BigDecimal("40.00"),
                new BigDecimal("240.00"),
                new BigDecimal("20400.0"),
                "Posto Petrobras Sul",
                LocalDate.now()
        ));

        AiDiagnosticsResponseDTO diagnostico = aiAdvisorService.gerarDiagnosticoFrota();
        assertThat(diagnostico).isNotNull();
        assertThat(diagnostico.veiculoMaisEficiente()).isNotNull();
        assertThat(diagnostico.veiculoMaisEficiente().apelido()).isEqualTo("Voltz EVS Delivery");
        assertThat(diagnostico.pontoAtencao()).isNotNull();
        assertThat(diagnostico.pontoAtencao().apelido()).isEqualTo("Civic Frota");
        assertThat(diagnostico.recomendacoes()).isNotEmpty();

        AiChatResponseDTO chatResp = aiAdvisorService.responderPergunta("Qual moto de delivery tem o menor R$/km?");
        assertThat(chatResp).isNotNull();
        assertThat(chatResp.resposta()).contains("Voltz EVS Delivery");
        assertThat(chatResp.sugestoesFollowUp()).isNotEmpty();
    }
}
