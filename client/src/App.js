import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CommentAnalyzer from './components/CommentAnalyzer';
import AuthPage from './components/AuthPage';
import { checkAuthStatus, clearAuthStatus, setAuthStatus } from './utils/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // 初始化时检查认证状态
    return checkAuthStatus();
  });

  useEffect(() => {
    // 定期检查会话状态
    const checkInterval = setInterval(() => {
      const isValid = checkAuthStatus();
      setIsAuthenticated(isValid);
    }, 60000); // 每分钟检查一次

    // 添加存储事件监听，用于多标签页同步
    const handleStorageChange = (e) => {
      if (e.key === 'auth_status' || e.key === 'auth_timestamp') {
        const isValid = checkAuthStatus();
        setIsAuthenticated(isValid);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleAuthSuccess = () => {
    setAuthStatus();
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuthStatus();
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? (
        <CommentAnalyzer onLogout={handleLogout} />
      ) : (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
    </ThemeProvider>
  );
}

export default App; 