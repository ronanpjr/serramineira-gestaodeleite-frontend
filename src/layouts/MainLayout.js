import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { DashboardIcon, UsersIcon, ClipboardIcon, CalendarIcon, ChartIcon, MilkIcon, LogoutIcon, MenuIcon } from '../components/icons';
import DashboardPage from '../pages/DashboardPage';
import ProdutorPage from '../pages/ProdutorPage';
import ColetaDiariaPage from '../pages/ColetaDiariaPage';
import FechamentoPage from '../pages/FechamentoPage';
import ReportsPage from '../pages/ReportsPage';

const MainLayout = ({ currentPage, onNavigate, onLogout, token, setNotification }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'producers', label: 'Produtores', icon: <UsersIcon /> },
        { id: 'collections', label: 'Coletas', icon: <ClipboardIcon /> },
        { id: 'closings', label: 'Fechamentos', icon: <CalendarIcon /> },
        { id: 'reports', label: 'Relatórios', icon: <ChartIcon /> },
    ];

    const handleNavigateAndCloseSidebar = (page) => {
        onNavigate(page);
        setIsSidebarOpen(false);
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardPage token={token} setNotification={setNotification} />;
            case 'producers': return <ProdutorPage apiService={apiService} token={token} setNotification={setNotification} />;
            case 'collections': return <ColetaDiariaPage apiService={apiService} token={token} setNotification={setNotification} />;
            case 'closings': return <FechamentoPage apiService={apiService} token={token} setNotification={setNotification} />;
            case 'reports': return <ReportsPage apiService={apiService} token={token} setNotification={setNotification} />;
            default: return <DashboardPage token={token} setNotification={setNotification} />;
        }
    };

    return (
        <div className="relative min-h-screen md:flex">
            {/* Overlay para fechar a sidebar em telas pequenas */}
            <div onClick={() => setIsSidebarOpen(false)} className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}></div>
            
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col z-30 sidebar-transition md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center justify-center border-b border-gray-700">
                    <MilkIcon />
                    <h1 className="text-xl font-bold ml-2">SMLaticínios</h1>
                </div>
                <nav className="flex-1 px-4 py-6">
                    <ul>
                        {navItems.map(item => (
                             <li key={item.id}>
                                <button 
                                    onClick={() => handleNavigateAndCloseSidebar(item.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition duration-200 ${currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                                >
                                    {item.icon}
                                    <span className="ml-4">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-700">
                     <button onClick={onLogout} className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition duration-200">
                        <LogoutIcon />
                        <span className="ml-4">Sair</span>
                    </button>
                </div>
            </aside>
            
            {/* Área de Conteúdo Principal */}
            <div className="flex-1 flex flex-col md:ml-64">
                {/* Botão de Menu para telas pequenas */}
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-4 text-gray-600 self-start">
                    <MenuIcon />
                </button>
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 pt-0 md:pt-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;