import { AbastecimentoResponse } from './abastecimento.model';
import { CategoriaVeiculo, TipoPropulsao } from './enums.model';

export interface GastoMensal {
  readonly anoMes: string;
  readonly valorTotal: number;
}

export interface ConsumoVeiculo {
  readonly veiculoId: number;
  readonly apelido: string;
  readonly placa: string;
  readonly categoria: CategoriaVeiculo;
  readonly propulsao: TipoPropulsao;
  readonly mediaConsumo: number;
  readonly unidadeConsumo: string;
  readonly custoMedioPorKm: number;
}

export interface DashboardResponse {
  readonly totalVeiculos: number;
  readonly totalAbastecimentos: number;
  readonly gastoTotalMesAtual: number;
  readonly consumoMedioFrotaKmPorLitro: number;
  readonly custoMedioFrotaPorKm: number;
  readonly ultimoAbastecimento: AbastecimentoResponse | null;
  readonly gastosPorMes: readonly GastoMensal[];
  readonly consumoPorVeiculo: readonly ConsumoVeiculo[];
}
