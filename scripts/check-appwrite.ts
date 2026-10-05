import { Client, Databases, Users } from "node-appwrite";
import * as dotenv from "dotenv";
dotenv.config();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const users = new Users(client);

async function main() {
  try {
    console.log("Checking Appwrite at:", endpoint, "project:", projectId);
    const dbs = await databases.list();
    console.log("Databases in project:", dbs.total, dbs.databases.map((d) => ({ id: d.$id, name: d.name })));
    
    const userList = await users.list();
    console.log("Users in project:", userList.total, userList.users.map((u) => ({ id: u.$id, email: u.email, name: u.name })));
  } catch (err) {
    console.error("Error connecting to Appwrite:", err);
  }
}

main();
