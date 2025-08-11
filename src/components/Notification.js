// src/components/Notification.js
import React, { useEffect } from 'react';

const Notification = ({ message, type, onDismiss }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => onDismiss(), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onDismiss]);

    if (!message) return null;

    const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-x-0 opacity-100 z-50";
    const typeStyle = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};

export default Notification;