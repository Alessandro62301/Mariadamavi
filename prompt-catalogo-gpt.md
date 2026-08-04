# Prompt — Evoluir o /buscador da Mavi pra um catálogo completo (nível Conecta Lojista)

Cole este prompt inteiro no GPT. Ele já traz todo o contexto necessário: stack, arquivos existentes, design system, formato real da API e as regras de marca. Não precisa complementar nada — só colar e pedir o código.

---

## 1. Contexto do projeto

A Mavi é uma operação de venda de Apple (iPhone, iPad, MacBook, Apple Watch) por encomenda, com atendimento pessoal via WhatsApp. Já existe um app Next.js (App Router, TypeScript) com:

- Site público: home (`/`) e FAQ (`/faq`) — **não mexer nisso**.
- Um painel interno **`/buscador`**, protegido por login (cookie de sessão, `middleware.ts`), que consulta uma base de ofertas de fornecedores (via API real, descrita abaixo) pra equipe da Mavi achar produto rápido e puxar contato do fornecedor no WhatsApp.

**O pedido agora:** evoluir esse `/buscador` pra ficar tão completo quanto o painel de referência (Conecta Lojista/BuskaPhone — um marketplace B2B de fornecedores Apple), com todos os filtros, busca, ordenação e paginação que ele tem. **Continua 100% interno/logado** — não é uma página pública, não expõe preço pra cliente final, é ferramenta de trabalho da equipe.

---

## 2. Stack técnica (não trocar nada disso)

- Next.js 16 (App Router), React 19, TypeScript
- Prisma + MySQL (tabela `User` pro login, tabela `ApiSession` guarda o token da API upstream)
- `axios` no backend pra chamar a API upstream
- Sem CSS framework — design system próprio em `app/globals.css` (tokens CSS + classes utilitárias, ver seção 5)
- Autenticação: cookie de sessão assinado (HMAC), validado em `middleware.ts` pra tudo que começa com `/buscador` e `/api/buscador`

## 3. Estrutura de arquivos relevante (hoje)

```
app/
  buscador/
    login/page.tsx        // tela de login (não mexer)
    page.tsx              // TELA PRINCIPAL A EVOLUIR
  api/
    buscador/
      ofertas/route.ts              // GET — lista/filtra ofertas
      ofertas/[id]/contato/route.ts // GET — busca contato do fornecedor
      status/route.ts               // GET — total/cidades/fornecedores
lib/
  types.ts        // tipos Oferta, Contato, Status, OfertasQuery, OfertasResponse
  upstream.ts      // cliente da API real (Supabase) + fallback pra mock
  mock-ofertas.ts  // dados de exemplo (usados só se a API real não estiver configurada)
  prisma.ts        // singleton do PrismaClient
  session.ts       // sessão de login (não mexer)
components/
  icons.tsx        // WhatsAppIcon, MenuIcon, ChevronDownIcon
```

## 4. A API upstream real (já integrada, não precisa recriar — só usar melhor)

A base é um projeto Supabase (PostgREST por baixo). `lib/upstream.ts` já resolve autenticação (token com refresh automático, persistido no banco). As funções expostas hoje:

```ts
// lib/types.ts (ATUAL)
export type Oferta = {
  id: number;
  modelo: string;        // ex.: "iPhone 13 128GB", "MacBook Pro M3 16/512GB"
  categoria: string;     // "iphone" | "ipad" | "macbook" | "apple watch" | outras
  condicao: string;      // "Usado" | "Novo"
  cor: string;           // ex.: "PRETO", "TITÂNIO NATURAL"
  variante: string | null; // às vezes carrega algo como "2TB"
  cidade: string;        // ex.: "São Paulo, SP"
  valor: string;         // ex.: "R$ 950,00" (já formatado)
  valor_num: number;     // ex.: 950 (pra ordenar/filtrar)
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

export type Status = { total: number; cidades: number; fornecedores: number };

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

export type OfertasResponse = { items: Oferta[]; total: number; page: number; pageSize: number };
```

```ts
// lib/upstream.ts (ATUAL, resumido — a lógica de auth/refresh já existe, não precisa mexer nela)
export async function buscarOfertas(query: OfertasQuery): Promise<OfertasResponse> { /* já implementado */ }
export async function buscarContato(id: number): Promise<Contato | null> { /* já implementado */ }
export async function buscarStatus(): Promise<Status> { /* já implementado */ }
```

