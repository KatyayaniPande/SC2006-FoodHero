import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// MongoDB URI and client setup
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Environment variable MONGODB_URI is not defined");
}
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Define valid status transitions
const statusTransitions = {
  new: "matched",
  matched: "inwarehouse",
  // awaitingpickup: "awaitingdelivery",
  inwarehouse: "awaitingdelivery",
  awaitingdelivery: "delivered",
};

// Function to connect to a specific collection
async function connectToDB(collectionName: string) {
  if (!client.isConnected) {
    await client.connect();
  }
  return client.db("database").collection(collectionName);
}

async function detectCollection(donationId: string): Promise<string> {
  // Try finding the document in the 'requests' collection first
  const requestsCollection = await connectToDB("requests");
  const requestDoc = await requestsCollection.findOne({
    _id: new ObjectId(donationId),
  });

  if (requestDoc) {
    return "requests"; // If found, return 'requests'
  }

  // If not found in 'requests', check in 'donations'
  const donationsCollection = await connectToDB("donations");
  const donationDoc = await donationsCollection.findOne({
    _id: new ObjectId(donationId),
  });

  if (donationDoc) {
    return "donations"; // If found, return 'donations'
  }

  // If not found in either collection, throw an error
  throw new Error(
    "Unable to determine the collection for the provided donationId"
  );
}

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { donationId, currentStatus = "new" } = requestBody;

    // Log the incoming request
    console.log("Request body:", { donationId, currentStatus });

    // Validate that donationId is provided
    if (!donationId) {
      return NextResponse.json(
        { error: "Invalid request. donationId is required." },
        { status: 400 }
      );
    }

    // Validate donationId format
    if (!ObjectId.isValid(donationId)) {
      return NextResponse.json(
        { error: "Invalid donationId format" },
        { status: 400 }
      );
    }

    // Autodetect collection by fetching the document from either 'requests' or 'donations'
    const collectionName = await detectCollection(donationId);

    // Connect to the appropriate collection
    const collection = await connectToDB(collectionName);

    // Check if the current status can transition to the next status
    const nextStatus = statusTransitions[currentStatus];
    if (!nextStatus) {
      return NextResponse.json(
        { error: `Invalid status transition from '${currentStatus}'` },
        { status: 400 }
      );
    }

    console.log(
      `Updating ${collectionName} with _id:`,
      donationId,
      "to status:",
      nextStatus
    );

    const result = await collection.updateOne(
      { _id: new ObjectId(donationId) }, // Match by _id
      { $set: { status: nextStatus } }
    );

    // Log the result of the query
    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      const donation = await collection.findOne({
        _id: new ObjectId(donationId),
      });
      console.log(
        `Status in DB for donationId ${donationId} in ${collectionName} is:`,
        donation?.status
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Donation not found or current status does not match." },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Donation status in ${collectionName} successfully updated to '${nextStatus}'`,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error updating donation status:", e.message || e);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  } finally {
    console.log("MongoDB connection will be reused");
  }
}
