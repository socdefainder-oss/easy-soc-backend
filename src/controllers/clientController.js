import { getSheetData } from "../services/googleSheetService.js";

/**
 * 📊 Obtém o resumo de endpoints de um cliente específico
 * com base na planilha do Google Sheets
 */
export async function getResumo(req, res) {
  try {
    const clienteId = parseInt(req.params.id);
    const clientes = ["alphatech", "betacorp", "client3", "client4"];
    const clienteNome = clientes[clienteId - 1];

    console.log(`📄 Iniciando leitura da planilha para o cliente: ${clienteNome}`);

    // 🔹 Leitura direta da planilha
    const linhas = await getSheetData("endpoints!A1:K100");

    if (!linhas || linhas.length === 0) {
      console.error("❌ Nenhum dado retornado da planilha. Verifique o acesso ou o range.");
      return res.status(500).json({
        erro: "Falha ao obter dados da planilha (retorno vazio)",
      });
    }

    console.log(`✅ Planilha lida com sucesso: ${linhas.length} linhas encontradas.`);

    // 🔹 Verifica estrutura de dados
    if (!Array.isArray(linhas)) {
      console.error("❌ Estrutura de dados inesperada na planilha:", typeof linhas);
      return res.status(500).json({
        erro: "Formato de dados incorreto retornado pela planilha",
      });
    }

    // 🔹 Filtra registros do cliente
    const dadosCliente = linhas.filter(
      (r) => (r.Cliente || "").toLowerCase() === clienteNome
    );

    if (dadosCliente.length === 0) {
      console.warn(`⚠️ Nenhum registro encontrado para o cliente: ${clienteNome}`);
    }

    const toInt = (v) => parseInt(v || "0", 10) || 0;

    // 🔹 Cálculos
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

    // 🔹 Retorna tudo
    return res.json({
      maquinasTotais: total,
      maquinasSeguras: seguras,
      vulnerabilidades,
      riscos,
      incidentes,
      detalhes: { maquinas: dadosCliente },
    });
  } catch (err) {
    console.error("❌ Erro geral ao gerar resumo:", err);
    res.status(500).json({ erro: "Falha ao gerar resumo da planilha" });
  }
}
