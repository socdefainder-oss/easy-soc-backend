// ==========================
// SERVIÇO DE INTEGRAÇÃO - GRAVITYZONE
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
        filters: {}, // vazio = busca tudo
        fields: ["name", "status", "ip", "lastSeen", "managedState"]
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

    // 🧠 Log de depuração (importante para testar)
    console.log("🔍 GravityZone response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ Erro na API GravityZone:", data.error);
      return [];
    }

    const items = data.result?.items || [];

    return items.map(item => ({
      nome: item.name || "Desconhecido",
      status: item.status || item.managedState || "Indefinido",
      ip: item.ip || "N/A",
      ultimaAtualizacao: item.lastSeen || "N/A"
    }));

  } catch (err) {
    console.error("⚠️ Erro ao buscar endpoints do GravityZone:", err);
    return [];
  }
}
