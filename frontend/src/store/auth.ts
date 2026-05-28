import { create } from 'zustand';

type TokenResponse = { accessToken: string; refreshToken: string; fullName: string; roles: string[] };
type AuthState = {
  token: string | null;
  refreshToken: string | null;
  fullName: string | null;
  roles: string[];
  setAuth: (token: string, fullName: string, roles: string[], refreshToken?: string) => void;
  logout: () => void;
};

const authKeys = ['accessToken', 'refreshToken', 'fullName', 'roles'];

function readRoles() {
  try {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) as string[] : [];
  } catch {
    return [];
  }
}

function clearStoredAuth() {
  authKeys.forEach((key) => localStorage.removeItem(key));
}

function readStoredAuth() {
  return {
    token: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    fullName: localStorage.getItem('fullName'),
    roles: readRoles(),
  };
}

export const useAuth = create<AuthState>((set) => ({
  ...readStoredAuth(),
  setAuth: (token, fullName, roles, refreshToken) => {
    localStorage.setItem('accessToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('roles', JSON.stringify(roles));
    set({ token, fullName, roles, refreshToken: refreshToken ?? localStorage.getItem('refreshToken') });
  },
  logout: () => {
    clearStoredAuth();
    set({ token: null, refreshToken: null, fullName: null, roles: [] });
  },
}));

window.addEventListener('veetu-auth-expired', () => {
  useAuth.setState({ token: null, refreshToken: null, fullName: null, roles: [] });
});

window.addEventListener('veetu-auth-updated', ((event: Event) => {
  const detail = (event as CustomEvent<TokenResponse>).detail;
  if (!detail) return;
  useAuth.setState({
    token: detail.accessToken,
    refreshToken: detail.refreshToken,
    fullName: detail.fullName,
    roles: detail.roles,
  });
}) as EventListener);

window.addEventListener('storage', (event) => {
  if (event.key && authKeys.includes(event.key)) {
    useAuth.setState(readStoredAuth());
  }
});
