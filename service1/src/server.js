import app from "./app.js";
import prisma from "./prismaClient.js";

const PORT = process.env.PORT || 3001;

async function iniciarServidor() {
  try {
    await prisma.$connect();
    console.log("✅ Banco de dados conectado com sucesso!");

    app.listen(PORT, () => {
      console.log("────────────────────────────────────────────");
      console.log("🚀 Serviço 1 – API de Tarefas rodando!");
      console.log(`   URL:   http://localhost:${PORT}`);
      console.log(`   Saúde: http://localhost:${PORT}/health`);
      console.log("────────────────────────────────────────────");
      console.log("📋 Rotas disponíveis:");
      console.log(`   POST   /api/usuarios/register`);
      console.log(`   POST   /api/usuarios/login`);
      console.log(`   GET    /api/usuarios/me`);
      console.log(`   POST   /api/tarefas`);
      console.log(`   GET    /api/tarefas`);
      console.log(`   GET    /api/tarefas/stats`);
      console.log(`   PATCH  /api/tarefas/:id/concluir`);
      console.log(`   DELETE /api/tarefas/:id`);
      console.log("────────────────────────────────────────────");
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Encerrando servidor (SIGTERM)...");
  await prisma.$disconnect();
  process.exit(0);
});

iniciarServidor();
