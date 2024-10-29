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

// Handler to get the admin's accepted deliveries
export async function GET(request: NextRequest) {
  try {
    // Retrieve the session to get the user email
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const email = session.user.email;

    // Connect to the 'users' collection in the 'test' database
    const usersCollection = await connectToDB("users", true);
    const userDoc = await usersCollection.findOne({ email });

    if (
      !userDoc ||
      !userDoc.acceptedItems ||
      userDoc.acceptedItems.length === 0
    ) {
      return NextResponse.json(
        { error: "No accepted deliveries found for this user" },
        { status: 404 }
      );
    }

    // Fetch the deliveries (donations) that match the acceptedItems
    const acceptedItemsIds = userDoc.acceptedItems.map(
      (id: string) => new ObjectId(id)
    );

    const donationsCollection = await connectToDB("donations", false); // Connect to the 'donations' collection
    const requestsCollection = await connectToDB("requests", false); // Connect to the 'requests' collection

    // Fetch accepted deliveries from donations collection
    const acceptedDonations = await donationsCollection
      .find({ _id: { $in: acceptedItemsIds }, status: "awaitingdelivery" }) // Only get awaiting deliveries
      .toArray();

    // Fetch accepted deliveries from requests collection
    const acceptedRequests = await requestsCollection
      .find({ _id: { $in: acceptedItemsIds }, status: "awaitingdelivery" }) // Only get awaiting deliveries
      .toArray();

    // Combine both donations and requests into a single array
    const acceptedDeliveries = [...acceptedDonations, ...acceptedRequests];

    return NextResponse.json(acceptedDeliveries, { status: 200 });
  } catch (e: any) {
    console.error("Error fetching accepted deliveries:", e.message || e);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
