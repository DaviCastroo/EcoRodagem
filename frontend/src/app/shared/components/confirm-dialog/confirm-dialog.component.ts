import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title'"
      >
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-fade-in">
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-triangle-exclamation text-lg" aria-hidden="true"></i>
            </div>
            <div class="flex-1">
              <h3 id="dialog-title" class="text-base font-bold text-slate-900">
                {{ titulo() }}
              </h3>
              <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {{ mensagem() }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              class="btn-secondary"
              (click)="cancelar.emit()"
            >
              Manter registro
            </button>
            <button
              type="button"
              class="btn-danger"
              (click)="confirmar.emit()"
            >
              <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
              <span>{{ rotuloConfirmar() }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  readonly aberto = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly mensagem = input.required<string>();
  readonly rotuloConfirmar = input<string>('Excluir permanentemente');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
