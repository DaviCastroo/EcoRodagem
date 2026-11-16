import { TipoCombustivel } from './enums.model';

export interface AbastecimentoRequest {
  readonly veiculoId: number;
  readonly combustivel: TipoCombustivel;
  readonly tanqueCheio: boolean;
  readonly litros: number;
  readonly valorTotal: number;
  readonly hodometro: number;
  readonly locPosto?: string | null;
  readonly dataAbastecimento: string;
}

export interface AbastecimentoResponse {
  readonly id: number;
  readonly veiculoId: number;
  readonly veiculoApelido: string;
  readonly veiculoPlaca: string;
  readonly combustivel: TipoCombustivel;
  readonly unidadeMedida: string;
  readonly unidadeConsumo: string;
  readonly tanqueCheio: boolean;
  readonly litros: number;
  readonly valorTotal: number;
  readonly precoLitro: number;
  readonly hodometro: number;
  readonly kmPercorridos: number;
  readonly mediaConsumoKmPorLitro: number;
  readonly custoPorKm: number;
  readonly locPosto: string | null;
  readonly dataAbastecimento: string;
  readonly criadoEm: string;
}

export interface PostoResumoResponse {
  readonly locPosto: string;
  readonly totalAbastecimentos: number;
  readonly precoMedioLitro: number;
  readonly totalGasto: number;
}
