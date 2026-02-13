import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { useUserInfoContext } from "../../components/context/UserInfoContext";
import { getProductAssigned } from "../../api/Api_call";
import Card from "../../components/utils/Card";
import Button from "../../components/utils/Button";
import AvailLoan from "./AvailLoan";

function LoanOffer() {
    const [product, setProduct] = useState(null);
    const [isProductSelected, setIsProductSelected] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [startKYC, setStartKYC] = useState(false);

    const { userInfo } = useUserInfoContext();

    useEffect(() => {
        const fetchData = async () => {
            if (!userInfo?.user_id || !userInfo?.lead_id) return;

            const req = {
                user_id: userInfo.user_id,
                lead_id: userInfo.lead_id,
            };

            try {
                const response = await getProductAssigned(req);
                if (response.status) {
                    setProduct(response);
                } else {
                    console.error(response.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [userInfo?.user_id, userInfo?.lead_id]);

    const handleApplyForLoan = (index) => {
        setIsProductSelected(true);
        setSelectedProduct(product?.getAssignProducts[index]);
    };

    const handleBack = () => {
        setIsProductSelected(false);
        setSelectedProduct(null);
    };

    const handleSelectLoan = () => {
        setStartKYC(true);
    };

    const frequency = product?.getAssignProducts?.[0]?.repayment_frequency;

    return (
        <>
            {!isProductSelected && (
                <>
                    <div className="flex justify-center items-center mb-5">
                        <div>
                            {frequency ? (
                                <h1 className="text-md font-semibold text-black text-center mb-4">Your Approved Credit Line</h1>
                            ) : (
                                <>
                                    <h1 className="text-md font-semibold text-black text-center mb-4">Choose Credit Line</h1>
                                    <p className="text-sm text-center mt-1 text-gray-600">That best fits your needs</p>
                                </>
                            )}
                        </div>
                    </div>

                    {!product ? (
                        <p className="text-center text-sm text-gray-500">Loading your loan offers...</p>
                    ) : product.getAssignProducts?.length > 0 ? (
                        <Swiper
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            modules={[Navigation, Pagination]}
                            className="mySwiper"
                        >
                            {product.getAssignProducts.map((productItem, index) => (
                                <SwiperSlide key={index}>
                                    <Card
                                        heading={`${productItem.product_code}`}
                                        style="mb-8"
                                    >
                                        <div className="grid grid-cols-3 gap-3 px-5">
                                            <InfoRow label="Amount" value={`₹${productItem.loan_amount}`} />
                                            <InfoRow label="Tenure" value={productItem.tenure} />
                                            {/* <InfoRow label="Credit Type" value={productItem.product_type} /> */}
                                            <InfoRow
                                                label="Interest Rate"
                                                value={`${productItem.interest_rate}%${frequency === "Bulletpayment" ? " /Day" : "/PM"
                                                    }`}
                                            />
                                            <InfoRow
                                                label="Frequency"
                                                value={
                                                    productItem.repayment_frequency === "Bulletpayment"
                                                        ? "Bullet Payment"
                                                        : "Monthly"
                                                }
                                            />
                                        </div>

                                        <div className="flex justify-center items-center mt-8 mb-2">
                                            <Button
                                                btnName="Continue to Apply"
                                                style="py-2 w-full bg-secondary text-black text-sm"
                                                btnIcon="MdCheckCircleOutline"
                                                onClick={() => handleApplyForLoan(index)}
                                            />
                                        </div>
                                    </Card>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <p className="text-center text-sm text-red-500">No credit products assigned.</p>
                    )}
                </>
            )}

            {isProductSelected && !startKYC && (
                <>
                    <AvailLoan product={selectedProduct} handleApply={handleSelectLoan} />
                    <div className="flex justify-center items-center mt-4">
                        <button
                            className="bg-gray-600 text-white px-8 text-xs py-2 rounded flex justify-center items-center"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

// Helper component
function InfoRow({ label, value }) {
    return (
        <>
            <div className="col-span-2">
                <h2 className="text-xs font-medium">{label}</h2>
            </div>
            <div className="col-span-1">
                <h1 className="text-sm">{value}</h1>
            </div>
        </>
    );
}

export default LoanOffer;
