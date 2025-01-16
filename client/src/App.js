import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CommentAnalyzer from './components/CommentAnalyzer';
import AuthPage from './components/AuthPage';
import { checkAuthStatus, clearAuthStatus } from './utils/auth';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查认证状态
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus);

    // 添加页面可见性变化监听
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏时清除认证状态
        clearAuthStatus();
        setIsAuthenticated(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('auth_status', 'verified');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? (
        <CommentAnalyzer />
      ) : (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
    </ThemeProvider>
  );
}

export default App; 