import axios from "axios";
import { parse } from "csv-parse/sync";

const requiredHeaders = [
  "Cliente",
  "Hostname",
  "Status",
  "Vulnerabilidades",
  "Riscos",
  "Incidentes"
];

// Lê CSV público do Google Sheets e retorna array de objetos
export async function getSheetRowsCsv(sheetId, gid = "0") {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const { data } = await axios.get(url, { responseType: "arraybuffer" });

  // Parse do CSV (auto_detect, com header)
  const records = parse(data, {
    columns: true,
    skip_empty_lines: true
  });

  // Normaliza nomes de cabeçalhos (tira espaços extras)
  const normalized = records.map((row) => {
    const obj = {};
    Object.keys(row).forEach((k) => {
      const key = String(k).trim();
      obj[key] = String(row[k] ?? "").trim();
    });
    return obj;
  });

  // Validação leve: checa se os headers principais existem
  const headersOk = requiredHeaders.every((h) => normalized[0]?.hasOwnProperty(h));
  if (!headersOk) {
    const keys = normalized[0] ? Object.keys(normalized[0]) : [];
    throw new Error(
      `Cabeçalhos inesperados. Esperado: ${requiredHeaders.join(", ")} | Encontrado: ${keys.join(", ")}`
    );
  }

  return normalized;
}
