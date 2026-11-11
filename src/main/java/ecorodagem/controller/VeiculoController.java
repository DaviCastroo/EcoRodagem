package ecorodagem.controller;

import ecorodagem.dto.request.VeiculoRequestDTO;
import ecorodagem.dto.response.VeiculoResponseDTO;
import ecorodagem.service.VeiculoService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/veiculos")
@RequiredArgsConstructor
@Tag(name = "Veículos", description = "Gerenciamento da frota de veículos")
public class VeiculoController {

    private final VeiculoService veiculoService;

    @GetMapping
    @Operation(summary = "Listar todos os veículos", description = "Retorna a lista de veículos cadastrados com o consumo médio (km/L) calculado.")
    public ResponseEntity<List<VeiculoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(veiculoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar veículo por ID")
    public ResponseEntity<VeiculoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo veículo")
    public ResponseEntity<VeiculoResponseDTO> cadastrar(@Valid @RequestBody VeiculoRequestDTO dto) {
        VeiculoResponseDTO criado = veiculoService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar veículo existente")
    public ResponseEntity<VeiculoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody VeiculoRequestDTO dto
    ) {
        return ResponseEntity.ok(veiculoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir veículo")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        veiculoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
