import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is missing from .env");
}

const client = new MongoClient(uri);
let database;

export async function connectDB() {
  if (!database) {
    await client.connect();
    database = client.db("Test");
    console.log("✅ Connected to MongoDB database: Test");
  }

  return database;
}

export function getBrandsCollection() {
  if (!database) {
    throw new Error("Database is not connected");
  }

  return database.collection("Brands");
}