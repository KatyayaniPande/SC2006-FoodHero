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
    const donations = client.db('database').collection('requests');

    if (body.foodType === 'Non-Cooked Food') {
      const {
        foodType,
        deliveryMethod,
        needByTime,
        foodCategory,
        foodName,
        deliveryLocation,
        deliveryTime,
        quantity,
        specialRequest,
        user,
      } = body;

      // create a new donation object
      const newDonation = {
        foodType,
        deliveryMethod,
        needByTime,
        foodCategory,
        foodName,
        deliveryLocation,
        deliveryTime,
        quantity,
        specialRequest,
        user,
      };

      // Insert the new donation into the "donations" collection
      const result = await donations.insertOne(newDonation);
      return new Response(
        JSON.stringify({ success: true, donationId: result.insertedId }),
        { status: 201 }
      );
    } else {
      // foodType is cooked food
      const {
        foodType,
        deliveryMethod,
        needByTime,
        foodCategory,
        foodName,
        deliveryLocation,
        deliveryTime,
        numberOfServings,
        specialRequest,
        user,
      } = body;

      // create new donation object
      const newDonation = {
        foodType,
        deliveryMethod,
        needByTime: needByTime || null,
        foodCategory,
        foodName,
        deliveryLocation: deliveryLocation || null,
        deliveryTime: deliveryTime || null,
        numberOfServings,
        specialRequest,
        createdAt: new Date(),
        user,
      };

      // Insert the new donation into the "donations" collection
      const result = await donations.insertOne(newDonation);
      return new Response(
        JSON.stringify({ success: true, donationId: result.insertedId }),
        { status: 201 }
      );
    }
  } catch (e) {
    console.error('Error connecting to database', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
