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
async function connectToDB(collectionName) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("test").collection(collectionName);
}

// GET handler to fetch admin details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter: email is required" }),
        { status: 400 }
      );
    }

    const collection = await connectToDB("users");

    // Find the user by email and ensure their role is 'admin'
    const admin = await collection.findOne({ email: email, role: 'admin' });

    if (!admin) {
      return new Response(JSON.stringify({ error: "Admin not found or role mismatch" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ email: admin.email }), { status: 200 });
  } catch (error) {
    console.error("Error fetching admin details:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// POST handler to update admin email
export async function POST(request) {
    try {
      const body = await request.json();
      const { email, currentEmail } = body;
      if (!email || !currentEmail) {
        return new Response(JSON.stringify({ error: "Missing required fields: email or currentEmail" }), {
          status: 400,
        });
      }
      
      const collection = await connectToDB("users");
  

      // Check if the new email already exists
      const existingUser = await collection.findOne({ email: email });
  
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: `The email ${email} is already in use by another user` }),
          { status: 400 }
        );
      }
  
      // Proceed with updating the admin email
      const result = await collection.updateOne(
        { role: 'admin' }, // Match the admin by role (you can add the old email if necessary)
        {
          $set: {
            email: email, // Update the email
          },
        }
      );
  
      if (result.matchedCount === 0) {
        return new Response(
          JSON.stringify({ error: "Admin not found or role mismatch" }),
          { status: 404 }
        );
      }
  
      return new Response(JSON.stringify({ message: "Admin email updated successfully" }), {
        status: 200,
      });
    } catch (error) {
      console.error("Error updating admin email:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }
  
