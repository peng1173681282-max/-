import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateComicBackground(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A vibrant manhua (Chinese comic) style illustration of a traditional Taoist temple. In the foreground, a large, ornate bronze incense burner with wisps of white smoke. Wide stone stairs lead up to a grand two-story wooden temple building with red pillars, intricate carvings, and traditional tiled roofs with red lanterns hanging. Lush green trees and misty mountains in the background. Bright, saturated colors, clean black outlines, cel-shaded style, high quality, 16:9 aspect ratio.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Failed to generate background:", error);
    // Fallback to a high-quality placeholder if generation fails
    return "https://images.unsplash.com/photo-1548102268-3d7469f0061d?q=80&w=1920&auto=format&fit=crop";
  }
}
