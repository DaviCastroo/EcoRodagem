import { CategoriaVeiculo, TipoPropulsao } from './enums.model';

export interface VeiculoRequest {
  readonly apelido: string;
  readonly placa: string;
  readonly marca: string;
  readonly modelo: string;
  readonly cor?: string | null;
  readonly ano?: string | null;
  readonly categoria: CategoriaVeiculo;
  readonly propulsao: TipoPropulsao;
  readonly hodometro: number;
  readonly tanqueComb?: number | null;
  readonly capacidadeGnvM3?: number | null;
  readonly capacidadeBateriaKwh?: number | null;
}

export interface VeiculoResponse {
  readonly id: number;
  readonly apelido: string;
  readonly placa: string;
  readonly marca: string;
  readonly modelo: string;
  readonly cor: string | null;
  readonly ano: string | null;
  readonly categoria: CategoriaVeiculo;
  readonly propulsao: TipoPropulsao;
  readonly hodometroInicial: number;
  readonly hodometroAtual: number;
  readonly tanqueComb: number | null;
  readonly capacidadeGnvM3: number | null;
  readonly capacidadeBateriaKwh: number | null;
  readonly consumoMedio: number;
  readonly unidadeConsumoPrincipal: string;
  readonly custoMedioPorKm: number;
  readonly ativo: boolean;
  readonly criadoEm: string;
}
