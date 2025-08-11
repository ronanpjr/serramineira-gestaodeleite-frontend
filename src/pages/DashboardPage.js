// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UsersIcon, MilkIcon, CalendarIcon, ClipboardIcon } from '../components/icons';

const DashboardPage = ({ token, setNotification }) => {
    const [stats, setStats] = useState({ produtoresAtivos: 0, litrosColetadosMes: 0, pagamentosPendentes: 0, coletasHoje: 0 });
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Buscar todos os dados necessários em paralelo
                const [producers, collections, closings] = await Promise.all([
                    apiService.getProducers(token),
                    apiService.getColetas(token),
                    apiService.getFechamentos(token),
                ]);

                // --- Calcular Estatísticas ---
                const today = new Date();
                const currentMonth = today.getMonth() + 1;
                const currentYear = today.getFullYear();
                const todayString = today.toISOString().split('T')[0];

                const produtoresAtivos = producers.filter(p => p.ativo).length;

                const litrosColetadosMes = collections
                    .filter(c => {
                        const d = new Date(c.data);
                        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
                    })
                    .reduce((acc, c) => acc + c.quantidadeLitros, 0);

                const coletasHoje = collections
                    .filter(c => c.data.startsWith(todayString))
                    .reduce((acc, c) => acc + c.quantidadeLitros, 0);
                
                const pagamentosPendentes = closings
                    .filter(f => f.statusPagamento === 'Pendente')
                    .reduce((acc, f) => acc + f.totalLiquido, 0);

                setStats({ produtoresAtivos, litrosColetadosMes, pagamentosPendentes, coletasHoje });


                // --- Calcular Dados do Gráfico (Últimos 6 meses) ---
                const monthlyProduction = {};
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    const monthName = d.toLocaleString('pt-BR', { month: 'long' });
                    const year = d.getFullYear();
                    const monthKey = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`;
                    monthlyProduction[monthKey] = 0;
                }

                collections.forEach(c => {
                    const d = new Date(c.data);
                    const monthName = d.toLocaleString('pt-BR', { month: 'long' });
                    const year = d.getFullYear();
                    const monthKey = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`;
                    if (monthKey in monthlyProduction) {
                        monthlyProduction[monthKey] += c.quantidadeLitros;
                    }
                });

                const chartDataFormatted = Object.keys(monthlyProduction).map(key => ({
                    name: key,
                    'Produção': monthlyProduction[key],
                }));
                
                setChartData(chartDataFormatted);

            } catch (error) {
                setNotification({ message: 'Não foi possível carregar os dados do dashboard.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token, setNotification]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const summaryData = [
        { title: "Produtores Ativos", value: stats.produtoresAtivos, icon: <UsersIcon />, color: "blue" },
        { title: "Litros Coletados (Mês)", value: `${stats.litrosColetadosMes.toLocaleString('pt-BR')} L`, icon: <MilkIcon />, color: "green" },
        { title: "Pagamentos Pendentes", value: formatCurrency(stats.pagamentosPendentes), icon: <CalendarIcon />, color: "orange" },
        { title: "Coletas Hoje", value: `${stats.coletasHoje.toLocaleString('pt-BR')} L`, icon: <ClipboardIcon />, color: "indigo" },
    ];

    const colorMapping = { blue: 'border-blue-500', green: 'border-green-500', orange: 'border-orange-500', indigo: 'border-indigo-500' };
    const bgMapping = { blue: 'bg-blue-100', green: 'bg-green-100', orange: 'bg-orange-100', indigo: 'bg-indigo-100' };
    const textMapping = { blue: 'text-blue-600', green: 'text-green-600', orange: 'text-orange-600', indigo: 'text-indigo-600' };

    if (isLoading) {
        return <div className="text-center p-8">Carregando dados do dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {summaryData.map(item => (
                    <div key={item.title} className={`dashboard-card bg-white p-6 rounded-xl shadow-md flex items-center border-l-4 ${colorMapping[item.color]}`}>
                        <div className={`p-3 rounded-full ${bgMapping[item.color]} ${textMapping[item.color]} mr-4`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{item.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="dashboard-chart bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Produção Semestral (Litros)</h2>
                <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString('pt-BR')} L`} />
                            <Legend />
                            <Bar dataKey="Produção" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;