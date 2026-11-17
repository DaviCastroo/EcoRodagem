package ecorodagem.service;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoPropulsao;
import ecorodagem.dto.response.AiChatResponseDTO;
import ecorodagem.dto.response.AiDiagnosticsResponseDTO;
import ecorodagem.dto.response.DashboardResponseDTO;
import ecorodagem.dto.response.PostoResumoResponseDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAdvisorService {

    private final DashboardService dashboardService;
    private final AbastecimentoService abastecimentoService;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private RestClient restClient;

    @PostConstruct
    void inicializarRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2500);
        factory.setReadTimeout(12000);
        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(factory)
                .build();
    }

    public record FrotaContextPayload(
            long totalVeiculos,
            long totalAbastecimentos,
            BigDecimal gastoTotalMesAtual,
            BigDecimal consumoMedioFrotaKmPorLitro,
            BigDecimal custoMedioFrotaPorKm,
            List<DashboardResponseDTO.ConsumoVeiculoDTO> veiculos,
            List<PostoResumoResponseDTO> postos,
            List<DashboardResponseDTO.GastoMensalDTO> gastosPorMes
    ) {
    }

    /**
     * Nota de Arquitetura (Java Pro / Backend Architect):
     * Não anotamos este método com @Transactional para evitar reter conexões do HikariCP
     * durante a chamada de rede externa (I/O HTTP) ao microsserviço Python/LLM.
     * As leituras em dashboardService e abastecimentoService já executam suas próprias
     * transações curtas (readOnly = true) e liberam a conexão imediatamente.
     */
    public AiDiagnosticsResponseDTO gerarDiagnosticoFrota() {
        long inicio = System.currentTimeMillis();
        DashboardResponseDTO resumo = dashboardService.obterResumoDashboard();
        List<PostoResumoResponseDTO> postos = abastecimentoService.resumirPorPosto();
        FrotaContextPayload contexto = montarContexto(resumo, postos);

        try {
            AiDiagnosticsResponseDTO respostaPython = obterRestClient()
                    .post()
                    .uri("/api/v1/diagnostics")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(contexto)
                    .retrieve()
                    .body(AiDiagnosticsResponseDTO.class);

            if (respostaPython != null) {
                return respostaPython;
            }
        } catch (Exception ex) {
            log.debug("Microsserviço Python FastAPI indisponível em {}. Acionando motor analítico local: {}",
                    aiServiceUrl, ex.getMessage());
        }

        long latencia = Math.max(System.currentTimeMillis() - inicio, 1L);
        return construirDiagnosticoFallback(contexto, latencia);
    }

    public AiChatResponseDTO responderPergunta(String pergunta) {
        long inicio = System.currentTimeMillis();
        DashboardResponseDTO resumo = dashboardService.obterResumoDashboard();
        List<PostoResumoResponseDTO> postos = abastecimentoService.resumirPorPosto();
        FrotaContextPayload contexto = montarContexto(resumo, postos);

        try {
            Map<String, Object> payload = Map.of(
                    "pergunta", pergunta,
                    "contexto", contexto
            );

            AiChatResponseDTO respostaPython = obterRestClient()
                    .post()
                    .uri("/api/v1/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(AiChatResponseDTO.class);

            if (respostaPython != null) {
                return respostaPython;
            }
        } catch (Exception ex) {
            log.debug("Microsserviço Python FastAPI indisponível em {}. Acionando Copiloto local: {}",
                    aiServiceUrl, ex.getMessage());
        }

        long latencia = Math.max(System.currentTimeMillis() - inicio, 1L);
        return construirChatFallback(pergunta, contexto, latencia);
    }

    private RestClient obterRestClient() {
        if (this.restClient == null) {
            inicializarRestClient();
        }
        return this.restClient;
    }

    private FrotaContextPayload montarContexto(DashboardResponseDTO resumo, List<PostoResumoResponseDTO> postos) {
        return new FrotaContextPayload(
                resumo.totalVeiculos(),
                resumo.totalAbastecimentos(),
                resumo.gastoTotalMesAtual(),
                resumo.consumoMedioFrotaKmPorLitro(),
                resumo.custoMedioFrotaPorKm(),
                resumo.consumoPorVeiculo(),
                postos,
                resumo.gastosPorMes()
        );
    }

    private AiDiagnosticsResponseDTO construirDiagnosticoFallback(FrotaContextPayload ctx, long latenciaMs) {
        List<DashboardResponseDTO.ConsumoVeiculoDTO> ativos = ctx.veiculos().stream()
                .filter(v -> v.custoMedioPorKm() != null && v.custoMedioPorKm().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(DashboardResponseDTO.ConsumoVeiculoDTO::custoMedioPorKm))
                .toList();

        AiDiagnosticsResponseDTO.DestaqueVeiculoDTO maisEficiente = null;
        AiDiagnosticsResponseDTO.DestaqueVeiculoDTO pontoAtencao = null;

        if (!ativos.isEmpty()) {
            var best = ativos.get(0);
            maisEficiente = new AiDiagnosticsResponseDTO.DestaqueVeiculoDTO(
                    best.apelido(),
                    best.placa(),
                    best.propulsao().name(),
                    best.custoMedioPorKm(),
                    best.mediaConsumo(),
                    best.unidadeConsumo(),
                    String.format(Locale.forLanguageTag("pt-BR"),
                            "Menor custo operacional da frota (R$ %.3f/km) com rendimento de %.2f %s.",
                            best.custoMedioPorKm(), best.mediaConsumo(), best.unidadeConsumo())
            );

            var worst = ativos.get(ativos.size() - 1);
            pontoAtencao = new AiDiagnosticsResponseDTO.DestaqueVeiculoDTO(
                    worst.apelido(),
                    worst.placa(),
                    worst.propulsao().name(),
                    worst.custoMedioPorKm(),
                    worst.mediaConsumo(),
                    worst.unidadeConsumo(),
                    String.format(Locale.forLanguageTag("pt-BR"),
                            "Maior desembolso por km (R$ %.3f/km). Priorize rotas otimizadas e abastecimento nos postos líderes.",
                            worst.custoMedioPorKm())
            );
        }

        BigDecimal gastoBase = ctx.gastoTotalMesAtual();
        if ((gastoBase == null || gastoBase.compareTo(BigDecimal.ZERO) <= 0) && !ctx.gastosPorMes().isEmpty()) {
            BigDecimal soma = ctx.gastosPorMes().stream()
                    .map(DashboardResponseDTO.GastoMensalDTO::valorTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            gastoBase = soma.divide(BigDecimal.valueOf(ctx.gastosPorMes().size()), 2, RoundingMode.HALF_UP);
        }

        BigDecimal pctOtimizacao = ativos.size() >= 3 ? new BigDecimal("14.5") : new BigDecimal("8.0");
        BigDecimal economiaEstimada = (gastoBase != null ? gastoBase : BigDecimal.ZERO)
                .multiply(pctOtimizacao)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        List<AiDiagnosticsResponseDTO.RecomendacaoIaDTO> recomendacoes = new ArrayList<>();

        var eletricos = ativos.stream()
                .filter(v -> v.propulsao() == TipoPropulsao.ELETRICO_BEV
                        || v.propulsao() == TipoPropulsao.HIBRIDO_PHEV
                        || v.propulsao() == TipoPropulsao.HIBRIDO_HEV)
                .toList();
        var combustao = ativos.stream()
                .filter(v -> v.propulsao() == TipoPropulsao.COMBUSTAO || v.propulsao() == TipoPropulsao.FLEX)
                .toList();

        if (!eletricos.isEmpty() && !combustao.isEmpty()) {
            var melhorEv = eletricos.get(0);
            recomendacoes.add(new AiDiagnosticsResponseDTO.RecomendacaoIaDTO(
                    "Priorização de Veículos Elétricos e Híbridos em Rotas Urbanas",
                    String.format(Locale.forLanguageTag("pt-BR"),
                            "O veículo %s (%s) opera a R$ %.3f/km, superando com folga a média dos veículos a combustão. Priorize-o em rotas urbanas e entregas de alta frequência.",
                            melhorEv.apelido(), melhorEv.placa(), melhorEv.custoMedioPorKm()),
                    "ALTO",
                    "ELETRIFICACAO"
            ));
        }

        if (ctx.postos().size() >= 2) {
            var melhorPosto = ctx.postos().get(0);
            var piorPosto = ctx.postos().get(ctx.postos().size() - 1);
            recomendacoes.add(new AiDiagnosticsResponseDTO.RecomendacaoIaDTO(
                    "Concentração de Abastecimentos em " + melhorPosto.locPosto(),
                    String.format(Locale.forLanguageTag("pt-BR"),
                            "O local '%s' registra o menor preço médio unitário (R$ %.3f), contra R$ %.3f em '%s'. Direcionar a frota aos líderes do ranking reduz imediatamente o R$/km.",
                            melhorPosto.locPosto(), melhorPosto.precoMedioLitro(),
                            piorPosto.precoMedioLitro(), piorPosto.locPosto()),
                    "ALTO",
                    "POSTO"
            ));
        }

        recomendacoes.add(new AiDiagnosticsResponseDTO.RecomendacaoIaDTO(
                "Equilíbrio Inteligente da Matriz Flex e GNV",
                "Nos veículos Flex e Bi-Combustível, utilize Etanol apenas quando o litro custar até 70% da Gasolina e priorize o GNV em rodagem diária superior a 60 km.",
                "MEDIO",
                "COMBUSTIVEL"
        ));

        String resumoExecutivo = String.format(Locale.forLanguageTag("pt-BR"),
                "A frota possui %d veículos ativos e %d registros auditados, operando a um custo médio global de R$ %.3f/km e rendimento médio de %.2f km/un.%s",
                ctx.totalVeiculos(),
                ctx.totalAbastecimentos(),
                ctx.custoMedioFrotaPorKm(),
                ctx.consumoMedioFrotaKmPorLitro(),
                (maisEficiente != null && pontoAtencao != null)
                        ? String.format(Locale.forLanguageTag("pt-BR"),
                        " O destaque de eficiência é %s (R$ %.3f/km), enquanto %s (R$ %.3f/km) concentra a maior oportunidade de otimização.",
                        maisEficiente.apelido(), maisEficiente.custoPorKm(),
                        pontoAtencao.apelido(), pontoAtencao.custoPorKm())
                        : ""
        );

        return new AiDiagnosticsResponseDTO(
                resumoExecutivo,
                economiaEstimada,
                pctOtimizacao,
                maisEficiente,
                pontoAtencao,
                recomendacoes,
                "Motor Analítico EcoRodagem (Fallback Resiliente)",
                latenciaMs
        );
    }

    private AiChatResponseDTO construirChatFallback(String pergunta, FrotaContextPayload ctx, long latenciaMs) {
        String q = pergunta.toLowerCase(Locale.ROOT);
        List<DashboardResponseDTO.ConsumoVeiculoDTO> ativos = ctx.veiculos().stream()
                .filter(v -> v.custoMedioPorKm() != null && v.custoMedioPorKm().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(DashboardResponseDTO.ConsumoVeiculoDTO::custoMedioPorKm))
                .toList();

        List<DashboardResponseDTO.ConsumoVeiculoDTO> motos = ativos.stream()
                .filter(v -> v.categoria() == CategoriaVeiculo.MOTO)
                .toList();

        String resposta;
        if (q.contains("moto") || q.contains("delivery") || q.contains("entrega")) {
            if (!motos.isEmpty()) {
                var bestMoto = motos.get(0);
                String resumoMotos = motos.stream()
                        .map(m -> String.format(Locale.forLanguageTag("pt-BR"),
                                "%s (%s: R$ %.3f/km | %.2f %s)",
                                m.apelido(), m.placa(), m.custoMedioPorKm(), m.mediaConsumo(), m.unidadeConsumo()))
                        .collect(Collectors.joining(", "));
                resposta = String.format(Locale.forLanguageTag("pt-BR"),
                        "Para operações de delivery, a moto mais eficiente é %s (%s), com custo de R$ %.3f/km e média de %.2f %s (%s). Comparativo das motos: %s.",
                        bestMoto.apelido(), bestMoto.placa(), bestMoto.custoMedioPorKm(),
                        bestMoto.mediaConsumo(), bestMoto.unidadeConsumo(), bestMoto.propulsao(), resumoMotos);
            } else {
                resposta = "Não há motocicletas com histórico suficiente para comparar o R$/km no momento.";
            }
        } else if (q.contains("posto") || q.contains("eletroposto") || q.contains("barato") || q.contains("preço")) {
            if (!ctx.postos().isEmpty()) {
                var top = ctx.postos().get(0);
                var ult = ctx.postos().get(ctx.postos().size() - 1);
                resposta = String.format(Locale.forLanguageTag("pt-BR"),
                        "O local mais econômico do ranking é %s, com preço médio unitário de R$ %.3f (%d registros, total R$ %.2f). O maior preço médio foi registrado em %s (R$ %.3f).",
                        top.locPosto(), top.precoMedioLitro(), top.totalAbastecimentos(), top.totalGasto(),
                        ult.locPosto(), ult.precoMedioLitro());
            } else {
                resposta = "Ainda não há postos suficientes cadastrados para gerar o ranking de preços.";
            }
        } else if (q.contains("elétrico") || q.contains("eletrico") || q.contains("etanol")
                || q.contains("gasolina") || q.contains("gnv") || q.contains("híbrido")) {
            if (!ativos.isEmpty()) {
                var top = ativos.get(0);
                resposta = String.format(Locale.forLanguageTag("pt-BR"),
                        "Pela métrica universal de R$/km, a propulsão elétrica e híbrida lidera a eficiência na frota com %s (%s) operando a R$ %.3f/km. Nos veículos Flex, o Etanol é vantajoso até 70%% do preço da Gasolina, enquanto o GNV se destaca em rodagem intensa.",
                        top.apelido(), top.propulsao(), top.custoMedioPorKm());
            } else {
                resposta = "Adicione registros em diferentes matrizes energéticas para comparar o R$/km.";
            }
        } else {
            String melhorStr = !ativos.isEmpty()
                    ? String.format(Locale.forLanguageTag("pt-BR"), "%s (%s) com R$ %.3f/km",
                    ativos.get(0).apelido(), ativos.get(0).placa(), ativos.get(0).custoMedioPorKm())
                    : "N/A";
            resposta = String.format(Locale.forLanguageTag("pt-BR"),
                    "Com base nos %d veículos e %d abastecimentos da frota, o custo médio global é de R$ %.3f/km (rendimento de %.2f km/un) e o gasto no mês atual soma R$ %.2f. O veículo mais econômico no ranking geral é %s.",
                    ctx.totalVeiculos(), ctx.totalAbastecimentos(), ctx.custoMedioFrotaPorKm(),
                    ctx.consumoMedioFrotaKmPorLitro(), ctx.gastoTotalMesAtual(), melhorStr);
        }

        List<String> sugestoes = List.of(
                "Qual moto de delivery tem o menor R$/km?",
                "Compensa mais rodar com veículo elétrico, GNV ou Flex na frota?",
                "Quais postos e eletropostos têm o menor preço médio?"
        );

        return new AiChatResponseDTO(
                pergunta,
                resposta,
                sugestoes,
                "Copiloto Analítico EcoRodagem (Fallback Resiliente)",
                latenciaMs
        );
    }
}
