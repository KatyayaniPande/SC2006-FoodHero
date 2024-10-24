import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

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

export async function POST(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const donations = client.db("database").collection("donations");

    if (body.foodType === "Non-Cooked Food") {
      const {
        user,
        foodType,
        consumeByTiming,
        foodCategory,
        foodImages,
        foodName,
        quantity,
        specialHandling,
        agencyName,
        status,
      } = body;

      // create a new donation object
      const newDonation = {
        foodCategory,
        foodImages,
        foodName,
        foodType,
        consumeByTiming,
        quantity,
        specialHandling,
        agencyName: agencyName || "",
        createdAt: new Date(),
        user: user,
        status: "new",
        donoremail: user.email,
        deliveryLocation: null,
        needByTime: null,
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
        consumeByTiming,
        foodImages,
        foodName,
        numberOfServings,
        specialHandling,
        agencyName,
        status,
      } = body;

      // create new donation object
      const newDonation = {
        user,
        foodType,
        consumeByTiming,
        foodImages,
        foodName,
        numberOfServings,
        specialHandling,
        agencyName: agencyName || "",
        createdAt: new Date(),
        status: "new",
        donoremail: user.email,
        deliveryLocation: null,
        needByTime: null,
      };

      // Insert the new donation into the "donations" collection
      const result = await donations.insertOne(newDonation);
      return new Response(
        JSON.stringify({ success: true, donationId: result.insertedId }),
        { status: 201 }
      );
    }
  } catch (e) {
    console.error("Error connecting to database", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}

export async function GET(request: Request) {
  try {
    await client.connect();
    const url = new URL(request.url);
    const id = url.searchParams.get("id"); // Get the donation ID from the query string
    const donations = client.db("database").collection("donations");

    if (id) {
      // Fetch a specific donation by its ID
      const donation = await donations.findOne({ _id: new ObjectId(id) });
      if (!donation) {
        return new Response(JSON.stringify({ error: "Donation not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(donation), { status: 200 });
    } else {
      // Fetch all donations if no specific ID is provided
      const allDonations = await donations.find({}).toArray();
      return new Response(JSON.stringify(allDonations), { status: 200 });
    }
  } catch (e) {
    console.error("Error fetching donations", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}

export async function PUT(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const donations = client.db("database").collection("donations");

    // Check for the donation ID in the request body
    const { id } = body;

    console.log(id);
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Donation ID is required" }),
        { status: 400 }
      );
    }

    // Check the food type and prepare the update object
    let updateObject;
    if (body.foodType === "Non-Cooked Food") {
      const {
        foodType,
        consumeByTiming,
        foodCategory,
        foodImages,
        foodName,
        quantity,
        specialHandling,
        agencyName,
        status,
      } = body;

      // Update object for Non-Cooked Food
      updateObject = {
        $set: {
          foodCategory,
          foodImages,
          foodName,
          foodType,
          consumeByTiming,
          quantity,
          specialHandling,
          agencyName: agencyName || "",
          status,
          updatedAt: new Date(), // Keep track of when the document was updated
        },
      };
    } else {
      const {
        foodType,
        consumeByTiming,
        foodImages,
        foodName,
        numberOfServings,
        specialHandling,
        agencyName,
        status,
      } = body;

      // Update object for Cooked Food
      updateObject = {
        $set: {
          consumeByTiming,
          foodImages,
          foodName,
          foodType,
          numberOfServings,
          specialHandling,
          agencyName: agencyName || "",
          status,
          updatedAt: new Date(),
        },
      };
    }

    // Update the donation with the new data
    const result = await donations.updateOne(
      { _id: new ObjectId(id) },
      updateObject
    );

    // If no documents were updated, return a 404 Not Found
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Donation not found" }), {
        status: 404,
      });
    }

    // Return a success response
    return new Response(JSON.stringify({ success: true, donationId: id }), {
      status: 200,
    });
  } catch (e) {
    console.error("Error updating donation:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
