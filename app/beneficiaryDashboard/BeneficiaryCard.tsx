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
  FaCalendarAlt,
  FaUtensils,
  FaQuestionCircle,
  FaTruck,
} from "react-icons/fa";
import { FaBowlFood, FaRegStar, FaPersonChalkboard } from "react-icons/fa6";
import { AiOutlineNumber } from "react-icons/ai";
import { IoLocation } from "react-icons/io5";
import { Request } from "./BeneficiaryDashboardClient";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams

interface RequestCardProps {
  request: Request;
  onDelete?: (id: string) => void;
}

// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-300"; // New = Blue
    case "matched":
      return "bg-yellow-500"; // Matched = Yellow
    case "inwarehouse":
      return "bg-green-500"; // In Warehouse = Green
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

const BeneficiaryCard: React.FC<RequestCardProps> = ({ request, onDelete }) => {
  // Hooks
  const [isCooked, setIsCooked] = useState(false);
  const [isSelfCollection, setIsSelfCollection] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();

  // Effects
  useEffect(() => {
    setIsCooked(request.foodType === "Cooked Food");
    setIsSelfCollection(request.deliveryMethod === "Self-Collection");
    setIsDelivery(request.deliveryMethod !== "Self-Collection");
  }, [request]);

  // Early return after hooks
  if (isDeleted) return null;

  // Handler for deleting the request
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this request?"
    );
    if (confirmed) {
      try {
        const response = await fetch(`/api/requests?id=${request._id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Request deleted successfully.");
          setIsDeleted(true);
          if (onDelete) onDelete(request._id);
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("An error occurred while deleting the request.");
      }
    }
  };

  // Component render
  return (
    <Card
      shadow={false}
      className="relative mb-4 border border-black rounded-lg p-4"
    >
      <div
        className={`absolute top-2 right-2 text-black text-sm font-semibold px-2 py-1 rounded-md ${getStatusColor(
          request.status
        )}`}
      >
        {request.status}
      </div>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          <FaBowlFood className="inline-block mr-2" />
          {request.foodName} {!isCooked && `[${request.foodCategory}]`}
        </Typography>

        <Typography className="mb-2">
          <AiOutlineNumber className="inline-block mr-2" />
          {isCooked
            ? `Number of servings: ${request.numberOfServings}`
            : `Quantity: ${request.quantity}`}
        </Typography>

        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Need by: {request.needByTime}
        </Typography>

        {request.consumeByTiming && (
          <Typography className="mb-2">
            <FaClock className="inline-block mr-2" />
            Consume by: {request.consumeByTiming}
          </Typography>
        )}

        {request.specialRequest && (
          <Typography className="mb-2">
            <FaRegStar className="inline-block mr-2" />
            Special Request: {request.specialRequest}
          </Typography>
        )}

        <Typography className="mb-2">
          <IoLocation className="inline-block mr-2" />
          Delivery Location: {request.deliveryLocation}
        </Typography>

        {request.floorNumber && (
          <Typography className="mb-2">
            <IoLocation className="inline-block mr-2" />
            Unit Number: {request.floorNumber}
          </Typography>
        )}

        {/* {isDelivery && (
          <>
            <Typography className="mb-2">
              <FaTruck className="inline-block mr-2" />
              Delivery Method: {request.deliveryMethod}
            </Typography>
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Delivery Time: {request.deliveryTime}
            </Typography>
            <Typography className="mb-2">
              <IoLocation className="inline-block mr-2" />
              Delivery Location: {request.deliveryLocation}
            </Typography>
          </>
        )} */}

        {/* {isSelfCollection && (
          <>
            <Typography className="mb-2">
              <FaPersonChalkboard className="inline-block mr-2" />
              Delivery Method: {request.deliveryMethod}
            </Typography>
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Pick-up Time: {request.deliveryTime}
            </Typography>
          </>
        )} */}
      </CardBody>
      <CardFooter className="pt-0">
        {request.status === "new" && (
          <div className="flex space-x-2">
            <Button
              className="text-white bg-custom-dark-green hover:bg-custom-darker-green"
              onClick={() => router.push(`/request?id=${request._id}`)}
            >
              Edit Details
            </Button>
            <Button className="text-black bg-white hover:bg-gray-100 border border-black" onClick={handleDelete}>
              Withdraw
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BeneficiaryCard;
