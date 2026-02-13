import { Outlet } from "react-router-dom"
import Icon from "../utils/Icon"
import { heroPoints } from "../content/Content"
import Images from "../content/Images"

function PublicLayout() {


    return (
        <div className="flex flex-col lg:flex-row h-auto min-h-screen w-full">
            {/* Left Section - Hidden on small screens, full width on md, 60% width on lg+ */}

            {/* Right Section - Full width on mobile and md, 40% on lg+ */}
            <div className="w-full lg:w-2/5 md:h-auto lg:h-screen overflow-y-auto bg-white order-1 lg:order-0">
                {/* Mobile-only header - visible on small and medium screens */}
                <div className="md:hidden bg-white shadow-lg p-4">
                    <div className="flex items-center justify-center">
                        <img className="h-8 w-auto" src={Images.fullLogo || "/placeholder.svg"} alt="Logo" />
                    </div>
                </div>

                {/* Content area with responsive padding */}
                <div className="lg:h-screen lg:flex justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 md:py-10">
                    <Outlet />
                </div>
            </div>

            <div className="hidden md:flex flex-col md:w-full lg:w-3/5 md:h-auto lg:h-screen bg-primary text-white items-center justify-center p-4 md:p-6 lg:p-10 order-0 lg:order-1">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        
                        {/* Content Section */}
                        <div className="flex flex-col justify-center p-4 sm:p-5 md:p-5">
                            <div className="flex items-center justify-center mb-0">
                                <img className="h-8 sm:h-16 w-auto" src={Images.fullLogo || "/placeholder.svg"} alt="Logo" />
                            </div>

                            <div className="my-3 md:my-4">
                                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-center text-black">
                                    Need a <span className="text-primary">quick credit line?</span>
                                </h1>
                                <p className="text-xs sm:text-sm md:text-base text-center text-gray-700">
                                    Complete the form to access financial solutions in just a few clicks.
                                </p>

                                <div className="mt-4 md:mt-6 px-2 sm:px-4">
                                    {heroPoints.map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="flex items-center border border-primary rounded-lg px-3 sm:px-4 py-2 sm:py-3 mb-2 sm:mb-3"
                                        >
                                            <Icon className="text-primary" name={feature.icon} color="#2ec4b6" />
                                            <span className="text-xs sm:text-sm md:text-base font-medium text-black ml-2 sm:ml-3">
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image Section - Hidden on small screens, visible on md+ */}
                        <div className="hidden lg:block relative h-full min-h-[250px]">
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
};
export default PublicLayout