import fetch from "node-fetch";

const API_URL =
  process.env.GZ_API_URL ||
  "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

async function callGZ(method, params = {}) {
  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: "1",
  };

  console.log(`➡️ Enviando requisição ${method}...`);

  const response = await fetch(API_URL, {
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
    console.error("⚠️ Resposta não-JSON do GravityZone:", text);
    return {};
  }

  if (data.error) console.error("❌ Erro GravityZone:", data.error);
  return data.result || {};
}

// 🔹 Versão universal com autodetecção
export async function getEndpointsFromGravityZone() {
  const possibleMethods = [
    // Novo modelo cloud
    { method: "getEndpointsSummary", desc: "API v2 summary" },
    { method: "getEndpointsList", desc: "API v2 endpoints list" },
    // Modelos anteriores
    { method: "getManagedEndpointsList", desc: "API v1 managed list" },
    { method: "getNetworkInventory", desc: "API legacy inventory" },
    { method: "getNetworkInventoryItems", desc: "API legacy items" },
  ];

  for (const m of possibleMethods) {
    try {
      console.log(`🔹 Tentando método ${m.method} (${m.desc})...`);

      const result = await callGZ(m.method, {
        page: 1,
        perPage: 100,
        params: { includeSecurityInfo: true },
      });

      if (result && Object.keys(result).length > 0) {
        console.log(`✅ Método ${m.method} funcionou!`);
        console.log("🧾 Resposta completa da API GravityZone:");
        console.log(JSON.stringify(result, null, 2));

        // Normaliza diferentes formatos
        const items =
          result.items ||
          result.entities ||
          result.children ||
          result.endpoints ||
          result.data ||
          result.summary ||
          [];

        if (!Array.isArray(items) || items.length === 0) {
          console.log("⚠️ Nenhum item encontrado neste método.");
          continue;
        }

        const endpoints = items.map((item) => ({
          nome: item.name || item.displayName || "Desconhecido",
          ip: item.ip || item.lastIp || item.address || "N/A",
          status:
            item.securityStatus ||
            item.endpointStatus ||
            item.status ||
            "Indefinido",
          os: item.os || item.operatingSystem || "N/A",
          politica: item.policyName || item.policy || "Padrão",
          ultimaAtualizacao: item.lastSeen || item.lastUpdate || "N/A",
          online: item.isOnline ? "Sim" : "Não",
        }));

        console.log(`📦 ${endpoints.length} endpoints encontrados (${m.method})`);
        return endpoints;
      }
    } catch (err) {
      console.error(`⚠️ Erro no método ${m.method}:`, err.message);
    }
  }

  console.error("❌ Nenhum método retornou resultados válidos.");
  return [];
}
