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

export interface AiDestaqueVeiculo {
  readonly apelido: string;
  readonly placa: string;
  readonly propulsao: string;
  readonly custoPorKm: number;
  readonly mediaConsumo: number;
  readonly unidadeConsumo: string;
  readonly observacao: string;
}

export interface AiRecomendacao {
  readonly titulo: string;
  readonly descricao: string;
  readonly impacto: 'ALTO' | 'MEDIO' | 'BAIXO';
  readonly categoria: 'ELETRIFICACAO' | 'COMBUSTIVEL' | 'POSTO' | 'FROTA';
}

export interface AiDiagnosticsResponse {
  readonly resumoExecutivo: string;
  readonly economiaEstimadaMensal: number;
  readonly percentualOtimizacaoPotencial: number;
  readonly veiculoMaisEficiente: AiDestaqueVeiculo | null;
  readonly pontoAtencao: AiDestaqueVeiculo | null;
  readonly recomendacoes: readonly AiRecomendacao[];
  readonly fonteIa: string;
  readonly latenciaMs: number;
}

export interface AiChatResponse {
  readonly pergunta: string;
  readonly resposta: string;
  readonly sugestoesFollowUp: readonly string[];
  readonly fonteIa: string;
  readonly latenciaMs: number;
}
