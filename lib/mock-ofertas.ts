import type { Oferta, Contato } from "./types";

/**
 * Dados de exemplo no MESMO formato da API real (Conecta Lojista/BuskaPhone).
 * Trocar `buscarOfertasUpstream` / `buscarContatoUpstream` em lib/upstream.ts
 * pela chamada axios real quando a credencial estiver disponível — o resto
 * do app (rotas, filtros, UI) não muda.
 */

const FORNECEDORES = ["SÓ IPHONE", "Selena Cell", "Mundo do iPhone", "Souna Cell", "iStore RJ", "Apple Center Niterói"];
const CIDADES = ["São Paulo, SP", "Campo Grande, MS", "Guarulhos, SP", "Rio de Janeiro, RJ", "Niterói, RJ"];
const CORES_IPHONE = ["PRETO", "ROXO", "VERMELHO", "BRANCO", "AZUL", "VERDE", "TITÂNIO NATURAL", "TITÂNIO PRETO"];
const MODELOS: { modelo: string; categoria: string; base: number }[] = [
  { modelo: "iPhone 11 64GB", categoria: "iphone", base: 950 },
  { modelo: "iPhone 12 128GB", categoria: "iphone", base: 1250 },
  { modelo: "iPhone 13 128GB", categoria: "iphone", base: 1850 },
  { modelo: "iPhone 14 128GB", categoria: "iphone", base: 2400 },
  { modelo: "iPhone 15 128GB", categoria: "iphone", base: 3200 },
  { modelo: "iPhone 15 Pro 256GB", categoria: "iphone", base: 4800 },
  { modelo: "iPhone 16 Pro Max 256GB", categoria: "iphone", base: 6900 },
  { modelo: "iPad 9 64GB", categoria: "ipad", base: 1400 },
  { modelo: "iPad Air M2 128GB", categoria: "ipad", base: 3600 },
  { modelo: "MacBook Air M1 8/256GB", categoria: "macbook", base: 4200 },
  { modelo: "MacBook Pro M3 16/512GB", categoria: "macbook", base: 8900 },
  { modelo: "Apple Watch Series 9", categoria: "apple watch", base: 2100 },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gerarOfertas(): Oferta[] {
  const rand = seededRandom(42);
  const ofertas: Oferta[] = [];
  let id = 669588;

  for (const { modelo, categoria, base } of MODELOS) {
    const repeticoes = 6 + Math.floor(rand() * 10);
    for (let i = 0; i < repeticoes; i++) {
      const cor = CORES_IPHONE[Math.floor(rand() * CORES_IPHONE.length)];
      const condicao = rand() > 0.15 ? "Usado" : "Novo";
      const variação = Math.round((rand() - 0.5) * base * 0.2);
      const valor_num = Math.max(300, base + variação);
      const cidade = CIDADES[Math.floor(rand() * CIDADES.length)];

      ofertas.push({
        id: id++,
        modelo,
        categoria,
        condicao,
        cor,
        variante: null,
        cidade,
        valor: `R$ ${valor_num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        valor_num,
        foto_url: `https://app.buskaphone.com.br/cdn/img/product-variants/${modelo.replace(/\s+/g, "_")}_${cor}`,
        data_atualizacao: "03/08 17:02",
        created_at: new Date().toISOString(),
        verificado: rand() > 0.5,
      });
    }
  }
  return ofertas;
}

export const MOCK_OFERTAS: Oferta[] = gerarOfertas();

export function mockContatoPorId(id: number): Contato | null {
  const oferta = MOCK_OFERTAS.find((o) => o.id === id);
  if (!oferta) return null;
  const rand = seededRandom(id);
  const fornecedor = FORNECEDORES[Math.floor(rand() * FORNECEDORES.length)];
  const telefone = `55119${Math.floor(10000000 + rand() * 89999999)}`;
  return {
    id,
    telefone,
    fornecedor,
    whatsapp_url: `https://wa.me/${telefone}`,
  };
}
