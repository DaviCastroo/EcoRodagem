import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DashboardResponse } from '../../../../core/models/dashboard.model';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { DashboardApiService } from '../../services/dashboard-api.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe, DatePipe, PropulsionBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly dados = signal<DashboardResponse | null>(null);

  readonly maiorGastoMensal = computed<number>(() => {
    const gastos = this.dados()?.gastosPorMes ?? [];
    if (gastos.length === 0) {
      return 1;
    }
    return Math.max(...gastos.map((g) => g.valorTotal), 1);
  });

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.carregando.set(true);
    this.dashboardApi
      .obterResumo()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => this.dados.set(res)
      });
  }

  calcularPercentualBarra(valor: number): number {
    const max = this.maiorGastoMensal();
    return Math.max(Math.round((valor / max) * 100), 8);
  }
}
