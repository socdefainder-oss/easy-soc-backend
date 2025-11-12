import { google } from "googleapis";

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function getSheetData(range = "endpoints!A1:Z1000") {
  try {
    const sheetId = process.env.SHEET_ID;
    if (!sheetId) {
      console.error("❌ Variável SHEET_ID não definida.");
      return [];
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
    );
  } catch (err) {
    console.error("❌ Erro ao acessar planilha:", err);
    return [];
  }
}
