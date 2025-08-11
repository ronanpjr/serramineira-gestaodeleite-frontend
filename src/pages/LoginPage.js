// src/pages/LoginPage.js
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { MilkIcon } from '../components/icons';

const LoginPage = ({ onLoginSuccess, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await apiService.login(email, password);
            onLoginSuccess(data.token);
        } catch (err) {
            setError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex justify-center items-center mb-6">
                    <MilkIcon />
                    <h1 className="text-2xl font-bold text-gray-800 ml-2">Serra Mineira</h1>
                </div>
                <h2 className="text-xl text-center font-semibold text-gray-700 mb-6">Acessar o Sistema</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2" htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-600 mb-2" htmlFor="password">Senha</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    Não tem uma conta?{' '}
                    <button onClick={() => onNavigate('register')} className="text-blue-600 hover:underline font-semibold">
                        Registre-se
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;