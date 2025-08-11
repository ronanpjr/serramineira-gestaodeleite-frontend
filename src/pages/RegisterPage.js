// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { apiService } from '../services/apiService';

const RegisterPage = ({ onNavigate, setNotification }) => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await apiService.register(nome, email, password);
            setNotification({ message: 'Usuário registrado com sucesso! Faça o login.', type: 'success' });
            onNavigate('login');
        } catch (err) {
            setError(err.message || 'Não foi possível registrar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Criar Nova Conta</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2" htmlFor="nome">Nome Completo</label>
                        <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="input-field" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2" htmlFor="email-register">Email</label>
                        <input type="email" id="email-register" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-600 mb-2" htmlFor="password-register">Senha</label>
                        <input type="password" id="password-register" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    Já tem uma conta?{' '}
                    <button onClick={() => onNavigate('login')} className="text-blue-600 hover:underline font-semibold">
                        Faça o login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;