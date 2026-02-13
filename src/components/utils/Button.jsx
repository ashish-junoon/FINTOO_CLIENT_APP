import Icon from "./Icon"

function Button({ btnName, style, onClick, btnIcon, type, disabled }) {
    return (
        <button
            className={`shadow-md  rounded flex items-center justify-center hover:shadow-lg ${style}`}
            type={type ? type : "button"}
            onClick={onClick}
            disabled={disabled || false}
        >
            <span className="mr-1">
                {btnIcon && <Icon name={btnIcon} size={18} />}
            </span>
            {btnName}
        </button>
    )
}

export default Button