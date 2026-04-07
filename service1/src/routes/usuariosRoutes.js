import { Router } from "express";
import { cadastrar, login, me } from "../controllers/usuariosController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

router.post("/register", cadastrar);
router.post("/login", login);
router.get("/me", autenticar, me);

export default router;
