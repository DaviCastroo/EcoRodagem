package ecorodagem.dto.response;

import java.util.List;

public record AiChatResponseDTO(
        String pergunta,
        String resposta,
        List<String> sugestoesFollowUp,
        String fonteIa,
        long latenciaMs
) {
}
