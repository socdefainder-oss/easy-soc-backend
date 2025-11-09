// ==========================
// EASY SOC BACKEND - DEFAINDER
// ==========================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./src/routes/clientRoutes.js";

dotenv.config();
const app = express();

// --------------------------
// 🔐 Middlewares
// --------------------------
app.use(cors({
  origin: "*", // permite acesso de qualquer origem (para testes)
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// --------------------------
// 📡 Rotas principais
// --------------------------
app.use("/api", clientRoutes);

// --------------------------
// 🚀 Inicialização do servidor
// --------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("====================================");
  console.log("🚀 EASY SOC BACKEND - defAInder");
  console.log(`✅ Servidor rodando na porta: ${PORT}`);
  console.log("🌐 Endpoint de teste: http://localhost:" + PORT + "/api/resumo/1");
  console.log("====================================");
});

