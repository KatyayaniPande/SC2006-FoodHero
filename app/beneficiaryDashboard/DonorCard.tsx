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

  return (
    <Card
      shadow={false}
      className='relative mb-4 border border-black rounded-lg p-4'
    >
      <CardBody>
        <Typography
          variant='h5'
          color='blue-gray'
          className='mb-2'
        >
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
        <Button className='text-white bg-black'>
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DonorCard;
