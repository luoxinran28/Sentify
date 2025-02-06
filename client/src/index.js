import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { handleGlobalError, setupResizeObserverError, setupGlobalErrorHandlers } from './utils/errorHandler';
import ErrorBoundary from './components/common/ErrorBoundary';

// 设置全局错误处理
window.onerror = handleGlobalError;

// 设置 ResizeObserver 错误处理
setupResizeObserverError();

// 设置其他全局错误处理器
setupGlobalErrorHandlers();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
); 