import { MongoClient, ServerApiVersion } from 'mongodb';

// Your MongoDB URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Environment variable MONGODB_URI is not defined');
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

export async function POST(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const feedbackCollection = client.db('yourDatabaseName').collection('feedback'); // Add feedback collection

    const { name, email, subject, message } = body;

    // Create a new feedback object
    const newFeedback = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
    };

    // Insert the feedback into the "feedback" collection
    const result = await feedbackCollection.insertOne(newFeedback);
    return new Response(
      JSON.stringify({ success: true, feedbackId: result.insertedId }),
      { status: 201 }
    );
  } catch (e) {
    console.error('Error connecting to database', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
