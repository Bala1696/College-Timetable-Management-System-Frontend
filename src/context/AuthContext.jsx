import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

import { io } from 'socket.io-client';

const AuthContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Check if token exists and valid
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);

        // Initialize Socket
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && user) {
            // Join user-specific room for targeted events
            socket.emit('setup', user.id);

            socket.on('forced-logout', () => {
                console.log('📢 Forced logout received via socket');
                // Don't call the full logout() to avoid infinite loops 
                // but clear local state exactly like logout does.
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/login'; // Force redirect
            });
        }

        return () => {
            if (socket) socket.off('forced-logout');
        };
    }, [socket, user]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            // This will trigger the socket event on the backend, 
            // which will then hit all OTHER tabs (and this one, handled by id check if we wanted, 
            // but here we just clear local anyway)
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API failed', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, socket }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
