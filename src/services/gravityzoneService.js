import fetch from "node-fetch";

const API_URL =
  process.env.GZ_API_URL ||
  "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("⚠️ GZ_ACCESS_KEY não definido. Configure no Render!");
}

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

// 🔹 Busca endpoints gerenciados da rede
export async function getEndpointsFromGravityZone() {
  try {
    console.log("🔹 Chamando método getNetworkInventoryItems (modo fixado)...");

    // ✅ Parâmetros corretos (sem recursive)
    const result = await callGZ("getNetworkInventoryItems", {
      filters: {
        type: ["managedEndpoint"], // tipo aceito pela doc
      },
    });

    console.log("🧩 Resultado bruto:");
    console.log(JSON.stringify(result, null, 2));

    const items =
      result?.items ||
      result?.entities ||
      result?.children ||
      result?.networkItems ||
      [];

    if (!Array.isArray(items) || items.length === 0) {
      console.log(
        "⚠️ Nenhum endpoint encontrado. Estrutura do retorno:",
        JSON.stringify(Object.keys(result || {}), null, 2)
      );
      return [];
    }

    const endpoints = items.map((item) => ({
      nome: item.name || "Desconhecido",
      ip: item.ip || "N/A",
      status: item.securityStatus || "Indefinido",
      os: item.os || "N/A",
      ultimaAtualizacao: item.lastSeen || "N/A",
      politica: item.policyName || "Padrão",
      online: item.isOnline ? "Sim" : "Não",
    }));

    console.log(`📦 ${endpoints.length} endpoints encontrados no GravityZone`);
    return endpoints;
  } catch (err) {
    console.error("⚠️ Erro ao buscar endpoints do GravityZone:", err);
    return [];
  }
}
