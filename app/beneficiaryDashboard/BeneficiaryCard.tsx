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
import { Request } from './BeneficiaryDashboardClient';
import { useState, useEffect } from 'react';
import { AiOutlineNumber } from 'react-icons/ai';
import { FaRegStar } from 'react-icons/fa6';
import { FaTruck } from 'react-icons/fa';
import { FaPersonChalkboard } from 'react-icons/fa6';
import { IoLocation } from 'react-icons/io5';

interface RequestCardProps {
  request: Request;
}

const BeneficiaryCard: React.FC<RequestCardProps> = ({ request }) => {
  console.log(request);
  const [isCooked, setIsCooked] = useState(false);
  const [isSelfCollection, setIsSelfCollection] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

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

  return (
    <Card
      placeholder=''
      onPointerEnterCapture={() => {}}
      onPointerLeaveCapture={() => {}}
      shadow={false}
      className='relative mb-4 border border-black rounded-lg p-4'
    >
      <CardBody
        placeholder=''
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
      >
        {!isCooked && (
          <Typography
            variant='h5'
            color='blue-gray'
            className='mb-2'
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <FaBowlFood className='inline-block mr-2' />
            {request.foodName} [{request.foodCategory}]
          </Typography>
        )}
        {isCooked && (
          <Typography
            variant='h5'
            color='blue-gray'
            className='mb-2'
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <FaBowlFood className='inline-block mr-2' />
            {request.foodName}
          </Typography>
        )}
        {!isCooked && (
          <Typography
            className='mb-2'
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <AiOutlineNumber className='inline-block mr-2' />
            Quantity: {request.quantity}
          </Typography>
        )}
        {isCooked && (
          <Typography
            className='mb-2'
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <AiOutlineNumber className='inline-block mr-2' />
            Number of servings: {request.numberOfServings}
          </Typography>
        )}
        <Typography
          className='mb-2'
          placeholder=''
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
        >
          <FaClock className='inline-block mr-2' />
          Need by: {request.needByTime}
        </Typography>
        <Typography
          className='mb-2'
          placeholder=''
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
        >
          <FaRegStar className='inline-block mr-2' />
          Special Request: {request.specialRequest}
        </Typography>
        {isDelivery && (
          <Typography
            className='mb-2'
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <FaTruck className='inline-block mr-2' />
            Delivery Method: {request.deliveryMethod}
          </Typography>
        )}
        {isSelfCollection && (
          <Typography
            className='mb-2'
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <FaPersonChalkboard className='inline-block mr-2' />
            Delivery Method: {request.deliveryMethod}
          </Typography>
        )}
        {isSelfCollection && (
          <>
            <Typography
              className='mb-2'
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              <FaClock className='inline-block mr-2' />
              Pick-up Time: {request.deliveryTime}
            </Typography>
          </>
        )}
        {isDelivery && (
          <>
            <Typography
              className='mb-2'
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              <FaClock className='inline-block mr-2' />
              Delivery Time: {request.deliveryTime}
            </Typography>
            <Typography
              className='mb-2'
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              <IoLocation className='inline-block mr-2' />
              Delivery Location: {request.deliveryLocation}
            </Typography>
          </>
        )}
      </CardBody>
      <CardFooter
        className='pt-0'
        placeholder=''
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
      >
        <Button
          className='text-black'
          placeholder=''
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
        >
          withdraw
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BeneficiaryCard;
