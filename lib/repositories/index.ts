import { GoogleSheetsFinanceRepository } from "./google-sheets-repository";
import { hasGoogleCredentials } from "@/lib/google-credentials";
export function getFinanceRepository() {
  const configured = Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && hasGoogleCredentials());
  if (!configured) {
    throw new Error("Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID and service-account credentials.");
  }
  return new GoogleSheetsFinanceRepository();
}
