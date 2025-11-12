import { Router } from "express";
import { getResumo, pingSheet } from "../controllers/clientController.js";

const router = Router();

// Health / debug
router.get("/ping", (req, res) => res.json({ ok: true }));

// Diagnóstico rápido da planilha
router.get("/sheet/ping", pingSheet);

// Resumo por clienteId (1..n)
router.get("/resumo/:id", getResumo);

export default router;
