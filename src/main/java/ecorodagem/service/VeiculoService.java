package ecorodagem.service;

import ecorodagem.domain.enums.CategoriaVeiculo;
import ecorodagem.domain.enums.TipoPropulsao;
import ecorodagem.domain.model.Veiculo;
import ecorodagem.dto.request.VeiculoRequestDTO;
import ecorodagem.dto.response.VeiculoResponseDTO;
import ecorodagem.exception.RecursoNaoEncontradoException;
import ecorodagem.exception.RegraNegocioException;
import ecorodagem.repository.AbastecimentoRepository;
import ecorodagem.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;
    private final AbastecimentoRepository abastecimentoRepository;

    @Transactional(readOnly = true)
    public List<VeiculoResponseDTO> listarTodos() {
        return veiculoRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public VeiculoResponseDTO buscarPorId(Long id) {
        Veiculo veiculo = buscarEntidadePorId(id);
        return toResponseDTO(veiculo);
    }

    @Transactional
    public VeiculoResponseDTO cadastrar(VeiculoRequestDTO dto) {
        String placaNormalizada = normalizarPlaca(dto.placa());
        if (veiculoRepository.existsByPlacaIgnoreCase(placaNormalizada)) {
            throw new RegraNegocioException("Já existe um veículo cadastrado com a placa " + placaNormalizada);
        }

        CategoriaVeiculo categoria = dto.categoria() != null ? dto.categoria() : CategoriaVeiculo.CARRO;
        TipoPropulsao propulsao = dto.propulsao() != null ? dto.propulsao() : TipoPropulsao.FLEX;
        validarCapacidadesPorPropulsao(propulsao, dto);

        Veiculo veiculo = Veiculo.builder()
                .apelido(dto.apelido().trim())
                .placa(placaNormalizada)
                .marca(dto.marca().trim())
                .modelo(dto.modelo().trim())
                .cor(dto.cor() != null ? dto.cor().trim() : null)
                .ano(dto.ano() != null ? dto.ano().trim() : null)
                .categoria(categoria)
                .propulsao(propulsao)
                .hodometroInicial(dto.hodometro())
                .hodometroAtual(dto.hodometro())
                .tanqueComb(dto.tanqueComb())
                .capacidadeGnvM3(dto.capacidadeGnvM3())
                .capacidadeBateriaKwh(dto.capacidadeBateriaKwh())
                .ativo(true)
                .build();

        Veiculo salvo = veiculoRepository.save(veiculo);
        return toResponseDTO(salvo);
    }

    @Transactional
    public VeiculoResponseDTO atualizar(Long id, VeiculoRequestDTO dto) {
        Veiculo veiculo = buscarEntidadePorId(id);
        String placaNormalizada = normalizarPlaca(dto.placa());

        if (veiculoRepository.existsByPlacaIgnoreCaseAndIdNot(placaNormalizada, id)) {
            throw new RegraNegocioException("Já existe outro veículo cadastrado com a placa " + placaNormalizada);
        }

        CategoriaVeiculo categoria = dto.categoria() != null ? dto.categoria() : veiculo.getCategoria();
        TipoPropulsao propulsao = dto.propulsao() != null ? dto.propulsao() : veiculo.getPropulsao();
        validarCapacidadesPorPropulsao(propulsao, dto);

        veiculo.setApelido(dto.apelido().trim());
        veiculo.setPlaca(placaNormalizada);
        veiculo.setMarca(dto.marca().trim());
        veiculo.setModelo(dto.modelo().trim());
        veiculo.setCor(dto.cor() != null ? dto.cor().trim() : null);
        veiculo.setAno(dto.ano() != null ? dto.ano().trim() : null);
        veiculo.setCategoria(categoria);
        veiculo.setPropulsao(propulsao);
        veiculo.setTanqueComb(dto.tanqueComb());
        veiculo.setCapacidadeGnvM3(dto.capacidadeGnvM3());
        veiculo.setCapacidadeBateriaKwh(dto.capacidadeBateriaKwh());

        if (dto.hodometro().compareTo(veiculo.getHodometroAtual()) >= 0) {
            veiculo.setHodometroAtual(dto.hodometro());
        }

        Veiculo atualizado = veiculoRepository.save(veiculo);
        return toResponseDTO(atualizado);
    }

    @Transactional
    public void excluir(Long id) {
        Veiculo veiculo = buscarEntidadePorId(id);
        veiculoRepository.delete(veiculo);
    }

    public Veiculo buscarEntidadePorId(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Veículo não encontrado com ID: " + id));
    }

    public VeiculoResponseDTO toResponseDTO(Veiculo veiculo) {
        BigDecimal media = abastecimentoRepository.calcularConsumoMedioPorVeiculo(veiculo.getId());
        BigDecimal mediaArredondada = media != null
                ? media.setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal custoKm = abastecimentoRepository.calcularCustoMedioPorKmPorVeiculo(veiculo.getId());
        BigDecimal custoKmArredondado = custoKm != null
                ? custoKm.setScale(3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(3, RoundingMode.HALF_UP);

        String unidadePrincipal = determinarUnidadeConsumoPrincipal(veiculo.getPropulsao());

        return new VeiculoResponseDTO(
                veiculo.getId(),
                veiculo.getApelido(),
                veiculo.getPlaca(),
                veiculo.getMarca(),
                veiculo.getModelo(),
                veiculo.getCor(),
                veiculo.getAno(),
                veiculo.getCategoria(),
                veiculo.getPropulsao(),
                veiculo.getHodometroInicial(),
                veiculo.getHodometroAtual(),
                veiculo.getTanqueComb(),
                veiculo.getCapacidadeGnvM3(),
                veiculo.getCapacidadeBateriaKwh(),
                mediaArredondada,
                unidadePrincipal,
                custoKmArredondado,
                veiculo.isAtivo(),
                veiculo.getCriadoEm()
        );
    }

    public String determinarUnidadeConsumoPrincipal(TipoPropulsao propulsao) {
        if (propulsao == TipoPropulsao.ELETRICO_BEV) {
            return "km/kWh";
        }
        return "km/L";
    }

    private void validarCapacidadesPorPropulsao(TipoPropulsao propulsao, VeiculoRequestDTO dto) {
        if (propulsao.isRequerTanqueLiquido() && (dto.tanqueComb() == null || dto.tanqueComb().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new RegraNegocioException("Veículos com propulsão " + propulsao + " exigem a capacidade do tanque líquido (tanqueComb > 0).");
        }
        if (propulsao.isRequerCilindroGnv() && (dto.capacidadeGnvM3() == null || dto.capacidadeGnvM3().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new RegraNegocioException("Veículos com propulsão " + propulsao + " exigem a capacidade do cilindro GNV em m³ (capacidadeGnvM3 > 0).");
        }
        if (propulsao.isRequerBateriaKwh() && (dto.capacidadeBateriaKwh() == null || dto.capacidadeBateriaKwh().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new RegraNegocioException("Veículos com propulsão " + propulsao + " exigem a capacidade da bateria em kWh (capacidadeBateriaKwh > 0).");
        }
    }

    private String normalizarPlaca(String placa) {
        return placa.trim().toUpperCase();
    }
}
