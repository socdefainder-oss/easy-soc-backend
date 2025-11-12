// src/controllers/clientController.js
import { getSheetData } from "../services/sheetsCsv.js";

/**
 * 🔐 Login básico (modo de testes)
 */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (email === "empresa@alpha.com" && senha === "12345") {
    return res.json({
      token: "abc123",
      nome: "AlphaTech",
      id: 1,
    });
  }

  return res.status(401).json({ erro: "Credenciais inválidas" });
};

/**
 * 📊 Obtém o resumo de endpoints de um cliente específico (por nome)
 * Exemplo: /api/resumo/alphatech
 */
export const getResumo = async (req, res) => {
  try {
    const clienteNome = (req.params.cliente || "").toLowerCase().trim();

    if (!clienteNome) {
      return res.status(400).json({ erro: "Cliente não informado" });
    }

    console.log(`📄 Lendo planilha para cliente: ${clienteNome}`);

    // Lê os dados da planilha
    const linhas = await getSheetData("0"); // gid da aba "endpoints"

    if (!linhas || linhas.length === 0) {
      console.error("❌ Nenhum dado retornado da planilha. Verifique o acesso ou o range.");
      return res.status(500).json({
        erro: "Falha ao obter dados da planilha (retorno vazio)",
      });
    }

    console.log(`✅ Planilha lida com sucesso: ${linhas.length} linhas encontradas.`);

    // Filtra apenas os registros do cliente
    const dadosCliente = linhas.filter(
      (r) => (r.Cliente || "").toLowerCase().trim() === clienteNome
    );

    if (dadosCliente.length === 0) {
      console.warn(`⚠️ Nenhum registro encontrado para o cliente: ${clienteNome}`);
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    // Função auxiliar para converter strings em número
    const toInt = (v) => parseInt(v || "0", 10) || 0;

    // Calcula os totais e somatórios
    const total = dadosCliente.length;
    const seguras = dadosCliente.filter(
      (r) => (r.Status || "").toLowerCase().trim() === "seguro"
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

    // Retorna o resumo formatado
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
