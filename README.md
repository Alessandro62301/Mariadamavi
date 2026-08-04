# Mavi

App Next.js (App Router) com o site institucional da Mavi e o `/buscador` interno.

## Estrutura

- `app/page.tsx` — homepage
- `app/faq/page.tsx` — perguntas frequentes (com schema `FAQPage` para SEO)
- `app/buscador/` — buscador interno (login único + listagem de ofertas), protegido por `middleware.ts`
- `app/api/buscador/` — rotas server-side que fazem a ponte com a API upstream (Conecta Lojista/BuskaPhone)
- `lib/upstream.ts` — cliente axios da API upstream; sem `BUSCADOR_API_BASE_URL` configurado, usa dados de exemplo (`lib/mock-ofertas.ts`) automaticamente
- `faq.md` — lista de referência com 100 temas de FAQ/comparativos pra expandir o conteúdo
- `_archive-html-estatico/` — versão anterior em HTML puro, mantida só de referência local (fora do git)

## Rodar localmente

```bash
npm install
cp .env.example .env.local
# preencha AUTH_SECRET, BUSCADOR_USER e BUSCADOR_PASS
npm run dev
```

Abra `http://localhost:3000`. O `/buscador` pede login com o usuário/senha definidos no `.env.local`.

## Deploy (Docker)

Este projeto **não sobe o próprio Traefik** — ele se conecta ao Traefik que já roda fixo na VPS (rede `host`, entrypoints `web`/`websecure`, certresolver `letsencrypt`).

```bash
cp .env.example .env
# preencha AUTH_SECRET, BUSCADOR_USER, BUSCADOR_PASS (e BUSCADOR_API_* quando tiver a credencial real)
docker compose up -d --build
```
