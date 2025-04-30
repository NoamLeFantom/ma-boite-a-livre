import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ma-boite-a-livre";
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

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
  return client.db("BookTraveller");
}