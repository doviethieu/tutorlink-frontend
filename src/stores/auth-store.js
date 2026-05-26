import { create } from 'zustand';

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('tutorlinkToken') || null,
  refreshToken: localStorage.getItem('tutorlinkRefreshToken') || null,
  user: readJson('tutorlinkUser'),
  hasHydrated: true,

  setSession: ({ accessToken, refreshToken, user }) => {
    if (accessToken) localStorage.setItem('tutorlinkToken', accessToken);
    if (refreshToken) localStorage.setItem('tutorlinkRefreshToken', refreshToken);
    if (user) localStorage.setItem('tutorlinkUser', JSON.stringify(user));

    set({
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      user: user || null,
      hasHydrated: true,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('tutorlinkToken', accessToken);
    if (refreshToken) localStorage.setItem('tutorlinkRefreshToken', refreshToken);

    set((state) => ({
      accessToken: accessToken || state.accessToken,
      refreshToken: refreshToken || state.refreshToken,
    }));
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('tutorlinkUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('tutorlinkUser');
    }

    set({ user: user || null });
  },

  clear: () => {
    localStorage.removeItem('tutorlinkToken');
    localStorage.removeItem('tutorlinkRefreshToken');
    localStorage.removeItem('tutorlinkUser');
    localStorage.removeItem('token');

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: true,
    });
  },
}));
