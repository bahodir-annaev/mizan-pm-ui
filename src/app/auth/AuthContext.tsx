import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { setAccessToken, clearTokens } from '@/app/auth/auth-storage';
import { AuthError } from '@/app/auth/auth-error';
import { mapApiUserToAuthUser } from '@/lib/mappers';
import { connectSocket, disconnectSocket, isSocketConnected } from '@/lib/websocket';
import type { LoginDto, RegisterDto, ApiUser } from '@/types/api';
import type { AuthUser } from '@/types/domain';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  /** Update the cached user after a successful profile edit. */
  updateLocalUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try refresh token on mount to restore session from httpOnly cookie
    apiClient
      .post<{ accessToken: string; user: ApiUser }>('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setUser(mapApiUserToAuthUser(data.user));
        connectSocket();
      })
      .catch(() => {
        // No valid session — user stays null, ProtectedRoute will redirect to /login
      })
      .finally(() => setIsLoading(false));

    // When the api-client silently refreshes a token mid-session, reconnect
    // the WebSocket if it dropped while the old token was expiring.
    function handleTokenRefreshed() {
      if (!isSocketConnected()) {
        connectSocket();
      }
    }
    window.addEventListener('token-refreshed', handleTokenRefreshed);
    return () => window.removeEventListener('token-refreshed', handleTokenRefreshed);
  }, []);

  async function login(dto: LoginDto) {
    try {
      const { data } = await apiClient.post<{ accessToken: string; user: ApiUser }>('/auth/login', dto);
      setAccessToken(data.accessToken);
      setUser(mapApiUserToAuthUser(data.user));
      connectSocket();
    } catch (err: any) {
      throw new AuthError(
        err.response?.data?.message ?? 'Login failed',
        err.response?.status,
      );
    }
  }

  async function register(dto: RegisterDto) {
    try {
      const { data } = await apiClient.post<{ accessToken: string; user: ApiUser }>('/auth/register', dto);
      setAccessToken(data.accessToken);
      setUser(mapApiUserToAuthUser(data.user));
      connectSocket();
    } catch (err: any) {
      throw new AuthError(
        err.response?.data?.message ?? 'Registration failed',
        err.response?.status,
      );
    }
  }

  async function logout() {
    await apiClient.post('/auth/logout').catch(() => {});
    disconnectSocket();
    clearTokens();
    setUser(null);
    window.location.replace('/login');
  }

  function updateLocalUser(patch: Partial<AuthUser>) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
