import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CommentAnalyzer from './components/CommentAnalyzer';
import ScenePage from './components/ScenePage';
import AuthPage from './components/AuthPage';
import { checkAuthStatus, clearAuthStatus, setAuthStatus } from './utils/auth';
import './styles/fonts.css';

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
    fontFamily: 'var(--font-family-base)',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { 
      fontWeight: 500,
      textTransform: 'none' // 防止按钮文字自动大写
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"liga" 1', // 启用连字
        },
      },
    },
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
      <BrowserRouter>
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<ScenePage onLogout={handleLogout} />} />
            <Route path="/comment-analyzer" element={<CommentAnalyzer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 