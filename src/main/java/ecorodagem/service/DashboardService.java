package ecorodagem.service;

import ecorodagem.domain.model.Abastecimento;
import ecorodagem.dto.response.AbastecimentoResponseDTO;
import ecorodagem.dto.response.DashboardResponseDTO;
import ecorodagem.repository.AbastecimentoRepository;
import ecorodagem.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VeiculoRepository veiculoRepository;
    private final AbastecimentoRepository abastecimentoRepository;
    private final AbastecimentoService abastecimentoService;
    private final VeiculoService veiculoService;

    @Transactional(readOnly = true)
    public DashboardResponseDTO obterResumoDashboard() {
        long totalVeiculos = veiculoRepository.count();
        long totalAbastecimentos = abastecimentoRepository.count();

        YearMonth mesAtual = YearMonth.now();
        LocalDate inicioMes = mesAtual.atDay(1);
        LocalDate fimMes = mesAtual.atEndOfMonth();

        BigDecimal gastoMesAtual = abastecimentoRepository
                .somarGastoTotalNoPeriodo(inicioMes, fimMes)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal consumoMedioGeral = abastecimentoRepository
                .calcularConsumoMedioGeral()
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal custoMedioPorKmGeral = abastecimentoRepository
                .calcularCustoMedioPorKmGeral()
                .setScale(3, RoundingMode.HALF_UP);

        AbastecimentoResponseDTO ultimoAbastecimento = abastecimentoRepository
                .findFirstByOrderByDataAbastecimentoDescIdDesc()
                .map(abastecimentoService::toResponseDTO)
                .orElse(null);

        // Agrupamento de gastos por Ano-Mês para gráficos
        List<Abastecimento> todosAbastecimentos = abastecimentoRepository.findAll();
        Map<YearMonth, BigDecimal> gastosAgrupados = todosAbastecimentos.stream()
                .collect(Collectors.groupingBy(
                        a -> YearMonth.from(a.getDataAbastecimento()),
                        Collectors.reducing(BigDecimal.ZERO, Abastecimento::getValorTotal, BigDecimal::add)
                ));

        List<DashboardResponseDTO.GastoMensalDTO> gastosPorMes = gastosAgrupados.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new DashboardResponseDTO.GastoMensalDTO(
                        e.getKey().toString(),
                        e.getValue().setScale(2, RoundingMode.HALF_UP)
                ))
                .toList();

        // Consumo médio e custo por km por veículo
        List<DashboardResponseDTO.ConsumoVeiculoDTO> consumoPorVeiculo = veiculoRepository.findAll().stream()
                .map(v -> {
                    BigDecimal media = abastecimentoRepository
                            .calcularConsumoMedioPorVeiculo(v.getId())
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal custoKm = abastecimentoRepository
                            .calcularCustoMedioPorKmPorVeiculo(v.getId())
                            .setScale(3, RoundingMode.HALF_UP);
                    return new DashboardResponseDTO.ConsumoVeiculoDTO(
                            v.getId(),
                            v.getApelido(),
                            v.getPlaca(),
                            v.getCategoria(),
                            v.getPropulsao(),
                            media,
                            veiculoService.determinarUnidadeConsumoPrincipal(v.getPropulsao()),
                            custoKm
                    );
                })
                .sorted(Comparator.comparing(DashboardResponseDTO.ConsumoVeiculoDTO::mediaConsumo).reversed())
                .toList();

        return new DashboardResponseDTO(
                totalVeiculos,
                totalAbastecimentos,
                gastoMesAtual,
                consumoMedioGeral,
                custoMedioPorKmGeral,
                ultimoAbastecimento,
                gastosPorMes,
                consumoPorVeiculo
        );
    }
}
