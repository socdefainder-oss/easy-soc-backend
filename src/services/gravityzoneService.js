// src/services/gravityzoneService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function obterResumoGravityZone() {
  // monta Basic auth com a chave (Bitdefender usa Basic com chave:)
  const auth = Buffer.from(`${process.env.GZ_ACCESS_KEY}:`).toString("base64");

  const payload = {
    jsonrpc: "2.0",
    method: "getEndpointsList", // método exemplo: ajusta conforme a API do GZ
    params: { page: 1, perPage: 200 },
    id: 1
  };

  try {
    const resp = await axios.post(process.env.GZ_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`
      },
      timeout: 15000
    });

    const endpoints = resp.data.result?.items || [];

    const total = endpoints.length;
    const managed = endpoints.filter(e => (e.status || "").toLowerCase().includes("managed")).length;
    const atRisk = endpoints.filter(e => (e.status || "").toLowerCase().includes("at risk")).length;
    const offline = endpoints.filter(e => (e.status || "").toLowerCase().includes("offline")).length;

    return {
      maquinasProtegidas: `${managed} de ${total} Seguras`,
      vulnerabilidades: `${atRisk} Encontradas`,
      riscos: `${offline} Offline`,
      incidentes: "Nenhum",
      detalhes: { endpoints } // retorna a lista completa para exibir na UI
    };

  } catch (err) {
    console.error("Erro ao consultar GravityZone:", err.response?.data || err.message);
    throw err;
  }
}
