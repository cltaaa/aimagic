import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const getBase64Data = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error('无效的数据 URL 格式');
  }
  return { mimeType: match[1], data: match[2] };
};

export const translateToEnglish = async (text: string): Promise<string> => {
  try {
    const apiKey = "AIzaSyCuCkINzjnHkrU0_QXjdO-i2POO5aF7vqA";
    if (!apiKey) {
      throw new Error("API 密钥未设置。");
    }
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following Chinese text to English. Only return the translated English text, without any introductory phrases or explanations. Chinese text: "${text}"`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("翻译时出错:", error);
    // 如果翻译失败，则回退到原始文本
    return text;
  }
};

export const editImageWithNanoBanana = async (
  userImage: string,
  referenceImage: string,
  prompt: string
): Promise<{ image: string | null; text: string | null; error?: string }> => {
  try {
    const apiKey = "AIzaSyCuCkINzjnHkrU0_QXjdO-i2POO5aF7vqA";
    if (!apiKey) {
      throw new Error("API 密钥未设置。");
    }
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const translatedPrompt = await translateToEnglish(prompt);

    const userImageData = getBase64Data(userImage);
    const referenceImageData = getBase64Data(referenceImage);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: userImageData.data, mimeType: userImageData.mimeType } },
          { inlineData: { data: referenceImageData.data, mimeType: referenceImageData.mimeType } },
          { text: translatedPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let generatedImage: string | null = null;
    let generatedText: string | null = null;

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          generatedText = part.text;
        }
      }
    }
    
    if (!generatedImage) {
        return { image: null, text: generatedText, error: '模型未返回图片。' };
    }

    return { image: generatedImage, text: generatedText };
  } catch (error) {
    console.error("调用 Gemini API 时出错:", error);
    return { image: null, text: null, error: (error as Error).message };
  }
};