const { query } = require('./postgresService');

exports.getArticlesByScenario = async (scenarioId, page, limit) => {
  const offset = (page - 1) * limit;
  
  try {
    // 使用 postgresService 执行查询
    const articlesQuery = `
      SELECT id, content, created_at as "createdAt"
      FROM articles 
      WHERE scenario_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles
      WHERE scenario_id = $1
    `;
    
    const [articlesResult, countResult] = await Promise.all([
      query(articlesQuery, [scenarioId, limit, offset]),
      query(countQuery, [scenarioId])
    ]);

    const articles = articlesResult.rows;
    const total = parseInt(countResult.rows[0].total);

    return {
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  } catch (error) {
    console.error('获取场景文章错误:', error);
    throw new Error('获取场景文章失败');
  }
}; 