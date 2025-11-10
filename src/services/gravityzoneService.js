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

// 🔹 Busca endpoints em profundidade (modo recursivo)
export async function getEndpointsFromGravityZone() {
  try {
    console.log("🔹 Chamando método getManagedEndpointsList (modo recursivo)...");

    // Primeiro: tenta pegar todos os endpoints
    const result = await callGZ("getManagedEndpointsList", {
      page: 1,
      perPage: 200,
      params: {
        includeSecurityInfo: true,
      },
    });

    // Alguns tenants retornam em `result.items` e outros dentro de children
    const items =
      result?.items ||
      result?.entities ||
      result?.children ||
      result?.data ||
      [];

    // Se só vier “Companies” e “Network”, tenta o próximo nível
    let endpoints = items.filter(
      (i) =>
        i.entityType === "endpoint" ||
        i.type === "endpoint" ||
        i.ip ||
        i.os ||
        (i.name && !["Companies", "Network"].includes(i.name))
    );

    if (endpoints.length === 0) {
      console.log("⚠️ Nenhum endpoint direto. Tentando explorar subníveis...");
      const sub = await callGZ("getNetworkInventoryItems", {
        parentId: null,
      });
      const subItems =
        sub?.items ||
        sub?.entities ||
        sub?.children ||
        sub?.data ||
        [];
      endpoints = subItems.filter(
        (i) =>
          i.entityType === "endpoint" ||
          i.type === "endpoint" ||
          i.ip ||
          (i.name && !["Companies", "Network"].includes(i.name))
      );
    }

    if (!endpoints || endpoints.length === 0) {
      console.log("⚠️ Ainda sem endpoints — verifique permissões de rede.");
      return [];
    }

    const mapped = endpoints.map((item) => ({
      nome: item.name || item.displayName || "Desconhecido",
      ip: item.ip || item.lastIp || "N/A",
      status: item.securityStatus || item.status || "Indefinido",
      os: item.os || item.operatingSystem || "N/A",
      politica: item.policyName || item.policy || "Padrão",
      ultimaAtualizacao: item.lastSeen || "N/A",
      online: item.isOnline ? "Sim" : "Não",
    }));

    console.log(`📦 ${mapped.length} endpoints reais encontrados`);
    return mapped;
  } catch (err) {
    console.error("⚠️ Erro ao buscar endpoints do GravityZone:", err);
    return [];
  }
}
