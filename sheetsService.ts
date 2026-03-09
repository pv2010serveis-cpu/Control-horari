
import { ClockEntry } from "./types";

export const syncToSheets = async (entry: ClockEntry, url: string): Promise<boolean> => {
  if (!url || !url.startsWith('https://script.google.com')) {
    console.error("URL de Google Sheets no vàlida");
    return false;
  }

  try {
    // Utilitzem 'text/plain' per evitar peticions OPTIONS (pre-flight) que Apps Script no gestiona bé.
    // El script de Google rebrà el JSON igualment a e.postData.contents.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(entry),
    });
    
    // Amb mode 'no-cors' no podem llegir la resposta (opaque), 
    // però si no hi ha una excepció de xarxa, donem per fet que s'ha enviat.
    console.log("Petició enviada a Google Sheets");
    return true;
  } catch (error) {
    console.error("Error de xarxa sincronitzant amb Sheets:", error);
    return false;
  }
};
