// src/routes/clientRoutes.js
import express from "express";
import { getResumo } from "../controllers/clientController.js";

const router = express.Router();

// 🔹 Rota principal de resumo (por nome do cliente)
router.get("/resumo/:cliente", getResumo);

export default router;
