// src/controllers/clientController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getSheetData } from "../services/sheetsCsv.js";

dotenv.config();

/* ============================================================
   🔐 LOGIN
   ============================================================ */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  const usuarios = [
    { email: "empresa@alpha.com", senha: "12345", cliente: "alphatech" },
    { email: "empresa@beta.com", senha: "12345", cliente: "betacorp" },
  ];

  const user = usuarios.find(
    (u) => u.email === email && u.senha === senha
  );

  if (!user) {
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { cliente: user.cliente },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return res.json({
    token,
    cliente: user.cliente,
  });
};

/* ============================================================
   📊 DASHBOARD + MÁQUINAS (Aba: endpoints – GID "0")
   ============================================================ */
export const getResumo = async (req, res) => {
  try {
    const clienteNome = (req.params.cliente || "").toLowerCase().trim();
    const tokenCliente = req.user?.cliente?.toLowerCase();

    if (clienteNome !== tokenCliente) {
      return res.status(403).json({ erro: "Acesso negado a este cliente" });
    }

    const linhas = await getSheetData("0"); // ABA endpoints

    if (!linhas || linhas.length === 0) {
      return res.status(500).json({ erro: "Falha ao obter dados da planilha" });
    }

    const dadosCliente = linhas.filter(
      (r) => (r.Cliente || "").toLowerCase().trim() === clienteNome
    );

    if (dadosCliente.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    const toInt = (v) => parseInt(v || "0", 10) || 0;

    return res.json({
      cliente: clienteNome,
      maquinasTotais: dadosCliente.length,
      maquinasSeguras: dadosCliente.filter(
        (r) => (r.Status || "").toLowerCase() === "seguro"
      ).length,
      vulnerabilidades: dadosCliente.reduce(
        (s, r) => s + toInt(r.Vulnerabilidades),
        0
      ),
      riscos: dadosCliente.reduce((s, r) => s + toInt(r.Riscos), 0),
      incidentes: dadosCliente.reduce(
        (s, r) => s + toInt(r.Incidentes),
        0
      ),
      detalhes: { maquinas: dadosCliente },
    });
  } catch (err) {
    console.error("❌ Erro ao gerar resumo:", err);
    res.status(500).json({ erro: "Falha ao gerar resumo" });
  }
};

/* ============================================================
   🛡️ VULNERABILIDADES – ABA: vulnerabilidades
   ============================================================ */
export const getVulnerabilidades = async (req, res) => {
  try {
    const cliente = req.user.cliente.toLowerCase();
    
    const linhas = await getSheetData("1074733271");

    const filtro = linhas.filter(
      (l) => (l.Máquina || "").toLowerCase().includes(cliente)
    );

    return res.json({ vulnerabilidades: filtro });
  } catch (err) {
    console.error("Erro ao ler vulnerabilidades:", err);
    res.status(500).json({ erro: "Falha ao obter vulnerabilidades" });
  }
};

/* ============================================================
   🚨 INCIDENTES – ABA: incidentes
   ============================================================ */
export const getIncidentes = async (req, res) => {
  try {
    const cliente = req.user.cliente.toLowerCase();

    const linhas = await getSheetData("1216340788");

    const filtro = linhas.filter(
      (l) => (l.Máquina || "").toLowerCase().includes(cliente)
    );

    return res.json({ incidentes: filtro });
  } catch (err) {
    console.error("Erro ao ler incidentes:", err);
    res.status(500).json({ erro: "Falha ao obter incidentes" });
  }
};

/* ============================================================
   ⚠️ RISCOS – ABA: riscos
   ============================================================ */
export const getRiscos = async (req, res) => {
  try {
    const cliente = req.user.cliente.toLowerCase();

    const linhas = await getSheetData("1272284185");

    const filtro = linhas.filter(
      (l) => (l.Máquina || "").toLowerCase().includes(cliente)
    );

    return res.json({ riscos: filtro });
  } catch (err) {
    console.error("Erro ao ler riscos:", err);
    res.status(500).json({ erro: "Falha ao obter riscos" });
  }
};
