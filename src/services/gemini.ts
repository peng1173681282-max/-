import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface FortuneResult {
  title: string;
  verse: string;
  meaning: string;
  advice: string;
  level: "大吉" | "上吉" | "中吉" | "中平" | "下下";
}

export async function interpretFortune(verse: string, context: string): Promise<FortuneResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `请作为一位深谙道家文化的解签大师，为我解读以下签诗。
    签诗：${verse}
    求签者关注点：${context}
    
    请返回JSON格式，包含：
    title: 签位名称 (如：第一签)
    verse: 原文签诗
    meaning: 签诗大意
    advice: 针对求签者的建议
    level: 签的等级 (大吉, 上吉, 中吉, 中平, 下下)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          verse: { type: Type.STRING },
          meaning: { type: Type.STRING },
          advice: { type: Type.STRING },
          level: { 
            type: Type.STRING,
            enum: ["大吉", "上吉", "中吉", "中平", "下下"]
          }
        },
        required: ["title", "verse", "meaning", "advice", "level"]
      }
    }
  });

  return JSON.parse(response.text);
}
