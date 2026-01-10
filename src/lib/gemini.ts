import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function summarizeFhcNews(stockName: string, stockId: string, newsHeadlines: string[]) {
    const prompt = `
    你是一位專業的台灣金融分析師。請針對以下關於「${stockName} (${stockId})」的近期新聞標題進行綜合分析與摘要：
    
    新聞標題：
    ${newsHeadlines.join("\n")}
    
    請提供：
    1. **核心摘要**：用兩三句話總結目前的主要趨勢（利多或利空）。
    2. **情緒評分**：從 -100 (極度悲觀) 到 +100 (極度樂觀) 給出一個數字。
    3. **關鍵風險/機會**：指出一個最值得注意的點。
    
    輸出格式要求為 JSON：
    {
      "summary": "...",
      "sentimentScore": number,
      "highlight": "..."
    }
    
    語言請使用繁體中文。
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up potential markdown formatting in response
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return {
            summary: "暫時無法分析新聞，請確認 API Key 是否設定正確。",
            sentimentScore: 0,
            highlight: "連線異常"
        };
    }
}
