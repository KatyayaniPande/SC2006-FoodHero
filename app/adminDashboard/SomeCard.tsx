'use client';

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  FaClock,
  FaUtensils,
  FaQuestionCircle,
} from "react-icons/fa";
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
    case 'new':
      return 'bg-blue-300'; // New = Blue
    case 'matched':
      return 'bg-yellow-500'; // Matched = Yellow
    case 'awaitingpickup':
      return 'bg-orange-500'; // Awaiting Pickup = Orange
    case 'awaitingdelivery':
      return 'bg-purple-500'; // Awaiting Delivery = Purple
    case 'delivered':
      return 'bg-green-500'; // Delivered = Green
    default:
      return 'bg-gray-500'; // Default = Gray
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

  return (
    <Card
      shadow={false}
      className="relative mb-4 border border-black rounded-lg p-4"
    >
      {/* Status badge */}
      <div className={`absolute top-2 right-2 text-black text-sm font-semibold px-2 py-1 rounded-md ${getStatusColor(donation.status)}`}>
        {donation.status}
      </div>

      <CardBody>
        <Typography
          variant="h5"
          color="blue-gray"
          className="mb-2"
        >
          <FaBowlFood className="inline-block mr-2" />
          {donation.foodName} {isCooked ? "" : `[${donation.foodCategory}]`}
        </Typography>

        <Typography className="mb-2">
          <AiOutlineNumber className="inline-block mr-2" />
          {isCooked ? `Number of servings: ${donation.numberOfServings}` : `Quantity: ${donation.quantity}`}
        </Typography>

        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Consume By: {donation.consumeByTiming}
        </Typography>

        <Typography className="mb-2">
          <FaRegStar className="inline-block mr-2" />
          Special Request: {donation.specialHandling}
        </Typography>

        {isDelivery && (
          <>
            <Typography className="mb-2">
              <FaTruck className="inline-block mr-2" />
              Delivery Method: {donation.deliveryMethod}
            </Typography>
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

        {isSelfPickUp && (
          <>
            <Typography className="mb-2">
              <FaPersonChalkboard className="inline-block mr-2" />
              Delivery Method: {donation.deliveryMethod}
            </Typography>
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Pick-up Time: {donation.pickUpTime}
            </Typography>
          </>
        )}
      </CardBody>

      <CardFooter className="pt-0">
        <Button className="text-white">
          Withdraw
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SomeCard;
