import express from "express";
import { getResumoCliente } from "../controllers/clientController.js";

const router = express.Router();

// Endpoint: /api/resumo/:id
router.get("/resumo/:id", getResumoCliente);

export default router;
