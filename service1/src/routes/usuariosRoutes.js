// src/routes/usuariosRoutes.js
// Rotas do recurso Usuário
//
// FUTURO: Algumas rotas serão movidas para o Serviço de Auth
// (ex: login, registro com hash de senha)

import { Router } from "express";
import {
  criarUsuario,
  listarUsuarios,
  buscarUsuario,
} from "../controllers/usuariosController.js";

const router = Router();

// POST /api/usuarios → Criar usuário
router.post("/", criarUsuario);

// GET /api/usuarios → Listar usuários (FUTURO: proteger com auth de admin)
router.get("/", listarUsuarios);

// GET /api/usuarios/:id → Buscar usuário por ID
router.get("/:id", buscarUsuario);

export default router;
