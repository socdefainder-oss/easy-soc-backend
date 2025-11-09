import jwt from "jsonwebtoken";
import fs from "fs";

const data = JSON.parse(fs.readFileSync("./src/db/mockDB.json", "utf-8"));

// === LOGIN ===
export const login = (req, res) => {
  const { email, senha } = req.body;

  const user = data.find(
    (c) => c.email === email && c.senha === senha
  );

  if (!user) {
    console.log("❌ Usuário não encontrado ou senha incorreta.");
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { id: user.id },
    "chave_secreta_super_segura",
    { expiresIn: "2h" }
  );

  res.json({
    token,
    nome: user.nome,
    id: user.id
  });
};

// === RESUMO DA EMPRESA ===
export const getResumo = (req, res) => {
  const { id } = req.params;
  const auth = req.headers.authorization;

  if (!auth) return res.status(403).json({ message: "Token ausente" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, "chave_secreta_super_segura");

    const user = data.find((c) => c.id === parseInt(id));
    if (!user) return res.status(404).json({ message: "Cliente não encontrado" });

    // Retorna resumo + detalhes
    res.json({
      ...user.resumo,
      detalhes: user.detalhes
    });

  } catch (e) {
    console.error("Erro de autenticação:", e);
    res.status(403).json({ message: "Token inválido ou expirado" });
  }
};
