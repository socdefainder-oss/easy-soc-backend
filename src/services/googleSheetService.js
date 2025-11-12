import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Caminho do arquivo de credenciais
const KEY_FILE = "./credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SHEET_ID = "1GaX4EMPIrKVyEVcow7dxsct6XeFZ_0DUQhTNwFdonXE";

export async function getSheetData(range) {
  try {
    if (!fs.existsSync(KEY_FILE)) {
      throw new Error("❌ Arquivo credentials.json não encontrado");
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      console.log("⚠️ Nenhum dado encontrado na planilha.");
      return [];
    }

    // A primeira linha são os cabeçalhos (A1:K1)
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header.trim()] = row[index] || "";
      });
      return item;
    });

    console.log("📊 Dados lidos da planilha:", data);
    return data;
  } catch (err) {
    console.error("❌ Erro ao acessar Google Sheets:", err.message);
    return [];
  }
}
