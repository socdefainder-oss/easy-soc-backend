import jwt from "jsonwebtoken";
import { obterResumoGravityZone } from "../services/gravityzoneService.js";

/**
 * Controller responsável por autenticar o token JWT,
 * consultar os dados da GravityZone e retornar o resumo
 * que será exibido no painel do Easy SOC.
 */
export const getResumo = async (req, res) => {
  try {
    // 1️⃣ Verifica se o token JWT foi enviado
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token de autenticação ausente" });
    }

    // 2️⃣ Valida o token usando a chave secreta JWT
    jwt.verify(token, process.env.JWT_SECRET || "chave_teste");

    // 3️⃣ Consulta a API do GravityZone
    const resumo = await obterResumoGravityZone();

    // 4️⃣ Retorna os dados ao frontend
    return res.status(200).json(resumo);
  } catch (error) {
    console.error("Erro ao obter resumo da GravityZone:", error.message || error);
    return res.status(500).json({
      message: "Erro ao obter dados da GravityZone. Verifique logs do servidor.",
    });
  }
};

/**
 * Controller de exemplo para login — 
 * gera token JWT para testar a autenticação no frontend.
 */
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Simulação de login básico
    if (email === "empresa@alpha.com" && senha === "12345") {
      const token = jwt.sign({ id: 1, email }, process.env.JWT_SECRET || "chave_teste", {
        expiresIn: "2h",
      });

      return res.status(200).json({
        id: 1,
        nome: "Empresa Alpha",
        email,
        token,
      });
    } else {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
  } catch (error) {
    console.error("Erro no login:", error.message || error);
    return res.status(500).json({ message: "Erro interno no login" });
  }
};
