import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBingoCall = async (number: number, letter: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found, skipping AI generation.");
    return "";
  }

  try {
    const prompt = `Genereer een korte, grappige, traditionele of rijmende bingo-uitspraak in het Nederlands voor het getal "${letter}-${number}". 
    Voorbeelden: "Twee zwaantjes, 22", "Eenzaam en alleen, 1", "Johan Cruijff, 14".
    Houd het korter dan 8 woorden. Gebruik geen aanhalingstekens in de output. Alleen de uitspraak. Wees grappig, maar geen grappen over oude mensen.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating bingo call:", error);
    return "";
  }
};