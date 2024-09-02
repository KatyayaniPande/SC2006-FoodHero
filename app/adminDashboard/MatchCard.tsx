import Image from "next/image";
import React from "react";

interface MatchCardProps {
  donorPic: string;
  beneficiaryPic: string;
  donorName: string;
  beneficiaryName: string;
  foodType: string;
  quantityDonated: string;
  quantityRequested: string;
  matchDate: string;
  onAccept: () => void;
  onReject: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  donorPic,
  beneficiaryPic,
  donorName,
  beneficiaryName,
  foodType,
  quantityDonated,
  quantityRequested,
  matchDate,
  onAccept,
  onReject,
}) => {
  return (
    <div className="flex items-center p-4 border border-gray-200 rounded-lg shadow-md bg-white">
      {/* Donor Section */}
      <div className="flex flex-col items-center flex-1 text-center p-2">
        <div className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-green-600 bg-white text-green-600">
          <p className="font-semibold">Donor</p>
        </div>
        <h2 className="mt-2 font-semibold text-gray-800">{donorName}</h2>
      </div>

      {/* Match Details */}
      <div className="flex flex-col items-center flex-1 text-center mx-4">
        <div className="mt-2">
          <p className="text-gray-600">
            <strong>Food Type:</strong> {foodType}
          </p>
          <p className="text-gray-600">
            <strong>Quantity Donated:</strong> {quantityDonated}
          </p>
          <p className="text-gray-600">
            <strong>Quantity Requested:</strong> {quantityRequested}
          </p>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={onAccept}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Beneficiary Section */}
      <div className="flex flex-col items-center flex-1 text-center p-2">
        <div className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-green-600 bg-white text-green-600">
          <p className="font-semibold">To</p>
        </div>
        <h2 className="mt-2 font-semibold text-gray-800">{beneficiaryName}</h2>
      </div>
    </div>
  );
};

export default MatchCard;
