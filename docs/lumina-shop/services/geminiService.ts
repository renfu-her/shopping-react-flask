import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShoppingAdvice = async (query: string, currentContext: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful and polite AI shopping assistant for "Lumina Shop".
      The user is currently looking at: ${currentContext}.
      
      Answer the user's question briefly and provide a recommendation if applicable.
      Keep the tone professional yet friendly. Max 100 words.
      
      User Question: ${query}`,
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the brain. Please try again later.";
  }
};