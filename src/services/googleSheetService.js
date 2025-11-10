import { google } from "googleapis";
import fs from "fs";

export async function getSheetData(sheetName = "endpoints") {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./src/config/service-account.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GSHEET_ID;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = res.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i] || ""));
      return obj;
    });
  } catch (err) {
    console.error("❌ Erro ao ler planilha:", err);
    return [];
  }
}
