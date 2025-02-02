import { useState } from 'react';

export const useSelection = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState(new Set());

  const handleToggleSelect = () => {
    setIsSelecting(!isSelecting);
    setSelectedArticles(new Set());
  };

  const handleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(Array.from({ length: articles.length }, (_, i) => i)));
    }
  };

  const handleToggleArticle = (index) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedArticles(newSelected);
  };

  return {
    isSelecting,
    selectedArticles,
    handleToggleSelect,
    handleSelectAll,
    handleToggleArticle
  };
}; 