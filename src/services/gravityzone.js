// src/services/gravityzone.js
import axios from "axios";

const GZ_BASE = "https://cloud.gravityzone.bitdefender.com/api";
const GZ_KEY = process.env.GZ_API_KEY;

function gzHeaders() {
  if (!GZ_KEY) throw new Error("GZ_API_KEY não definido no .env");
  const token = Buffer.from(`${GZ_KEY}:`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

async function gzCall(domain, method, params = {}) {
  const url = `${GZ_BASE}/v1.0/jsonrpc/${domain}`;
  const payload = {
    id: `${domain}-${method}-${Date.now()}`,
    jsonrpc: "2.0",
    method,
    params,
  };

  const res = await axios.post(url, payload, {
    headers: gzHeaders(),
    timeout: 30000,
  });

  if (res.data.error) {
    throw new Error(`GravityZone API error: ${JSON.stringify(res.data.error)}`);
  }

  return res.data.result;
}

/**
 * Busca todos os endpoints gerenciados paginando automaticamente.
 * Filtra apenas isManaged === true.
 */
export async function getManagedEndpoints() {
  const allItems = [];
  let page = 1;

  while (true) {
    const result = await gzCall("network", "getNetworkInventoryItems", {
      page,
      perPage: 100,
      filters: {
        type: {
          computers: true,
          virtualMachines: true,
          ec2Instances: true,
        },
        depth: { allItemsRecursively: true },
        security: { management: { managedWithBest: true } },
      },
      options: {
        endpoints: {
          returnProductOutdated: true,
          includeScanLogs: false,
        },
      },
    });

    const items = result?.items ?? [];
    allItems.push(...items);

    const pagesCount = result?.pagesCount ?? page;
    const hasMore = result?.hasMoreRecords ?? false;

    if (!hasMore && page >= pagesCount) break;
    page++;
  }

  // Garante apenas gerenciados (double-check)
  return allItems.filter((item) => item?.details?.isManaged === true);
}

/**
 * Mapeia campos do item para objeto padronizado do frontend.
 */
function moduleFlag(val) {
  if (val === true) return "Sim";
  if (val === false) return "Não";
  return "N/A";
}

function typeLabel(val) {
  const map = { 5: "Computador", 6: "Servidor Virtual", 7: "Instância Cloud" };
  return map[val] ?? String(val ?? "");
}

function simplifyOS(os) {
  if (!os) return "Não informado";
  const l = os.toLowerCase();
  if (l.includes("ubuntu")) return "Linux Ubuntu";
  if (l.includes("debian")) return "Linux Debian";
  if (l.includes("centos")) return "Linux CentOS";
  if (l.includes("red hat") || l.includes("rhel")) return "Linux Red Hat";
  if (l.includes("amazon linux")) return "Amazon Linux";
  if (l.includes("linux")) return "Linux";
  if (l.includes("windows")) return "Windows";
  return os;
}

function execStatus(ep) {
  if (!ep.policyApplied || !ep.antimalware) return "Crítico";
  if (ep.productOutdated) return "Atenção";
  if (!ep.advancedThreatControl) return "Atenção";
  return "OK";
}

function collectVulnerabilities(ep) {
  const vulnerabilidades = [];

  if (!ep.policyApplied) vulnerabilidades.push("Política não aplicada");
  if (!ep.antimalware) vulnerabilidades.push("Antimalware inativo");
  if (!ep.advancedThreatControl) vulnerabilidades.push("ATC/EDR inativo");
  if (!ep.networkAttackDefense) vulnerabilidades.push("Network Attack Defense inativo");
  if (!ep.hyperDetect) vulnerabilidades.push("HyperDetect inativo");
  if (!ep.sandboxAnalyzer) vulnerabilidades.push("Sandbox Analyzer inativo");
  if (ep.productOutdated) vulnerabilidades.push("Produto desatualizado");

  return vulnerabilidades;
}

function collectRisks(ep) {
  const riscos = [];

  if (!ep.policyApplied) riscos.push("Endpoint sem política aplicada");
  if (!ep.antimalware) riscos.push("Ausência de proteção antimalware");
  if (!ep.advancedThreatControl) riscos.push("Sem controle avançado de ameaças");
  if (!ep.networkAttackDefense) riscos.push("Sem defesa contra ataques de rede");
  if (ep.productOutdated) riscos.push("Agente/assinaturas desatualizados");
  if (!ep.riskManagement) riscos.push("Módulo de Risk Management inativo");

  return riscos;
}

function riskScore(ep) {
  let score = 0;
  if (!ep.policyApplied) score += 30;
  if (!ep.antimalware) score += 30;
  if (!ep.advancedThreatControl) score += 15;
  if (!ep.networkAttackDefense) score += 10;
  if (!ep.riskManagement) score += 5;
  if (ep.productOutdated) score += 10;
  return Math.min(score, 100);
}

export function normalizeEndpoints(items) {
  return items.map((item) => {
    const d = item.details ?? {};
    const p = d.policy ?? {};
    const m = d.modules ?? {};

    const ep = {
      id: item.id,
      hostname: item.name,
      fqdn: d.fqdn || item.name,
      tipo: typeLabel(item.type),
      ip: d.ip ?? "",
      os: d.operatingSystemVersion ?? "",
      osSimplificado: simplifyOS(d.operatingSystemVersion),
      managedWithBest: moduleFlag(d.managedWithBest),
      productOutdated: d.productOutdated === true,
      policy: p.name ?? "",
      policyApplied: p.applied === true,
      antimalware: m.antimalware === true,
      firewall: m.firewall === true,
      contentControl: m.contentControl === true,
      deviceControl: m.deviceControl === true,
      advancedThreatControl: m.advancedThreatControl === true,
      applicationControl: m.applicationControl === true,
      encryption: m.encryption === true,
      networkAttackDefense: m.networkAttackDefense === true,
      hyperDetect: m.hyperDetect === true,
      sandboxAnalyzer: m.sandboxAnalyzer === true,
      riskManagement: m.riskManagement === true,
    };

    ep.status = execStatus(ep);
    ep.vulnerabilidadesEncontradas = collectVulnerabilities(ep);
    ep.qtdVulnerabilidades = ep.vulnerabilidadesEncontradas.length;
    ep.riscosIdentificados = collectRisks(ep);
    ep.qtdRiscos = ep.riscosIdentificados.length;
    ep.riskScore = riskScore(ep);
    return ep;
  });
}
