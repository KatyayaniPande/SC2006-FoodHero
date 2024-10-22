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
} from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { Donation } from "./DonorDashboardClient"; // Adjust this import based on your structure
import { useState, useEffect } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { FaRegStar } from "react-icons/fa6";
import { FaTruck } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { getSession } from "next-auth/react";
import { Dialog } from "@headlessui/react"; // Import Dialog for the modal
import { Input } from "@/components/ui/input";

interface DonorCardProps {
  donation: Donation;
}
// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-300"; // New = Blue
    case "matched":
      return "bg-yellow-500"; // Matched = Yellow
    case "inwarehouse":
      return "bg-red-500"; // Matched = Yellow
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
const DonorCard: React.FC<DonorCardProps> = ({ donation }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(""); // Track the selected delivery date
  const [errors, setErrors] = useState({ location: "", date: "" }); // Track errors

  useEffect(() => {
    if (donation.foodType === "Cooked Food") {
      setIsCooked(true);
    }

    // if (donation.deliveryMethod === "Scheduled Pickup") {
    //   setIsSelfPickUp(true);
    //   setIsDelivery(false);
    // } else {
    //   setIsDelivery(true);
    //   setIsSelfPickUp(false);
    // }
  }, [donation]);

  const handleAcceptClick = () => {
    setIsModalOpen(true); // Open modal when Accept button is clicked
  };

  const handleConfirmSubmit = async () => {
    let validationErrors = { location: "", date: "" };

    // Validate Delivery Location
    if (!deliveryLocation) {
      validationErrors.location = "Delivery location is required.";
    }

    // Validate Delivery Date
    if (!deliveryDate) {
      validationErrors.date = "Delivery date is required.";
    }

    // If there are validation errors, update the state and stop the submission
    if (validationErrors.location || validationErrors.date) {
      setErrors(validationErrors);
      return;
    }
    if (!donation._id) {
      alert("Donation ID is missing.");
      return;
    }

    try {
      const session = await getSession();
      const beneficiaryEmail = session?.user?.email;

      const response = await fetch("/api/statusUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation._id, // Use the _id from the request object as donationId
          currentStatus: donation.status, // Pass the current status
          deliveryLocation: deliveryLocation, // Include an 'accept' action if necessary for logic differentiation
          needByTime: deliveryDate,
          method: "accept",
        }),
      });

      const beneificaryUpdateResponse = await fetch("/api/updateBeneficiary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation._id, // Use the same request._id
          beneficiaryEmail, // Update the donorEmail field in the DB
        }),
      });

      if (!beneificaryUpdateResponse.ok) {
        const errorData = await beneificaryUpdateResponse.json();
        alert(`Error updating beneficiary: ${errorData.error}`);
        return;
      }

      const beneificaryUpdateData = await beneificaryUpdateResponse.json();
      alert(`Beneficary Update Success: ${beneificaryUpdateData.message}`);

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
    setIsModalOpen(false); // Close modal after submission
  };

  return (
    <>
      <Card
        shadow={false}
        className="relative mb-4 border border-black rounded-lg p-4"
      >
        {/* Status Box */}
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
            {donation.foodName} {isCooked || `[${donation.foodCategory}]`}
          </Typography>

          <Typography className="mb-2">
            <AiOutlineNumber className="inline-block mr-2" />
            {isCooked
              ? `Number of servings: ${donation.numberOfServings}`
              : `Quantity: ${donation.quantity}`}
          </Typography>

          {isCooked && (
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Prepared On: {donation.timePrepared}
            </Typography>
          )}
          <Typography className="mb-2">
            <FaClock className="inline-block mr-2" />
            Best Before: {donation.consumeByTiming || donation.bestBeforeDate}
          </Typography>

          <Typography className="mb-2">
            <FaRegStar className="inline-block mr-2" />
            Special Handling:{" "}
            {donation.specialHandling || "No special handling required"}
          </Typography>
        </CardBody>

        <CardFooter className="pt-0">
          {donation.status === "new" && (
            <Button className="text-white bg-black" onClick={handleAcceptClick}>
              Accept
            </Button>
          )}
        </CardFooter>
      </Card>

      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Enter Delivery Details
              </Dialog.Title>
              <div className="mt-2">
                {/* Delivery Location */}
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Location
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}

                {/* Delivery Date */}
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Delivery Date
                </label>
                <Input
                  className="shadow-sm"
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Adds 2 days
                    .toISOString()
                    .slice(0, 16)} // Convert to 'YYYY-MM-DDTHH:MM' format
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <p className="text-red-500 text-sm mt-2">{errors.general}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  className="text-white bg-black"
                  onClick={handleConfirmSubmit}
                >
                  Confirm
                </Button>
                <Button
                  className="ml-2 text-white bg-black"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default DonorCard;
