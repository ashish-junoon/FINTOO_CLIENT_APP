import { useNavigate } from "react-router-dom"
import Icon from "./Icon"
function MobileMenu() {
    const navigate = useNavigate()
    return (
        <div className="lg:hidden fixed bottom-5 w-full px-5">
            <div className="flex bg-gray-50 shadow-lg rounded-lg">

                <button className="w-full flex flex-col justify-center items-center hover:bg-blue-100 py-2"
                    onClick={() => navigate("/")}
                >
                    <Icon name="RiHomeSmileLine" size={25} color="#0b5cff" />
                    <p className="text-xs font-semibold">Home</p>
                </button>
                <button className="w-full flex flex-col justify-center items-center hover:bg-blue-100 py-2"
                    onClick={() => navigate("/my-loan")}
                >
                    <Icon name="RiMoneyRupeeCircleLine" size={25} color="#0b5cff" />
                    <p className="text-xs font-semibold">Account</p>
                </button>
                <button className="w-full flex flex-col justify-center items-center hover:bg-blue-100 py-2"
                    onClick={() => navigate("/profile")}
                >
                    <Icon name="RiAccountCircleLine" size={25} color="#0b5cff" />
                    <p className="text-xs font-semibold">Profile</p>
                </button>

            </div>
        </div>
    )
}
export default MobileMenu