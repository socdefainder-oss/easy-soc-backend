import dotenv from "dotenv";
import { getSheetData } from "./services/googleSheetService.js";

dotenv.config();

const main = async () => {
  console.log("🔹 Lendo dados da planilha...");
  const data = await getSheetData();
  console.log("📊 Resultado:");
  console.log(data);
};

main();
