// server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./src/routes/clientRoutes.js";

dotenv.config();

const app = express();

/* ============================================================
   ✅ CORS CONFIGURADO CORRETAMENTE
   ============================================================ */
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost",
  "capacitor://localhost",
  "http://localhost:3000",
  "https://easy-soc-front.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // permite apps locais/mobile
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("❌ CORS Bloqueado – Origem não permitida: " + origin));
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
  })
);

// Corrige preflight OPTIONS
app.options("*", cors());

/* ============================================================
   🔧 EXPRESS CONFIGURAÇÕES
   ============================================================ */
app.use(express.json());
app.use(morgan("dev"));

// Rotas
app.use("/api", routes);

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ============================================================
   🚀 INICIAR SERVIDOR
   ============================================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log("🌐 CORS liberado para:", allowedOrigins);
});
