import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from '@material-tailwind/react';
import {
  FaClock,
  FaTruck,
} from 'react-icons/fa';
import { FaBowlFood } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import { AiOutlineNumber } from 'react-icons/ai';
import { FaRegStar, FaPersonChalkboard } from 'react-icons/fa6';
import { IoLocation } from 'react-icons/io5';

// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-300'; // New = Light Blue
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
    deliveryTime?: string;
    deliveryLocation?: string;
    status: 'new' | 'matched' | 'awaitingpickup' | 'awaitingdelivery' | 'delivered';
  };
}

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isSelfCollection, setIsSelfCollection] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (request.foodType === 'Cooked Food') {
      setIsCooked(true);
    }

    if (request.deliveryMethod === 'Self-Collection') {
      setIsSelfCollection(true);
    } else {
      setIsDelivery(true);
    }
  }, [request]);

  const handleDonateClick = async () => {
    if (!request._id) {
      alert('Donation ID is missing.');
      return;
    }
    try {
      const response = await fetch('/api/statusUpdate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error updating status:', error);
      alert('An error occurred while updating the donation status.');
    }
  };

  return (
    <Card
      shadow={false}
      className='relative mb-4 border border-gray-300 rounded-lg p-4 bg-white'
    >
      {/* Status badge */}
      <div className={`absolute top-2 right-2 text-white text-sm font-semibold px-2 py-1 rounded-md ${getStatusColor(request.status)}`}>
        {request.status}
      </div>

      <CardBody>
        <Typography variant='h5' color='blue-gray' className='mb-2'>
          <FaBowlFood className='inline-block mr-2' />
          {request.foodName} {isCooked || `[${request.foodCategory}]`}
        </Typography>

        <Typography className='mb-2'>
          <AiOutlineNumber className='inline-block mr-2' />
          {isCooked ? `Number of servings: ${request.numberOfServings}` : `Quantity: ${request.quantity}`}
        </Typography>

        <Typography className='mb-2'>
          <FaClock className='inline-block mr-2' />
          Need by: {request.needByTime}
        </Typography>

        {request.specialRequest && (
          <Typography className='mb-2'>
            <FaRegStar className='inline-block mr-2' />
            Special Request: {request.specialRequest}
          </Typography>
        )}

        {isDelivery && (
          <>
            <Typography className='mb-2'>
              <FaTruck className='inline-block mr-2' />
              Delivery Method: {request.deliveryMethod}
            </Typography>
            <Typography className='mb-2'>
              <FaClock className='inline-block mr-2' />
              Delivery Time: {request.deliveryTime}
            </Typography>
            <Typography className='mb-2'>
              <IoLocation className='inline-block mr-2' />
              Delivery Location: {request.deliveryLocation}
            </Typography>
          </>
        )}

        {isSelfCollection && (
          <>
            <Typography className='mb-2'>
              <FaPersonChalkboard className='inline-block mr-2' />
              Delivery Method: {request.deliveryMethod}
            </Typography>
            <Typography className='mb-2'>
              <FaClock className='inline-block mr-2' />
              Pick-up Time: {request.deliveryTime}
            </Typography>
          </>
        )}
      </CardBody>

      <CardFooter className='pt-0'>
        <Button onClick={handleDonateClick} className='text-white bg-black'>
          Donate
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
