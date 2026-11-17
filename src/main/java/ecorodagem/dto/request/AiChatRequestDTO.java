package ecorodagem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiChatRequestDTO(
        @NotBlank(message = "A pergunta não pode estar vazia.")
        @Size(min = 3, max = 600, message = "A pergunta deve ter entre 3 e 600 caracteres.")
        String pergunta
) {
}
