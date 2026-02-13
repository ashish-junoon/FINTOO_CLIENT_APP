import React from "react";
import Icon from "../utils/Icon";

function SelectInput({ label, icon, name, id, options, onChange, onBlur, value, placeholder, required, disabled }) {
    return (
        <>
            <label htmlFor={id} className="block mb-1 text-sm font-medium text-black">
                {label}{required ? <span className="text-danger text-sm">*</span> : ""}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon name={icon} size={20} />
                </div>
                <select
                    name={name}
                    id={id}
                    className="bg-white border border-black text-black text-sm rounded focus:ring-primary focus:border-primary block w-full pl-10 p-1.5 focus:shadow-xs focus:outline-light"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    disabled={disabled}
                >
                    <option value="" label={placeholder} className="option:text-xs" />
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}

export default SelectInput;
