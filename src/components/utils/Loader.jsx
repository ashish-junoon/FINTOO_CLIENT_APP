import { MutatingDots } from "react-loader-spinner";

function Loader({ msg }) {
    return (
        <div className="flex flex-col justify-center items-center bg-white bg-opacity-85 h-screen w-full fixed top-0 left-0 z-50">
            {msg && <p className="text-black mb-4">{msg}</p>}
            <MutatingDots
                visible={true}
                height="100"
                width="100"
                color="#4fa94d"
                secondaryColor="#4fa94d"
                radius="12.5"
                ariaLabel="mutating-dots-loading"
            />
        </div>

    );
}

export default Loader;
