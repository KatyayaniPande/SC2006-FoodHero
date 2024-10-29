import { MongoClient, ServerApiVersion } from "mongodb";
import { ObjectId } from "mongodb";

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

async function connectToDB(collectionName) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("database").collection(collectionName);
}
export async function PUT(request: Request) {
  try {
    const { donationId, beneficiaryEmail } = await request.json();

    if (!donationId) {
      return new Response(JSON.stringify({ error: "Missing beneficiaryId" }), {
        status: 400,
      });
    }

    const collection = await connectToDB("donations");

    // Update both the status and donor email
    const result = await collection.updateOne(
      { _id: new ObjectId(donationId) },
      { $set: { beneficiaryemail: beneficiaryEmail } } // Update the donor email field
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Donation not found" }), {
        status: 404,
      });
    }

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to update donation" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Donation updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating donation:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
