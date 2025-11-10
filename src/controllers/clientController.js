// ==========================
// CONTROLLER PRINCIPAL - CLIENTES
// ==========================

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getEndpointsFromGravityZone } from "../services/gravityzoneService.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "segredo_local_teste";

// 🧠 Mock de clientes (poderia vir de um banco real)
const clientes = [
  { id: 1, nome: "Empresa Alpha", email: "empresa@alpha.com", senha: "12345" }
];

// ------------------------------------------------------
// 🔐 LOGIN - retorna token de acesso
// ------------------------------------------------------
export const login = (req, res) => {
  const { email, senha } = req.body;

  const cliente = clientes.find(c => c.email === email && c.senha === senha);
  if (!cliente) return res.status(401).json({ message: "Credenciais inválidas" });

  const token = jwt.sign({ id: cliente.id }, JWT_SECRET, { expiresIn: "2h" });

  res.json({
    id: cliente.id,
    nome: cliente.nome,
    email: cliente.email,
    token
  });
};

// ------------------------------------------------------
// 📊 RESUMO - traz dados reais da API GravityZone
// ------------------------------------------------------
export const getResumo = async (req, res) => {
  try {
    const endpoints = await getEndpointsFromGravityZone();

    const total = endpoints.length;
    const seguras = endpoints.filter(e => e.status === "OK").length;
    const vulneraveis = total - seguras;

    res.json({
      maquinasTotais: total,
      maquinasSeguras: seguras,
      vulnerabilidades: vulneraveis,
      riscos: vulneraveis,
      incidentes: 0,
      detalhes: {
        maquinas: endpoints
      }
    });
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    res.status(500).json({ message: "Erro ao conectar ao GravityZone" });
  }
};
