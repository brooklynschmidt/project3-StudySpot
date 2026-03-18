import { MongoClient } from "mongodb";

let client = null;
let db = null;

async function connect(uri) {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  console.log(`Connected to MongoDB: ${db.databaseName}`);
  return db;
}

async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Disconnected from MongoDB");
  }
}

function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connect() first.");
  }
  return db;
}

export { connect, disconnect, getDb };