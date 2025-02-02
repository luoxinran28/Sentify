import React, { useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const InfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
  threshold = 1.5,
  containerRef,
  children,
  loadingSpinner
}) => {
  const debouncedLoadMore = useCallback(
    debounce(() => {
      if (!loading && hasMore) {
        onLoadMore();
      }
    }, 300),
    [loading, hasMore, onLoadMore]
  );

  const handleScroll = useCallback(() => {
    const container = containerRef?.current || document.documentElement;
    const { scrollTop, clientHeight, scrollHeight } = container;
    
    if (!loading && hasMore && scrollHeight - scrollTop <= clientHeight * threshold) {
      debouncedLoadMore();
    }
  }, [debouncedLoadMore, containerRef, threshold, loading, hasMore]);

  useEffect(() => {
    const container = containerRef?.current || window;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, containerRef]);

  return (
    <>
      {children}
      {loading && hasMore && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4,
            mb: 4
          }}
        >
          {loadingSpinner || <CircularProgress size={24} />}
        </Box>
      )}
    </>
  );
};

InfiniteScroll.propTypes = {
  loading: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  threshold: PropTypes.number,
  containerRef: PropTypes.object,
  children: PropTypes.node.isRequired,
  loadingSpinner: PropTypes.node
};

export default InfiniteScroll; 