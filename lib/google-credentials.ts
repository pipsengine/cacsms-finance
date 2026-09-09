import { readFileSync } from "node:fs";

export type GoogleCredentials = { email: string; key: string };

export function hasGoogleCredentials() {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
  );
}

export function getGoogleCredentials(): GoogleCredentials {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (email && key) return { email, key: key.replace(/\\n/g, "\n") };

  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) throw new Error("Google service account is not configured");

  try {
    const file = JSON.parse(readFileSync(path, "utf8")) as {
      client_email?: unknown;
      private_key?: unknown;
    };
    if (typeof file.client_email !== "string" || typeof file.private_key !== "string") {
      throw new Error("Credential fields are missing");
    }
    return { email: file.client_email, key: file.private_key };
  } catch (error) {
    throw new Error("Could not load Google service account credentials", { cause: error });
  }
}
