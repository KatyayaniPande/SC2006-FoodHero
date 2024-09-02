// pages/api/resetPoints.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

// MongoDB connection details
const uri =
  'mongodb+srv://rwu:Wu123456@atlascluster.zs8ab.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const dbName = 'database';
const agencyScoreCollection = 'agency';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { entityName } = req.query;

  if (!entityName) {
    return res.status(400).json({ error: 'Entity name is required' });
  }

  let client: MongoClient;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(agencyScoreCollection);

    // Reset the score to zero for the specified entity
    const result = await collection.updateOne(
      { entityName: entityName.toString() },
      { $set: { score: 0 } }
    );

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ message: `Points for ${entityName} have been reset.` });
    } else {
      res
        .status(404)
        .json({ error: `Entity with name ${entityName} not found.` });
    }
  } catch (error) {
    console.error('Error resetting points:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // if (client) await client.close();
  }
}
