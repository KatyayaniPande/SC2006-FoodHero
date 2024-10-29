// pages/api/optimizeRoutes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { parse, format } from 'date-fns';
import moment from 'moment';
import { MongoClient } from 'mongodb';

const uri =
  'mongodb+srv://rwu:Wu123456@atlascluster.zs8ab.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const dbName = 'route';
const collectionName = 'delivery_task';

// Define your types if needed
interface Entry {
  'S/N': number;
  Donor: string;
  'Donation Type': string;
  Agency: string;
  'Source Address': string;
  'Source Geocode': string;
  'Destination Address': string;
  'Destination Geocode': string;
  'Pickup Time': string;
  'Delivery Time': string;
}

interface Coordinate {
  id: number;
  location: [number, number];
  time_windows: [number, number][];
}

interface RouteResponse {
  coordinates: {
    location: [number, number];
    arrivalTime: string;
    jobId: number;
  }[];
  geometry: string;
  color: string;
}

const timestampToTimeStr = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

const datetimeStrToTimestamp = (
  datetimeStr: string,
  formatStr: string = 'DD/MM/YYYY HH:mm'
): number => {
  const momentDate = moment(datetimeStr, formatStr);
  return momentDate.utc().unix();
};

const convertToOrsFormat = (
  data: Entry[],
  shiftStart: string = '08:00',
  shiftEnd: string = '23:00',
  dateStr: string = '27/08/2024'
): Coordinate[] => {
  const timeToTimestamp = (timeStr: string, dateStr: string): number => {
    const dtStr = `${dateStr} ${timeStr}`;
    const dtObj = parse(dtStr, 'dd/MM/yyyy HH:mm', new Date());
    return Math.floor(dtObj.getTime() / 1000);
  };

  const shiftStartTimestamp = timeToTimestamp(shiftStart, dateStr);
  const shiftEndTimestamp = timeToTimestamp(shiftEnd, dateStr);

  const coords: Coordinate[] = [];
  let idCounter = 1;

  data.forEach((entry) => {
    let pickupStartTimestamp: number;
    let pickupEndTimestamp: number;
    if (entry['Pickup Time'] !== 'Any Time') {
      const [pickupStart, pickupEnd] = entry['Pickup Time'].split('-');
      pickupStartTimestamp = timeToTimestamp(pickupStart, dateStr);
      pickupEndTimestamp = timeToTimestamp(pickupEnd, dateStr);
    } else {
      pickupStartTimestamp = shiftStartTimestamp;
      pickupEndTimestamp = shiftEndTimestamp;
    }

    let deliveryStartTimestamp: number;
    let deliveryEndTimestamp: number;
    if (entry['Delivery Time'] !== 'Any Time') {
      const [deliveryStart, deliveryEnd] = entry['Delivery Time'].split('-');
      deliveryStartTimestamp = timeToTimestamp(deliveryStart, dateStr);
      deliveryEndTimestamp = timeToTimestamp(deliveryEnd, dateStr);
    } else {
      deliveryStartTimestamp = pickupEndTimestamp;
      deliveryEndTimestamp = shiftEndTimestamp;
    }

    const sourceGeocode = entry['Source Geocode'].split(',').map(Number);
    coords.push({
      id: idCounter++,
      location: [sourceGeocode[1], sourceGeocode[0]],
      time_windows: [[pickupStartTimestamp, pickupEndTimestamp]],
    });

    const destinationGeocode = entry['Destination Geocode']
      .split(',')
      .map(Number);
    coords.push({
      id: idCounter++,
      location: [destinationGeocode[1], destinationGeocode[0]],
      time_windows: [[deliveryStartTimestamp, deliveryEndTimestamp]],
    });
  });

  return coords;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let client: MongoClient;

  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection<Entry>(collectionName);

    // Fetch tasks from MongoDB
    const tasks: Entry[] = await collection.find({}).toArray();

    // Convert tasks to ORS format
    const formattedData = convertToOrsFormat(tasks);

    // Send request to the optimization API
    const apiResponse = await axios.post(
      'https://api.openrouteservice.org/optimization',
      JSON.stringify({
        jobs: formattedData,
        vehicles: [
          {
            id: 1,
            profile: 'driving-car',
            start: [103.748576, 1.311294],
            end: [103.748576, 1.311294],
            capacity: [10],
            skills: [1, 14],
            time_window: [
              datetimeStrToTimestamp('27/08/2024 08:00'),
              datetimeStrToTimestamp('27/08/2024 13:00'),
            ],
          },
          {
            id: 2,
            profile: 'driving-car',
            start: [103.748576, 1.311294],
            end: [103.748576, 1.311294],
            capacity: [10],
            skills: [2, 14],
            time_window: [
              datetimeStrToTimestamp('27/08/2024 13:00'),
              datetimeStrToTimestamp('27/08/2024 18:00'),
            ],
          },
          {
            id: 3,
            profile: 'driving-car',
            start: [103.748576, 1.311294],
            end: [103.748576, 1.311294],
            capacity: [10],
            skills: [3, 14],
            time_window: [
              datetimeStrToTimestamp('27/08/2024 18:00'),
              datetimeStrToTimestamp('27/08/2024 23:00'),
            ],
          },
        ],
        options: {
          g: true,
        },
      }),
      {
        headers: {
          Accept:
            'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          Authorization:
            '5b3ce3597851110001cf624849a8b76e0ca043beb2b299204d411ef0',
          'Content-Type': 'application/json',
        },
      }
    );

    const lineColors: { [key: number]: string } = {
      1: 'green',
      2: 'orange',
      3: 'blue',
      4: 'yellow',
    };

    // Process the response data
    const routesData: RouteResponse[] = apiResponse.data.routes.map(
      (route: any) => ({
        coordinates: route.steps
          .filter((step: any) => step.type === 'job')
          .map((step: any) => ({
            location: step.location,
            arrivalTime: timestampToTimeStr(step.arrival),
            jobId: step.id,
          })),
        geometry: route.geometry, // Include geometry data for drawing the route
        color: lineColors[route.vehicle] || 'black',
      })
    );

    // Send the response back to the client
    res.status(200).json(routesData);
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Ensure the client is closed after operation
    if (client!) await client.close();
  }
}
