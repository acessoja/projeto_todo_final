import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("iniciando seed do banco de dados...");

  const usuario1 = await prisma.usuario.upsert({
    where: { email: "joao@example.com" },
    update: {},
    create: {
      nome: "João Silva",
      email: "joao@example.com",
      senha: "senha123",
    },
  });

  const usuario2 = await prisma.usuario.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      nome: "Maria Santos",
      email: "maria@example.com",
      senha: "senha456",
    },
  });

  await prisma.tarefa.deleteMany({
    where: {
      usuarioId: {
        in: [usuario1.id, usuario2.id],
      },
    },
  });

  await prisma.tarefa.createMany({
    data: [
      { titulo: "Estudar Prisma", concluida: false, usuarioId: usuario1.id },
      { titulo: "Estudar Node.js", concluida: true, usuarioId: usuario1.id },
      { titulo: "Fazer o trabalho", concluida: false, usuarioId: usuario1.id },
    ],
  });

  await prisma.tarefa.createMany({
    data: [
      { titulo: "Revisar PR", concluida: false, usuarioId: usuario2.id },
      { titulo: "Escrever testes", concluida: false, usuarioId: usuario2.id },
    ],
  });

  console.log("seed concluido!");
  console.log(`usuario 1: ${usuario1.email} (id: ${usuario1.id})`);
  console.log(`usuario 2: ${usuario2.email} (id: ${usuario2.id})`);
}

main()
  .catch((e) => {
    console.error("erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });