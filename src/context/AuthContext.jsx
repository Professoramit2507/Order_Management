import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { lsGet, lsSet } from '../utils/helpers';

const AuthContext = createContext(null);

const DEMO_USER = { id: 'demo', name: 'Demo User', email: 'demo@inventory.com', password: 'demo1234', role: 'Admin' };

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => lsGet('auth_user', null));
    const [accounts, setAccounts] = useState(() => lsGet('auth_accounts', [DEMO_USER]));

    useEffect(() => { lsSet('auth_accounts', accounts); }, [accounts]);
    useEffect(() => { lsSet('auth_user', user); }, [user]);

    const login = useCallback((email, password) => {
        const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
        if (!found) return { ok: false, error: 'Invalid email or password.' };
        const { password: _, ...safeUser } = found;
        setUser(safeUser);
        return { ok: true };
    }, [accounts]);

    const signup = useCallback((name, email, password) => {
        if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase()))
            return { ok: false, error: 'An account with this email already exists.' };
        const newUser = { id: `user-${Date.now()}`, name, email, password, role: 'Manager' };
        setAccounts(prev => [...prev, newUser]);
        const { password: _, ...safeUser } = newUser;
        setUser(safeUser);
        return { ok: true };
    }, [accounts]);

    const logout = useCallback(() => setUser(null), []);

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
