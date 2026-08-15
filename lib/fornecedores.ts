export type Fornecedor = {
  nome: string;
  galeria: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  ofertas: number;
  nota: number;
  verificado: boolean;
  melhor?: boolean;
  tel: string;
};

// TODO: substituir pela lista real de fornecedores (API/DB) quando existir.
export const FORNECEDORES: Fornecedor[] = [
  { nome: "Ultra Store 7915", galeria: "Shopping Oriental", cidade: "São Paulo, SP", uf: "SP", lat: -23.5389, lng: -46.6144, ofertas: 412, nota: 4.9, verificado: true, melhor: true, tel: "5511999990001" },
  { nome: "Number One 2203", galeria: "Shopping Oriental VT 2A", cidade: "São Paulo, SP", uf: "SP", lat: -23.5397, lng: -46.6131, ofertas: 388, nota: 4.7, verificado: true, tel: "5511999990002" },
  { nome: "Mega Polo Brás 357", galeria: "Mega Polo Moda", cidade: "São Paulo, SP", uf: "SP", lat: -23.5375, lng: -46.6199, ofertas: 301, nota: 5.0, verificado: true, tel: "5511999990003" },
  { nome: "Bagda 6620", galeria: "Rua Oriente", cidade: "São Paulo, SP", uf: "SP", lat: -23.5421, lng: -46.6167, ofertas: 264, nota: 4.3, verificado: false, tel: "5511999990004" },
  { nome: "Import Line 118", galeria: "Galeria Pagé", cidade: "São Paulo, SP", uf: "SP", lat: -23.5412, lng: -46.6316, ofertas: 187, nota: 4.1, verificado: false, tel: "5511999990005" },
  { nome: "Saara Tech 41", galeria: "Saara", cidade: "Rio de Janeiro, RJ", uf: "RJ", lat: -22.9046, lng: -43.1823, ofertas: 243, nota: 4.6, verificado: true, tel: "5521999990006" },
  { nome: "Mavi Base", galeria: "Operação própria", cidade: "Niterói, RJ", uf: "RJ", lat: -22.8832, lng: -43.1034, ofertas: 96, nota: 5.0, verificado: true, tel: "5521920184210" },
  { nome: "Center Cell MS", galeria: "Centro", cidade: "Campo Grande, MS", uf: "MS", lat: -20.4697, lng: -54.6201, ofertas: 158, nota: 4.4, verificado: true, tel: "5567999990008" },
  { nome: "Mac House 44", galeria: "Batel", cidade: "Curitiba, PR", uf: "PR", lat: -25.4284, lng: -49.2733, ofertas: 132, nota: 4.8, verificado: true, tel: "5541999990009" },
  { nome: "Sul Import 09", galeria: "Centro Histórico", cidade: "Porto Alegre, RS", uf: "RS", lat: -30.0346, lng: -51.2177, ofertas: 104, nota: 4.2, verificado: false, tel: "5551999990010" },
  { nome: "Minas Apple 7", galeria: "Savassi", cidade: "Belo Horizonte, MG", uf: "MG", lat: -19.9167, lng: -43.9345, ofertas: 121, nota: 4.5, verificado: true, tel: "5531999990011" },
  { nome: "Goiás Cell 22", galeria: "Setor Central", cidade: "Goiânia, GO", uf: "GO", lat: -16.6799, lng: -49.2550, ofertas: 88, nota: 4.0, verificado: false, tel: "5562999990012" },
  { nome: "Nordeste Tech", galeria: "Boa Viagem", cidade: "Recife, PE", uf: "PE", lat: -8.0476, lng: -34.8770, ofertas: 76, nota: 4.4, verificado: true, tel: "5581999990013" },
  { nome: "Fortal Store 3", galeria: "Centro", cidade: "Fortaleza, CE", uf: "CE", lat: -3.7319, lng: -38.5267, ofertas: 69, nota: 3.9, verificado: false, tel: "5585999990014" },
  { nome: "Norte Import", galeria: "Zona Franca", cidade: "Manaus, AM", uf: "AM", lat: -3.1190, lng: -60.0217, ofertas: 143, nota: 4.6, verificado: true, tel: "5592999990015" },
];
