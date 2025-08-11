// src/services/apiService.js

const API_BASE_URL = 'http://localhost:8080';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorBody = await response.text();
        try {
            const errorJson = JSON.parse(errorBody);
            throw new Error(errorJson.message || `Erro ${response.status}`);
        } catch {
            throw new Error(errorBody || `Erro ${response.status}`);
        }
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    // Retorna a resposta completa se não for JSON, para casos como DELETE
    return response;
};

export const apiService = {
    // Auth
    register: (nome, email, senha) => fetch(`${API_BASE_URL}/api/auth/registrar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
    }).then(handleResponse),
    login: (email, senha) => fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
    }).then(handleResponse),

    // Produtores
    getProducers: (token) => fetch(`${API_BASE_URL}/api/produtores`, {
        headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),
    createProducer: (token, producerData) => fetch(`${API_BASE_URL}/api/produtores`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(producerData),
    }).then(handleResponse),
    updateProducer: (token, id, producerData) => fetch(`${API_BASE_URL}/api/produtores/${id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(producerData),
    }).then(handleResponse),
    deleteProducer: (token, id) => fetch(`${API_BASE_URL}/api/produtores/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),

    // Coletas
    getColetas: (token) => fetch(`${API_BASE_URL}/api/coletas`, {
        headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),
    getColetasPorMes: (token, produtorId, ano, mes) => fetch(`${API_BASE_URL}/api/coletas/produtor/${produtorId}/mes/${ano}/${mes}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),
    salvarColetasEmLote: (token, coletas) => fetch(`${API_BASE_URL}/api/coletas/lote`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(coletas),
    }).then(handleResponse),

    // Fechamentos
    getFechamentos: (token) => fetch(`${API_BASE_URL}/api/fechamentos`, {
        headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),
    createFechamento: (token, data) => fetch(`${API_BASE_URL}/api/fechamentos`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    // Corrigido para corresponder à API
    atualizarPagamentoFechamento: (token, id, data) => fetch(`${API_BASE_URL}/api/fechamentos/${id}/pagamento`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    deleteFechamento: (token, id) => fetch(`${API_BASE_URL}/api/fechamentos/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),
};