// src/routes/clientRoutes.js
import express from "express";
import { getResumo, login } from "../controllers/clientController.js";
import { autenticarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/resumo/:cliente", autenticarToken, getResumo);

export default router;
