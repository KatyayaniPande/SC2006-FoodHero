'use client';

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from '@material-tailwind/react';
import {
  FaClock,
  FaCalendarAlt,
  FaUtensils,
  FaQuestionCircle,
} from 'react-icons/fa';
import { FaBowlFood } from 'react-icons/fa6';
import { Donation } from './DonorDashboardClient'; // Adjust this import based on your structure
import { useState, useEffect } from 'react';
import { AiOutlineNumber } from 'react-icons/ai';
import { FaRegStar } from 'react-icons/fa6';
import { FaTruck } from 'react-icons/fa';
import { FaPersonChalkboard } from 'react-icons/fa6';
import { IoLocation } from 'react-icons/io5';

interface DonorCardProps {
  donation: Donation;
}
// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-500'; // New = Blue
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
const DonorCard: React.FC<DonorCardProps> = ({ donation }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isSelfPickUp, setIsSelfPickUp] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

  useEffect(() => {
    if (donation.foodType === 'Cooked Food') {
      setIsCooked(true);
    }

    if (donation.deliveryMethod === 'Scheduled Pickup') {
      setIsSelfPickUp(true);
      setIsDelivery(false);
    } else {
      setIsDelivery(true);
      setIsSelfPickUp(false);
    }
  }, [donation]);

  const handleAcceptClick = async () => {
    if (!donation._id) {
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
          donationId: donation._id, // Use the _id from the request object as donationId
          currentStatus: donation.status, // Pass the current status
          action: 'accept' // Include an 'accept' action if necessary for logic differentiation
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
    <Card shadow={false} className='relative mb-4 border border-black rounded-lg p-4'>
      {/* Status Box */}
      <div className={`absolute top-2 right-2 text-white text-sm font-semibold px-2 py-1 rounded-md ${getStatusColor(donation.status)}`}>
        {donation.status}
      </div>
      <CardBody>
        <Typography variant='h5' color='blue-gray' className='mb-2'>
          <FaBowlFood className='inline-block mr-2' />
          {donation.foodName} {isCooked || `[${donation.foodCategory}]`}
        </Typography>

        <Typography className='mb-2'>
          <AiOutlineNumber className='inline-block mr-2' />
          {isCooked ? `Number of servings: ${donation.numberOfServings}` : `Quantity: ${donation.quantity}`}
        </Typography>

        <Typography className='mb-2'>
          <FaClock className='inline-block mr-2' />
          Best Before: {donation.bestBeforeDate || 'No best before date specified'}
        </Typography>

        <Typography className='mb-2'>
          <FaRegStar className='inline-block mr-2' />
          Special Handling: {donation.specialHandling || 'No special handling required'}
        </Typography>

        {isDelivery && (
          <>
            <Typography className='mb-2'>
              <FaTruck className='inline-block mr-2' />
              Delivery Method: {donation.deliveryMethod}
            </Typography>
            <Typography className='mb-2'>
              <FaClock className='inline-block mr-2' />
              Drop-Off Time: {donation.dropOffTime}
            </Typography>
            <Typography className='mb-2'>
              <IoLocation className='inline-block mr-2' />
              Drop-Off Location: {donation.dropOffLocation || 'No drop-off location specified'}
            </Typography>
          </>
        )}

        {isSelfPickUp && (
          <>
            <Typography className='mb-2'>
              <FaPersonChalkboard className='inline-block mr-2' />
              Pick-up Time: {donation.pickUpTime || 'No pick-up time specified'}
            </Typography>
            <Typography className='mb-2'>
              <IoLocation className='inline-block mr-2' />
              Pick-up Location: {donation.pickUpLocation || 'No pick-up location specified'}
            </Typography>
          </>
        )}
      </CardBody>
      <CardFooter className='pt-0'>
        <Button className='text-white bg-black' onClick={handleAcceptClick}>
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DonorCard;
