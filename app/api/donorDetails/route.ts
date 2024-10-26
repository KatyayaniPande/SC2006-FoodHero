import { MongoClient, ServerApiVersion } from "mongodb";

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

// GET handler to fetch donor details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter: email is required" }),
        { status: 400 }
      );
    }

    const collection = await connectToDB("test", "users");

    // Find the user by email and ensure their role is 'donor'
    const donor = await collection.findOne({ email: email, role: "donor" });

    if (!donor) {
      return new Response(
        JSON.stringify({ error: "Donor not found or role mismatch" }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify(donor), { status: 200 });
  } catch (error) {
    console.error("Error fetching donor details:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// POST handler to update donor details
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      poc_name,
      poc_phone,
      agency,
      halal_certification,
      hygiene_certification,
      uen,
      address,
    } = body;

    // Check for missing required fields
    if (!email || !poc_name || !poc_phone || !agency || !uen || !address) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const collection = await connectToDB("test", "users");

    // Update the donor details in the database
    const result = await collection.updateOne(
      { email: email, role: "donor" },
      {
        $set: {
          poc_name: poc_name,
          poc_phone: poc_phone,
          agency: agency,
          halal_certification: halal_certification,
          hygiene_certification: hygiene_certification,
          uen: uen,
          address: address, // Include the address in the update
        },
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Donor not found or role mismatch" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Donor updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating donor details:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter: email is required" }),
        { status: 400 }
      );
    }

    // Connect to the donations and requests collections in the 'db' database
    const donationsCollection = await connectToDB("database", "donations");
    const requestsCollection = await connectToDB("database", "requests");

    // Check for pending donations or requests
    const pendingDonation = await donationsCollection.findOne({
      donoremail: email,
      status: { $in: ["matched", "awaitingdelivery", "inwarehouse"] },
    });

    const pendingRequest = await requestsCollection.findOne({
      donoremail: email,
      status: { $in: ["matched", "awaitingdelivery", "inwarehouse"] },
    });

    if (pendingDonation || pendingRequest) {
      return new Response(
        JSON.stringify({
          error:
            "Cannot delete profile. You have pending donations or requests. Please complete them before deleting your profile.",
        }),
        { status: 400 }
      );
    }

    // Connect to the users collection in the 'test' database
    const usersCollection = await connectToDB("test", "users");

    // Delete the donor from the users collection
    const userDeleteResult = await usersCollection.deleteOne({
      email: email,
    });

    if (userDeleteResult.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Donor not found or role mismatch" }),
        { status: 404 }
      );
    }

    // Delete associated donations and requests
    const donationsDeleteResult = await donationsCollection.deleteMany({
      donoremail: email,
    });
    const requestsDeleteResult = await requestsCollection.deleteMany({
      donoremail: email,
    });

    // Return success message
    return new Response(
      JSON.stringify({
        message: "Donor and associated data deleted successfully",
        deletedDonations: donationsDeleteResult.deletedCount,
        deletedRequests: requestsDeleteResult.deletedCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting donor details:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
