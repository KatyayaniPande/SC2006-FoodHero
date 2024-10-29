// app/api/requests/route.ts

import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let mongoClient: MongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function getCollection() {
  const client = await mongoClient.connect();
  const db = client.db("database");
  return db.collection("requests");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("beneficiaryemail");
    const collection = await getCollection();

    let requests;

    if (email) {
      // If email is provided, find requests for that specific user
      requests = await collection.find({ beneficiaryemail: email }).toArray();
    } else {
      // If no email is provided, return all requests
      requests = await collection.find({}).toArray();
    }

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Request ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid Request ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection();

    // Convert the id string to a MongoDB ObjectId
    const objectId = new ObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      return NextResponse.json(
        { message: "Request deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
