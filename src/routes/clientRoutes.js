// ==========================
// ROTEADOR PRINCIPAL (clientRoutes.js)
// ==========================

import express from "express";
import { login, getResumo } from "../controllers/clientController.js";

const router = express.Router();

// ------------------------------------------------------
// 🔐 LOGIN — retorna token e dados do cliente
// ------------------------------------------------------
router.post("/login", login);

// ------------------------------------------------------
// 📊 RESUMO — retorna métricas de segurança do cliente
// ------------------------------------------------------
router.get("/resumo/:id", getResumo);

export default router;
