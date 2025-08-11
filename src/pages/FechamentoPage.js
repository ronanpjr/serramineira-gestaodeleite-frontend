import React, { useState, useEffect, useCallback } from 'react';

// --- Ícones ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6l1.4-2.8A2 2 0 0 1 8.2 2h7.6a2 2 0 0 1 1.8 1.2L19 6" /></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;


// --- Componente do Modal de Geração/Edição ---
const FechamentoModal = ({ isOpen, onClose, onSave, producers, fechamento }) => {
    const [selectedProducerId, setSelectedProducerId] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [precoLitro, setPrecoLitro] = useState('');
    const [descontos, setDescontos] = useState('');
    const [statusPagamento, setStatusPagamento] = useState('Pendente');

    useEffect(() => {
        if (!isOpen) return;

        if (fechamento) { // Modo Edição
            setSelectedProducerId(fechamento.produtor.id);
            setMonth(fechamento.mes);
            setYear(fechamento.ano);
            setPrecoLitro(fechamento.precoLitro || '');
            setDescontos(fechamento.descontos || '');
            setStatusPagamento(fechamento.statusPagamento || 'Pendente');
        } else { // Modo Criação
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            setSelectedProducerId(producers.length > 0 ? producers[0].id : '');
            setMonth(lastMonth.getMonth() + 1);
            setYear(lastMonth.getFullYear());
            setPrecoLitro('');
            setDescontos('');
            setStatusPagamento('Pendente');
        }
    }, [fechamento, producers, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (fechamento) { // Salvando Edição
            const data = {
                descontos: parseFloat(descontos) || 0,
                statusPagamento: statusPagamento,
                dataPagamento: statusPagamento === 'Pago' ? new Date().toISOString().split('T')[0] : null
            };
            onSave(data);
        } else { // Salvando Criação
            const data = {
                produtorId: parseInt(selectedProducerId, 10),
                mes: parseInt(month, 10),
                ano: parseInt(year, 10),
                precoLitro: parseFloat(precoLitro) || 0
            };
            onSave(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{fechamento ? 'Editar Fechamento' : 'Gerar Novo Fechamento'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 mb-2">Produtor</label>
                            <select value={selectedProducerId} onChange={(e) => setSelectedProducerId(e.target.value)} className="input-field" disabled={!!fechamento} required>
                                {producers.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2">Mês</label>
                            <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} className="input-field" min="1" max="12" disabled={!!fechamento} required />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2">Ano</label>
                            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" min="2020" max="2099" disabled={!!fechamento} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-600 mb-2">Preço por Litro (R$)</label>
                            <input type="number" step="0.01" value={precoLitro} onChange={(e) => setPrecoLitro(e.target.value)} className="input-field" placeholder="Ex: 2.50" disabled={!!fechamento} />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2">Descontos (R$)</label>
                            <input type="number" step="0.01" value={descontos} onChange={(e) => setDescontos(e.target.value)} className="input-field" placeholder="Ex: 50.00" />
                        </div>
                    </div>
                    {fechamento && (
                        <div className="mb-6">
                            <label className="block text-gray-600 mb-2">Status do Pagamento</label>
                             <select value={statusPagamento} onChange={(e) => setStatusPagamento(e.target.value)} className="input-field">
                                <option value="Pendente">Pendente</option>
                                <option value="Pago">Pago</option>
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente de Impressão ---
const PrintableReport = ({ reportData }) => {
    const { fechamento, coletas } = reportData;
    
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';
    const monthYear = `${String(fechamento.mes).padStart(2, '0')}/${fechamento.ano}`;
    
    const daysInMonth = new Date(fechamento.ano, fechamento.mes, 0).getDate();
    const coletasMap = new Map(coletas.map(c => [new Date(c.data).getUTCDate(), c.quantidadeLitros]));
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return { day, litros: coletasMap.get(day) || '-' };
    });

    return (
        <div className="p-8 font-sans text-gray-800">
            <header className="text-center mb-8">
                <h1 className="text-2xl font-bold">Serra Mineira Laticínios</h1>
                <p className="text-lg">Relatório Mensal de Coleta</p>
                <p className="text-sm text-gray-600">Data de Emissão: {formatDate(new Date())}</p>
            </header>

            <section className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-3">Dados do Produtor</h2>
                <p><strong>Produtor:</strong> {fechamento.produtor.nome}</p>
                <p><strong>Linha/Região:</strong> {fechamento.produtor.linha || 'Não informada'}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-3">Resumo do Fechamento - {monthYear}</h2>
                <table className="w-full text-left">
                    <tbody>
                        <tr className="border-b"><td className="py-1 pr-4">Total de Litros:</td><td className="font-medium">{fechamento.totalLitros} L</td></tr>
                        <tr className="border-b"><td className="py-1 pr-4">Preço por Litro:</td><td className="font-medium">{formatCurrency(fechamento.precoLitro)}</td></tr>
                        <tr className="border-b"><td className="py-1 pr-4">Total Bruto:</td><td className="font-medium">{formatCurrency(fechamento.totalBruto)}</td></tr>
                        <tr className="border-b"><td className="py-1 pr-4">Descontos:</td><td className="font-medium text-red-600">{formatCurrency(fechamento.descontos)}</td></tr>
                        <tr><td className="py-2 pr-4 text-lg font-bold">Total Líquido a Pagar:</td><td className="text-lg font-bold">{formatCurrency(fechamento.totalLiquido)}</td></tr>
                    </tbody>
                </table>
            </section>

            <section>
                <h2 className="text-xl font-semibold border-b pb-2 mb-3">Coletas Diárias - {monthYear}</h2>
                <div className="grid grid-cols-5 gap-x-8 gap-y-2 text-sm">
                    {calendarDays.map(({ day, litros }) => (
                        <div key={day} className="flex justify-between border-b border-dashed">
                            <span>Dia {String(day).padStart(2, '0')}:</span>
                            <span className="font-mono font-medium">{litros}</span>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="mt-20 text-center">
                <div className="inline-block border-t-2 border-gray-800 px-16 py-2">
                    <p>Assinatura do Produtor(a)</p>
                </div>
            </footer>
        </div>
    );
};

const PrintableBulkReport = ({ bulkReportData }) => {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div>
            {bulkReportData.map((data) => (
                <div key={data.fechamento.id} className="page-break">
                    <PrintableReport reportData={data} />
                </div>
            ))}
        </div>
    );
};

// --- Página Principal de Fechamentos ---
const FechamentoPage = ({ apiService, token, setNotification }) => {
    const [fechamentos, setFechamentos] = useState([]);
    const [producers, setProducers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFechamento, setEditingFechamento] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [bulkReportData, setBulkReportData] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const fetchFechamentos = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getFechamentos(token);
            if (response.ok) {
                const data = await response.json();
                setFechamentos(data);
            } else {
                setNotification({ message: 'Falha ao carregar fechamentos.', type: 'error' });
            }
        } catch (error) {
            setNotification({ message: 'Erro de conexão.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [apiService, token, setNotification]);
    
    useEffect(() => {
        const fetchProducers = async () => {
            setIsLoading(true);
            try {
                // A "data" já é o JSON retornado pelo apiService
                const data = await apiService.getProducers(token);
                if (data) {
                    setProducers(data);
                } else {
                    // Trate o caso de não haver dados, se necessário
                    setProducers([]);
                    setNotification({ message: 'Falha ao carregar produtores.', type: 'error' });
                }
            } catch (error) {
                setNotification({ message: `Erro de conexão ao carregar produtores: ${error.message}`, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducers();
        fetchFechamentos();
    }, [fetchFechamentos, apiService, token, setNotification]);

    useEffect(() => {
        const handleAfterPrint = () => {
            setReportData(null);
            setBulkReportData(null);
        };

        if (reportData || bulkReportData) {
            window.addEventListener('afterprint', handleAfterPrint);
        }

        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [reportData, bulkReportData]);

    const handleOpenModal = (fechamento = null) => {
        setEditingFechamento(fechamento);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFechamento(null);
    };

    const handleSaveFechamento = async (data) => {
        const apiCall = editingFechamento
            ? apiService.atualizarPagamentoFechamento(token, editingFechamento.id, data)
            : apiService.createFechamento(token, data);
        
        try {
            const response = await apiCall;
            if (response.ok) {
                setNotification({ message: `Fechamento ${editingFechamento ? 'atualizado' : 'gerado'} com sucesso!`, type: 'success' });
                handleCloseModal();
                fetchFechamentos();
            } else {
                const errorData = await response.text();
                setNotification({ message: `Erro: ${errorData || 'Não foi possível salvar.'}`, type: 'error' });
            }
        } catch (error) {
            setNotification({ message: 'Erro de conexão.', type: 'error' });
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este fechamento? Esta ação não pode ser desfeita.')) {
            try {
                const response = await apiService.deleteFechamento(token, id);
                if (response.ok || response.status === 204) {
                    setNotification({ message: 'Fechamento excluído com sucesso.', type: 'success' });
                    fetchFechamentos();
                } else {
                    setNotification({ message: 'Erro ao excluir.', type: 'error' });
                }
            } catch (error) {
                setNotification({ message: 'Erro de conexão.', type: 'error' });
            }
        }
    };

    const handleMarkAsPaid = async (id) => {
        if (window.confirm('Marcar este fechamento como PAGO?')) {
            const fechamento = fechamentos.find(f => f.id === id);
            const data = {
                descontos: fechamento.descontos || 0,
                statusPagamento: 'Pago',
                dataPagamento: new Date().toISOString().split('T')[0]
            };
            try {
                const response = await apiService.atualizarPagamentoFechamento(token, id, data);
                if (response.ok) {
                    setNotification({ message: 'Fechamento marcado como pago.', type: 'success' });
                    fetchFechamentos();
                } else {
                    setNotification({ message: 'Erro ao marcar como pago.', type: 'error' });
                }
            } catch (error) {
                setNotification({ message: 'Erro de conexão.', type: 'error' });
            }
        }
    };

    const handlePrint = async (fechamento) => {
        try {
            const res = await apiService.getColetasPorMes(token, fechamento.produtor.id, fechamento.ano, fechamento.mes);
            if (!res.ok) {
                throw new Error('Não foi possível buscar as coletas para impressão.');
            }
            const coletas = await res.json();
            setReportData({ fechamento, coletas });
        } catch (error) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const handleBulkPrint = async () => {
        if (fechamentos.length === 0) {
            setNotification({ message: 'Não há fechamentos para imprimir.', type: 'error' });
            return;
        }
        setIsPrinting(true);
        try {
            const reports = await Promise.all(
                fechamentos.map(async (fechamento) => {
                    const res = await apiService.getColetasPorMes(token, fechamento.produtor.id, fechamento.ano, fechamento.mes);
                    if (!res.ok) {
                        console.error(`Falha ao buscar coletas para ${fechamento.produtor.nome}`);
                        return { fechamento, coletas: [] };
                    }
                    const coletas = await res.json();
                    return { fechamento, coletas };
                })
            );
            setBulkReportData(reports);
        } catch (error) {
            setNotification({ message: 'Ocorreu um erro ao preparar os relatórios para impressão.', type: 'error' });
        } finally {
            setIsPrinting(false);
        }
    };
    
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';


    return (
        <div className="main-content">
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-3xl font-bold text-gray-800">Fechamentos Mensais</h1>
                <div className="flex gap-4">
                    <button onClick={handleBulkPrint} className="btn-primary flex items-center gap-2" disabled={isPrinting}>
                        <PrintIcon />
                        {isPrinting ? 'Preparando...' : 'Imprimir Todos'}
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                        <PlusIcon />
                        Gerar Fechamento
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-x-auto no-print">
                 {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Carregando...</p>
                ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Litros</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Líquido</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Pag.</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fechamentos.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{f.produtor?.nome || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${String(f.mes).padStart(2, '0')}/${f.ano}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.totalLitros} L</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{formatCurrency(f.totalLiquido)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${f.statusPagamento === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {f.statusPagamento}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(f.dataPagamento)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-4">
                                        <button onClick={() => handlePrint(f)} title="Imprimir" className="text-gray-600 hover:text-gray-900"><PrintIcon /></button>
                                        {f.statusPagamento !== 'Pago' && (
                                            <button onClick={() => handleMarkAsPaid(f.id)} title="Marcar como Pago" className="text-green-600 hover:text-green-900"><DollarSignIcon /></button>
                                        )}
                                        <button onClick={() => handleOpenModal(f)} title="Editar" className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                                        <button onClick={() => handleDelete(f.id)} title="Excluir" className="text-red-600 hover:text-red-900"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 )}
            </div>

            <FechamentoModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveFechamento}
                producers={producers}
                fechamento={editingFechamento}
            />
            
            <div className="printable-area">
                {reportData && <PrintableReport reportData={reportData} />}
                {bulkReportData && <PrintableBulkReport bulkReportData={bulkReportData} />}
            </div>
        </div>
    );
};

export default FechamentoPage;
