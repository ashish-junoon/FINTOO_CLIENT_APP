import { Link, Outlet } from "react-router-dom";
import Icon from "../utils/Icon";
import { heroPoints } from "../content/Content";
import Images from "../content/Images";
import { useUserInfoContext } from "../context/UserInfoContext";
import MobileMenu from "../utils/MobileMenu";

function ProtectedLayout() {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const { userInfo } = useUserInfoContext();

    const handleLogout = () => {
        localStorage.removeItem("loggedUser");
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full">
            
            {/* Left Section - Full width on mobile, 40% on lg+ */}
            <div className="w-full lg:w-2/5 h-auto lg:h-screen overflow-y-auto bg-white">

                {/* Header - Mobile only */}
                <div className="lg:hidden bg-white shadow-lg p-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <img className="h-10" src={Images.fullLogo} alt="Logo" />

                        {/* Navigation Links (if allowed) */}
                        {userInfo?.bank_info_fill && (
                            <div className="gap-4 text-sm hidden lg:flex">
                                <Link className="text-black hover:text-primary" to="/">Home</Link>
                                <Link className="text-black hover:text-primary" to="/my-loan">Account</Link>
                                <Link className="text-black hover:text-primary" to="/profile">Profile</Link>
                            </div>
                        )}

                        {/* Logout Button */}
                        {loggedUser && (
                            <button onClick={handleLogout}>
                                <Icon className="text-primary" name="RiLogoutCircleRLine" color="#FF0000" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Header - Desktop only */}
                <div className="hidden lg:block bg-white shadow-lg p-5 mb-2">
                    <div className="grid grid-cols-6 items-center">
                        {/* Back Button */}
                        <div className="col-span-1">
                            {window.location.pathname !== "/" && (
                                <button
                                    onClick={() => window.history.back()}
                                    className="bg-gray-100 rounded-full p-2 shadow-sm"
                                >
                                    <Icon className="text-primary" name="IoArrowBackSharp" color="#0b5cff" />
                                </button>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="col-span-4 hidden lg:flex justify-center">
                            {userInfo?.bank_info_fill && (
                                <div className="gap-5 py-2 flex">
                                    <Link className="text-black hover:text-primary hover:font-semibold" to="/">Home</Link>
                                    <Link className="text-black hover:text-primary hover:font-semibold" to="/my-loan">Account</Link>
                                    <Link className="text-black hover:text-primary hover:font-semibold" to="/profile">Profile</Link>
                                </div>
                            )}
                        </div>


                        {/* Logout Button */}
                        <div className="col-span-1 flex justify-end">
                            {loggedUser && (
                                <button onClick={handleLogout} className="bg-gray-100 rounded-full p-2 shadow-sm">
                                    <Icon className="text-primary" name="RiLogoutCircleRLine" color="#FF0000" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 md:py-10">
                    <Outlet />
                </div>

                {/* Mobile Menu */}
                {userInfo?.bank_info_fill && (
                    <div className="lg:hidden my-16">
                        <MobileMenu />
                    </div>
                )}
            </div>

            {/* Right Section - Hidden on small screens, 60% width on lg+ */}
            <div className="hidden lg:flex flex-col w-3/5 h-screen bg-primary text-white items-center justify-center p-4 lg:p-10">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">

                        {/* Content Section */}
                        <div className="flex flex-col justify-center p-4 sm:p-5">
                            <div className="flex items-center justify-center mb-0">
                                <img className="h-8 sm:h-16 w-auto" src={Images.fullLogo || "/placeholder.svg"} alt="Logo" />
                            </div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-center text-black">
                                Need a <span className="text-primary">quick credit line?</span>
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-center text-gray-700">
                                Complete the form to access financial solutions in just a few clicks.
                            </p>

                            <div className="mt-4 px-2 sm:px-4">
                                {heroPoints.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className="flex items-center border border-primary rounded-lg px-3 sm:px-4 py-2 sm:py-3 mb-2 sm:mb-3"
                                    >
                                        <Icon className="text-secondary" name={feature.icon} color="#2ec4b6" />
                                        <span className="text-xs sm:text-sm md:text-base font-medium text-black ml-2 sm:ml-3">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="relative min-h-[250px]">
                            <img
                                className="absolute inset-0 h-full w-full object-cover"
                                src={Images.heroImg || "/placeholder.svg"}
                                alt="Apply User"
                            />
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

export default ProtectedLayout;
