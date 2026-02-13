import React from "react";
import Images from "../content/Images";

const AdharCard = ({
    name,
    dob,
    gender,
    aadhaarNumber,

}) => {
    return (
        <div className="w-[300px] sm:w-[350px] bg-white border border-gray-300 rounded-md shadow-sm px-4 py-1 text-xs font-sans">
            {/* Header */}
            <div className="flex justify-between items-center">
                {/* <img src="https://www.presentations.gov.in/wp-content/uploads/2020/01/NE_Preview1.png" alt="India Emblem" className="h-10 xl:h-12" /> */}
                <img src={Images.adhar1} alt="India Emblem" className="h-10 xl:h-12" />
                <div className="text-center flex-1">
                    {/* <div className="text-[10px] text-black font-semibold">
                        <span className="text-[#ff9933]">■■■</span>{" "}
                        <span className="bg-gradient-to-r from-[#ff9933] via-white to-[#138808] px-5 py-2 rounded-sm">Government of India</span>{" "}
                        <span className="text-[#138808]">■■■</span>
                    </div> */}
                </div>
                <img src={Images.adhar2} alt="Aadhaar Logo" className="h-12" />
                {/* <img src="https://www.presentations.gov.in/wp-content/uploads/2020/06/Aadhaar_Preview.png" alt="Aadhaar Logo" className="h-12" /> */}
            </div>

            {/* Profile + QR */}
            <div className="flex justify-between items-start gap-4 mt-2">
                <div className="flex gap-3 items-start">
                    {/* <img src={imageUrl} alt="Profile" className="w-20 h-24 object-cover border border-gray-400 rounded-sm" /> */}
                    <div className="text-sm space-y-1 text-gray-800">
                        <p><strong>{name}</strong></p>
                        <p><strong>DOB:</strong> {dob}</p>
                        <p><strong>Gender:</strong> {gender}</p>
                    </div>
                </div>
                <img src={Images.QR} alt="QR Code" className="w-14 h-14 md:w-16 md:h-16 object-cover" />
            </div>

            {/* Aadhaar Number */}
            <div className="mt-2 text-center text-base tracking-widest font-semibold">
                {aadhaarNumber}
            </div>

            {/* Footer line */}
            <div className="mt-1 border-t border-red-600 mb-2" />
            <div className="text-xs text-center font-bold">आधार - आम आदमी का अधिकार</div>
        </div>
    );
};

export default AdharCard;
