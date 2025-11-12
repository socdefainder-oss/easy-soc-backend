// src/services/sheetsCsv.js
import axios from "axios";
import Papa from "papaparse";
import dotenv from "dotenv";

dotenv.config();

const GSHEET_ID = process.env.GSHEET_ID;

/**
 * 🔗 Gera a URL pública para exportar uma aba em CSV
 */
function buildCsvUrl(gid = "0") {
  if (!GSHEET_ID) throw new Error("GSHEET_ID não definido no .env");
  return `https://docs.google.com/spreadsheets/d/${GSHEET_ID}/export?format=csv&gid=${gid}`;
}

/**
 * 📥 Lê a planilha pública (CSV) e converte em JSON
 */
export async function getSheetData(gid = "0") {
  try {
    const url = buildCsvUrl(gid);
    console.log(`📊 Buscando planilha: ${url}`);

    const response = await axios.get(url, {
      responseType: "text",
      maxRedirects: 5,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (response.status !== 200) {
      console.error(`❌ Falha ao acessar planilha (HTTP ${response.status})`);
      return [];
    }

    const csv = response.data;
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    console.log(`✅ CSV lido com ${parsed.data.length} linhas.`);
    return parsed.data || [];
  } catch (err) {
    console.error("❌ Erro ao ler planilha CSV:", err.message);
    return [];
  }
}
