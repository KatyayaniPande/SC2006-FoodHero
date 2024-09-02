import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
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
  const db = client.db('database');
  return db.collection('requests');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const collection = await getCollection();
    // find donations made by donor with user.email
    const requests = await collection.find({ 'user.email': email }).toArray();
    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 404 }
    );
  }
}
