module.exports = {
  // ... 其他配置 ...
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error.message === 'ResizeObserver loop limit exceeded') {
            return false;
          }
          return true;
        },
      },
    },
  },
  stats: {
    warnings: true,
    warningsFilter: [
      /ResizeObserver loop/,
    ],
  },
  
  // ... 其他配置 ...
}; 