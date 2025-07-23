import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Falta la variable de Database en el .env");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default clientPromise;
