import fetch from "node-fetch";

const API_URL = process.env.GZ_API_URL || "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("⚠️ GZ_ACCESS_KEY não definido. Configure no Render!");
}

// Função genérica para chamadas na API
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

// ================================
// 🚀 Função principal
// ================================
export async function getEndpointsFromGravityZone() {
  try {
    console.log("🔹 Etapa 1: Descobrindo empresas...");

    const companies = await callGZ("getCompaniesList", {});
    const empresa = companies.items?.find(c => c.name?.toLowerCase().includes("defainder"));

    if (!empresa) {
      console.log("⚠️ Nenhuma empresa chamada 'defainder' encontrada. Usando raiz padrão.");
    } else {
      console.log(`🏢 Empresa encontrada: ${empresa.name} (ID ${empresa.id})`);
    }

    console.log("🔹 Etapa 2: Buscando inventário de endpoints...");

    const inventory = await callGZ("getNetworkInventoryItems", {
      parentId: empresa ? empresa.id : undefined,
      filters: {},
      fields: [
        "name", "fqdn", "entityName", "ip", "status", "managedState",
        "securityStatus", "lastSeen", "os", "policy", "isOnline"
      ]
    });

    const items = inventory.items || [];
    console.log(`📦 ${items.length} endpoints retornados pelo GravityZone`);

    return items.map(item => ({
      nome: item.name || item.entityName || "Desconhecido",
      ip: item.ip || "N/A",
      status: item.securityStatus || item.status || "Indefinido",
      os: item.os || "N/A",
      ultimaAtualizacao: item.lastSeen || "N/A",
      politica: item.policy || "Padrão",
      online: item.isOnline ? "Sim" : "Não"
    }));
  } catch (err) {
    console.error("⚠️ Erro ao buscar endpoints do GravityZone:", err);
    return [];
  }
}
