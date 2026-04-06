// src/app.js
// Configuração do aplicativo Express
// Separado do server.js para facilitar testes

import express from "express";
import cors from "cors";

import tarefasRoutes from "./routes/tarefasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ── Middlewares globais ──────────────────────────────────────────────────────

// CORS: permite que o frontend (porta diferente) se comunique com a API
// FUTURO: restringir origins em produção
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization", // FUTURO: JWT virá aqui
    ],
  })
);

// Parse de JSON no body
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
// Útil para verificar se o serviço está online (monitoramento, Docker, etc.)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    servico: "Serviço 1 – API de Tarefas",
    versao: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── Rotas da API ─────────────────────────────────────────────────────────────
app.use("/api/tarefas", tarefasRoutes);
app.use("/api/usuarios", usuariosRoutes);

// ── Rota não encontrada ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    path: req.originalUrl,
  });
});

// ── Tratamento de erros global ────────────────────────────────────────────────
// DEVE ser o último middleware
app.use(errorHandler);

export default app;
