package ecorodagem.controller;

import ecorodagem.dto.response.DashboardResponseDTO;
import ecorodagem.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Indicadores consolidados de frota, gastos mensais e consumo médio")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Obter resumo do Dashboard", description = "Retorna total de veículos, total de abastecimentos, gasto no mês atual, média geral de consumo (km/L), último abastecimento e séries para gráficos.")
    public ResponseEntity<DashboardResponseDTO> obterResumo() {
        return ResponseEntity.ok(dashboardService.obterResumoDashboard());
    }
}
