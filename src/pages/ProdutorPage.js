// src/pages/ProdutorPage.js
import React, { useState, useEffect, useCallback } from 'react';

// --- Ícones ---
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6l1.4-2.8A2 2 0 0 1 8.2 2h7.6a2 2 0 0 1 1.8 1.2L19 6" /></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);


// --- Componente do Modal ---
const ProducerModal = ({ isOpen, onClose, onSave, producer }) => {
    const [formData, setFormData] = useState({ nome: '', linha: '', chavePix: '', ativo: true });

    useEffect(() => {
        if (producer) {
            setFormData({
                nome: producer.nome || '',
                linha: producer.linha || '',
                chavePix: producer.chavePix || '',
                ativo: producer.ativo !== undefined ? producer.ativo : true,
            });
        } else {
            setFormData({ nome: '', linha: '', chavePix: '', ativo: true });
        }
    }, [producer, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{producer ? 'Editar Produtor' : 'Adicionar Produtor'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Nome</label>
                        <input name="nome" value={formData.nome} onChange={handleChange} className="input-field" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Linha/Região</label>
                        <input name="linha" value={formData.linha} onChange={handleChange} className="input-field" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Chave PIX</label>
                        <input name="chavePix" value={formData.chavePix} onChange={handleChange} className="input-field" />
                    </div>
                    <div className="mb-6 flex items-center">
                        <input type="checkbox" name="ativo" id="ativo" checked={formData.ativo} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">Ativo</label>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Página Principal de Produtores ---
const ProdutorPage = ({ apiService, token, setNotification }) => {
    const [producers, setProducers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProducer, setEditingProducer] = useState(null);

    const fetchProducers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getProducers(token);
            setProducers(data || []);
        } catch (error) {
            setNotification({ message: `Erro de conexão ao carregar produtores: ${error.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [apiService, token, setNotification]);

    useEffect(() => {
        fetchProducers();
    }, [fetchProducers]);

    const handleOpenModal = (producer = null) => {
        setEditingProducer(producer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProducer(null);
    };

    const handleSaveProducer = async (producerData) => {
        const producerToSave = editingProducer ? { ...editingProducer, ...producerData } : producerData;
        
        try {
            const apiCall = editingProducer
                ? apiService.updateProducer(token, producerToSave.id, producerToSave)
                : apiService.createProducer(token, producerToSave);
            
            await apiCall;
            
            setNotification({ message: `Produtor ${editingProducer ? 'atualizado' : 'criado'} com sucesso!`, type: 'success' });
            handleCloseModal();
            fetchProducers(); // Recarrega a lista
        } catch (error) {
            setNotification({ message: `Erro ao salvar: ${error.message}`, type: 'error' });
        }
    };

    const handleDeleteProducer = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este produtor?')) {
            try {
                await apiService.deleteProducer(token, id);
                setNotification({ message: 'Produtor excluído com sucesso!', type: 'success' });
                fetchProducers(); // Recarrega a lista
            } catch (error) {
                setNotification({ message: `Erro ao excluir: ${error.message}`, type: 'error' });
            }
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestão de Produtores</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <PlusIcon />
                    Adicionar Produtor
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Carregando produtores...</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linha/Região</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chave PIX</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {producers.map((producer) => (
                                <tr key={producer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producer.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producer.linha}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producer.chavePix}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${producer.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {producer.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleOpenModal(producer)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                                            <button onClick={() => handleDeleteProducer(producer.id)} className="text-red-600 hover:text-red-900"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <ProducerModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveProducer} producer={editingProducer} />
        </div>
    );
};

export default ProdutorPage;