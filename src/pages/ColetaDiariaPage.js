import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// --- Ícones ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const LoaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
);
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);
const EditIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
    </svg>
);

// --- Componente da Página ---
const ColetaDiariaPage = ({ apiService, token, setNotification }) => {
    const [producers, setProducers] = useState([]);
    const [selectedProducerId, setSelectedProducerId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [collections, setCollections] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving', 'error'

    // Ref para o timer do debounce, para que possamos limpá-lo
    const debounceTimeoutRef = useRef(null);

    // Efeito para buscar a lista de produtores uma única vez
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
    }, [token, apiService, setNotification]);

    // Efeito para buscar as coletas quando os filtros mudam
    useEffect(() => {
        if (!selectedProducerId || !year || !month) return;
        
        const fetchCollections = async () => {
            setIsLoading(true);
            setSaveStatus('saved'); // Reseta o status ao carregar novos dados
            if(debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); // Cancela qualquer salvamento pendente
            
            try {
                const response = await apiService.getColetasPorMes(token, selectedProducerId, year, month);
                const data = response.ok ? await response.json() : [];
                
                // Transforma o array de coletas em um mapa [data] -> quantidade
                const collectionsMap = data.reduce((acc, coleta) => {
                    // A API retorna a data como "YYYY-MM-DD". Para evitar problemas de fuso horário,
                    // tratamos ela como UTC para gerar a chave do mapa.
                    const dateKey = new Date(coleta.data + 'T00:00:00Z').toISOString().split('T')[0];
                    acc[dateKey] = coleta.quantidadeLitros;
                    return acc;
                }, {});
                setCollections(collectionsMap);

            } catch (error) {
                setNotification({ message: 'Erro de conexão ao buscar coletas.', type: 'error' });
                setCollections({}); // Limpa coletas em caso de erro
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollections();
    }, [selectedProducerId, year, month, token, apiService, setNotification]);


    // Função de salvamento, agora memoizada com useCallback
    const handleSaveChanges = useCallback(async (currentCollections) => {
        setSaveStatus('saving');
        
        const payload = Object.entries(currentCollections)
            // Filtra entradas nulas, vazias ou que não são números
            .filter(([, quantidade]) => quantidade != null && `${quantidade}`.trim() !== '' && !isNaN(quantidade))
            .map(([data, quantidadeLitros]) => ({
                data,
                quantidadeLitros: Number(quantidadeLitros),
                produtorId: Number(selectedProducerId) 
            }));
        
        // Se não há nada a salvar, apenas atualiza o status.
        if (payload.length === 0 && Object.values(currentCollections).every(v => v === '' || v == null)) {
            setSaveStatus('saved');
            return;
        }

        try {
            const response = await apiService.salvarColetasEmLote(token, payload);
            if (response.ok) {
                setSaveStatus('saved');
            } else {
                const errorText = await response.text();
                setSaveStatus('error');
                setNotification({ message: `Falha ao salvar: ${errorText || 'Erro desconhecido.'}`, type: 'error' });
            }
        } catch (error) {
            setSaveStatus('error');
            setNotification({ message: 'Erro de conexão ao salvar as alterações.', type: 'error' });
        }
    }, [selectedProducerId, apiService, token, setNotification]);

    
    // Efeito para acionar o debounce. Roda toda vez que 'collections' muda.
    useEffect(() => {
        // Não faz nada se estiver carregando dados ou se não houver alterações pendentes
        if (isLoading || saveStatus !== 'unsaved') {
            return;
        }

        // Limpa o timer anterior para reiniciar a contagem
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Define um novo timer. O salvamento só ocorrerá se não houver mais alterações em 1.5s
        debounceTimeoutRef.current = setTimeout(() => {
            handleSaveChanges(collections);
        }, 1500);

        // Função de limpeza: cancela o timer se o componente for desmontado
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [collections, isLoading, saveStatus, handleSaveChanges]);

    // Gera a estrutura do calendário
    const { daysInMonth, firstDayOffset } = useMemo(() => {
        if (!year || !month || month < 1 || month > 12) return { daysInMonth: [], firstDayOffset: 0 };
        const date = new Date(year, month - 1, 1);
        const days = [];
        const firstDay = date.getDay(); 
        while (date.getMonth() === month - 1) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return { daysInMonth: days, firstDayOffset: firstDay };
    }, [year, month]);

    // Handler para quando um valor de coleta é alterado
    const handleCollectionChange = (date, value) => {
        setSaveStatus('unsaved'); // Marca que há alterações não salvas
        setCollections(prev => ({ ...prev, [date]: value }));
    };

    // Componente que mostra o status do salvamento
    const SaveStatusIndicator = () => {
        const statusMap = {
            unsaved: { title: 'Alterações pendentes...', color: 'text-gray-500', icon: <EditIcon /> },
            saving: { title: 'Salvando...', color: 'text-blue-600', icon: <LoaderIcon /> },
            saved: { title: 'Salvo na nuvem', color: 'text-green-600', icon: <CheckCircleIcon /> },
            error: { title: 'Erro ao salvar', color: 'text-red-600', icon: <AlertTriangleIcon /> },
        };
        const currentStatus = statusMap[saveStatus];
        return (
            <div title={currentStatus.title} className={`flex items-center justify-center p-2 rounded-md ${currentStatus.color} transition-colors`}>
                {currentStatus.icon}
                <span className="ml-2 text-sm font-medium hidden sm:inline">{currentStatus.title}</span>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Lançamento de Coletas</h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex flex-wrap items-end gap-4 flex-grow">
                    <div className="flex-grow min-w-[250px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Produtor</label>
                        <select
                            value={selectedProducerId}
                            onChange={(e) => setSelectedProducerId(e.target.value)}
                            className="input-field"
                            disabled={producers.length === 0}
                        >
                            {producers.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow" style={{maxWidth: '120px'}}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                        <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} className="input-field" />
                    </div>
                    <div className="flex-grow" style={{maxWidth: '120px'}}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                        <input type="number" min="2020" max="2099" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} className="input-field" />
                    </div>
                </div>
                 <div className="flex-shrink-0">
                    <SaveStatusIndicator />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center p-8">
                    <LoaderIcon />
                    <p className="mt-2 text-gray-600">Carregando coletas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="text-center font-bold text-sm text-gray-500 mb-2">{day}</div>
                    ))}
                    {Array.from({ length: firstDayOffset }).map((_, index) => (
                        <div key={`empty-${index}`} className="border rounded-md bg-gray-50 min-h-[80px]"></div>
                    ))}
                    {daysInMonth.map(day => {
                        const dateString = day.toISOString().split('T')[0];
                        const dayNumber = day.getDate();
                        return (
                            <div key={dateString} className="bg-white p-2 rounded-md shadow-sm border text-center flex flex-col min-h-[80px]">
                                <label className="font-bold text-sm text-gray-700">{String(dayNumber).padStart(2, '0')}</label>
                                <input
                                    type="number"
                                    placeholder="Litros"
                                    value={collections[dateString] || ''}
                                    onChange={(e) => handleCollectionChange(dateString, e.target.value)}
                                    className="w-full p-1 text-center border-gray-200 border rounded-md mt-1 flex-grow focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ColetaDiariaPage;
