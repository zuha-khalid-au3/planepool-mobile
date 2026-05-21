import axios, { AxiosInstance, AxiosError } from 'axios';
import { appStorage, getDevLanHost } from './appStorage';
import Constants from 'expo-constants';

/**
 * Local dev: talk to planepool-admin (REST shim) on port 3000 unless overridden.
 * Physical device on LAN: set EXPO_PUBLIC_API_URL=http://<your-mac-ip>:3000
 */
function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (__DEV__) {
    const host = getDevLanHost();
    return `http://${host}:3000`;
  }

  return (
    Constants.expoConfig?.extra?.apiUrl?.replace(/\/$/, '') || 'https://api.planepool.com'
  );
}

const API_URL = getApiBaseUrl();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await appStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = await appStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.client.post<AuthTokens>('/auth/refresh', {
                refreshToken,
              });
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              await appStorage.setItem('accessToken', accessToken);
              await appStorage.setItem('refreshToken', newRefreshToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.logout();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await this.client.post<AuthTokens>('/auth/login', {
        email,
        password,
      });
      const { accessToken, refreshToken } = response.data;
      await appStorage.setItem('accessToken', accessToken);
      await appStorage.setItem('refreshToken', refreshToken);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async signup(email: string, password: string, name: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await this.client.post<AuthTokens>('/auth/signup', {
        email,
        password,
        name,
      });
      const { accessToken, refreshToken } = response.data;
      await appStorage.setItem('accessToken', accessToken);
      await appStorage.setItem('refreshToken', refreshToken);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await appStorage.removeItem('accessToken');
      await appStorage.removeItem('refreshToken');
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  async verifyPhone(phoneNumber: string): Promise<ApiResponse<{ otp: string }>> {
    try {
      const response = await this.client.post('/auth/verify-phone', { phoneNumber });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async confirmOtp(phoneNumber: string, otp: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await this.client.post<AuthTokens>('/auth/confirm-otp', {
        phoneNumber,
        otp,
      });
      const { accessToken, refreshToken } = response.data;
      await appStorage.setItem('accessToken', accessToken);
      await appStorage.setItem('refreshToken', refreshToken);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/users/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.put('/users/profile', data);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // KYC endpoints
  async uploadKycDocument(type: 'id' | 'selfie' | 'ticket', file: any): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await this.client.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getKycStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/kyc/status');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Ride endpoints
  async getDestinations(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/rides/destinations');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async selectDestination(destination: string, flightId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/rides/select-destination', {
        destination,
        flightId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRideGroups(flightId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get(`/rides/groups/${flightId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async joinRideGroup(groupId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(`/rides/groups/${groupId}/join`, {});
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async leaveRideGroup(groupId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(`/rides/groups/${groupId}/leave`, {});
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Chat endpoints
  async sendMessage(groupId: string, message: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(`/chat/groups/${groupId}/messages`, {
        message,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMessages(groupId: string, limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get(`/chat/groups/${groupId}/messages`, {
        params: { limit },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Notification endpoints
  async getNotifications(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.client.get('/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.put(`/notifications/${notificationId}/read`, {});
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Analytics endpoints
  async trackEvent(eventName: string, data: any): Promise<void> {
    try {
      await this.client.post('/analytics/events', {
        eventName,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Error handling
  private handleError(error: any): ApiResponse<any> {
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || 'An error occurred',
        message: error.response.data?.message,
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server',
      };
    } else {
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }
}

export const apiClient = new ApiClient();
