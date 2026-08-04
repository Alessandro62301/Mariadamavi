# Mavi

App Next.js (App Router) com o site institucional da Mavi e o `/buscador` interno.

## Estrutura

- `app/page.tsx` — homepage
- `app/faq/page.tsx` — perguntas frequentes (com schema `FAQPage` para SEO)
- `app/buscador/` — buscador interno (login via banco + listagem de ofertas), protegido por `middleware.ts`
- `app/api/buscador/` — rotas server-side que fazem a ponte com a API upstream
- `lib/upstream.ts` — cliente axios da API upstream; sem `BUSCADOR_API_BASE_URL` configurado, usa dados de exemplo (`lib/mock-ofertas.ts`) automaticamente
- `prisma/schema.prisma` — modelo `User` (login do buscador); base pronta pra novas tabelas
- `faq.md` — lista de referência com 100 temas de FAQ/comparativos pra expandir o conteúdo
- `_archive-html-estatico/` — versão anterior em HTML puro, mantida só de referência local (fora do git)

## Rodar localmente

```bash
npm install
cp .env.example .env.local
```

Preenche o `.env.local`: `AUTH_SECRET`, `BUSCADOR_USER`/`BUSCADOR_PASS` (vira o usuário inicial do banco) e os dados do MySQL. Como o MySQL roda local fora de container, o `DATABASE_URL` usa `localhost`:

```
DATABASE_URL="mysql://mavi:sua-senha@localhost:3306/mavi"
```

Sobe só o banco via Docker:
```bash
docker compose --env-file .env.local up -d db
```

Aplica o schema e cria o usuário inicial:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Roda o app:
```bash
npm run dev
```

Abra `http://localhost:3000`. O `/buscador` pede login com o `BUSCADOR_USER`/`BUSCADOR_PASS` que você seedou.

## Deploy (Docker)

Este projeto **não sobe o próprio Traefik** — ele se conecta ao Traefik que já roda fixo na VPS (rede `host`, entrypoints `web`/`websecure`, certresolver `letsencrypt`).

```bash
cp .env.example .env
```

Preenche o `.env` igual ao local, mas o `DATABASE_URL` aqui usa o nome do serviço (`db`), não `localhost`, porque roda dentro da rede do Docker:

```
DATABASE_URL="mysql://mavi:sua-senha@db:3306/mavi"
```

```bash
docker compose up -d --build
```

O container `web` aplica as migrations do Prisma e cria o usuário inicial (`BUSCADOR_USER`/`BUSCADOR_PASS`) automaticamente antes de subir o servidor — não precisa rodar nada manual.
