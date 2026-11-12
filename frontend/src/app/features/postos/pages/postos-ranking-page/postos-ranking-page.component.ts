import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PostoResumoResponse } from '../../../../core/models/abastecimento.model';
import { AbastecimentoApiService } from '../../../abastecimentos/services/abastecimento-api.service';

@Component({
  selector: 'app-postos-ranking-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Postos & Eletropostos</h1>
        <p class="text-sm text-slate-600 mt-1">
          Ranking dos locais onde você abasteceu, ordenados pelo menor preço médio unitário.
        </p>
      </div>
      <a routerLink="/abastecimentos/novo" class="btn-primary">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        <span>Registrar abastecimento</span>
      </a>
    </header>

    @if (carregando()) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        @for (i of [1, 2, 3]; track i) {
          <div class="h-32 bg-white rounded-2xl border border-slate-200 p-6"></div>
        }
      </div>
    } @else if (postos().length === 0) {
      <div class="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-6">
        <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-map-location-dot text-2xl" aria-hidden="true"></i>
        </div>
        <h2 class="text-base font-bold text-slate-900">Nenhum posto registrado ainda</h2>
        <p class="text-sm text-slate-600 mt-1 mb-6">
          Ao informar o nome do posto ou eletroposto nos seus abastecimentos, você verá aqui o comparativo de preços.
        </p>
        <a routerLink="/abastecimentos/novo" class="btn-primary">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
          <span>Registrar abastecimento com local</span>
        </a>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (p of postos(); track p.locPosto; let idx = $index) {
          <article class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0"
                  [class.bg-emerald-100]="idx === 0"
                  [class.text-emerald-800]="idx === 0"
                  [class.bg-slate-100]="idx !== 0"
                  [class.text-slate-700]="idx !== 0"
                >
                  #{{ idx + 1 }}
                </div>
                <div class="min-w-0">
                  <h2 class="text-base font-bold text-slate-900 truncate">{{ p.locPosto }}</h2>
                  <p class="text-xs text-slate-600">
                    {{ p.totalAbastecimentos }} {{ p.totalAbastecimentos === 1 ? 'visita registrada' : 'visitas registradas' }}
                  </p>
                </div>
              </div>
              @if (idx === 0) {
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Melhor preço
                </span>
              }
            </div>

            <div class="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
              <div>
                <span class="block text-xs text-slate-500">Preço Médio Unit.</span>
                <span class="block text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {{ p.precoMedioLitro | currency:'BRL':'symbol':'1.3-3' }}
                </span>
              </div>
              <div class="text-right">
                <span class="block text-xs text-slate-500">Total Investido</span>
                <span class="block text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {{ p.totalGasto | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </div>
            </div>
          </article>
        }
      </div>
    }
  `
})
export class PostosRankingPageComponent implements OnInit {
  private readonly abastecimentoApi = inject(AbastecimentoApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly postos = signal<readonly PostoResumoResponse[]>([]);

  ngOnInit(): void {
    this.abastecimentoApi
      .resumirPorPosto()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lista) => this.postos.set(lista)
      });
  }
}
