"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaClock, FaUtensils, FaQuestionCircle } from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { AiOutlineNumber } from "react-icons/ai";
import { useState, useEffect } from "react";
import { FaRegStar } from "react-icons/fa6";
import { FaTruck } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";

// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-300"; // New = Blue
    case "matched":
      return "bg-yellow-500"; // Matched = Yellow
    case "awaitingpickup":
      return "bg-orange-500"; // Awaiting Pickup = Orange
    case "awaitingdelivery":
      return "bg-purple-500"; // Awaiting Delivery = Purple
    case "delivered":
      return "bg-green-500"; // Delivered = Green
    default:
      return "bg-gray-500"; // Default = Gray
  }
};

const SomeCard = ({ donation }) => {
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
        <Button
          className="text-white"
          onClick={
            donation.status === "awaitingdelivery"
              ? handleMarkAsDelivered // If status is "awaitingdelivery", call this function
              : handleTakeOnDelivery // Otherwise, call the "Take on delivery" function
          }
        >
          {donation.status === "awaitingdelivery"
            ? "Mark as Delivered" // Change button text if status is "awaitingdelivery"
            : "Take on this delivery"}{" "}
          {/* Default button text */}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SomeCard;
