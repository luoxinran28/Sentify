import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CommentAnalyzer from './components/CommentAnalyzer';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CommentAnalyzer />
    </ThemeProvider>
  );
}

export default App; 