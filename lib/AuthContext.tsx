"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    clearTokens,
    getAccessToken,
    getMe,
    refreshToken,
    setTokens,
    UserInfo,
} from "./api";

interface AuthState {
    user: UserInfo | null;
    loading: boolean;
    login: (access: string, refresh: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    setUser: (u: UserInfo | null) => void;
}

const AuthContext = createContext<AuthState>({
    user: null,
    loading: true,
    login: async () => { },
    logout: () => { },
    refreshUser: async () => { },
    setUser: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const me = await getMe();
            setUser(me);
        } catch (_) {
            // token 可能过期，尝试刷新
            try {
                const stored = localStorage.getItem("refresh_token");
                if (stored) {
                    const newTokens = await refreshToken(stored);
                    setTokens(newTokens.access_token, newTokens.refresh_token);
                    const me = await getMe();
                    setUser(me);
                } else {
                    clearTokens();
                }
            } catch (_) {
                clearTokens();
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = useCallback(async (access: string, refresh: string) => {
        setTokens(access, refresh);
        const me = await getMe();
        setUser(me);
    }, []);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
