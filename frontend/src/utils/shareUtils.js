import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const shareAPI = {
  createShare: (invoiceId) => API.post(`/public/share/${invoiceId}`),
  getStats:    (invoiceId) => API.get(`/public/stats/${invoiceId}`),
  revokeShare: (invoiceId) => API.delete(`/public/share/${invoiceId}`),
  getPublic:   (token)     => API.get(`/public/view/${token}`),
  trackDL:     (token)     => API.post(`/public/download/${token}`),
};

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}

export function whatsappShare(url, invoiceNumber) {
  const msg = encodeURIComponent(
    `Hi! Please find your Invoice/Quotation ${invoiceNumber} here:\n${url}`
  );
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

export function emailShare(url, invoiceNumber) {
  const subject = encodeURIComponent(`Invoice ${invoiceNumber}`);
  const body    = encodeURIComponent(
    `Please find your Invoice/Quotation ${invoiceNumber}:\n\n${url}`
  );
  window.open(`mailto:?subject=${subject}&body=${body}`);
}
