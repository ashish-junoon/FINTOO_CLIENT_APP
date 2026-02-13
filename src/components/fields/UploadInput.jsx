import { useState } from "react";
import Icon from "../utils/Icon";

function UploadInput({
    label,
    icon,
    name,
    id,
    onChange,
    onBlur,
    value,
    required,
    acceptedFormats,
    disabled
}) {
    const [fileName, setFileName] = useState(value ? value.name : "");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const MAX_FILE_SIZE_MB = 5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`File size must be less than ${MAX_FILE_SIZE_MB} MB`);
                event.target.value = ""; // Clear the input
                setFileName("");
                onChange({ target: { name, value: null } }); // Clear Formik value
                return;
            }

            setFileName(file.name);
            onChange(event); // Pass the event to Formik
        } else {
            setFileName("");
        }
    };

    return (
        <>
            <label className="block mb-1 text-sm font-medium text-black">
                {label}
                {required && <span className="text-danger text-sm">*</span>}
            </label>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon name={icon} size={20} />
                </div>

                <label
                    htmlFor={id}
                    className="bg-white border border-black text-black text-md rounded focus:ring-primary focus:border-primary block w-full pl-10 p-0.5 focus:shadow-sm focus:outline-light cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
                >
                    <input
                        type="file"
                        name={name}
                        id={id}
                        className="hidden"
                        accept={acceptedFormats}
                        onChange={handleFileChange}
                        onBlur={onBlur}
                        disabled={disabled}
                    />
                    <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {fileName || "No file chosen"}
                    </span>
                </label>
            </div>
        </>
    );
}

export default UploadInput;
