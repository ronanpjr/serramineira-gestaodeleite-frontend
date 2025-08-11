// src/services/apiService.js

const API_BASE_URL = 'http://localhost:8080';

const handleResponse = async (response) => {
    // Se a resposta não for bem-sucedida (status 4xx ou 5xx),
    // sempre trate como um erro.
    if (!response.ok) {
        const errorBody = await response.text();
        try {
            // Tenta extrair uma mensagem de erro JSON do back-end.
            const errorJson = JSON.parse(errorBody);
            throw new Error(errorJson.message || `Erro ${response.status}`);
        } catch {
            // Se o corpo do erro não for JSON (ex: um erro de HTML do servidor),
            // lança o corpo do erro diretamente para facilitar a depuração.
            throw new Error(errorBody || `Erro ${response.status}`);
        }
    }

    // Se a resposta for bem-sucedida (status 2xx), verifique se há conteúdo.
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        // Se for JSON, retorna o corpo da resposta em formato JSON.
        return response.json();
    }

    // **ESTA É A CORREÇÃO CRÍTICA:**
    // Para respostas bem-sucedidas mas sem conteúdo JSON (como POST, PUT, ou DELETE
    // que retornam 200 OK ou 204 No Content), retorna `null`.
    // Isso sinaliza ao componente que a operação foi um sucesso, mas não há dados para processar.
    return null;
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
    atualizarPagamentoFechamento: (token, id, data) => fetch(`${API_BASE_URL}/api/fechamentos/${id}/pagamento`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    deleteFechamento: (token, id) => fetch(`${API_BASE_URL}/api/fechamentos/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
    }).then(handleResponse),
};