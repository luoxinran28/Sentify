import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { authService } from '../services';

const CodeInput = styled(TextField)(({ theme }) => ({
  width: '50px',
  height: '60px',
  '& .MuiInputBase-root': {
    height: '100%',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }
  },
  '& input': {
    textAlign: 'center',
    fontSize: '1.5rem',
    padding: '8px',
    '-webkit-text-security': 'disc',
  },
  [theme.breakpoints.down('sm')]: {
    width: '45px',
    height: '55px',
  },
}));

function AuthPage({ onAuthSuccess }) {
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    // 确保只处理数字输入
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;

    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    if (numericValue && index < 3) {
      inputRefs[index + 1].current.focus();
    }

    if (newCode.every(digit => digit) && numericValue) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (fullCode) => {
    try {
      const result = await authService.verify(fullCode);
      if (result.success) {
        onAuthSuccess(result.user);
      } else {
        setError('验证码错误');
        // 清空输入
        setCode(['', '', '', '']);
        inputRefs[0].current.focus();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 组件加载时聚焦第一个输入框
  useEffect(() => {
    inputRefs[0].current.focus();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '64vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6
        }}
        onContextMenu={e => e.preventDefault()}
      >
        <Typography 
          variant="subtitle1" 
          align="center" 
          gutterBottom
          sx={{ 
            color: 'text.disabled',
            maxWidth: '80%',
            lineHeight: 1.6
          }}
        >
            <div>如需访问该页面，请联系:</div>
            <div>luo.xinran@foxmail.com</div>
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center'
            }}
          >
            {code.map((digit, index) => (
              <CodeInput
                key={index}
                inputRef={inputRefs[index]}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={e => e.preventDefault()}
                inputProps={{
                  maxLength: 1,
                  autoComplete: 'off',
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: {
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={1000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default AuthPage; 