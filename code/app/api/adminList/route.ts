import { connect } from "http2";
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

// Function to connect to the database and collection
async function connectToDB(databaseName, collectionName) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(databaseName).collection(collectionName);
}
export async function GET(request) {
  try {
    // Connect to the approvedAdmins database and users collection
    const collection = await connectToDB("approvedAdmins", "users");

    // Find all users in the collection
    const users = await collection.find({}).toArray(); // toArray to get the actual list of users

    // Return the list of users as JSON
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    // Parse the incoming request to extract user data
    const body = await request.json();
    const { email, ...rest } = body;

    // Ensure the email is provided
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    // Connect to the approvedAdmins database and users collection
    const collection = await connectToDB("test", "users");

    // Check if a user with the same email already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      // If a user with the same email exists, return an error
      return new Response(
        JSON.stringify({ error: `${email} already exists` }),
        {
          status: 400, // Conflict status code
        }
      );
    }

    // If no user exists with this email, insert the new user
    const newUser = { email, ...rest }; // Construct the new user object with additional fields if needed

    const adminCollection = await connectToDB("approvedAdmins", "users");
    await adminCollection.insertOne(newUser);

    // Return a success response
    return new Response(
      JSON.stringify({ message: `${email} added successfully` }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user:", error);
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
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const usersCollection = await connectToDB("test", "users");
    const existingUser = await usersCollection.findOne({
      email,
      role: "admin",
    });
    const adminListCollection = await connectToDB("approvedAdmins", "users");

    if (!existingUser) {
      await adminListCollection.deleteOne({ email });
      return new Response(
        JSON.stringify({ message: `${email} deleted successfully` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      if (
        !existingUser.acceptedItems ||
        existingUser.acceptedItems.length === 0
      ) {
        await usersCollection.deleteOne({ email });
        await adminListCollection.deleteOne({ email });
        return new Response(
          JSON.stringify({ message: `${email} deleted successfully` }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const acceptedItemsIds = existingUser.acceptedItems.map(
        (id) => new ObjectId(id)
      );
      const donationsCollection = await connectToDB("database", "donations");
      const requestsCollection = await connectToDB("database", "requests");

      const pendingDonations = await donationsCollection
        .find({
          _id: { $in: acceptedItemsIds },
          status: { $ne: "delivered" },
        })
        .toArray();

      const pendingRequests = await requestsCollection
        .find({
          _id: { $in: acceptedItemsIds },
          status: { $ne: "delivered" },
        })
        .toArray();

      if (pendingDonations.length > 0 || pendingRequests.length > 0) {
        return new Response(
          JSON.stringify({
            error: `${email} cannot be deleted, there are pending items.`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      await usersCollection.deleteOne({ email });

      await adminListCollection.deleteOne({ email });

      return new Response(
        JSON.stringify({ message: `${email} deleted successfully` }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
