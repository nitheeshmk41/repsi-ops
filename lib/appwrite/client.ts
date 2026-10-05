import { Client, Account, Databases, Storage } from "appwrite";
import { appwriteConfig } from "./config";

export function createBrowserAppwriteClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

export const browserAppwrite = typeof window !== "undefined" ? createBrowserAppwriteClient() : null;
