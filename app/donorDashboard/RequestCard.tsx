import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaClock, FaTruck } from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { FaRegStar, FaPersonChalkboard } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { getSession } from "next-auth/react";
import { MdNotificationImportant } from "react-icons/md";
import { Dialog } from "@headlessui/react"; // Import Dialog for the modal
import { Input } from "@/components/ui/input";
import { IoMdContact } from "react-icons/io";

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

interface RequestCardProps {
  request: {
    _id: string; // Ensure that _id (donationId) is included in the request object
    foodName: string;
    foodType: string;
    foodCategory?: string;
    numberOfServings?: number;
    quantity?: number;
    needByTime: string;
    specialRequest?: string;
    deliveryMethod: string;
    donoremail: string;
    deliveryTime?: string;
    deliveryLocation?: string;
    floorNumber: string;
    consumeByTiming: string;
    beneficiaryemail: string;
    status: "new" | "matched" | "awaitingdelivery" | "delivered";
  };
}

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isSelfCollection, setIsSelfCollection] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false); // New state to track deletion
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state
  const [consumeBy, setConsumeBy] = useState("");
  const [errors, setErrors] = useState({ consumeByDate: "" }); // Track errors
  const [beneficiaryData, setBeneficiaryData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchBeneficiaryData() {
      try {
        const response = await fetch(
          `/api/beneficiaryDetails?email=${request.beneficiaryemail}`
        );
        if (response.ok) {
          const data = await response.json();
          setBeneficiaryData(data);
        } else {
          console.error("Error fetching donor data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching donor data:", error);
      }
    }

    if (request.beneficiaryemail) {
      fetchBeneficiaryData();
    }
  }, [request.beneficiaryemail]);

  useEffect(() => {
    if (request.foodType === "Cooked Food") {
      setIsCooked(true);
    }

    if (request.deliveryMethod === "Self-Collection") {
      setIsSelfCollection(true);
    } else {
      setIsDelivery(true);
    }
  }, [request]);

  const handleConfirmSubmit = async () => {
    let validationErrors = { consumeByDate: "" };

    if (!request._id) {
      alert("Donation ID is missing.");
      return;
    }
    // Validate Delivery Location
    if (!consumeBy) {
      validationErrors.consumeByDate = "Consume by Date is required.";
    }

    // If there are validation errors, update the state and stop the submission
    if (validationErrors.consumeByDate) {
      setErrors(validationErrors);
      return;
    }
    try {
      const session = await getSession();
      const donorEmail = session?.user?.email;

      const response = await fetch("/api/statusUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: request._id, // Use the _id from the request object as donationId
          currentStatus: request.status, // Pass the current status
          // object: request,
          deliveryLocation: "",
          needByTime: consumeBy,
          method: "donate",
        }),
      });

      const donorUpdateResponse = await fetch("/api/updateDonor", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request._id, // Use the same request._id
          donorEmail, // Update the donorEmail field in the DB
        }),
      });

      if (!donorUpdateResponse.ok) {
        const errorData = await donorUpdateResponse.json();
        alert(`Error updating donor: ${errorData.error}`);
        return;
      }

      const donorUpdateData = await donorUpdateResponse.json();
      alert(`Donor Update Success: ${donorUpdateData.message}`);

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
            donationId: request._id, // Use the _id from the request object as donationId
            currentStatus: request.status, // Pass the current status
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

  const handleDonateClick = () => {
    setIsModalOpen(true); // Open modal when Accept button is clicked
  };

  return (
    <>
      <Card
        shadow={false}
        className="relative mb-4 border border-black rounded-lg p-4 bg-white"
      >
        {/* Status badge */}
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
            {request.foodName} {isCooked || `[${request.foodCategory}]`}
          </Typography>

          <Typography className="mb-2">
            <AiOutlineNumber className="inline-block mr-2" />
            {isCooked
              ? `Number of servings: ${request.numberOfServings}`
              : `Quantity: ${request.quantity}`}
          </Typography>

          <Typography className="mb-2">
            <FaClock className="inline-block mr-2" />
            {request.status === "new" ? (
              <>
                Need by:{" "}
                {(() => {
                  const needByDate = new Date(request.needByTime); // Convert to Date object

                  // Format the date and time to "October 25, 2024, 2:30 PM"
                  return needByDate.toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true, // Display in 12-hour format
                  });
                })()}
              </>
            ) : (
              <>
                Beneficiary needs the delivery by:{" "}
                {(() => {
                  const needByDate = new Date(request.needByTime); // Convert to Date object

                  // Format the needByTime to a more readable format
                  return needByDate.toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true, // Display in 12-hour format
                  });
                })()}
                .{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  Please deliver to our warehouse by:{" "}
                  {(() => {
                    const needByDate = new Date(request.needByTime); // Convert to Date object
                    needByDate.setDate(needByDate.getDate() - 1); // Subtract 1 day

                    // Format the date to "October 25, 2024"
                    return needByDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </span>
                .
              </>
            )}
          </Typography>

          {request.consumeByTiming && (
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Consume by:{" "}
              {(() => {
                const consumeByDate = new Date(request.consumeByTiming); // Convert to Date object

                // Format the date and time to "October 25, 2024, 2:30 PM"
                return consumeByDate.toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true, // Display in 12-hour format
                });
              })()}
            </Typography>
          )}
          {request.specialRequest && (
            <Typography className="mb-2">
              <FaRegStar className="inline-block mr-2" />
              Special Request: {request.specialRequest}
            </Typography>
          )}

          {/* {request.status === "matched" &&
            request.needByTime &&
            (() => {
              const currentDate = new Date();
              const needByDate = new Date(request.needByTime);

              // Calculate the difference in time
              const diffTime = needByDate.getTime() - currentDate.getTime();

              // Convert time difference to days
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              // Show the message only if it is 2 days or less before needByTime
              if (diffDays <= 2 && diffDays >= 0) {
                return (
                  <Typography className="mb-2 text-red-500">
                    <MdNotificationImportant className="inline-block mr-2" />
                    Please deliver to our warehouse 2 days before!
                  </Typography>
                );
              }
              return null; // Don't show the message if it's more than 2 days away
            })()} */}
          {request.status !== "new" && beneficiaryData && (
            <Typography className="mb-2">
              <IoMdContact className="inline-block mr-2" />
              Point of Contact: {beneficiaryData.poc_name}, Phone Number:{" "}
              {beneficiaryData.poc_phone}
            </Typography>
          )}
        </CardBody>

        <CardFooter className="pt-0">
          {request.status === "new" && (
            <Button
              onClick={handleDonateClick}
              className="text-white bg-custom-dark-green hover:bg-custom-darker-green"
            >
              Donate
            </Button>
          )}

          {request.status === "matched" && (
            <>
              <Button
                onClick={handleMarkAsDelivered}
                className="text-white bg-custom-dark-green hover:bg-custom-darker-green"
              >
                Mark as Delivered
              </Button>
            </>
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
                Enter Consume By Details
              </Dialog.Title>
              <div className="mt-2">
                {/* Delivery Date */}
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Consume By
                </label>
                <Input
                  className="shadow-sm"
                  type="datetime-local"
                  value={consumeBy}
                  onChange={(e) => setConsumeBy(e.target.value)}
                  min={
                    new Date(request.needByTime).toISOString().slice(0, 16) // Format request.needByTime to 'YYYY-MM-DDTHH:MM'
                  }
                />
                {errors.consumeByDate && (
                  <p className="text-red-500 text-sm">{errors.consumeByDate}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <p className="text-red-500 text-sm mt-2">{errors.general}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  className="text-white bg-custom-dark-green hover:bg-custom-darker-green"
                  onClick={handleConfirmSubmit}
                >
                  Confirm
                </Button>
                <Button
                  className="ml-2 text-black bg-white hover:bg-gray-100 border border-black"
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

export default RequestCard;
