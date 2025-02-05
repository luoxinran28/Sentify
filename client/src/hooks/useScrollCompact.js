import { useState, useEffect } from 'react';

const useScrollCompact = (threshold = 50) => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldCompact = window.scrollY > threshold;
      if (isCompact !== shouldCompact) {
        setIsCompact(shouldCompact);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isCompact]);

  return isCompact;
};

export default useScrollCompact; 