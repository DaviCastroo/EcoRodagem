package ecorodagem.service;

import ecorodagem.domain.enums.TipoCombustivel;
import ecorodagem.domain.model.Abastecimento;
import ecorodagem.domain.model.Veiculo;
import ecorodagem.dto.request.AbastecimentoRequestDTO;
import ecorodagem.dto.response.AbastecimentoResponseDTO;
import ecorodagem.dto.response.PostoResumoResponseDTO;
import ecorodagem.exception.RecursoNaoEncontradoException;
import ecorodagem.exception.RegraNegocioException;
import ecorodagem.repository.AbastecimentoRepository;
import ecorodagem.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbastecimentoService {

    private final AbastecimentoRepository abastecimentoRepository;
    private final VeiculoRepository veiculoRepository;
    private final VeiculoService veiculoService;

    @Transactional(readOnly = true)
    public List<AbastecimentoResponseDTO> listar(Long veiculoId, TipoCombustivel combustivel) {
        List<Abastecimento> lista;
        if (veiculoId != null) {
            lista = abastecimentoRepository.findByVeiculoIdOrderByDataAbastecimentoDescIdDesc(veiculoId);
        } else if (combustivel != null) {
            lista = abastecimentoRepository.findByCombustivelOrderByDataAbastecimentoDescIdDesc(combustivel);
        } else {
            lista = abastecimentoRepository.findAllByOrderByDataAbastecimentoDescIdDesc();
        }
        return lista.stream().map(this::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public AbastecimentoResponseDTO buscarPorId(Long id) {
        Abastecimento abastecimento = abastecimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Abastecimento não encontrado com ID: " + id));
        return toResponseDTO(abastecimento);
    }

    @Transactional
    public AbastecimentoResponseDTO registrar(AbastecimentoRequestDTO dto) {
        Veiculo veiculo = veiculoService.buscarEntidadePorId(dto.veiculoId());

        // 1. Valida compatibilidade entre propulsão do veículo e o energético informado
        if (!veiculo.getPropulsao().aceitaCombustivel(dto.combustivel())) {
            throw new RegraNegocioException(String.format(
                    "O veículo '%s' possui propulsão %s e não aceita abastecimento/recarga do tipo %s.",
                    veiculo.getApelido(), veiculo.getPropulsao(), dto.combustivel()
            ));
        }

        // 2. Valida capacidade máxima de acordo com a fonte energética (Tanque L, Cilindro m³ ou Bateria kWh)
        validarCapacidadeMaxima(veiculo, dto.combustivel(), dto.litros());

        // 3. Determina o hodômetro de referência (último abastecimento ou hodômetro inicial do veículo)
        Optional<Abastecimento> ultimoAbastecimentoOpt = abastecimentoRepository
                .findFirstByVeiculoIdOrderByDataAbastecimentoDescIdDesc(veiculo.getId());

        BigDecimal hodometroAnterior = ultimoAbastecimentoOpt
                .map(Abastecimento::getHodometro)
                .orElse(veiculo.getHodometroInicial());

        if (dto.hodometro().compareTo(hodometroAnterior) <= 0) {
            throw new RegraNegocioException(String.format(
                    "O hodômetro informado (%.1f km) deve ser maior que o hodômetro anterior registrado (%.1f km).",
                    dto.hodometro(), hodometroAnterior
            ));
        }

        // 4. Preço unitário (R$/L, R$/m³ ou R$/kWh) = Valor Total / Quantidade
        BigDecimal precoUnitario = dto.valorTotal()
                .divide(dto.litros(), 3, RoundingMode.HALF_UP);

        // 5. Quilômetros percorridos desde o último registro
        BigDecimal kmPercorridos = dto.hodometro()
                .subtract(hodometroAnterior)
                .setScale(1, RoundingMode.HALF_UP);

        // 6. Média de consumo (km/L, km/m³ ou km/kWh) = kmPercorridos / Quantidade
        BigDecimal mediaConsumo = kmPercorridos
                .divide(dto.litros(), 2, RoundingMode.HALF_UP);

        // 7. Custo universal por quilômetro rodado (R$/km) = Valor Total / kmPercorridos
        BigDecimal custoPorKm = dto.valorTotal()
                .divide(kmPercorridos, 3, RoundingMode.HALF_UP);

        Abastecimento abastecimento = Abastecimento.builder()
                .veiculo(veiculo)
                .combustivel(dto.combustivel())
                .unidadeMedida(dto.combustivel().getUnidadeVolume())
                .tanqueCheio(dto.tanqueCheio())
                .litros(dto.litros())
                .valorTotal(dto.valorTotal())
                .precoLitro(precoUnitario)
                .hodometro(dto.hodometro())
                .kmPercorridos(kmPercorridos)
                .mediaConsumo(mediaConsumo)
                .custoPorKm(custoPorKm)
                .locPosto(dto.locPosto() != null ? dto.locPosto().trim() : null)
                .dataAbastecimento(dto.dataAbastecimento())
                .build();

        // Atualiza o hodômetro atual do veículo
        veiculo.setHodometroAtual(dto.hodometro());
        veiculoRepository.save(veiculo);

        Abastecimento salvo = abastecimentoRepository.save(abastecimento);
        return toResponseDTO(salvo);
    }

    @Transactional
    public void excluir(Long id) {
        Abastecimento abastecimento = abastecimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Abastecimento não encontrado com ID: " + id));
        abastecimentoRepository.delete(abastecimento);
    }

    @Transactional(readOnly = true)
    public List<PostoResumoResponseDTO> resumirPorPosto() {
        List<Abastecimento> todos = abastecimentoRepository.findAll();

        Map<String, List<Abastecimento>> agrupado = todos.stream()
                .filter(a -> a.getLocPosto() != null && !a.getLocPosto().isBlank())
                .collect(Collectors.groupingBy(a -> a.getLocPosto().trim()));

        return agrupado.entrySet().stream()
                .map(entry -> {
                    String posto = entry.getKey();
                    List<Abastecimento> itens = entry.getValue();
                    long qtd = itens.size();

                    BigDecimal somaPrecoLitro = itens.stream()
                            .map(Abastecimento::getPrecoLitro)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal precoMedio = somaPrecoLitro.divide(
                            BigDecimal.valueOf(qtd), 3, RoundingMode.HALF_UP
                    );

                    BigDecimal totalGasto = itens.stream()
                            .map(Abastecimento::getValorTotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .setScale(2, RoundingMode.HALF_UP);

                    return new PostoResumoResponseDTO(posto, qtd, precoMedio, totalGasto);
                })
                .sorted(Comparator.comparing(PostoResumoResponseDTO::precoMedioLitro))
                .toList();
    }

    private void validarCapacidadeMaxima(Veiculo veiculo, TipoCombustivel combustivel, BigDecimal quantidade) {
        switch (combustivel) {
            case GNV -> {
                if (veiculo.getCapacidadeGnvM3() != null && quantidade.compareTo(veiculo.getCapacidadeGnvM3()) > 0) {
                    throw new RegraNegocioException(String.format(
                            "A quantidade de GNV (%.2f m³) excede a capacidade do cilindro do veículo (%.2f m³).",
                            quantidade, veiculo.getCapacidadeGnvM3()
                    ));
                }
            }
            case ELETRICO -> {
                if (veiculo.getCapacidadeBateriaKwh() != null && quantidade.compareTo(veiculo.getCapacidadeBateriaKwh()) > 0) {
                    throw new RegraNegocioException(String.format(
                            "A recarga informada (%.2f kWh) excede a capacidade da bateria do veículo (%.2f kWh).",
                            quantidade, veiculo.getCapacidadeBateriaKwh()
                    ));
                }
            }
            default -> {
                if (veiculo.getTanqueComb() != null && quantidade.compareTo(veiculo.getTanqueComb()) > 0) {
                    throw new RegraNegocioException(String.format(
                            "A quantidade de litros (%.2f L) excede a capacidade do tanque do veículo (%.2f L).",
                            quantidade, veiculo.getTanqueComb()
                    ));
                }
            }
        }
    }

    public AbastecimentoResponseDTO toResponseDTO(Abastecimento a) {
        String unidadeMedida = a.getUnidadeMedida() != null
                ? a.getUnidadeMedida()
                : a.getCombustivel().getUnidadeVolume();

        return new AbastecimentoResponseDTO(
                a.getId(),
                a.getVeiculo().getId(),
                a.getVeiculo().getApelido(),
                a.getVeiculo().getPlaca(),
                a.getCombustivel(),
                unidadeMedida,
                a.getCombustivel().getUnidadeConsumo(),
                a.isTanqueCheio(),
                a.getLitros(),
                a.getValorTotal(),
                a.getPrecoLitro(),
                a.getHodometro(),
                a.getKmPercorridos(),
                a.getMediaConsumo(),
                a.getCustoPorKm(),
                a.getLocPosto(),
                a.getDataAbastecimento(),
                a.getCriadoEm()
        );
    }
}
