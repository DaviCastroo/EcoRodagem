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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AbastecimentoResponse } from '../../../../core/models/abastecimento.model';
import {
  CATEGORIAS_MAP,
  COMBUSTIVEIS_MAP,
  CategoriaVeiculo,
  TipoCombustivel
} from '../../../../core/models/enums.model';
import { VeiculoResponse } from '../../../../core/models/veiculo.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { VeiculoApiService } from '../../../veiculos/services/veiculo-api.service';
import { AbastecimentoApiService } from '../../services/abastecimento-api.service';

export type PeriodoFiltro = 'TODOS' | '7D' | '30D' | '60D' | '90D' | 'PERSONALIZADO';
export type OrdenacaoAbastecimento =
  | 'DATA_DESC'
  | 'DATA_ASC'
  | 'VALOR_DESC'
  | 'VALOR_ASC'
  | 'CUSTO_KM_ASC'
  | 'MEDIA_DESC';

@Component({
  selector: 'app-abastecimento-list-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe, DatePipe, PropulsionBadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './abastecimento-list-page.component.html'
})
export class AbastecimentoListPageComponent implements OnInit {
  private readonly abastecimentoApi = inject(AbastecimentoApiService);
  private readonly veiculoApi = inject(VeiculoApiService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly todosRegistros = signal<readonly AbastecimentoResponse[]>([]);
  readonly veiculos = signal<readonly VeiculoResponse[]>([]);

  // Estados reativos dos filtros combináveis
  readonly termoBusca = signal<string>('');
  readonly filtroVeiculoId = signal<number | null>(null);
  readonly filtroCategoria = signal<CategoriaVeiculo | null>(null);
  readonly filtroCombustivel = signal<TipoCombustivel | null>(null);
  readonly filtroPeriodo = signal<PeriodoFiltro>('TODOS');
  readonly dataInicial = signal<string>('');
  readonly dataFinal = signal<string>('');
  readonly ordenacao = signal<OrdenacaoAbastecimento>('DATA_DESC');

  readonly registroParaExcluir = signal<AbastecimentoResponse | null>(null);

  readonly categorias = Object.values(CATEGORIAS_MAP);
  readonly combustiveis = Object.values(COMBUSTIVEIS_MAP);

  // Mapa rápido de ID do veículo -> VeiculoResponse
  readonly mapaVeiculos = computed<ReadonlyMap<number, VeiculoResponse>>(() => {
    const map = new Map<number, VeiculoResponse>();
    for (const v of this.veiculos()) {
      map.set(v.id, v);
    }
    return map;
  });

  // Quantidade de filtros ativos no momento
  readonly qtdFiltrosAtivos = computed<number>(() => {
    let total = 0;
    if (this.termoBusca().trim()) total++;
    if (this.filtroVeiculoId() !== null) total++;
    if (this.filtroCategoria() !== null) total++;
    if (this.filtroCombustivel() !== null) total++;
    if (this.filtroPeriodo() !== 'TODOS') total++;
    return total;
  });

  // Lista filtrada e ordenada reativamente
  readonly registrosFiltrados = computed<readonly AbastecimentoResponse[]>(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    const veiculoId = this.filtroVeiculoId();
    const categoria = this.filtroCategoria();
    const combustivel = this.filtroCombustivel();
    const periodo = this.filtroPeriodo();
    const dtInicio = this.dataInicial();
    const dtFim = this.dataFinal();
    const ordem = this.ordenacao();
    const veiculosMap = this.mapaVeiculos();

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const filtrados = this.todosRegistros().filter((item) => {
      if (veiculoId !== null && item.veiculoId !== veiculoId) {
        return false;
      }

      if (categoria !== null) {
        const veiculo = veiculosMap.get(item.veiculoId);
        if (!veiculo || veiculo.categoria !== categoria) {
          return false;
        }
      }

      if (combustivel !== null && item.combustivel !== combustivel) {
        return false;
      }

      if (periodo !== 'TODOS') {
        const dataItem = new Date(item.dataAbastecimento + 'T12:00:00');
        if (periodo === 'PERSONALIZADO') {
          if (dtInicio) {
            const inicio = new Date(dtInicio + 'T00:00:00');
            if (dataItem < inicio) return false;
          }
          if (dtFim) {
            const fim = new Date(dtFim + 'T23:59:59');
            if (dataItem > fim) return false;
          }
        } else {
          const diasMap: Record<string, number> = {
            '7D': 7,
            '30D': 30,
            '60D': 60,
            '90D': 90
          };
          const dias = diasMap[periodo] ?? 0;
          if (dias > 0) {
            const dataLimite = new Date(hoje);
            dataLimite.setDate(dataLimite.getDate() - dias);
            if (dataItem < dataLimite) return false;
          }
        }
      }

      if (busca) {
        const textoAlvo = `${item.veiculoApelido} ${item.veiculoPlaca} ${item.locPosto ?? ''} ${item.combustivel}`.toLowerCase();
        if (!textoAlvo.includes(busca)) {
          return false;
        }
      }

      return true;
    });

    return [...filtrados].sort((a, b) => {
      switch (ordem) {
        case 'DATA_ASC':
          return a.dataAbastecimento.localeCompare(b.dataAbastecimento) || a.id - b.id;
        case 'VALOR_DESC':
          return b.valorTotal - a.valorTotal;
        case 'VALOR_ASC':
          return a.valorTotal - b.valorTotal;
        case 'CUSTO_KM_ASC':
          return a.custoPorKm - b.custoPorKm;
        case 'MEDIA_DESC':
          return b.mediaConsumoKmPorLitro - a.mediaConsumoKmPorLitro;
        case 'DATA_DESC':
        default:
          return b.dataAbastecimento.localeCompare(a.dataAbastecimento) || b.id - a.id;
      }
    });
  });

