
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  UserX, 
  User, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare,
  ArrowUp
} from 'lucide-react';

interface SettingsViewProps {
  sheetsUrl: string;
  onUpdateUrl: (url: string) => void;
  onResetProfile: () => void;
  onClearHistory: () => void;
  employeeName: string;
  isAdmin: boolean;
  installPrompt: any;
  onInstall: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  sheetsUrl, 
  onUpdateUrl, 
  onResetProfile, 
  onClearHistory,
  employeeName,
  isAdmin,
  installPrompt,
  onInstall
}) => {
  const [url, setUrl] = useState(sheetsUrl);
  const [saved, setSaved] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setUrl(sheetsUrl);
  }, [sheetsUrl]);

  const handleSave = () => {
    onUpdateUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 pb-24">
      {/* SECCIÓ D'INSTAL·LACIÓ */}
      {!isStandalone && (
        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-4 mb-6">
            <Smartphone size={32} />
            <div>
              <h3 className="text-xl font-bold">Instal·lar HorariPro</h3>
              <p className="text-indigo-100 text-sm">Afegeix l'app al teu escriptori.</p>
            </div>
          </div>
          {isIOS ? (
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-xs leading-relaxed">
              Prem <Share size={14} className="inline mx-1" /> <strong>Compartir</strong> i després <strong>"Afegir a la pantalla d'inici"</strong> <PlusSquare size={14} className="inline mx-1" />.
            </div>
          ) : (
            <button 
              onClick={onInstall}
              className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-lg"
            >
              <Download size={20} /> Instal·lar Ara
            </button>
          )}
        </div>
      )}

      {/* Google Sheets Config (VISIBLE PER A TOTS) */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sincronització Excel</h3>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Configuració de connexió</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Enllaç de Google Apps Script"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              saved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
            }`}
          >
            <CheckCircle2 size={18} /> {saved ? 'Enllaç Guardat!' : 'Actualitzar Enllaç'}
          </button>
        </div>
      </div>

      {/* Gestió del Perfil */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
            <User size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Compte d'usuari</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-700">{employeeName}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Dades locals</p>
            </div>
            <button 
              onClick={onResetProfile}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-100 active:scale-95 transition-all"
            >
              <UserX size={18} />
              Reiniciar App
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 text-amber-800 text-xs border border-amber-100">
            <AlertCircle size={20} className="shrink-0" />
            <p><strong>ATENCIÓ:</strong> El botó "Reiniciar App" esborra tot el teu perfil d'aquest mòbil. Hauràs de tornar a introduir el teu nom per entrar.</p>
          </div>

          {isAdmin && (
            <button 
              onClick={onClearHistory}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-slate-400 text-[10px] uppercase font-bold hover:text-rose-500 transition-colors"
            >
              <Trash2 size={14} /> Buidar registre de fitxatges local
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
