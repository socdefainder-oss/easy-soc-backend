import express from "express";
import { login, getResumo } from "../controllers/clientController.js";

const router = express.Router();

router.post("/login", login);
router.get("/resumo/:id", getResumo);

export default router;
