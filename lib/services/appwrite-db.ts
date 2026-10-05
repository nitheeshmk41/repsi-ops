import { Client, Databases, ID, Query } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

function getAdminDatabase() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  if (appwriteConfig.apiKey) {
    client.setKey(appwriteConfig.apiKey);
  }

  return new Databases(client);
}

export const appwriteDb = {
  // List documents from a collection/table
  async list<T>(collectionId: string, queries: string[] = []): Promise<T[]> {
    try {
      const db = getAdminDatabase();
      const res = await db.listDocuments(
        appwriteConfig.databaseId,
        collectionId,
        queries
      );
      return res.documents.map((doc) => ({
        id: doc.$id,
        ...doc,
      })) as unknown as T[];
    } catch (err: any) {
      // If collection is empty or not yet provisioned, return empty array
      return [];
    }
  },

  // Get a single document
  async get<T>(collectionId: string, documentId: string): Promise<T | null> {
    try {
      const db = getAdminDatabase();
      const doc = await db.getDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId
      );
      return { id: doc.$id, ...doc } as unknown as T;
    } catch {
      return null;
    }
  },

  // Create a document
  async create<T>(collectionId: string, data: Record<string, any>): Promise<T | null> {
    try {
      const db = getAdminDatabase();
      const doc = await db.createDocument(
        appwriteConfig.databaseId,
        collectionId,
        ID.unique(),
        data
      );
      return { id: doc.$id, ...doc } as unknown as T;
    } catch (err: any) {
      console.error(`Appwrite create failed in ${collectionId}:`, err.message);
      return null;
    }
  },

  // Update a document
  async update<T>(collectionId: string, documentId: string, data: Record<string, any>): Promise<T | null> {
    try {
      const db = getAdminDatabase();
      const doc = await db.updateDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId,
        data
      );
      return { id: doc.$id, ...doc } as unknown as T;
    } catch (err: any) {
      console.error(`Appwrite update failed in ${collectionId}:`, err.message);
      return null;
    }
  },

  // Delete a document
  async delete(collectionId: string, documentId: string): Promise<boolean> {
    try {
      const db = getAdminDatabase();
      await db.deleteDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId
      );
      return true;
    } catch {
      return false;
    }
  },
};
