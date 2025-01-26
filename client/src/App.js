import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ArticleAnalyzer from './components/ArticleAnalyzer';
import AuthPage from './components/AuthPage';
import { checkAuthStatus, clearAuthStatus, setAuthStatus } from './utils/auth';
import './styles/fonts.css';
import SceneList from './components/ScenePage/SceneList';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAuthStatus());
  }, []);

  const handleAuthSuccess = (user) => {
    setAuthStatus(user);
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
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <SceneList onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage onAuthSuccess={handleAuthSuccess} />
              )
            } 
          />
          <Route 
            path="/article-analyzer/:scenarioId" 
            element={
              isAuthenticated ? (
                <ArticleAnalyzer />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 