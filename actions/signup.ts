"use server";

import { mongoDBConnection } from "@/lib/mongodb";
import { MongoClient, ServerApiVersion } from "mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
// Your MongoDB URI

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Environment variable MONGODB_URI is not defined");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Function to connect to the database and collection
async function connectToDB(databaseName, collectionName) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(databaseName).collection(collectionName);
}

export const registerUser = async (values: any) => {
  const {
    email,
    password,
    agency,
    uen,
    address,
    poc_name,
    poc_phone,
    acceptedItems,
    halal_certification,
    hygiene_certification,
    role,
  } = values;

  try {
    // await mongoDBConnection();

    const usersConnection = await connectToDB("test", "users");

    const isUserFound = await usersConnection.findOne({ email });
    console.log(isUserFound);

    if (isUserFound) {
      return {
        error: "Email already exists",
      };
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      agency,
      uen,
      address,
      poc_name,
      poc_phone,
      acceptedItems,
      halal_certification,
      hygiene_certification,
      role,
    });

    await user.save();
  } catch (error: any) {
    return {
      error: error.toString(),
    };
  }
};
