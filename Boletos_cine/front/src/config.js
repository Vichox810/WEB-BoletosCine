const API_URL = (typeof window !== 'undefined' && window.__API_URL__) || import.meta.env.VITE_API_URL || 'http://localhost:3000'

export { API_URL }
