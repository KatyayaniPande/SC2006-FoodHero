"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { IoLocation } from "react-icons/io5";
import MapComponent from "../adminDashboard/map"; // Import the map component

import { FaClock, FaUtensils, FaQuestionCircle } from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa6";
import { FaTruck } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
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
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(
    null
  );

  const [isCooked, setIsCooked] = useState(false);
  const [isSelfPickUp, setIsSelfPickUp] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  useEffect(() => {
    if (donation.foodType === "Cooked Food") {
      setIsCooked(true);
    }
    if (donation.deliveryMethod === "Scheduled Pickup") {
      setIsSelfPickUp(true);
    } else {
      setIsDelivery(true);
    }
  }, [donation]);

  const handleTakeOnDelivery = async () => {
    if (!donation._id) {
      alert("Donation ID is missing.");
      return;
    }

    try {
      const response = await fetch("/api/statusUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation._id, // Use the donation ID from the prop
          currentStatus: donation.status, // Pass the current status from the prop
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success: ${data.message}`);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the donation status.");
    }
  };

  const handleMarkAsDelivered = async () => {
    const confirmed = window.confirm("Have you delivered to the warehouse?");
    if (confirmed) {
      try {
        const response = await fetch("/api/statusUpdate", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donationId: donation._id, // Use the _id from the request object as donationId
            currentStatus: donation.status, // Pass the current status
          }),
        });
        if (response.ok) {
          const data = await response.json();
          alert(`Success: ${data.message}`);
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("An error occurred while updating the donation status.");
      }
    }
  };

  const handleDisplaymap = async () => {
    const dropOffLocation = donation.deliveryLocation; // Get the drop-off location address

    console.log("Fetching coordinates for delivery location:", dropOffLocation); // Debugging log

    try {
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          dropOffLocation
        )}`
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
    <Card
      shadow={false}
      className="relative mb-4 border border-black rounded-lg p-4"
    >
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
          <FaBowlFood className="inline-block mr-2" />
          {donation.foodName} {isCooked ? "" : `[${donation.foodCategory}]`}
        </Typography>
        <Typography className="mb-2">
          <AiOutlineNumber className="inline-block mr-2" />
          {isCooked
            ? `Number of servings: ${donation.numberOfServings}`
            : `Quantity: ${donation.quantity}`}
        </Typography>
        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Consume By: {donation.consumeByTiming || donation.bestBeforeDate}
        </Typography>
        <Typography className="mb-2">
          <FaRegStar className="inline-block mr-2" />
          Special Request: {donation.specialHandling}
        </Typography>
        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Drop-Off Time: {donation.needByTime}
        </Typography>
        <Typography className="mb-2">
          <IoLocation className="inline-block mr-2" />
          Drop-Off Location: {donation.deliveryLocation}
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        {donation.status === "awaitingdelivery" ? (
          <div className="flex space-x-4">
            {/* Button to mark as delivered */}
            <Button className="text-white" onClick={handleMarkAsDelivered}>
              Mark as Delivered
            </Button>

            {/* New button, only visible when the status is "awaitingdelivery" */}
            <Button className="text-white" onClick={handleDisplaymap}>
              Display Map
            </Button>
          </div>
        ) : (
          <Button className="text-white" onClick={handleTakeOnDelivery}>
            Take on this delivery
          </Button>
        )}
      </CardFooter>
      {showMap && deliveryCoords && (
        <div className="mt-4">
          <Typography variant="h6" className="mb-2">
            Map Route
          </Typography>
          <MapComponent deliveryLocation={deliveryCoords} />
        </div>
      )}
    </Card>
  );
};

export default SomeCard;
