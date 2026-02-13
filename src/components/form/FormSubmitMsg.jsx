import Lottie from "lottie-react";
import animationData from '../../assets/success.json';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const style = {
    height: 100,
};

function FormSubmitMsg() {
    const [localData, setLocalData] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();
    const { loggedUser } = useAuth();

    // Retrieve loggedUser from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
            setLocalData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirectTimer = setTimeout(() => {
            navigate('/');
            window.location.reload();
        }, 5000); // 5 seconds

        return () => {
            clearInterval(timer);
            clearTimeout(redirectTimer);
        };
    }, []);



    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white">
            <Lottie animationData={animationData} loop={true} style={style} />
            <div className="mb-3">
                <h1 className="text-xl text-center text-success sm:my-3">Application Submitted Successfully!</h1>
            </div>
            <div className="mb-3 my-5">
                <p className="text-center font-semibold text-black">Your Reference ID<br />
                    <span className="text-primary font-bold text-2xl">{loggedUser?.lead_id || localData?.lead_id}</span>
                </p>
            </div>
            <div className="my-5">
                <p className="text-center text-black sm:my-3">
                    Thank you for your application. We’ll respond soon after completing the credit assessment.
                </p>
            </div>
            <div className="my-3">
                <p className="text-center text-gray-800">
                    Redirecting in <span className="text-primary font-bold">{countdown}</span> seconds...
                </p>
            </div>
        </div>
    );
}

export default FormSubmitMsg;
