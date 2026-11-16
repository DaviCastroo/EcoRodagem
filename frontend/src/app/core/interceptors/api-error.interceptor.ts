import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface ProblemDetailPayload {
  readonly title?: string;
  readonly detail?: string;
  readonly status?: number;
  readonly campos?: Record<string, string>;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastService.erro(
          'Servidor indisponível',
          'Não foi possível conectar à API (http://localhost:8080). Verifique se o backend Spring Boot está em execução.'
        );
      } else {
        const problem = error.error as ProblemDetailPayload | null;
        const titulo = problem?.title ?? 'Não foi possível concluir a ação';
        let detalhe = problem?.detail ?? 'Ocorreu um erro inesperado ao processar sua solicitação.';

        if (problem?.campos && Object.keys(problem.campos).length > 0) {
          const mensagensCampos = Object.values(problem.campos).join(' • ');
          detalhe = `${detalhe} (${mensagensCampos})`;
        }

        toastService.erro(titulo, detalhe);
      }

      return throwError(() => error);
    })
  );
};
