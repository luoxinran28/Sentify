const axios = require('axios');

const getBaiduAccessToken = async () => {
  const API_KEY = process.env.BAIDU_API_KEY;
  const SECRET_KEY = process.env.BAIDU_SECRET_KEY;
  
  const response = await axios.post(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`
  );
  
  return response.data.access_token;
};

exports.analyzeWithERNIE = async (text) => {
  const accessToken = await getBaiduAccessToken();
  
  try {
    const response = await axios.post(
      `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`,
      {
        messages: [
          {
            role: "system",
            content: "你是一个专业的情感分析助手，请分析以下评论的情感倾向、关键主题和具体观点。"
          },
          {
            role: "user",
            content: text
          }
        ]
      }
    );
    
    return response.data.result;
  } catch (error) {
    console.error('文心一言 API 调用失败:', error);
    throw error;
  }
}; 