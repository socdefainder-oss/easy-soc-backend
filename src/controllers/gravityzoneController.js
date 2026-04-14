// src/controllers/gravityzoneController.js
import { getManagedEndpoints, normalizeEndpoints } from "../services/gravityzone.js";

export const getEndpoints = async (req, res) => {
  try {
    const raw = await getManagedEndpoints();
    const endpoints = normalizeEndpoints(raw);

    const total = endpoints.length;
    const ok      = endpoints.filter((e) => e.status === "OK").length;
    const atencao = endpoints.filter((e) => e.status === "Atenção").length;
    const critico = endpoints.filter((e) => e.status === "Crítico").length;

    const totalVulnerabilidades = endpoints.reduce((acc, ep) => acc + (ep.qtdVulnerabilidades || 0), 0);
    const totalRiscos = endpoints.reduce((acc, ep) => acc + (ep.qtdRiscos || 0), 0);
    const mediaRiskScore = total > 0
      ? Math.round(endpoints.reduce((acc, ep) => acc + (ep.riskScore || 0), 0) / total)
      : 0;

    return res.json({
      resumo: { total, ok, atencao, critico, totalVulnerabilidades, totalRiscos, mediaRiskScore },
      endpoints,
      lastUpdate: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Erro GravityZone:", err.message);
    return res.status(502).json({ erro: "Falha ao consultar GravityZone API", detalhe: err.message });
  }
};
