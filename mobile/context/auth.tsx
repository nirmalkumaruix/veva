import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { login as loginRequest, register as registerRequest } from '@/lib/api';
import type { Role, TokenResponse } from '@/lib/types';

type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  role: 'OWNER' | 'TENANT';
};

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  fullName: string | null;
  roles: Role[];
  isOwnerMode: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<TokenResponse>;
  register: (payload: RegisterPayload) => Promise<TokenResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  function applyAuth(data: TokenResponse) {
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setFullName(data.fullName);
    setRoles(data.roles);
  }

  const value = useMemo<AuthContextValue>(() => ({
    accessToken,
    refreshToken,
    fullName,
    roles,
    isOwnerMode: roles.includes('OWNER') || roles.includes('ADMIN'),
    isLoggedIn: Boolean(accessToken),
    login: async (email, password) => {
      const data = await loginRequest(email, password);
      applyAuth(data);
      return data;
    },
    register: async (payload) => {
      const data = await registerRequest(payload);
      applyAuth(data);
      return data;
    },
    logout: () => {
      setAccessToken(null);
      setRefreshToken(null);
      setFullName(null);
      setRoles([]);
    },
  }), [accessToken, refreshToken, fullName, roles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
