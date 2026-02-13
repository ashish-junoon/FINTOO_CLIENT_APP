import React, { useState, useRef } from "react";
import Icon from "../utils/Icon";

const DateInput = ({
    label,
    name,
    id,
    placeholder,
    onChange,
    onBlur,
    value,
    required,
    disabled,
    max,
    min
}) => {
    const [selectedDate, setSelectedDate] = useState(value || "");
    const inputRef = useRef(null);

    const handleChange = (event) => {
        setSelectedDate(event.target.value);
        if (onChange) {
            onChange(event); // Pass the event to the parent component/Formik
        }
    };

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.showPicker?.();
        }
    };

    // Conditionally compute maxDate only if `max` is a valid number
    let maxDate;
    if (typeof max === "number" && !isNaN(max)) {
        const today = new Date();
        const computedDate = new Date(
            today.getFullYear() - max,
            today.getMonth(),
            today.getDate()
        );
        if (!isNaN(computedDate.getTime())) {
            maxDate = computedDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        }
    }

    return (
        <>
            <label
                htmlFor={id}
                className="block mb-1 text-sm font-medium text-black"
            >
                {label}
                {required ? <span className="text-danger text-sm">*</span> : ""}
            </label>
            <div className="relative w-full">
                <div
                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"
                    aria-hidden="true"
                >
                    <Icon name="RiCalendarLine" size={20} />
                </div>
                <input
                    ref={inputRef}
                    type="date"
                    name={name}
                    id={id}
                    placeholder={placeholder}
                    className="bg-white border border-black text-black text-xs rounded focus:ring-primary focus:border-primary block w-full pl-10 p-1.5 focus:shadow-sm focus:outline-light"
                    value={selectedDate}
                    onChange={handleChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    min={min}
                    {...(maxDate ? { max: maxDate } : {})}
                    style={{
                        colorScheme: "dark",
                    }}
                />
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={handleClick}
                    aria-label="Open date picker"
                ></div>
            </div>
        </>
    );
};

export default DateInput;
