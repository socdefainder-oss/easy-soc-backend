// ==========================
// SERVIÇO DE INTEGRAÇÃO - GRAVITYZONE (v2 completo)
// ==========================

import fetch from "node-fetch";

const API_URL = process.env.GZ_API_URL || "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network";
const ACCESS_KEY = process.env.GZ_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("⚠️ GZ_ACCESS_KEY não definido. Configure no Render!");
}

export async function getEndpointsFromGravityZone() {
  try {
    const body = {
      jsonrpc: "2.0",
      method: "getNetworkInventoryItems",
      params: {
        filters: {
          // força o retorno de todas as entidades
          "entityType": ["managedEndpoint", "machine"],
          "status": ["active", "inactive"]
        },
        fields: [
          "name",
          "fqdn",
          "entityName",
          "ip",
          "status",
          "managedState",
          "securityStatus",
          "lastSeen",
          "os",
          "policy",
          "isOnline"
        ]
      },
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
    console.log("🔍 GravityZone API Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ Erro na API GravityZone:", data.error);
      return [];
    }

    const items = data.result?.items || [];

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
