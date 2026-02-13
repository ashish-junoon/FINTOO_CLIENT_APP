import Icon from "./Icon"
import { motion } from "framer-motion"

function Card({ heading, children, icon, color, style }) {
    return (
        <div className={`w-full shadow-lg rounded-b-lg`}>
            <div className={`bg-primary flex flex-row text-lg text-white font-semibold italic py-0.5 px-5 rounded-t-lg items-center`}>
                {icon && <Icon name={icon} size={20} color={color} />}
                <span className="font-normal ml-2">{heading}</span>
            </div>

            <div className={`${style} px-5 py-4`}>
                {children}
            </div>
        </div>
    )
}
export default Card