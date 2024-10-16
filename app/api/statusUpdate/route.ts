import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust the path accordingly

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

// Function to ensure the MongoDB client is connected
async function connectToDB(collectionName: string, useTestDb = false) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }

  const dbName = useTestDb ? "test" : "database"; // Switch to 'test' only when needed
  return client.db(dbName).collection(collectionName);
}

// Define valid status transitions
const statusTransitions: Record<string, string> = {
  new: "matched",
  matched: "inwarehouse",
  inwarehouse: "awaitingdelivery",
  awaitingdelivery: "delivered",
};

// Function to determine which collection the donationId belongs to
async function detectCollection(donationId: string): Promise<string> {
  const requestsCollection = await connectToDB("requests");
  const requestDoc = await requestsCollection.findOne({
    _id: new ObjectId(donationId),
  });

  if (requestDoc) {
    return "requests"; // If found, return 'requests'
  }

  const donationsCollection = await connectToDB("donations");
  const donationDoc = await donationsCollection.findOne({
    _id: new ObjectId(donationId),
  });

  if (donationDoc) {
    return "donations"; // If found, return 'donations'
  }

  throw new Error(
    "Unable to determine the collection for the provided donationId"
  );
}

// Handler function to update donation status
export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {
      donationId,
      currentStatus = "new",
      deliveryLocation,
      needByTime,
      method,
    } = requestBody;

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

    // Retrieve the session to get the user email
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.error("User is not authenticated");
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const email = session.user.email;

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
      `Updating ${collectionName} with _id: ${donationId} to status: ${nextStatus} and updating donoremail to: ${email}`
    );

    const result = await collection.updateOne(
      { _id: new ObjectId(donationId) }, // Match by _id
      { $set: { status: nextStatus } } // Update status and donoremail
    );

    if (method === "donate") {
      const result = await collection.updateOne(
        { _id: new ObjectId(donationId) }, // Match by _id
        { $set: { consumeByTiming: needByTime } } // Update status and donoremail
      );
    } else if (method === "accept") {
      const result = await collection.updateOne(
        { _id: new ObjectId(donationId) }, // Match by _id
        { $set: { deliveryLocation: deliveryLocation, needByTime: needByTime } } // Update status and donoremail
      );
    }

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

    if (currentStatus === "inwarehouse" && nextStatus === "awaitingdelivery") {
      // Use the 'test' database for this specific case
      const usersCollection = await connectToDB("users", true); // Use the 'test' database

      const userUpdateResult = await usersCollection.updateOne(
        { email: email }, // Match by user email
        { $addToSet: { acceptedItems: new ObjectId(donationId) } } // Add the donationId to acceptedItems array as ObjectId
      );

      console.log(userUpdateResult);

      if (userUpdateResult.modifiedCount === 0) {
        console.warn(`Failed to update acceptedItems for user email: ${email}`);
      } else {
        console.log(
          `Donation ${donationId} successfully added to user's acceptedItems in test database.`
        );
      }
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Donation status in ${collectionName} successfully updated to '${nextStatus}'`,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Error updating donation status:", e.message || e);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
