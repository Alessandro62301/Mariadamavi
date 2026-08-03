# Mavi

Site institucional da Mavi (Apple por encomenda), em HTML puro — arquivo único, sem build, sem framework.

## Arquivos

- `index.html` — homepage
- `faq.html` — página de perguntas frequentes (com schema `FAQPage` para SEO)
- `faq.md` — lista de referência com 100 temas de FAQ/comparativos pra expandir o conteúdo
- `public/imgs/` — imagens reais usadas nas páginas

## Rodar localmente

Abra `index.html` direto no navegador, ou sirva a pasta com qualquer servidor estático:

```bash
npx serve .
```

## Deploy (Docker)

Este projeto **não sobe o próprio Traefik** — ele se conecta ao Traefik que já roda fixo na VPS (rede `host`, entrypoints `web`/`websecure`, certresolver `letsencrypt`). Só é preciso subir o serviço `web`:

```bash
docker compose up -d --build
```

As labels em `docker-compose.yml` fazem o Traefik já existente descobrir o container automaticamente e emitir o certificado para `mariadamavi.com.br` e `www.mariadamavi.com.br`.

Se a VPS não tiver um Traefik fixo rodando, adapte o `docker-compose.yml` para subir um Traefik próprio (com `ACME_EMAIL` e volume de certificado) antes do `web`.
