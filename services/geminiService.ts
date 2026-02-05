
import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAIAssistance(prompt: string, cartContext: string = "") {
  try {
    const menuContext = MENU_ITEMS.map(item => 
      `${item.name} (${item.category}): ${item.description} - ${item.price}TL`
    ).join("\n");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sen QuickServe restoranının akıllı dijital asistanısın. Müşterilere yemek seçimi konusunda yardımcı oluyorsun.
      
      Mevcut Menü:
      ${menuContext}
      
      Müşterinin Sepeti:
      ${cartContext}
      
      Müşterinin Sorusu:
      ${prompt}
      
      Kısa, nazik ve iştah açıcı bir cevap ver. Cevapların her zaman Türkçe olsun.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Üzgünüm, şu an asistan hizmeti veremiyorum. Lütfen garson çağırmayı deneyin.";
  }
}
