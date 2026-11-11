package ecorodagem.controller;

import ecorodagem.domain.enums.TipoCombustivel;
import ecorodagem.dto.request.AbastecimentoRequestDTO;
import ecorodagem.dto.response.AbastecimentoResponseDTO;
import ecorodagem.dto.response.PostoResumoResponseDTO;
import ecorodagem.service.AbastecimentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/abastecimentos")
@RequiredArgsConstructor
@Tag(name = "Abastecimentos", description = "Registro de abastecimentos, preço do litro, postos e cálculo de média de consumo (km/L)")
public class AbastecimentoController {

    private final AbastecimentoService abastecimentoService;

    @GetMapping
    @Operation(summary = "Listar abastecimentos", description = "Permite filtrar opcionalmente por ID do veículo ou tipo de combustível.")
    public ResponseEntity<List<AbastecimentoResponseDTO>> listar(
            @RequestParam(required = false) Long veiculoId,
            @RequestParam(required = false) TipoCombustivel combustivel
    ) {
        return ResponseEntity.ok(abastecimentoService.listar(veiculoId, combustivel));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar abastecimento por ID")
    public ResponseEntity<AbastecimentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(abastecimentoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(
            summary = "Registrar novo abastecimento",
            description = "Calcula automaticamente o preço por litro (R$/L), a quilometragem percorrida desde o último abastecimento e a média de consumo (km/L), atualizando o hodômetro do veículo."
    )
    public ResponseEntity<AbastecimentoResponseDTO> registrar(@Valid @RequestBody AbastecimentoRequestDTO dto) {
        AbastecimentoResponseDTO criado = abastecimentoService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir abastecimento")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        abastecimentoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/postos")
    @Operation(summary = "Resumo por posto de combustível", description = "Agrupa abastecimentos por local/posto informando o preço médio por litro e o total gasto.")
    public ResponseEntity<List<PostoResumoResponseDTO>> resumirPorPosto() {
        return ResponseEntity.ok(abastecimentoService.resumirPorPosto());
    }
}
