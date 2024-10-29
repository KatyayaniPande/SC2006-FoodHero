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
    const donations = client.db("database").collection("requests");

    if (body.foodType === "Non-Cooked Food") {
      const {
        donoremail,
        status,
        foodType,
        needByTime,
        foodCategory,
        foodName,
        deliveryLocation,
        floorNumber,
        quantity,
        specialRequest,
        user,
      } = body;

      // create a new donation object
      const newDonation = {
        donoremail,
        status,
        foodType,
        foodCategory,
        foodName,
        deliveryLocation: deliveryLocation,
        floorNumber,
        needByTime: needByTime,
        quantity,
        specialRequest,
        user,
        beneficiaryemail: user.email,
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
        donoremail,
        status,
        foodType,
        needByTime,
        foodCategory,
        foodName,
        deliveryLocation,
        floorNumber,
        numberOfServings,
        specialRequest,
        user,
      } = body;

      // create new donation object
      const newDonation = {
        donoremail,
        status,
        foodType,
        foodCategory,
        foodName,
        deliveryLocation: deliveryLocation,
        floorNumber,
        needByTime: needByTime,
        numberOfServings,
        specialRequest,
        createdAt: new Date(),
        user,
        beneficiaryemail: user.email,
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
    const requests = client.db("database").collection("requests");
    // console.log(id);

    if (id) {
      // Fetch a specific donation by its ID
      const request = await requests.findOne({ _id: new ObjectId(id) });
      if (!request) {
        return new Response(JSON.stringify({ error: "Request not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(request), { status: 200 });
    } else {
      // Fetch all donations if no specific ID is provided
      const allRequests = await requests.find({}).toArray();
      return new Response(JSON.stringify(allRequests), { status: 200 });
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
    const requests = client.db("database").collection("requests");

    // Check for the request ID in the request body
    const { id } = body;

    console.log(id);
    if (!id) {
      return new Response(JSON.stringify({ error: "Request ID is required" }), {
        status: 400,
      });
    }

    // Check the food type and prepare the update object
    let updateObject;
    if (body.foodType === "Non-Cooked Food") {
      const {
        needByTime,
        deliveryLocation,
        floorNumber,
        foodCategory,
        foodType,
        foodName,
        quantity,
        specialRequest,
      } = body;

      // Update object for Non-Cooked Food
      updateObject = {
        $set: {
          needByTime,
          deliveryLocation,
          floorNumber,
          foodCategory,
          foodType,
          foodName,
          quantity,
          specialRequest,
          updatedAt: new Date(), // Keep track of when the document was updated
        },
      };
    } else {
      const {
        needByTime,
        foodName,
        numberOfServings,
        foodType,
        specialRequest,
        foodCategory,
        deliveryLocation,
        floorNumber,
      } = body;

      // Update object for Cooked Food
      updateObject = {
        $set: {
          needByTime,
          foodName,
          numberOfServings,
          foodType,
          specialRequest,
          foodCategory,
          deliveryLocation,
          floorNumber,
          updatedAt: new Date(),
        },
      };
    }

    console.log(updateObject);

    // Update the donation with the new data
    const result = await requests.updateOne(
      { _id: new ObjectId(id) },
      updateObject
    );

    // If no documents were updated, return a 404 Not Found
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
      });
    }

    // Return a success response
    return new Response(JSON.stringify({ success: true, requestId: id }), {
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
