// src/App.js
import React, { useState, useEffect } from 'react';
import Notification from './components/Notification';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [currentPage, setCurrentPage] = useState(token ? 'dashboard' : 'login');
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [token]);

    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setToken(null);
        setCurrentPage('login');
        setNotification({ message: 'Você saiu do sistema.', type: 'success' });
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const handleDismissNotification = () => {
        setNotification({ message: '', type: '' });
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onDismiss={handleDismissNotification} />
            {token ? (
                <MainLayout
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    token={token}
                    setNotification={setNotification}
                />
            ) : (
                <>
                    {currentPage === 'register' ? (
                        <RegisterPage onNavigate={handleNavigate} setNotification={setNotification} />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
                    )}
                </>
            )}
        </div>
    );
}