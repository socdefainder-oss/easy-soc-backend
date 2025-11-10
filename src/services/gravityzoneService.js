import fetch from "node-fetch";

const API_URL =
  process.env.GZ_API_URL ||
  "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("⚠️ GZ_ACCESS_KEY não definido. Configure no Render!");
}

// Função genérica para chamada da API Bitdefender
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

  console.log("🧾 Resposta completa da API GravityZone:");
  console.log(JSON.stringify(data, null, 2));

  if (data.error) {
    console.error("❌ Erro GravityZone:", data.error);
  }

  return data.result || {};
}

// 🔹 Obter endpoints do GravityZone com fallback automático
export async function getEndpointsFromGravityZone() {
  try {
    console.log("🔹 Chamando método getManagedEndpointsList (modo final fixado)...");

    // ✅ Primeiro método (padrão para instâncias modernas)
    let result = await callGZ("getManagedEndpointsList", {
      filters: {
        status: ["managed", "unmanaged"],
      },
      params: {
        includeSecurityInfo: true,
      },
      page: 1,
      perPage: 100,
    });

    // Se o método não existir, tenta o fallback antigo
    if (!result || Object.keys(result).length === 0) {
      console.log("⚠️ Fallback: tentando getNetworkInventory...");
      result = await callGZ("getNetworkInventory", { parentId: null });
    }

    // Se ainda não vier nada, tenta o terceiro método de inventário cru
    if (!result || Object.keys(result).length === 0) {
      console.log("⚠️ Fallback 2: tentando getNetworkInventoryItems...");
      result = await callGZ("getNetworkInventoryItems", {});
    }

    console.log("🧩 Resultado bruto:");
    console.log(JSON.stringify(result, null, 2));

    const items =
      result?.items ||
      result?.entities ||
      result?.children ||
      result?.endpoints ||
      result?.data ||
      [];

    if (!Array.isArray(items) || items.length === 0) {
      console.log(
        "⚠️ Nenhum endpoint encontrado. Estrutura do retorno:",
        JSON.stringify(Object.keys(result || {}), null, 2)
      );
      return [];
    }

    const endpoints = items.map((item) => ({
      nome: item.name || item.displayName || "Desconhecido",
      ip: item.ip || item.lastIp || "N/A",
      status: item.securityStatus || item.status || "Indefinido",
      os: item.os || item.operatingSystem || "N/A",
      politica: item.policyName || item.policy || "Padrão",
      ultimaAtualizacao: item.lastSeen || "N/A",
      online: item.isOnline ? "Sim" : "Não",
    }));

    console.log(`📦 ${endpoints.length} endpoints encontrados no GravityZone`);
    return endpoints;
  } catch (err) {
    console.error("⚠️ Erro ao buscar endpoints do GravityZone:", err);
    return [];
  }
}
