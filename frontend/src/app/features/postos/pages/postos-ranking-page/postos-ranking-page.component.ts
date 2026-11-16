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
import { AbastecimentoResponse } from '../../../../core/models/abastecimento.model';
import { TipoCombustivel } from '../../../../core/models/enums.model';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { AbastecimentoApiService } from '../../../abastecimentos/services/abastecimento-api.service';

export type CategoriaPosto = 'TODOS' | 'LIQUIDO' | 'GNV' | 'ELETRICO';
export type OrdenacaoPosto = 'PRECO_ASC' | 'VISITAS_DESC' | 'GASTO_DESC' | 'RECENTE_DESC';

export interface PostoAnalitico {
  readonly locPosto: string;
  readonly categoriaPrincipal: 'LIQUIDO' | 'GNV' | 'ELETRICO';
  readonly unidadePrincipal: string;
  readonly combustiveis: readonly TipoCombustivel[];
  readonly veiculosAtendidos: readonly string[];
  readonly totalVisitas: number;
  readonly volumeTotal: number;
  readonly precoMedioUnitario: number;
  readonly menorPrecoUnitario: number;
  readonly maiorPrecoUnitario: number;
  readonly totalInvestido: number;
  readonly percentualGastoFrota: number;
  readonly ultimaVisita: string;
  readonly custoMedioPorKmLocal: number;
}

@Component({
  selector: 'app-postos-ranking-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe, DatePipe, PropulsionBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './postos-ranking-page.component.html'
})
export class PostosRankingPageComponent implements OnInit {
  private readonly abastecimentoApi = inject(AbastecimentoApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly abastecimentos = signal<readonly AbastecimentoResponse[]>([]);

  readonly filtroCategoria = signal<CategoriaPosto>('TODOS');
  readonly termoBusca = signal<string>('');
  readonly ordenacao = signal<OrdenacaoPosto>('PRECO_ASC');

  // Consolida estatísticas ricas por posto/eletroposto a partir do histórico
  readonly todosPostos = computed<readonly PostoAnalitico[]>(() => {
    const registros = this.abastecimentos().filter(
      (a) => a.locPosto && a.locPosto.trim().length > 0
    );
    if (registros.length === 0) {
      return [];
    }

    const gastoTotalGeral = registros.reduce((acc, r) => acc + r.valorTotal, 0) || 1;
    const grupos = new Map<string, AbastecimentoResponse[]>();

    for (const reg of registros) {
      const chave = reg.locPosto!.trim();
      const atual = grupos.get(chave) ?? [];
      atual.push(reg);
      grupos.set(chave, atual);
    }

    const resultado: PostoAnalitico[] = [];

    for (const [locPosto, itens] of grupos.entries()) {
      const totalVisitas = itens.length;
      const totalInvestido = itens.reduce((acc, i) => acc + i.valorTotal, 0);
      const volumeTotal = itens.reduce((acc, i) => acc + i.litros, 0);
      const precos = itens.map((i) => i.precoLitro);
      const precoMedioUnitario = precos.reduce((acc, p) => acc + p, 0) / totalVisitas;
      const menorPrecoUnitario = Math.min(...precos);
      const maiorPrecoUnitario = Math.max(...precos);
      const custoMedioPorKmLocal =
        itens.reduce((acc, i) => acc + i.custoPorKm, 0) / totalVisitas;

      const combustiveisSet = new Set<TipoCombustivel>();
      const veiculosSet = new Set<string>();
      let ultimaVisita = itens[0].dataAbastecimento;

      for (const i of itens) {
        combustiveisSet.add(i.combustivel);
        veiculosSet.add(i.veiculoApelido);
        if (i.dataAbastecimento > ultimaVisita) {
          ultimaVisita = i.dataAbastecimento;
        }
      }

      const combustiveis = Array.from(combustiveisSet);
      let categoriaPrincipal: 'LIQUIDO' | 'GNV' | 'ELETRICO' = 'LIQUIDO';
      let unidadePrincipal = 'L';

      if (combustiveis.includes('ELETRICO')) {
        categoriaPrincipal = 'ELETRICO';
        unidadePrincipal = 'kWh';
      } else if (combustiveis.includes('GNV')) {
        categoriaPrincipal = 'GNV';
        unidadePrincipal = 'm³';
      }

      resultado.push({
        locPosto,
        categoriaPrincipal,
        unidadePrincipal,
        combustiveis,
        veiculosAtendidos: Array.from(veiculosSet),
        totalVisitas,
        volumeTotal,
        precoMedioUnitario,
        menorPrecoUnitario,
        maiorPrecoUnitario,
        totalInvestido,
        percentualGastoFrota: Math.max(Math.round((totalInvestido / gastoTotalGeral) * 100), 1),
        ultimaVisita,
        custoMedioPorKmLocal
      });
    }

    return resultado;
  });

  readonly postosFiltrados = computed<readonly PostoAnalitico[]>(() => {
    const cat = this.filtroCategoria();
    const busca = this.termoBusca().trim().toLowerCase();
    const ordem = this.ordenacao();

    const filtrados = this.todosPostos().filter((p) => {
      if (cat !== 'TODOS' && p.categoriaPrincipal !== cat) {
        return false;
      }
      if (busca) {
        const alvo = `${p.locPosto} ${p.veiculosAtendidos.join(' ')} ${p.combustiveis.join(' ')}`.toLowerCase();
        if (!alvo.includes(busca)) {
          return false;
        }
      }
      return true;
    });

    return [...filtrados].sort((a, b) => {
      switch (ordem) {
        case 'VISITAS_DESC':
          return b.totalVisitas - a.totalVisitas || a.precoMedioUnitario - b.precoMedioUnitario;
        case 'GASTO_DESC':
          return b.totalInvestido - a.totalInvestido;
        case 'RECENTE_DESC':
          return b.ultimaVisita.localeCompare(a.ultimaVisita);
        case 'PRECO_ASC':
        default:
          return a.precoMedioUnitario - b.precoMedioUnitario;
      }
    });
  });

  // Destaques analíticos para os cards de KPI no topo
  readonly melhorPostoCombustivel = computed<PostoAnalitico | null>(() => {
    const liquidos = this.todosPostos().filter((p) => p.categoriaPrincipal === 'LIQUIDO');
    if (liquidos.length === 0) return null;
    return [...liquidos].sort((a, b) => a.precoMedioUnitario - b.precoMedioUnitario)[0];
  });

  readonly melhorEletroposto = computed<PostoAnalitico | null>(() => {
    const eletricos = this.todosPostos().filter((p) => p.categoriaPrincipal === 'ELETRICO');
    if (eletricos.length === 0) return null;
    return [...eletricos].sort((a, b) => a.precoMedioUnitario - b.precoMedioUnitario)[0];
  });

  readonly postoMaisFrequente = computed<PostoAnalitico | null>(() => {
    const todos = this.todosPostos();
    if (todos.length === 0) return null;
    return [...todos].sort((a, b) => b.totalVisitas - a.totalVisitas || b.totalInvestido - a.totalInvestido)[0];
  });

  readonly totalVisitasMapeadas = computed<number>(() => {
    return this.todosPostos().reduce((acc, p) => acc + p.totalVisitas, 0);
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.abastecimentoApi
      .listar(null, null)
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lista) => this.abastecimentos.set(lista)
      });
  }
}
