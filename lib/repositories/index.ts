import { GoogleSheetsFinanceRepository } from "./google-sheets-repository";
export function getFinanceRepository() {
  const hasCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY));
  const configured = Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && hasCredentials);
  if (!configured) {
    throw new Error("Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID and service-account credentials.");
  }
  return new GoogleSheetsFinanceRepository();
}
