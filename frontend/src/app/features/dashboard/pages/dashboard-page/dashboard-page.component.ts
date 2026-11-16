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
import { ConsumoVeiculo, DashboardResponse } from '../../../../core/models/dashboard.model';
import { CATEGORIAS_MAP, CategoriaVeiculo } from '../../../../core/models/enums.model';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { DashboardApiService } from '../../services/dashboard-api.service';

export interface GastoMensalEnriquecido {
  readonly anoMes: string;
  readonly rotuloCurto: string;
  readonly rotuloLongo: string;
  readonly valorTotal: number;
  readonly percentualAltura: number;
  readonly percentualParticipacao: number;
  readonly variacaoPercentual: number | null;
  readonly isPico: boolean;
  readonly isUltimo: boolean;
}

type FiltroGrupoCategoria = 'TODOS' | 'CARRO' | 'MOTO' | 'PESADOS';
type CriterioOrdenacaoEficiencia = 'CUSTO_KM' | 'RENDIMENTO';

const NOMES_MESES_CURTOS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez'
};

const NOMES_MESES_LONGOS: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro'
};

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

  readonly filtroCategoriaEficiencia = signal<FiltroGrupoCategoria>('TODOS');
  readonly ordenacaoEficiencia = signal<CriterioOrdenacaoEficiencia>('CUSTO_KM');
  readonly mostrarTodosVeiculos = signal<boolean>(false);

  readonly totalAcumuladoPeriodo = computed<number>(() => {
    const gastos = this.dados()?.gastosPorMes ?? [];
    return gastos.reduce((acc, g) => acc + g.valorTotal, 0);
  });

  readonly maiorGastoMensal = computed<number>(() => {
    const gastos = this.dados()?.gastosPorMes ?? [];
    if (gastos.length === 0) {
      return 0;
    }
    return Math.max(...gastos.map((g) => g.valorTotal), 0);
  });

  readonly mediaGastoMensal = computed<number>(() => {
    const gastos = this.dados()?.gastosPorMes ?? [];
    if (gastos.length === 0) {
      return 0;
    }
    return this.totalAcumuladoPeriodo() / gastos.length;
  });

  readonly variacaoUltimoMes = computed<number | null>(() => {
    const enriquecidos = this.gastosMensaisEnriquecidos();
    if (enriquecidos.length < 2) {
      return null;
    }
    return enriquecidos[enriquecidos.length - 1].variacaoPercentual;
  });

  readonly gastosMensaisEnriquecidos = computed<readonly GastoMensalEnriquecido[]>(() => {
    const gastos = this.dados()?.gastosPorMes ?? [];
    if (gastos.length === 0) {
      return [];
    }

    const maiorValor = Math.max(...gastos.map((g) => g.valorTotal), 1);
    const somaTotal = gastos.reduce((acc, g) => acc + g.valorTotal, 0) || 1;

    return gastos.map((g, index) => {
      const [ano, mes] = g.anoMes.split('-');
      const mesCurto = NOMES_MESES_CURTOS[mes] ?? mes;
      const mesLongo = NOMES_MESES_LONGOS[mes] ?? mes;
      const anoCurto = ano ? ano.slice(-2) : '';

      const anterior = index > 0 ? gastos[index - 1].valorTotal : null;
      const variacaoPercentual =
        anterior && anterior > 0 ? ((g.valorTotal - anterior) / anterior) * 100 : null;

      return {
        anoMes: g.anoMes,
        rotuloCurto: `${mesCurto}/${anoCurto}`,
        rotuloLongo: `${mesLongo} de ${ano}`,
        valorTotal: g.valorTotal,
        percentualAltura: Math.max(Math.round((g.valorTotal / maiorValor) * 100), 12),
        percentualParticipacao: Math.round((g.valorTotal / somaTotal) * 100),
        variacaoPercentual,
        isPico: g.valorTotal === maiorValor && g.valorTotal > 0,
        isUltimo: index === gastos.length - 1
      };
    });
  });

  readonly gastosMensaisReverso = computed<readonly GastoMensalEnriquecido[]>(() => {
    return [...this.gastosMensaisEnriquecidos()].reverse();
  });

  readonly veiculosEficienciaFiltrados = computed<readonly ConsumoVeiculo[]>(() => {
    const lista = this.dados()?.consumoPorVeiculo ?? [];
    const grupo = this.filtroCategoriaEficiencia();
    const criterio = this.ordenacaoEficiencia();

    const filtrados = lista.filter((v) => {
      if (grupo === 'TODOS') return true;
      if (grupo === 'CARRO') return v.categoria === 'CARRO';
      if (grupo === 'MOTO') return v.categoria === 'MOTO';
      return v.categoria === 'UTILITARIO' || v.categoria === 'CAMINHAO';
    });

    return [...filtrados].sort((a, b) => {
      if (criterio === 'CUSTO_KM') {
        const custoA = a.custoMedioPorKm > 0 ? a.custoMedioPorKm : 999999;
        const custoB = b.custoMedioPorKm > 0 ? b.custoMedioPorKm : 999999;
        return custoA - custoB;
      }
      return b.mediaConsumo - a.mediaConsumo;
    });
  });

  readonly veiculosEficienciaVisiveis = computed<readonly ConsumoVeiculo[]>(() => {
    const todos = this.veiculosEficienciaFiltrados();
    if (this.mostrarTodosVeiculos() || todos.length <= 5) {
      return todos;
    }
    return todos.slice(0, 5);
  });

  readonly maiorRendimentoVisivel = computed<number>(() => {
    const lista = this.veiculosEficienciaFiltrados();
    if (lista.length === 0) return 1;
    return Math.max(...lista.map((v) => v.mediaConsumo), 1);
  });

  readonly menorCustoKmVisivel = computed<number>(() => {
    const lista = this.veiculosEficienciaFiltrados().filter((v) => v.custoMedioPorKm > 0);
    if (lista.length === 0) return 0.01;
    return Math.min(...lista.map((v) => v.custoMedioPorKm));
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

  obterIconeCategoria(categoria: CategoriaVeiculo): string {
    return CATEGORIAS_MAP[categoria]?.icone ?? 'fa-solid fa-car-side';
  }

  obterRotuloCategoria(categoria: CategoriaVeiculo): string {
    return CATEGORIAS_MAP[categoria]?.rotulo ?? categoria;
  }

  calcularBarraEficienciaVeiculo(v: ConsumoVeiculo): number {
    if (this.ordenacaoEficiencia() === 'RENDIMENTO') {
      const max = this.maiorRendimentoVisivel();
      return Math.max(Math.round((v.mediaConsumo / max) * 100), 10);
    }
    if (v.custoMedioPorKm <= 0) {
      return 10;
    }
    const min = this.menorCustoKmVisivel();
    const eficienciaRelativa = (min / v.custoMedioPorKm) * 100;
    return Math.max(Math.min(Math.round(eficienciaRelativa), 100), 12);
  }
}
