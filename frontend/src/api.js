import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/token`, { email, password });
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        if (response.data.user_email) {
            localStorage.setItem('user_email', response.data.user_email);
        }
    }
    return response.data;
};

export const register = async (email, password) => {
    return await axios.post(`${API_URL}/register`, { email, password });
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export const sendEmail = async (to_email, subject, body, encryption_level, attachments = [], key_id = null) => {
    return await api.post('/send_email', { to_email, subject, body, encryption_level, attachments, key_id });
};

export const getInbox = async () => {
    return await api.get('/inbox');
};

export const getSent = async () => {
    return await api.get('/sent');
};

export const getTrash = async () => {
    return await api.get('/trash');
};

export const getDrafts = async () => {
    return await api.get('/drafts');
};

export const getSpam = async () => {
    return await api.get('/spam');
};

export const deleteEmail = async (id) => {
    return await api.post(`/email/${id}/delete`);
};

export const saveDraft = async (to_email, subject, body) => {
    return await api.post('/save_draft', { to_email, subject, body, encryption_level: "none" });
};

// Updated Google Login to accept token
export const googleLogin = async (token) => {
    // Send ACCESS TOKEN as 'credential'
    return await axios.post(`${API_URL}/auth/google`, { credential: token });
};

export const decryptEmail = async (id) => {
    return await api.get(`/email/${id}/decrypt`);
};

export const getQRNGStream = async (length = 16) => {
    return await api.get(`/qrng/stream?length=${length}`);
};

export const getEmailCounts = async () => {
    return await api.get('/counts');
};

export const getQKDKey = async (length = 32) => {
    return await api.get(`/keys/qkd?length=${length}`);
};

// SIMULATED QKD NODE INTERACTION
export const storeQKDKey = async (keyId, keyHex) => {
    return await api.post('/qkd/store_key', { key_id: keyId, key_hex: keyHex });
};

export const retrieveQKDKey = async (keyId) => {
    return await api.get(`/qkd/retrieve_key/${keyId}`);
};

// NEW API FUNCTIONS FOR FEATURE REQUESTS

export const generateKey = async (type, length, recipient) => {
    return await api.post('/keys/generate', { type, length, recipient });
};

export const getKeyMetadata = async (keyId) => {
    return await api.get(`/keys/${keyId}/metadata`);
};

export const discardKey = async (keyId) => {
    return await api.post(`/keys/${keyId}/discard`);
};

export default api;
