// prisma/seed.js
// Popula o banco com dados iniciais para desenvolvimento

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Cria usuários de exemplo
  const usuario1 = await prisma.usuario.upsert({
    where: { email: "joao@example.com" },
    update: {},
    create: {
      nome: "João Silva",
      email: "joao@example.com",
      // ATENÇÃO: em produção, use bcrypt para hash de senha
      // O Serviço de Auth (futuro) será responsável pelo hashing
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

  // Cria tarefas para o usuário 1
  await prisma.tarefa.createMany({
    data: [
      { titulo: "Estudar Prisma", concluida: false, usuarioId: usuario1.id },
      { titulo: "Estudar Node.js", concluida: true, usuarioId: usuario1.id },
      { titulo: "Fazer o trabalho", concluida: false, usuarioId: usuario1.id },
    ],
    skipDuplicates: true,
  });

  // Cria tarefas para o usuário 2
  await prisma.tarefa.createMany({
    data: [
      { titulo: "Revisar PR", concluida: false, usuarioId: usuario2.id },
      { titulo: "Escrever testes", concluida: false, usuarioId: usuario2.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed concluído!");
  console.log(`   Usuário 1: ${usuario1.email} (id: ${usuario1.id})`);
  console.log(`   Usuário 2: ${usuario2.email} (id: ${usuario2.id})`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
