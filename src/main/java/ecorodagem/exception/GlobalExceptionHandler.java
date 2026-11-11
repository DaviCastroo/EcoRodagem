package ecorodagem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ProblemDetail handleRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Recurso não encontrado");
        problem.setProperty("timestamp", OffsetDateTime.now());
        return problem;
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ProblemDetail handleRegraNegocio(RegraNegocioException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Violação de regra de negócio");
        problem.setProperty("timestamp", OffsetDateTime.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidacao(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Um ou mais campos estão inválidos. Verifique os detalhes."
        );
        problem.setTitle("Erro de validação de dados");
        problem.setProperty("timestamp", OffsetDateTime.now());

        Map<String, String> erros = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Campo inválido",
                        (msg1, msg2) -> msg1
                ));
        problem.setProperty("campos", erros);
        return problem;
    }
}
