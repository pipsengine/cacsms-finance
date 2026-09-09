import { DemoFinanceRepository } from "./demo-repository";
import { GoogleSheetsFinanceRepository } from "./google-sheets-repository";
export function getFinanceRepository() {
  const configured = Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  return configured ? new GoogleSheetsFinanceRepository() : new DemoFinanceRepository();
}
