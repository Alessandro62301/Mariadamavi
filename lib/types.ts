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
  cidade?: string;
  q?: string;
  sort?: "menor-preco" | "maior-preco" | "recentes";
  page?: number;
  pageSize?: number;
};

export type OfertasResponse = {
  items: Oferta[];
  total: number;
  page: number;
  pageSize: number;
};
