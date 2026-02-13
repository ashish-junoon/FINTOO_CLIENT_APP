import React from "react";

const PanCard = ({
    name = "Ravi Kumar",
    dob = "01/01/1990",
    panNumber = "ABCDE1234F",
}) => {
    return (
        <div className="w-[300px] sm:w-[350px] bg-gradient-to-br from-blue-200 to-blue-400 border border-gray-400 rounded-md shadow-md px-5 py-2 md:py-5 text-xs text-black font-sans relative overflow-hidden">
            {/* Top Section */}
            <div className="flex justify-between items-center my-3 text-[11px]  md:text-md font-semibold">
                <div>
                    <p className="text-[#4b0082]">आयकर विभाग</p>
                    <p>INCOME TAX DEPARTMENT</p>
                </div>
                <div className="text-right">
                    <p className="text-[#4b0082]">भारत सरकार</p>
                    <p>GOVT. OF INDIA</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="mt-3 text-[11px] leading-snug">
                <p className="font-semibold text-sm">{name}</p>
                <p className="mb-4 text-sm"><strong>DOB:</strong> {dob}</p>
                <p className="text-center">
                    <span className="text-primary font-medium">Permanent Account Number</span><br />
                    <span className="tracking-widest text-base font-bold">{panNumber}</span>
                </p>
            </div>
        </div>
    );
};

export default PanCard;
