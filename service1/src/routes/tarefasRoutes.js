import { Router } from "express";
import {
  criarTarefa,
  listarMinhasTarefas,
  concluirTarefa,
  deletarTarefa,
  minhasEstatisticas,
} from "../controllers/tarefasController.js";
import { validarCriarTarefa, validarIdTarefa } from "../middleware/validate.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

router.use(autenticar);

router.post("/", validarCriarTarefa, criarTarefa);
router.get("/", listarMinhasTarefas);
router.get("/stats", minhasEstatisticas);
router.patch("/:id/concluir", validarIdTarefa, concluirTarefa);
router.delete("/:id", validarIdTarefa, deletarTarefa);

export default router;
