const { DashScopeChatClient } = require('@dashscope/api');

const client = new DashScopeChatClient({
  apiKey: process.env.DASHSCOPE_API_KEY
});

exports.analyzeWithQianWen = async (text) => {
  try {
    const response = await client.chat({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的情感分析助手，请分析以下评论的情感倾向、关键主题和具体观点。'
        },
        {
          role: 'user',
          content: text
        }
      ]
    });
    
    return response.output.text;
  } catch (error) {
    console.error('通义千问 API 调用失败:', error);
    throw error;
  }
}; 