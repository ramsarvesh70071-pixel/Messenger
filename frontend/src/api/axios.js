import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Set by AuthContext on mount so this module can trigger a full logout
// when the refresh token itself has expired or been revoked.
let onSessionExpired = () => {};
export const registerSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('wa_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Prevents multiple simultaneous requests from each firing their own refresh call
let refreshPromise = null;

async function performRefresh() {
  const refreshToken = await AsyncStorage.getItem('wa_refresh_token');
  if (!refreshToken) throw new Error('No refresh token stored.');

  // Use a bare axios call (not `api`) to avoid recursively triggering this interceptor
  const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
  await AsyncStorage.setItem('wa_access_token', res.data.accessToken);
  await AsyncStorage.setItem('wa_refresh_token', res.data.refreshToken);
  return res.data.accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only attempt a refresh-and-retry once, and only for 401s that aren't the
    // login/register/refresh calls themselves
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some((p) =>
      original?.url?.includes(p)
    );

    if (error.response?.status === 401 && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      try {
        if (!refreshPromise) refreshPromise = performRefresh();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        await AsyncStorage.multiRemove(['wa_access_token', 'wa_refresh_token', 'wa_user']);
        onSessionExpired();
      }
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
