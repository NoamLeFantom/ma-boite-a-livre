import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const options = {};

let client;
let clientPromise;


if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

clientPromise
  .then(() => {
    console.log("MongoDB client connected successfully.");
    console.log("Resolved client:", client);
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

export default clientPromise;

export async function getDb() {
  console.log("Resolving clientPromise in getDb...");
  const client = await clientPromise;
  console.log("Resolved client:", client);
  const dbName = process.env.MONGODB_DB || "BookTraveller";
  return client.db(dbName);
}