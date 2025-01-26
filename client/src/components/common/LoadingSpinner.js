import React from 'react';
import { Box } from '@mui/material';

const LoadingSpinner = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        margin: '0 auto',
        animation: 'rotate 1s linear infinite',
        '@keyframes rotate': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          }
        }
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#ababab"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80, 200"
          strokeDashoffset="0"
          opacity="0.7"
        />
      </svg>
    </Box>
  );
};

export default LoadingSpinner; 