import express from "express";
import { login, getResumo } from "../controllers/clientController.js";

const router = express.Router();

/**
 * 🌡 Health check (para o Render saber que está tudo ok)
 */
router.get("/health", (req, res) => res.json({ ok: true }));

/**
 * 🔐 Rota de login (teste)
 */
router.post("/login", login);

/**
 * 📊 Rota de resumo — busca dados da planilha
 * Exemplo: GET /api/resumo/1
 */
router.get("/resumo/:id", getResumo);

export default router;
