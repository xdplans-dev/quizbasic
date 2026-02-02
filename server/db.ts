import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provision a database?",
  );
}

const client = new MongoClient(mongoUri);
const clientPromise = client.connect();

export async function getDb() {
  const connectedClient = await clientPromise;
  const dbName = process.env.MONGODB_DB;
  return dbName ? connectedClient.db(dbName) : connectedClient.db();
}
