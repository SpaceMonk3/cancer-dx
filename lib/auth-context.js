'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = Cookies.get('auth_token');
    const userData = Cookies.get('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with actual authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user_id,
          email: data.email,
          name: data.name || email.split('@')[0],
        };

        Cookies.set('auth_token', data.token, { expires: 7 });
        Cookies.set('user_data', JSON.stringify(userData), { expires: 7 });
        setUser(userData);
        return { success: true };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    setUser(null);
  };

  const getToken = () => {
    return Cookies.get('auth_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      getToken,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};