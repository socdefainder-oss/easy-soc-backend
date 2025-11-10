import { getSheetData } from "../services/googleSheetService.js";

// 🔹 Controlador de resumo por cliente
export async function getResumoCliente(req, res) {
  try {
    const cliente = req.params.id?.toLowerCase().trim();
    console.log(`🔹 Gerando resumo para cliente: ${cliente}`);

    const dados = await getSheetData(); // lê a planilha inteira
    console.log("📄 Total de linhas lidas:", dados.length);

    // Filtra só o cliente solicitado
    const maquinas = dados.filter(
      (m) => m.Cliente && m.Cliente.toLowerCase().trim() === cliente
    );

    console.log(`📊 Máquinas encontradas para ${cliente}:`, maquinas.length);

    if (maquinas.length === 0) {
      return res.status(404).json({
        erro: true,
        mensagem: `Nenhum dado encontrado para o cliente ${cliente}`,
        detalhes: [],
      });
    }

    // Faz resumo geral
    const total = maquinas.length;
    const seguras = maquinas.filter((m) => m.Status === "Seguro").length;
    const vulnerabilidades = maquinas.reduce(
      (acc, m) => acc + parseInt(m.Vulnerabilidades || 0),
      0
    );
    const riscos = maquinas.reduce(
      (acc, m) => acc + parseInt(m.Riscos || 0),
      0
    );
    const incidentes = maquinas.reduce(
      (acc, m) => acc + parseInt(m.Incidentes || 0),
      0
    );

    const resumo = {
      maquinasTotais: total,
      maquinasSeguras: seguras,
      vulnerabilidades,
      riscos,
      incidentes,
      detalhes: { maquinas },
    };

    return res.json(resumo);
  } catch (error) {
    console.error("❌ Erro ao gerar resumo:", error);
    return res.status(500).json({
      erro: true,
      mensagem: "Erro interno ao gerar resumo",
      detalhes: error.message,
    });
  }
}
