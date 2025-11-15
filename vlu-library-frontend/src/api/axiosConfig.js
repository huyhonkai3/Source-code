import axios from 'axios';

// Base Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:5000', // import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get tokens from storage
const getTokens = () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
});

const setTokens = (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

// Attach accessToken to every request if available
apiClient.interceptors.request.use(
    (config) => {
        const { accessToken } = getTokens();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401, try refresh (API 1.10), then retry original request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const refreshClient = axios.create({
    baseURL: 'http://localhost:5000', // import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (!error.response) {
            // Network or CORS error
            return Promise.reject(error);
        }

        const status = error.response.status;

        //  If we got 401 from refresh endpoint itself -> hard logout
        if (originalRequest?.url?.includes('api/auth/refresh') && status === 401) {
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue requests while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newAccessToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                }).catch((error) => Promise.reject(error));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { refreshToken } = getTokens();

            if (!refreshToken) {
                clearTokens();
                window.location.href = '/login';
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                const res = await refreshClient.post('/api/auth/refresh', { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data?.data || {};

                if (!newAccessToken || !newRefreshToken) {
                    throw new Error('Invalid refresh response');
            }

                setTokens(newAccessToken, newRefreshToken);
                apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        // 403 in token context: token revoked -> logout
        if (status === 403) {
            clearTokens();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);
export default apiClient;