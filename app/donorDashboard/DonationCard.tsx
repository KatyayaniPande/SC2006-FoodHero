"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  FaClock,
  FaRegStar,
  FaTruck,
  FaPersonChalkboard,
} from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { DonationCardProps } from "./page";
import { AiOutlineNumber } from "react-icons/ai";
import { useState, useEffect } from "react";
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

const DonationCard: React.FC<DonationCardProps> = ({ donation, onWithdraw }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isSelfPickUp, setIsSelfPickUp] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false); // New state to track deletion

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

    // Handler for the Withdraw button
  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to withdraw this donation?'
    );
    if (confirmed) {
      try {
        const response = await fetch(`/api/donations?id=${donation._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Donation deleted successfully
          alert('Donation withdrawn successfully.');
          setIsDeleted(true); // Update state to remove the card from UI
          // Optionally, you can call a parent function to refresh the donations list
          if (onWithdraw) onWithdraw(donation._id);
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting donation:', error);
        alert('An error occurred while withdrawing the donation.');
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
        {!isCooked && (
          <Typography variant="h5" color="blue-gray" className="mb-2">
            <FaBowlFood className="inline-block mr-2" />
            {donation.foodName} [{donation.foodCategory}]
          </Typography>
        )}
        {isCooked && (
          <Typography variant="h5" color="blue-gray" className="mb-2">
            <FaBowlFood className="inline-block mr-2" />
            {donation.foodName}
          </Typography>
        )}
        {!isCooked && (
          <Typography className="mb-2">
            <AiOutlineNumber className="inline-block mr-2" />
            Quantity: {donation.quantity}
          </Typography>
        )}
        {isCooked && (
          <Typography className="mb-2">
            <AiOutlineNumber className="inline-block mr-2" />
            Number of servings: {donation.numberOfServings}
          </Typography>
        )}
        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Consume By: {donation.consumeByTiming}
        </Typography>
        <Typography className="mb-2">
          <FaRegStar className="inline-block mr-2" />
          Special Request: {donation.specialHandling}
        </Typography>
        {isDelivery && (
          <Typography className="mb-2">
            <FaTruck className="inline-block mr-2" />
            Delivery Method: {donation.deliveryMethod}
          </Typography>
        )}
        {isSelfPickUp && (
          <Typography className="mb-2">
            <FaPersonChalkboard className="inline-block mr-2" />
            Delivery Method: {donation.deliveryMethod}
          </Typography>
        )}
        {isSelfPickUp && (
          <>
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Pick-up Time: {donation.pickUpTime}
            </Typography>
          </>
        )}
        {isDelivery && (
          <>
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Drop-Off Time: {donation.dropOffTime}
            </Typography>
            <Typography className="mb-2">
              <IoLocation className="inline-block mr-2" />
              Pick-Up Location: {donation.pickUpLocation}
            </Typography>
          </>
        )}
      </CardBody>
      <CardFooter className="pt-0">
        <Button className="text-white" onClick={handleWithdraw}>
          Withdraw
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DonationCard;
