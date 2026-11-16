import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  readonly id: number;
  readonly titulo: string;
  readonly detalhe: string;
  readonly tipo: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<readonly ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;

  sucesso(titulo: string, detalhe: string): void {
    this.adicionar(titulo, detalhe, 'success');
  }

  erro(titulo: string, detalhe: string): void {
    this.adicionar(titulo, detalhe, 'error');
  }

  info(titulo: string, detalhe: string): void {
    this.adicionar(titulo, detalhe, 'info');
  }

  remover(id: number): void {
    this._toasts.update((atuais) => atuais.filter((t) => t.id !== id));
  }

  private adicionar(titulo: string, detalhe: string, tipo: ToastType): void {
    const id = ++this.counter;
    const novo: ToastMessage = { id, titulo, detalhe, tipo };
    this._toasts.update((atuais) => [...atuais, novo]);

    setTimeout(() => {
      this.remover(id);
    }, 5500);
  }
}
