// pages/api/matchOrders.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Db, MongoClient, Collection } from 'mongodb';

// MongoDB connection details
const uri =
  'mongodb+srv://rwu:Wu123456@atlascluster.zs8ab.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const dbName = 'database';
const donationsCollection = 'donations';
const requestsCollection = 'requests';
const agencyScoreCollection = 'agency';
const entityCollection = 'entities';

// Updated Donation Interface
interface Donation {
  _id: string;
  deliveryMethod: string; // "Self-Delivery" or "pickup"
  dropOffTime: string | null;
  expiryDate: string | null;
  foodCategory: string; // e.g., "Canned Food"
  foodImages: string[]; // Array of image URLs, can be empty
  foodName: string; // e.g., "Meat"
  foodType: string; // e.g., "Cooked Food"
  pickUpLocation: string | null;
  pickUpTime: string | null;
  quantity: number; // e.g., 1 (units or kg)
  specialHandling: string; // e.g., special instructions for handling
  createdAt: string;
  user: {
    email: string;
    agency: string; // e.g., "Donor"
    address: string; // e.g., "Central"
    poc_name: string; // Point of contact name, e.g., "Bread Talk (HQ)"
    poc_phone: string; // Point of contact phone, e.g., "98928348"
    halal_certification: boolean;
    hygiene_certification: boolean;
    role: string; // e.g., "Donor"
  };
}

// Updated Request Interface
interface Request {
  _id: string;
  foodType: string; // e.g., "Non-Cooked Food"
  deliveryMethod: string; // e.g., "Scheduled Delivery"
  needByTime: string; // e.g., "1999-01-10T22:10"
  foodCategory: string; // e.g., "Fruits"
  foodName: string; // e.g., "Strawberry"
  deliveryLocation: string; // e.g., "somewhere in Singapore"
  deliveryTime: string; // e.g., "1222-12-12T10:10"
  quantity: number; // e.g., 100 (units or kg)
  specialRequest: string; // e.g., "sliced"
  user: {
    email: string;
    agency: string; // e.g., "Donor"
    uen: string; // e.g., "12345678X"
    address: string; // e.g., "123 Street"
    poc_name: string; // Point of contact name, e.g., "Society of Sheng Hong Welfare Services @ Hougang"
    poc_phone: string; // Point of contact phone, e.g., "91234567"
    halal_certification: boolean;
    hygiene_certification: string; // e.g., "C"
    role: string; // e.g., "Donor"
  };
}

// Updated EntityLocation Interface
interface EntityLocation {
  entityName: string; // e.g., "Society of Sheng Hong Welfare Services @ Hougang"
  entityAddress: string; // e.g., "Blk 237 Hougang St 21 #01-406 Singapore 530237"
  Geo_location: [number, number]; // [longitude, latitude] coordinates, e.g., [103.888708, 1.356995]
}

interface AgencyScore {
  entityName: string;
  score: number;
}

// Validity check function
const checkMatchValidity = (donation: Donation, request: Request): boolean => {
  if (
    donation.foodType !== request.foodType ||
    donation.foodCategory !== request.foodCategory ||
    donation.deliveryMethod !== request.deliveryMethod
  ) {
    return false;
  }

  if (
    donation.deliveryMethod === 'selfDelivery' &&
    donation.dropOffTime &&
    new Date(donation.dropOffTime) > new Date(request.needByTime)
  ) {
    return false;
  }

  if (
    donation.deliveryMethod === 'pickup' &&
    donation.pickUpTime &&
    new Date(donation.pickUpTime) > new Date(request.deliveryTime)
  ) {
    return false;
  }
  if (request.user.halal_certification && !donation.user.halal_certification) {
    return false;
  }

  return true;
};

// Basic Cartesian distance calculation (Euclidean distance)
const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  return Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
};

// Calculate match score based on quantity and distance
const calculateMatchScore = async (
  donation: Donation,
  request: Request,
  db: Db
): Promise<number> => {
  let score = 0;

  const entities: Collection<EntityLocation> = db.collection(entityCollection);

  // Retrieve coordinates for donation (based on user.poc_name) and request entities
  const donationEntity = await entities.findOne({
    entityName: donation.user.poc_name,
  });
  const requestEntity = await entities.findOne({
    entityName: request.user.poc_name,
  });

  if (donationEntity && requestEntity) {
    const distance = calculateDistance(
      donationEntity.Geo_location,
      requestEntity.Geo_location
    );

    // Add more points the closer the distance is (inverse relationship)
    score += Math.max(0, 50 - distance); // Example: max score of 50 for zero distance, decreases with distance
  }

  // Quantity score, the closer it is, the better
  if (Math.abs(donation.quantity - request.quantity) <= 50) {
    // Assuming 50 kg/unit tolerance
    score += 50 - Math.abs(donation.quantity - request.quantity);
  }

  return score;
};

// Main handler for matching donations and requests
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let client: MongoClient;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const donations = await db
      .collection<Donation>(donationsCollection)
      .find({})
      .toArray();
    const requests = await db
      .collection<Request>(requestsCollection)
      .find({})
      .toArray();
    const agencyScores = await db
      .collection<AgencyScore>(agencyScoreCollection)
      .find({})
      .toArray();

    // Create the matches pair and check match validity before calculating score
    const matches = [];

    for (const donation of donations) {
      const potentialMatches = requests
        .filter((request) => checkMatchValidity(donation, request))
        .map(async (request) => ({
          request,
          score: await calculateMatchScore(donation, request, db),
        }));

      if (potentialMatches.length > 0) {
        const resolvedMatches = await Promise.all(potentialMatches);

        resolvedMatches.forEach(async (match) => {
          // Check if the agency already exists in the score collection
          let agencyScore = await db
            .collection<AgencyScore>(agencyScoreCollection)
            .findOne({ entityName: match.request.user.poc_name });

          if (agencyScore) {
            // Update the existing score
            agencyScore.score += match.score;
            await db
              .collection<AgencyScore>(agencyScoreCollection)
              .updateOne(
                { entityName: match.request.user.poc_name },
                { $set: { score: agencyScore.score } }
              );
          } else {
            // Create a new entry for the agency score
            await db.collection<AgencyScore>(agencyScoreCollection).insertOne({
              entityName: match.request.user.poc_name,
              score: match.score,
            });
          }
        });

        // Find the best match for the current donation
        resolvedMatches.sort((a, b) => b.score - a.score);
        console.log("hiiii", resolvedMatches);
        const bestMatch = resolvedMatches[0];

        matches.push({
          donation,
          bestMatch: bestMatch.request,
          score: bestMatch.score,
        });
      }
    }

    // Return the best match for each donation

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error matching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // if (client) await client.close();
  }
}
