
import { GoogleGenAI } from "@google/genai";
import { ClockEntry } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateMonthlyInsights = async (entries: ClockEntry[], monthName: string) => {
  if (!process.env.API_KEY) return "Configura la clau API per rebre anàlisis.";

  try {
    const prompt = `Analitza aquests registres de control horari per al mes de ${monthName} i genera un resum motivador i professional en català. 
    Registres: ${JSON.stringify(entries.slice(0, 50))}...
    L'usuari ha treballat diverses jornades. Comenta sobre la puntualitat, hores extres o suggeriments de benestar laboral.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "Ets un assistent de recursos humans amable i professional anomenat HorariPro AI. Respon sempre en català."
      }
    });

    return response.text || "No s'ha pogut generar l'anàlisi.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Error al connectar amb el servei d'intel·ligència artificial.";
  }
};