  // Indicadores consolidados do recorte filtrado
  readonly resumoFiltrado = computed(() => {
    const lista = this.registrosFiltrados();
    const valorTotal = lista.reduce((acc, r) => acc + r.valorTotal, 0);
    const kmTotal = lista.reduce((acc, r) => acc + r.kmPercorridos, 0);
    const custoMedioKm =
      lista.length > 0
        ? lista.reduce((acc, r) => acc + r.custoPorKm, 0) / lista.length
        : 0;

    return {
      quantidade: lista.length,
      valorTotal,
      kmTotal,
      custoMedioKm
    };
  });

  ngOnInit(): void {
    const veiculoParam = this.route.snapshot.queryParamMap.get('veiculoId');
    if (veiculoParam) {
      this.filtroVeiculoId.set(Number(veiculoParam));
    }

    const postoParam = this.route.snapshot.queryParamMap.get('posto');
    if (postoParam) {
      this.termoBusca.set(postoParam);
    }

    this.veiculoApi
      .listarTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => this.veiculos.set(lista));

    this.carregarRegistros();
  }

  carregarRegistros(): void {
    this.carregando.set(true);
    this.abastecimentoApi
      .listar(null, null)
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lista) => this.todosRegistros.set(lista)
      });
  }

  limparFiltros(): void {
    this.termoBusca.set('');
    this.filtroVeiculoId.set(null);
    this.filtroCategoria.set(null);
    this.filtroCombustivel.set(null);
    this.filtroPeriodo.set('TODOS');
    this.dataInicial.set('');
    this.dataFinal.set('');
    this.ordenacao.set('DATA_DESC');
  }

  confirmarExclusao(): void {
    const alvo = this.registroParaExcluir();
    if (!alvo) {
      return;
    }

    this.abastecimentoApi
      .excluir(alvo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.sucesso(
            'Registro removido',
            `O abastecimento de ${alvo.veiculoApelido} foi excluído.`
          );
          this.registroParaExcluir.set(null);
          this.carregarRegistros();
        }
      });
  }
}
