package ecorodagem.controller;

import ecorodagem.dto.request.AiChatRequestDTO;
import ecorodagem.dto.response.AiChatResponseDTO;
import ecorodagem.dto.response.AiDiagnosticsResponseDTO;
import ecorodagem.service.AiAdvisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
@Tag(name = "Inteligência Artificial (Copiloto de Frota)", description = "Diagnóstico automatizado de eficiência energética e Copiloto Contextual integrado ao microsserviço Python (FastAPI + LLM)")
public class AiAdvisorController {

    private final AiAdvisorService aiAdvisorService;

    @GetMapping("/diagnostico")
    @Operation(
            summary = "Gerar diagnóstico inteligente da frota",
            description = "Consolida os indicadores da frota no PostgreSQL e aciona o microsserviço Python (FastAPI + Gemini LLM) para gerar insights de R$/km, veículos em destaque e estimativa de economia mensal."
    )
    public ResponseEntity<AiDiagnosticsResponseDTO> obterDiagnostico() {
        return ResponseEntity.ok(aiAdvisorService.gerarDiagnosticoFrota());
    }

    @PostMapping("/chat")
    @Operation(
            summary = "Perguntar ao Copiloto Contextual da Frota",
            description = "Responde perguntas em linguagem natural utilizando Context-Augmented Generation (RAG sobre os dados reais de veículos, abastecimentos e postos da frota)."
    )
    public ResponseEntity<AiChatResponseDTO> conversar(@Valid @RequestBody AiChatRequestDTO request) {
        return ResponseEntity.ok(aiAdvisorService.responderPergunta(request.pergunta()));
    }
}
