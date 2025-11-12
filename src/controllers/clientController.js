import { getSheetData } from "../services/googleSheetService.js";

/**
 * 🔐 Login básico (modo de testes)
 * Simula autenticação — futuramente substituído por JWT real.
 */
export async function login(req, res) {
  const { email, senha } = req.body;

  // Login de teste (apenas simulação)
  if (email === "empresa@alpha.com" && senha === "12345") {
    return res.json({
      token: "abc123",
      nome: "AlphaTech",
      id: 1,
    });
  }

  return res.status(401).json({ erro: "Credenciais inválidas" });
}

/**
 * 📊 Obtém o resumo de endpoints de um cliente específico
 * com base na planilha do Google Sheets
 */
export async function getResumo(req, res) {
  try {
    const clienteId = parseInt(req.params.id);
    const clientes = ["alphatech", "betacorp", "client3", "client4"];
    const clienteNome = clientes[clienteId - 1];

    console.log(`📄 Lendo planilha para cliente: ${clienteNome}`);

    // Lê os dados da planilha
    const linhas = await getSheetData("endpoints!A1:Z1000");

    if (!linhas.length) {
      return res.json({
        maquinasTotais: 0,
        maquinasSeguras: 0,
        vulnerabilidades: 0,
        riscos: 0,
        incidentes: 0,
        detalhes: { maquinas: [] },
      });
    }

    // Filtra apenas os registros do cliente
    const dadosCliente = linhas.filter(
      (r) => (r.Cliente || "").toLowerCase() === clienteNome
    );

    const total = dadosCliente.length;
    const seguras = dadosCliente.filter(
      (r) => (r.Status || "").toLowerCase() === "seguro"
    ).length;

    const toInt = (v) => parseInt(v || "0", 10) || 0;

    const vulnerabilidades = dadosCliente.reduce(
      (s, r) => s + toInt(r.Vulnerabilidades),
      0
    );
    const riscos = dadosCliente.reduce((s, r) => s + toInt(r.Riscos), 0);
    const incidentes = dadosCliente.reduce(
      (s, r) => s + toInt(r.Incidentes),
      0
    );

    // Retorna resumo formatado
    return res.json({
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
}
