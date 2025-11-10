import fetch from "node-fetch";

const API_URL = process.env.GZ_API_URL || "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("⚠️ GZ_ACCESS_KEY não definido. Configure no Render!");
}

async function callGZ(method, params = {}) {
  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: "1"
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(ACCESS_KEY + ":").toString("base64")}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (data.error) {
    console.error("❌ Erro GravityZone:", data.error);
  }
  return data.result || {};
}

export async function getEndpointsFromGravityZone() {
  try {
    console.log("🔹 Chamando método getManagedEndpointsList...");

    const result = await callGZ("getManagedEndpointsList", {});

    if (!result.items || result.items.length === 0) {
      console.log("⚠️ Nenhum endpoint retornado. Resultado bruto:", JSON.stringify(result, null, 2));
      return [];
    }

    const items = result.items.map(item => ({
      nome: item.name || "Desconhecido",
      ip: item.ip || "N/A",
      status: item.securityStatus || "Indefinido",
      os: item.os || "N/A",
      ultimaAtualizacao: item.lastSeen || "N/A",
      politica: item.policyName || "Padrão",
      online: item.isOnline ? "Sim" : "Não"
    }));

    console.log(`📦 ${items.length} endpoints encontrados no GravityZone`);
    return items;

  } catch (err) {
    console.error("⚠️ Erro ao buscar endpoints do GravityZone:", err);
    return [];
  }
}
