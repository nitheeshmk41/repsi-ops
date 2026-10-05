export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "repsi-ops-prod",
  apiKey: process.env.APPWRITE_API_KEY || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "repsi_ops_db",
  storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET || "repsi_attachments",
  // Appwrite Managed PostgreSQL Connection String
  postgresUrl: process.env.DATABASE_URL || "",
};