A chamada real usa PostgREST (`GET /rest/v1/ofertas_publicas?select=*&categoria=eq.iphone&order=valor_num.asc&offset=0&limit=25`, com header `Prefer: count=exact` pra pegar o total via `Content-Range`). **Isso já funciona e foi testado contra a API real.**

**IMPORTANTE:** não sei se a tabela `ofertas_publicas` tem colunas específicas de "armazenamento" e "modelo base" (ex.: separar "iPhone 13" de "128GB"), ou se isso vem tudo dentro do campo `modelo` como texto livre (ex.: `"iPhone 13 128GB"`). **Primeira tarefa do GPT:** propor uma estratégia de extração de armazenamento (regex tipo `/(\d+)\s?(GB|TB)/i` sobre `modelo`) pra derivar um filtro de armazenamento no frontend/backend sem depender de uma coluna que talvez não exista. Idem pra "modelo base" (ex.: extrair "iPhone 13" removendo o armazenamento do texto), já que o painel de referência filtra por modelo específico.

## 5. Design system (usar exatamente estas classes/tokens — já existem em `app/globals.css`)

```css
:root {
  --plum: #3B2033;      /* ameixa — fundos de impacto, header, textos fortes */
  --pink: #F47FA4;      /* rosa chiclete — CTA, destaques */
  --ivory: #F7F0E8;     /* off-white — fundo padrão */
  --charcoal: #242124;  /* texto corpo */
  --rose: #C87483;      /* apoio, divisores */
  --bg: var(--ivory);
  --ink: var(--charcoal);
  --ink-soft: rgba(36,33,36,.68);
  --line: rgba(59,32,51,.16);
  --surface: #FFFFFF;
  --font-display: 'League Gothic', sans-serif;  /* títulos grandes */
  --font-wordmark: 'Anton', sans-serif;          /* só a wordmark MARIADAMAVI */
  --font-body: 'Montserrat', sans-serif;         /* interface, corpo, botões */
  --radius-card: 12px;
  --radius-btn: 999px;
  --maxw: 1200px;
}
```

Classes já prontas do painel do buscador (em `app/globals.css`, procurar pela seção `BUSCADOR`):
`.busca-shell`, `.busca-header`, `.busca-header .stats`, `.busca-header .logout`, `.busca-body`, `.filtros`, `.filtros select/input`, `.busca-texto`, `.resultados-topo`, `.oferta-lista`, `.oferta-row`, `.oferta-foto`, `.oferta-info`, `.oferta-tags`, `.tag` (+ variantes `.usado`, `.novo`, `.verificado`), `.oferta-preco`, `.oferta-actions`, `.btn-whatsapp`, `.paginacao`, `.estado-vazio`.

**Regra:** reaproveitar e estender essas classes — não introduzir uma lib de UI nova (nada de Tailwind, MUI, shadcn etc.). Se precisar de componente novo (ex.: painel de filtros lateral, toggle lista/grade), criar CSS puro seguindo o mesmo padrão (BEM-like, nomes em português, tokens do `:root`).

## 6. Regras de marca (mesmo sendo painel interno, mantém consistência)

- Tom direto, sem gíria de vendedor, sem urgência falsa.
- **Nunca** inventar dado: se um filtro não tiver opções carregadas ainda, mostrar estado vazio/loading, não mockar contagem.
- Botão de ação principal sempre com o mesmo verbo: falar com o fornecedor = "WhatsApp" (já implementado, mantém).
- Wordmark é sempre `MARIADAMAVI`, fonte Anton, não usar em outro lugar da interface.

## 7. O que o painel de referência (Conecta Lojista) tem, que o nosso `/buscador` ainda não tem

Painel de referência, hoje nosso `/buscador` já cobre busca por texto, categoria, condição, cidade e ordenação (menor/maior preço/recentes) — falta:

