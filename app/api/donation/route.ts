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
    const donations = client.db('database').collection('donations');

    if (body.foodType === 'Non-Cooked Food') {
      const {
        user,
        foodType,
        deliveryMethod,
        dropOffTime,
        bestBeforeDate,
        foodCategory,
        foodImages,
        foodName,
        pickUpLocation,
        pickUpTime,
        quantity,
        specialHandling,
        agencyName,
        
      } = body;

      // create a new donation object
      const newDonation = {
        deliveryMethod,
        dropOffTime: dropOffTime || null,
        bestBeforeDate,
        foodCategory,
        foodImages,
        foodName,
        foodType,
        pickUpLocation: pickUpLocation || null,
        pickUpTime: pickUpTime || null,
        quantity,
        specialHandling,
        agencyName: agencyName || '',
        createdAt: new Date(),
        user: user
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
        user,
        foodType,
        deliveryMethod,
        dropOffTime,
        consumeByTiming,
        timePrepared,
        foodImages,
        foodName,
        pickUpLocation,
        pickUpTime,
        numberOfServings,
        specialHandling,
        agencyName,
      } = body;

      // create new donation object
      const newDonation = {
        user,
        foodType,
        deliveryMethod,
        dropOffTime: dropOffTime || null,
        consumeByTiming,
        timePrepared,
        foodImages,
        foodName,
        pickUpLocation: pickUpLocation || null,
        pickUpTime: pickUpTime || null,
        numberOfServings,
        specialHandling,
        agencyName: agencyName || '',
        createdAt: new Date(),
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
