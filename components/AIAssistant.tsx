
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { TimeEntry, VacationRequest } from '../types';

interface AIAssistantProps {
  entries: TimeEntry[];
  vacations: VacationRequest[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ entries, vacations }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    {role: 'bot', text: 'Hola! Soc l\'expert en RH de CONTROL HORARI. Com puc ajudar-te avui? Puc revisar els teus fitxatges, el calendari de 2026 o explicar-te quants dies de vacances tens.'}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userMessage}]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const approvedVacations = vacations.filter(v => v.status === 'APPROVED' && v.userId !== 'system');

      const systemInstruction = `
        Ets un assistent de recursos humans expert per a l'aplicació "CONTROL HORARI".
        Context de l'usuari actual:
        - Nom de l'usuari: Treballador de CONTROL HORARI.
        - Entrades/Sortides recents: ${entries.length} registres.
        - Vacances aprovades: ${approvedVacations.length} períodes.
        - Calendari laboral actual: Sector Construcció Tarragona 2026.
        - Proper festiu: 1 de Maig (Festa del Treball).
        
        Regles:
        1. Respon sempre en CATALÀ.
        2. Sigues amable, professional i concís.
        3. Si l'usuari pregunta per vacances, recorda-li que les pot demanar a la pestanya "Calendari".
        4. No inventis dades personals que no tinguis, demana aclariments si cal.
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const botText = response.text || "Ho sento, he tingut un problema processant la teva resposta. Torna-ho a intentar.";
      setMessages(prev => [...prev, {role: 'bot', text: botText}]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {role: 'bot', text: "Sembla que hi ha un error de connexió amb el meu cervell digital. Revisa la teva clau d'API o la connexió."}]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
      <div className="p-8 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tight">Assistent AI</h3>
            <p className="text-indigo-100 text-xs font-medium opacity-80 uppercase tracking-widest">RRHH Intel·ligent</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">En línia</div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-indigo-600'
              }`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm rounded-tl-none">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-3 p-3 bg-slate-50 rounded-[2rem] border-2 border-slate-100 focus-within:border-indigo-400 focus-within:bg-white transition-all duration-300">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta'm sobre les teves hores, vacances..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-700 font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-30 active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
