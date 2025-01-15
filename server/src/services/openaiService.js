const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.analyzeWithGPT = async (text) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的情感分析助手，请分析以下评论的情感倾向、关键主题和具体观点。"
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 调用失败:', error);
    throw error;
  }
}; 