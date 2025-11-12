import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./src/routes/clientRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api", clientRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("====================================");
  console.log("🚀 EASY SOC BACKEND - defAInder");
  console.log(`✅ Servidor rodando na porta: ${PORT}`);
  console.log(`🌐 Endpoint base: http://localhost:${PORT}/api`);
  console.log("====================================");
});
