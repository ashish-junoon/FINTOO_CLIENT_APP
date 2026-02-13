import React from 'react';
import * as Ri from 'react-icons/ri'; //Remix Icons 
import * as Md from 'react-icons/md'; //Material Icons
import * as Io from 'react-icons/io5'; //Ion Icons
import * as Gi from 'react-icons/gi';
import * as Pi from 'react-icons/pi';
import * as Go from 'react-icons/go';
import * as Fa from 'react-icons/fa';
// Import other icon sets as needed

const Icon = ({ name, size = 24, color = 'currentColor', style = {} }) => {
    let IconComponent;

    if (name.startsWith('Ri')) {
        IconComponent = Ri[name];
    } else if (name.startsWith('Md')) {
        IconComponent = Md[name];
    } else if (name.startsWith('Io')) {
        IconComponent = Io[name];
    } else if (name.startsWith('Gi')) {
        IconComponent = Gi[name];
    } else if (name.startsWith('Pi')) {
        IconComponent = Pi[name];
    } else if (name.startsWith('Go')) {
        IconComponent = Go[name];
    } else if (name.startsWith('Fa')) {
        IconComponent = Fa[name];
    }
    // Add more conditions for other icon sets

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return <IconComponent size={size} color={color} style={style} />;
};

export default Icon;