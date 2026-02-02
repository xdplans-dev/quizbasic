import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

async function getClient() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI must be set. Did you forget to provision a database?",
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(mongoUri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getDb() {
  const connectedClient = await getClient();
  const dbName = process.env.MONGODB_DB;
  return dbName ? connectedClient.db(dbName) : connectedClient.db();
}
