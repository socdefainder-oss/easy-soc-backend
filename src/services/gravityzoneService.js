import fetch from "node-fetch";

const BASE_URL = "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

// Função genérica de chamada à API
async function callGZ(apiPath, method, params = {}) {
  const apiUrl = `${BASE_URL}/${apiPath}`;
  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: "1",
  };

  console.log(`➡️ Chamando ${apiPath} → ${method}`);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(ACCESS_KEY + ":").toString("base64")}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("⚠️ Resposta não JSON:", text);
    return {};
  }

  if (data.error) console.error("❌ Erro Bitdefender:", data.error);
  return data.result || {};
}

export async function getEndpointsFromGravityZone() {
  try {
    // ✅ 1. Novo endpoint oficial (Risk Management)
    console.log("🔹 Tentando via riskManagement → getEndpoints...");
    let result = await callGZ("riskManagement", "getEndpoints", {
      page: 1,
      perPage: 100,
    });

    if (!result || Object.keys(result).length === 0) {
      console.log("⚠️ Fallback: tentando network → getManagedEndpointsList...");
      result = await callGZ("network", "getManagedEndpointsList", {
        page: 1,
        perPage: 100,
      });
    }

    if (!result || Object.keys(result).length === 0) {
      console.log("⚠️ Fallback final: tentando network → getNetworkInventory...");
      result = await callGZ("network", "getNetworkInventory", {});
    }

    console.log("🧾 Resposta completa:");
    console.log(JSON.stringify(result, null, 2));

    const endpoints =
      result.items ||
      result.entities ||
      result.children ||
      result.data ||
      result.endpoints ||
      [];

    if (!Array.isArray(endpoints) || endpoints.length === 0) {
      console.log("⚠️ Nenhum endpoint retornado do módulo Bitdefender.");
      return [];
    }

    const mapped = endpoints.map((e) => ({
      nome: e.name || e.displayName || e.hostname || "Desconhecido",
      ip: e.ip || e.lastIp || e.address || "N/A",
      status: e.status || e.securityStatus || "Indefinido",
      os: e.os || e.operatingSystem || "N/A",
      politica: e.policyName || e.policy || "Padrão",
      ultimaAtualizacao: e.lastSeen || e.lastUpdate || "N/A",
      online: e.isOnline ? "Sim" : "Não",
    }));

    console.log(`📦 ${mapped.length} endpoints obtidos`);
    return mapped;
  } catch (err) {
    console.error("⚠️ Erro ao consultar Bitdefender:", err);
    return [];
  }
}
