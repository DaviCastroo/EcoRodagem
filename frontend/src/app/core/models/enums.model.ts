export type CategoriaVeiculo = 'CARRO' | 'MOTO' | 'UTILITARIO' | 'CAMINHAO';

export type TipoPropulsao =
  | 'COMBUSTAO'
  | 'FLEX'
  | 'BI_FUEL_GNV'
  | 'HIBRIDO_HEV'
  | 'HIBRIDO_PHEV'
  | 'ELETRICO_BEV';

export type TipoCombustivel = 'GASOLINA' | 'ETANOL' | 'DIESEL' | 'GNV' | 'ELETRICO';

export interface CategoriaMeta {
  readonly valor: CategoriaVeiculo;
  readonly rotulo: string;
  readonly icone: string;
}

export interface PropulsaoMeta {
  readonly valor: TipoPropulsao;
  readonly rotulo: string;
  readonly descricaoCurta: string;
  readonly icone: string;
  readonly badgeClasses: string;
  readonly requerTanqueLiquido: boolean;
  readonly requerCilindroGnv: boolean;
  readonly requerBateriaKwh: boolean;
  readonly combustiveisAceitos: readonly TipoCombustivel[];
}

export interface CombustivelMeta {
  readonly valor: TipoCombustivel;
  readonly rotulo: string;
  readonly unidadeVolume: 'L' | 'm³' | 'kWh';
  readonly unidadeConsumo: 'km/L' | 'km/m³' | 'km/kWh';
  readonly icone: string;
  readonly badgeClasses: string;
}

export const CATEGORIAS_VEICULO: readonly CategoriaMeta[] = [
  { valor: 'CARRO', rotulo: 'Carro / Passeio', icone: 'fa-solid fa-car-side' },
  { valor: 'MOTO', rotulo: 'Motocicleta', icone: 'fa-solid fa-motorcycle' },
  { valor: 'UTILITARIO', rotulo: 'Utilitário / Picape / Van', icone: 'fa-solid fa-truck-pickup' },
  { valor: 'CAMINHAO', rotulo: 'Caminhão / Pesado', icone: 'fa-solid fa-truck' }
] as const;

export const CATEGORIAS_MAP: Record<CategoriaVeiculo, CategoriaMeta> = {
  CARRO: CATEGORIAS_VEICULO[0],
  MOTO: CATEGORIAS_VEICULO[1],
  UTILITARIO: CATEGORIAS_VEICULO[2],
  CAMINHAO: CATEGORIAS_VEICULO[3]
};

export const PROPULSOES_MAP: Record<TipoPropulsao, PropulsaoMeta> = {
  FLEX: {
    valor: 'FLEX',
    rotulo: 'Flex (Gasolina / Etanol)',
    descricaoCurta: 'Tanque líquido bicombustível',
    icone: 'fa-solid fa-leaf',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    requerTanqueLiquido: true,
    requerCilindroGnv: false,
    requerBateriaKwh: false,
    combustiveisAceitos: ['GASOLINA', 'ETANOL']
  },
  COMBUSTAO: {
    valor: 'COMBUSTAO',
    rotulo: 'Combustão Tradicional',
    descricaoCurta: 'Gasolina, Etanol ou Diesel',
    icone: 'fa-solid fa-gas-pump',
    badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200',
    requerTanqueLiquido: true,
    requerCilindroGnv: false,
    requerBateriaKwh: false,
    combustiveisAceitos: ['GASOLINA', 'ETANOL', 'DIESEL']
  },
  BI_FUEL_GNV: {
    valor: 'BI_FUEL_GNV',
    rotulo: 'Flex / Combustão + Kit GNV',
    descricaoCurta: 'Tanque líquido (L) + Cilindro GNV (m³)',
    icone: 'fa-solid fa-fire-flame-simple',
    badgeClasses: 'bg-sky-50 text-sky-800 border-sky-200',
    requerTanqueLiquido: true,
    requerCilindroGnv: true,
    requerBateriaKwh: false,
    combustiveisAceitos: ['GASOLINA', 'ETANOL', 'GNV']
  },
  HIBRIDO_HEV: {
    valor: 'HIBRIDO_HEV',
    rotulo: 'Híbrido Convencional (HEV)',
    descricaoCurta: 'Autorrecarregável (abastece combustível líquido)',
    icone: 'fa-solid fa-seedling',
    badgeClasses: 'bg-teal-50 text-teal-800 border-teal-200',
    requerTanqueLiquido: true,
    requerCilindroGnv: false,
    requerBateriaKwh: false,
    combustiveisAceitos: ['GASOLINA', 'ETANOL', 'DIESEL']
  },
  HIBRIDO_PHEV: {
    valor: 'HIBRIDO_PHEV',
    rotulo: 'Híbrido Plug-in (PHEV)',
    descricaoCurta: 'Tanque líquido (L) + Bateria recarregável (kWh)',
    icone: 'fa-solid fa-plug-circle-bolt',
    badgeClasses: 'bg-violet-50 text-violet-800 border-violet-200',
    requerTanqueLiquido: true,
    requerCilindroGnv: false,
    requerBateriaKwh: true,
    combustiveisAceitos: ['GASOLINA', 'ETANOL', 'ELETRICO']
  },
  ELETRICO_BEV: {
    valor: 'ELETRICO_BEV',
    rotulo: '100% Elétrico (BEV)',
    descricaoCurta: 'Apenas bateria recarregável em eletroposto (kWh)',
    icone: 'fa-solid fa-bolt',
    badgeClasses: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    requerTanqueLiquido: false,
    requerCilindroGnv: false,
    requerBateriaKwh: true,
    combustiveisAceitos: ['ELETRICO']
  }
};

export const PROPULSOES_LISTA: readonly PropulsaoMeta[] = Object.values(PROPULSOES_MAP);

export const COMBUSTIVEIS_MAP: Record<TipoCombustivel, CombustivelMeta> = {
  GASOLINA: {
    valor: 'GASOLINA',
    rotulo: 'Gasolina',
    unidadeVolume: 'L',
    unidadeConsumo: 'km/L',
    icone: 'fa-solid fa-gas-pump',
    badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  ETANOL: {
    valor: 'ETANOL',
    rotulo: 'Etanol',
    unidadeVolume: 'L',
    unidadeConsumo: 'km/L',
    icone: 'fa-solid fa-leaf',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  DIESEL: {
    valor: 'DIESEL',
    rotulo: 'Diesel',
    unidadeVolume: 'L',
    unidadeConsumo: 'km/L',
    icone: 'fa-solid fa-truck-droplet',
    badgeClasses: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  GNV: {
    valor: 'GNV',
    rotulo: 'Gás Natural (GNV)',
    unidadeVolume: 'm³',
    unidadeConsumo: 'km/m³',
    icone: 'fa-solid fa-fire-flame-simple',
    badgeClasses: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  ELETRICO: {
    valor: 'ELETRICO',
    rotulo: 'Recarga Elétrica',
    unidadeVolume: 'kWh',
    unidadeConsumo: 'km/kWh',
    icone: 'fa-solid fa-bolt',
    badgeClasses: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  }
};
