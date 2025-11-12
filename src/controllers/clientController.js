// src/controllers/clientController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getSheetData } from "../services/sheetsCsv.js";

dotenv.config();

/**
 * 🔐 Login — gera token JWT
 */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  // Simulação de usuários (poderá vir de planilha ou banco depois)
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

  // Gera token JWT
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

/**
 * 📊 Retorna dados do cliente logado (autenticado via JWT)
 */
export const getResumo = async (req, res) => {
  try {
    const clienteNome = (req.params.cliente || "").toLowerCase().trim();
    const tokenCliente = req.user?.cliente?.toLowerCase();

    // Impede acesso de cliente A aos dados de cliente B
    if (clienteNome !== tokenCliente) {
      return res.status(403).json({ erro: "Acesso negado a este cliente" });
    }

    console.log(`📄 Lendo planilha para cliente: ${clienteNome}`);
    const linhas = await getSheetData("0");

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

    const total = dadosCliente.length;
    const seguras = dadosCliente.filter(
      (r) => (r.Status || "").toLowerCase() === "seguro"
    ).length;
    const vulnerabilidades = dadosCliente.reduce(
      (s, r) => s + toInt(r.Vulnerabilidades),
      0
    );
    const riscos = dadosCliente.reduce((s, r) => s + toInt(r.Riscos), 0);
    const incidentes = dadosCliente.reduce(
      (s, r) => s + toInt(r.Incidentes),
      0
    );

    return res.json({
      cliente: clienteNome,
      maquinasTotais: total,
      maquinasSeguras: seguras,
      vulnerabilidades,
      riscos,
      incidentes,
      detalhes: { maquinas: dadosCliente },
    });
  } catch (err) {
    console.error("❌ Erro ao gerar resumo:", err);
    res.status(500).json({ erro: "Falha ao gerar resumo" });
  }
};
