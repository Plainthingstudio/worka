import { Client, Account, Databases, Storage, Functions, ID, Query } from 'appwrite';

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT as string;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;

const isConfiguredValue = (value?: string) =>
  Boolean(value && value.trim() && !value.includes("YOUR_"));

export const isAppwriteConfigured =
  isConfiguredValue(APPWRITE_ENDPOINT) &&
  isConfiguredValue(APPWRITE_PROJECT_ID) &&
  isConfiguredValue(DATABASE_ID);

export const appwriteConfigError =
  "Appwrite is not configured. Update VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, and VITE_APPWRITE_DATABASE_ID in .env.";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export { ID, Query, client };
