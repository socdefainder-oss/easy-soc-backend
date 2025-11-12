import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import clientRoutes from "./routes/clientRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "easy-soc-backend" });
});

// Rotas da API
app.use("/api", clientRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
