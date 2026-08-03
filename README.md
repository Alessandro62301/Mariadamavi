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

```bash
cp .env.example .env
# edite o .env com seu e-mail real (ACME_EMAIL=...)
docker compose up -d --build
```

Sobe um Nginx servindo os arquivos estáticos atrás de um Traefik com HTTPS automático (Let's Encrypt) para `mariadamavi.com.br`.
