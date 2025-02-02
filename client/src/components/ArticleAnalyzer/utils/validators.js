export const validateArticle = (article, existingArticles) => {
  if (!article || typeof article !== 'string') {
    return {
      isValid: false,
      error: '文章内容不能为空'
    };
  }

  const trimmedArticle = article.trim();
  
  if (trimmedArticle.length === 0) {
    return {
      isValid: false,
      error: '文章内容不能为空'
    };
  }

  // 检查重复
  const isDuplicate = existingArticles.some(existing => 
    typeof existing === 'string' 
      ? existing.trim() === trimmedArticle
      : existing.text.trim() === trimmedArticle
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: '当前场景已存在相同的文章'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

export const validateExcelFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: '请选择文件'
    };
  }

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '只支持 Excel 文件格式 (.xlsx, .xls)'
    };
  }

  return {
    isValid: true,
    error: null
  };
}; 