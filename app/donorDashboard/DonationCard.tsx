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
import { DonationCardProps } from "./page";
import { AiOutlineNumber } from "react-icons/ai";
import { useState, useEffect } from "react";
import { FaRegStar } from "react-icons/fa6";
import { FaTruck } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";

const DonationCard: React.FC<DonationCardProps> = ({ donation }) => {
    console.log(donation);
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
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            shadow={false}
            className="relative mb-4 border border-black rounded-lg p-4"
        >
            <CardBody
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
            >
                {!isCooked && (
                    <Typography
                        variant="h5"
                        color="blue-gray"
                        className="mb-2"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                    >
                        <FaBowlFood className="inline-block mr-2" />
                        {donation.foodName} [{donation.foodCategory}]
                    </Typography>
                )}
                {isCooked && (
                    <Typography
                        variant="h5"
                        color="blue-gray"
                        className="mb-2"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                    >
                        <FaBowlFood className="inline-block mr-2" />
                        {donation.foodName}
                    </Typography>
                )}
                {!isCooked && (
                    <Typography
                        className="mb-2"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                    >
                        <AiOutlineNumber className="inline-block mr-2" />
                        Quantity: {donation.quantity}
                    </Typography>
                )}
                {isCooked && (
                    <Typography
                        className="mb-2"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                    >
                        <AiOutlineNumber className="inline-block mr-2" />
                        Number of servings: {donation.numberOfServings}
                    </Typography>
                )}
                <Typography
                    className="mb-2"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                >
                    <FaClock className="inline-block mr-2" />
                    Consume By: {donation.consumeByTiming}
                </Typography>
                <Typography
                    className="mb-2"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                >
                    <FaRegStar className="inline-block mr-2" />
                    Special Request: {donation.specialHandling}
                </Typography>
                {isDelivery && (
                    <Typography
                        className="mb-2"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                    >
                        <FaTruck className="inline-block mr-2" />
                        Delivery Method: {donation.deliveryMethod}
                    </Typography>
                )}
                {isSelfPickUp && (
                    <Typography
                        className="mb-2"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                    >
                        <FaPersonChalkboard className="inline-block mr-2" />
                        Delivery Method: {donation.deliveryMethod}
                    </Typography>
                )}
                {isSelfPickUp && (
                    <>
                        <Typography
                            className="mb-2"
                            placeholder=""
                            onPointerEnterCapture={() => {}}
                            onPointerLeaveCapture={() => {}}
                        >
                            <FaClock className="inline-block mr-2" />
                            Pick-up Time: {donation.pickUpTime}
                        </Typography>
                    </>
                )}
                {isDelivery && (
                    <>
                        <Typography
                            className="mb-2"
                            placeholder=""
                            onPointerEnterCapture={() => {}}
                            onPointerLeaveCapture={() => {}}
                        >
                            <FaClock className="inline-block mr-2" />
                            Drop-Off Time: {donation.dropOffTime}
                        </Typography>
                        <Typography
                            className="mb-2"
                            placeholder=""
                            onPointerEnterCapture={() => {}}
                            onPointerLeaveCapture={() => {}}
                        >
                            <IoLocation className="inline-block mr-2" />
                            Pick-Up Location: {donation.pickUpLocation}
                        </Typography>
                    </>
                )}
            </CardBody>
            <CardFooter
                className="pt-0"
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
            >
                <Button
                    className="text-white"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                >
                    Withdraw
                </Button>
            </CardFooter>
        </Card>
    );
};

export default DonationCard;
