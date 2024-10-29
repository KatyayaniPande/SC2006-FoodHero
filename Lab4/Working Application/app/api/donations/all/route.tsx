import { MongoClient, ServerApiVersion } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// Create a single instance of the MongoClient to be reused across requests
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

/**
 * Utility function to connect to the database and get the collection
 */
async function getCollection() {
    const client = await mongoClient.connect();
    const db = client.db("database");
    return db.collection("donations");
}

export async function GET(request: NextRequest) {
    try {
        // Get the MongoDB collection
        const collection = await getCollection();
        // Retrieve all documents from the collection
        const donations = await collection.find({}).toArray();
        // Return the documents as a JSON response
        return NextResponse.json(donations, { status: 200 });
    } catch (error) {
        console.error("MongoDB connection error:", error);

        // Return an error response in case of failure
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
