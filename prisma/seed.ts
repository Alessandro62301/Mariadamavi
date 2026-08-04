import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BUSCADOR_USER?.trim();
  const senha = process.env.BUSCADOR_PASS?.trim();

  if (!email || !senha) {
    console.log("BUSCADOR_USER/BUSCADOR_PASS não definidos — nenhum usuário inicial criado.");
    return;
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log(`Usuário ${email} já existe, nada a fazer.`);
    return;
  }

  const hash = await bcrypt.hash(senha, 10);
  await prisma.user.create({ data: { email, password: hash, nome: "Mavi" } });
  console.log(`Usuário inicial criado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
