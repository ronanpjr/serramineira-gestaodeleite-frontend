import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ReportsPage = ({ apiService, token, setNotification }) => {
  const [producers, setProducers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [closings, setClosings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedProducers, setSelectedProducers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [producersRes, coletasRes, fechamentosRes] = await Promise.all([
          apiService.getProducers(token),
          apiService.getColetas(token),
          apiService.getFechamentos(token),
        ]);

        if (!producersRes.ok || !coletasRes.ok || !fechamentosRes.ok) {
          throw new Error('Falha ao carregar dados para os relatórios.');
        }

        const producersData = await producersRes.json();
        setProducers(producersData);
        setCollections(await coletasRes.json());
        setClosings(await fechamentosRes.json());
        
        // Select all producers by default
        setSelectedProducers(producersData.map(p => p.id.toString()));

      } catch (error) {
        setNotification({ message: error.message, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, apiService, setNotification]);

  const handleProducerSelection = (e) => {
    const { options } = e.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedProducers(value);
  };

  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    const producerMap = new Map(producers.map(p => [p.id, p.name]));

    const filteredCollections = collections.filter(c => {
      const collectionDate = new Date(c.data);
      const producerId = c.produtor ? c.produtor.id.toString() : c.produtorId.toString();
      return collectionDate >= start && collectionDate <= end &&
             (selectedProducers.length === 0 || selectedProducers.includes(producerId));
    });

    return filteredCollections.map(c => ({
        ...c,
        produtorName: producerMap.get(c.produtor ? c.produtor.id : c.produtorId) || 'Desconhecido'
    }));
  }, [startDate, endDate, selectedProducers, collections, producers]);

  const summaryCards = useMemo(() => {
    if (filteredData.length === 0) return { totalLitros: 0, mediaDiaria: 0, maiorProdutor: 'N/A', valorTotal: 0 };

    const totalLitros = filteredData.reduce((acc, c) => acc + c.quantidadeLitros, 0);
    
    const daysInRange = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
    const mediaDiaria = totalLitros / daysInRange;
    
    const producerTotals = filteredData.reduce((acc, c) => {
      const prodId = c.produtor ? c.produtor.id : c.produtorId;
      acc[prodId] = (acc[prodId] || 0) + c.quantidadeLitros;
      return acc;
    }, {});

    let maiorProdutor = 'N/A';
    let maxLitros = 0;
    for (const prodId in producerTotals) {
      if (producerTotals[prodId] > maxLitros) {
        maxLitros = producerTotals[prodId];
        const producer = producers.find(p => p.id.toString() === prodId);
        maiorProdutor = producer ? producer.nome : 'Desconhecido';
      }
    }
    
    // Simplified total value calculation - assumes a single price for all closings in range
    const relevantClosings = closings.filter(f => {
        const closingDate = new Date(f.ano, f.mes - 1, 1);
        return closingDate >= new Date(startDate) && closingDate <= new Date(endDate);
    });
    const valorTotal = relevantClosings.reduce((acc, f) => acc + f.totalLiquido, 0);


    return {
      totalLitros: totalLitros.toLocaleString('pt-BR'),
      mediaDiaria: mediaDiaria.toFixed(2).replace('.',','),
      maiorProdutor,
      valorTotal: valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };
  }, [filteredData, producers, closings, startDate, endDate]);

  const productionOverTimeData = useMemo(() => {
    const dataByDate = {};
    filteredData.forEach(c => {
      const date = new Date(c.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      if (!dataByDate[date]) {
        dataByDate[date] = { name: date };
      }
      if (!dataByDate[date][c.produtorName]) {
        dataByDate[date][c.produtorName] = 0;
      }
      dataByDate[date][c.produtorName] += c.quantidadeLitros;
    });
    return Object.values(dataByDate).sort((a,b) => new Date(a.name.split('/').reverse().join('-')) - new Date(b.name.split('/').reverse().join('-')));
  }, [filteredData]);

  const productionByProducerData = useMemo(() => {
    const totals = filteredData.reduce((acc, c) => {
      acc[c.produtorName] = (acc[c.produtorName] || 0) + c.quantidadeLitros;
      return acc;
    }, {});
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [filteredData]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];


  if (isLoading) {
    return <div className="text-center p-8">Carregando dados...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Relatórios e Gráficos</h1>

      {/* --- Filtros --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produtores</label>
          <select multiple value={selectedProducers} onChange={handleProducerSelection} className="input-field h-32">
            {producers.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      {/* --- Cards de Resumo --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card"><p className="text-gray-500 text-sm">Total de Litros no Período</p><p className="text-2xl font-bold">{summaryCards.totalLitros} L</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Média Diária</p><p className="text-2xl font-bold">{summaryCards.mediaDiaria} L</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Produtor com Maior Coleta</p><p className="text-2xl font-bold">{summaryCards.maiorProdutor}</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Valor Total à Pagar</p><p className="text-2xl font-bold">{summaryCards.valorTotal}</p></div>
      </div>

      {/* --- Gráficos --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Produção ao Longo do Tempo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {producers
                .filter(p => selectedProducers.includes(p.id.toString()))
                .map((p, index) => (
                <Line key={p.id} type="monotone" dataKey={p.nome} stroke={COLORS[index % COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Participação por Produtor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={productionByProducerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {productionByProducerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Tabela de Dados --- */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold p-6">Dados Detalhados da Coleta</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Litros</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map(coleta => (
              <tr key={coleta.id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(coleta.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td className="px-6 py-4 whitespace-nowrap">{coleta.produtorName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">{coleta.quantidadeLitros} L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
