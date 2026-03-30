// src/server.js
// Ponto de entrada do servidor
// Separado do app.js para facilitar testes de integração

import app from "./app.js";
import prisma from "./prismaClient.js";

const PORT = process.env.PORT || 3001;

async function iniciarServidor() {
  try {
    // Verifica a conexão com o banco antes de subir o servidor
    await prisma.$connect();
    console.log("✅ Banco de dados conectado com sucesso!");

    app.listen(PORT, () => {
      console.log("────────────────────────────────────────────");
      console.log("🚀 Serviço 1 – API de Tarefas rodando!");
      console.log(`   URL:   http://localhost:${PORT}`);
      console.log(`   Saúde: http://localhost:${PORT}/health`);
      console.log("────────────────────────────────────────────");
      console.log("📋 Rotas disponíveis:");
      console.log(`   POST   /api/tarefas`);
      console.log(`   GET    /api/tarefas/usuario/:id`);
      console.log(`   GET    /api/tarefas/usuario/:id/stats`);
      console.log(`   PATCH  /api/tarefas/:id/concluir`);
      console.log(`   DELETE /api/tarefas/:id`);
      console.log(`   POST   /api/usuarios`);
      console.log(`   GET    /api/usuarios`);
      console.log(`   GET    /api/usuarios/:id`);
      console.log("────────────────────────────────────────────");
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
}

// Encerramento limpo (importante para Docker e PM2)
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
