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

    return res.json({
      resumo: { total, ok, atencao, critico },
      endpoints,
      lastUpdate: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Erro GravityZone:", err.message);
    return res.status(502).json({ erro: "Falha ao consultar GravityZone API", detalhe: err.message });
  }
};
