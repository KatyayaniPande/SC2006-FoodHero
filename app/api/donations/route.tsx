import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Create a single instance of the MongoClient to be reused across requests
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

/**
 * Utility function to connect to the database and get the collection
 */
async function getCollection() {
  const client = await mongoClient.connect();
  const db = client.db('database');
  return db.collection('donations');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const collection = await getCollection();

    let donations;

    if (email) {
      // If email is provided, find donations for that specific user
      donations = await collection.find({ 'user.email': email }).toArray();
    } else {
      // If no email is provided, return all donations
      donations = await collection.find({}).toArray();
    }

    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Donation ID is required' },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json(
        { message: 'Donation deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Donation not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