1. **Localização em dois níveis:** filtro de Estado (ex.: SP, MS, RJ) que popula dinamicamente o filtro de Cidade (ex.: "Campo Grande, MS", "Guarulhos, SP"). Hoje só tem cidade solta.
2. **Filtro de Categoria com contagem:** cada opção mostra quantas ofertas tem (ex.: "📱 iPhone — 3.465", "📟 iPad — 380"). Buscar essa contagem via uma chamada agregada (pode ser um `select=categoria&categoria=neq.null` com `Prefer: count=exact` por categoria, ou um novo agregado — decidir a estratégia mais eficiente, evitando N chamadas).
3. **Filtro de Modelo específico** (ex.: "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17e"), com contagem por modelo, dependente da categoria escolhida, e com "Ver mais" pra expandir a lista quando tiver muitas opções.
4. **Filtro de Condição** com "Todos" explícito ao lado de "Novo"/"Usado" (já existe "Novo e usado" como default — ok manter, só garantir paridade visual).
5. **Filtro de Cor**, com todas as cores existentes na base (não hardcoded — vem de uma consulta de valores distintos), inclusive com contagem se possível.
6. **Filtro de Armazenamento** (64GB, 128GB, 256GB, 512GB, 1TB etc.) — ver observação da seção 4 sobre extrair isso do campo `modelo`.
7. **Seletor de itens por página** (10/25/50/100), não só um valor fixo.
8. **Ordenação adicional:** já tem menor/maior preço e recentes — adicionar "A → Z" por modelo.
9. **Toggle de visualização lista/grade** (ícones no canto superior direito da área de resultados).
10. **Foto do produto no card/linha** — hoje o `oferta-row` não renderiza `foto_url`; usar a classe `.oferta-foto` que já existe no CSS mas não está sendo usada no JSX.
11. **Estado "X produtos encontrados" e paginação numerada** — já existe, só garantir que sobrevive à extensão de filtros sem quebrar.
12. **Persistir os filtros na URL** (query string), pra poder voltar/compartilhar o link com os filtros aplicados — hoje os filtros são só estado local em `useState`, se der refresh perde tudo.

## 8. Entregáveis esperados

Gerar o código completo (arquivo inteiro, não diff) para:

1. `lib/types.ts` — estender `OfertasQuery` com os novos filtros (estado, modelo, armazenamento, itensPorPagina, sort "a-z") e `OfertasResponse`/tipos auxiliares pra contagens de filtro (ex.: `FiltrosDisponiveis` com `categorias: {valor, total}[]`, `modelos`, `cores`, `armazenamentos`, `estados`, `cidades`).
2. `lib/upstream.ts` — estender `buscarOfertas` pra aplicar os novos filtros nos parâmetros do PostgREST, e adicionar uma nova função `buscarFiltrosDisponiveis()` que devolve as opções + contagens pra popular o painel de filtros (pensar em cache curto em memória, tipo 60s, pra não bater na API a cada digitação).
3. `app/api/buscador/filtros/route.ts` (novo) — expõe `buscarFiltrosDisponiveis()`.
4. `app/api/buscador/ofertas/route.ts` — repassar os novos query params.
5. `app/buscador/page.tsx` — reescrever com:
   - Painel de filtros expandido (estado → cidade em cascata, categoria com contagem, modelo dependente da categoria, cor, armazenamento, itens por página)
   - Sincronização dos filtros com a URL (`useSearchParams` / `router.replace` sem reload)
   - Toggle lista/grade (persistir a preferência em `localStorage`)
   - Renderizar `foto_url` de cada oferta
   - Manter tudo que já funciona: login, logout, WhatsApp por oferta, paginação numerada, loading/estado vazio
6. Ajustes em `app/globals.css` pra qualquer classe nova (painel de filtros lateral, toggle de visualização, cards em modo grade) — seguindo o mesmo padrão de nomenclatura e os tokens do `:root` já existentes. Não recriar tokens.

## 9. Restrições

- Não criar página pública nem remover a proteção de login do `/buscador`.
- Não adicionar dependência nova de UI (sem Tailwind/MUI/Chakra/shadcn). Axios já é dependência, pode usar. Ícones: seguir o padrão de `components/icons.tsx` (SVG inline).
- Não mockar contagens de filtro — se a estratégia de agregação for cara, documentar o trade-off (ex.: cache de 60s, ou calcular contagem só da categoria ativa em vez de todas de uma vez).
- Não quebrar as rotas de API existentes (`/api/buscador/ofertas/[id]/contato`, `/api/buscador/status`) — só estender o que for preciso.
- Comentários no código só onde a lógica não for óbvia (ex.: por que o cache de filtros existe, por que o armazenamento é extraído via regex).
