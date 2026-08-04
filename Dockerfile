FROM node:20-slim

# Prisma precisa de openssl pra gerar/rodar o client no Debian slim.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
ENV PORT=3000

# Aplica as migrations, garante o usuário inicial (BUSCADOR_USER/BUSCADOR_PASS)
# e só então sobe o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]
