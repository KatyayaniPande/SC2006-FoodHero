'use client';

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { IoLocation } from "react-icons/io5";
import MapComponent from '../adminDashboard/map'; // Import the map component

// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-300";
    case "matched":
      return "bg-yellow-500";
    case "awaitingpickup":
      return "bg-orange-500";
    case "awaitingdelivery":
      return "bg-purple-500";
    case "delivered":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const SomeCard = ({ donation }) => {
  const [showMap, setShowMap] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(null);

  const handleTakeOnDelivery = async () => {
    const dropOffLocation = donation.deliveryLocation; // Get the drop-off location address

    console.log("Fetching coordinates for delivery location:", dropOffLocation); // Debugging log

    try {
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropOffLocation)}`
      );
      const data = await nominatimResponse.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        console.log("Coordinates found:", { lat, lon }); // Debugging log
        setDeliveryCoords([parseFloat(lat), parseFloat(lon)]); // Set the delivery coordinates
        setShowMap(true); // Show the map after geocoding
      } else {
        alert("Could not find coordinates for the provided address.");
        console.log("No coordinates found for the address:", dropOffLocation); // Debugging log
      }
    } catch (error) {
      console.error("Error fetching geocoding data:", error);
      alert("Error fetching location coordinates.");
    }
  };

  return (
    <>
      <Card shadow={false} className="relative mb-4 border border-black rounded-lg p-4">
        {/* Status badge */}
        <div
          className={`absolute top-2 right-2 text-black text-sm font-semibold px-2 py-1 rounded-md ${getStatusColor(
            donation.status
          )}`}
        >
          {donation.status}
        </div>

        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-2">
            {donation.foodName}
          </Typography>

          <Typography className="mb-2">
            <AiOutlineNumber className="inline-block mr-2" />
            {`Quantity: ${donation.quantity}`}
          </Typography>

          <Typography className="mb-2">
            <IoLocation className="inline-block mr-2" />
            Drop-Off Location: {donation.deliveryLocation}
          </Typography>
        </CardBody>

        <CardFooter className="pt-0">
          <Button className="text-white" onClick={handleTakeOnDelivery}>
            Take on this delivery
          </Button>
        </CardFooter>
      </Card>

      {showMap && deliveryCoords && (
        <div>
          <Typography variant="h6" className="mb-2">Map Route</Typography>
          <MapComponent deliveryLocation={deliveryCoords} />
        </div>
      )}
    </>
  );
};

export default SomeCard;
