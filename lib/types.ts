export type Oferta = {
  id: number;
  modelo: string;
  categoria: string;
  condicao: string;
  cor: string;
  variante: string | null;
  cidade: string;
  valor: string;
  valor_num: number;
  foto_url: string;
  data_atualizacao: string;
  created_at: string;
  verificado: boolean;
  fornecedor?: string | null;
};

export type Contato = {
  id: number;
  telefone: string;
  fornecedor: string;
  whatsapp_url: string;
};

export type Status = {
  total: number;
  cidades: number;
  fornecedores: number;
};

export type OfertasQuery = {
  categoria?: string;
  condicao?: string;
  cor?: string;
  estado?: string;
  cidade?: string;
  modelo?: string;
  armazenamento?: string;
  q?: string;
  sort?: "menor-preco" | "maior-preco" | "recentes" | "a-z";
  page?: number;
  pageSize?: number;
  itensPorPagina?: number;
};

export type OfertasResponse = {
  items: Oferta[];
  total: number;
  page: number;
  pageSize: number;
};

export type OpcaoFiltro = {
  valor: string;
  total: number;
};

export type ModeloFiltro = OpcaoFiltro & {
  categoria: string;
};

export type CidadeFiltro = OpcaoFiltro & {
  estado: string;
};

export type FiltrosDisponiveis = {
  categorias: OpcaoFiltro[];
  modelos: ModeloFiltro[];
  condicoes: OpcaoFiltro[];
  cores: OpcaoFiltro[];
  armazenamentos: OpcaoFiltro[];
  estados: OpcaoFiltro[];
  cidades: CidadeFiltro[];
  geradoEm: string;
};
