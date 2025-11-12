import { getSheetRowsCsv } from "../services/sheetsCsv.js";

const CLIENTES = ["alphatech", "betacorp", "client3", "client4"];

const toInt = (v) => {
  const n = parseInt(String(v || "0"), 10);
  return Number.isFinite(n) ? n : 0;
};

export const getResumo = async (req, res) => {
  try {
    const sheetId = process.env.GSHEET_ID;
    if (!sheetId) {
      return res.status(500).json({ erro: "GSHEET_ID ausente no .env" });
    }

    const gid = "0"; // ajuste se sua aba 'endpoints' tiver outro gid
    const clienteId = parseInt(req.params.id, 10);
    const clienteNome = CLIENTES[clienteId - 1];
    if (!clienteNome) {
      return res.status(400).json({ erro: "clienteId inválido" });
    }

    console.log(`📄 Lendo planilha CSV pública para cliente: ${clienteNome}`);
    const rows = await getSheetRowsCsv(sheetId, gid);
    console.log(`✅ Linhas obtidas: ${rows.length}`);

    const dadosCliente = rows.filter(
      (r) => (r.Cliente || "").toLowerCase() === clienteNome
    );

    const maquinasTotais = dadosCliente.length;
    const maquinasSeguras = dadosCliente.filter(
      (r) => (r.Status || "").toLowerCase() === "seguro"
    ).length;

    const vulnerabilidades = dadosCliente.reduce((s, r) => s + toInt(r.Vulnerabilidades), 0);
    const riscos = dadosCliente.reduce((s, r) => s + toInt(r.Riscos), 0);
    const incidentes = dadosCliente.reduce((s, r) => s + toInt(r.Incidentes), 0);

    return res.json({
      maquinasTotais,
      maquinasSeguras,
      vulnerabilidades,
      riscos,
      incidentes,
      detalhes: { maquinas: dadosCliente }
    });
  } catch (err) {
    console.error("❌ Erro no getResumo:", err.message);
    return res.status(500).json({ erro: "Falha ao ler a planilha CSV pública", detalhe: err.message });
  }
};

export const pingSheet = async (req, res) => {
  try {
    const sheetId = process.env.GSHEET_ID;
    if (!sheetId) {
      return res.status(500).json({ erro: "GSHEET_ID ausente no .env" });
    }
    const rows = await getSheetRowsCsv(sheetId, "0");
    return res.json({ ok: true, linhas: rows.length, amostra: rows.slice(0, 3) });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
};
