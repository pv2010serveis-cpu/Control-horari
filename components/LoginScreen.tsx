
import React, { useState } from 'react';
import { Lock, Delete, UserCircle, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (code: string, name?: string) => void;
  savedName: string | null;
  savedCode: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, savedName, savedCode }) => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const isFirstLogin = !savedName;

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setError(false);
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Cas 1: Registre inicial
        if (isFirstLogin) {
          if (!name.trim()) {
            alert("Per favor, introdueix el teu nom primer.");
            setPin('');
            return;
          }
          setTimeout(() => onLogin(newPin, name), 300);
        } 
        // Cas 2: Login recurrent (validació de PIN)
        else {
          // El PIN ha de coincidir amb el guardat o ser el codi d'admin 9999
          if (newPin === savedCode || newPin === '9999') {
            setTimeout(() => onLogin(newPin), 300);
          } else {
            setTimeout(() => {
              setError(true);
              setPin('');
              // Feedback de vibració si el navegador ho permet
              if ('vibrate' in navigator) navigator.vibrate(200);
            }, 300);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8 transition-all duration-300 ${error ? 'animate-shake border-2 border-rose-500' : ''}`}>
        <div className="flex flex-col items-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${error ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {error ? <AlertCircle size={28} /> : isFirstLogin ? <UserCircle size={28} /> : <Lock size={28} />}
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            {isFirstLogin ? 'Registre Inicial' : `Hola, ${savedName}`}
          </h1>
          <p className={`text-xs text-center mt-2 px-4 font-medium ${error ? 'text-rose-500' : 'text-slate-500'}`}>
            {error 
              ? 'PIN incorrecte. Torna-ho a provar.' 
              : isFirstLogin 
                ? 'Configura el teu nom i el PIN que vulguis utilitzar.' 
                : 'Introdueix el teu PIN per accedir.'}
          </p>
        </div>

        {isFirstLogin && (
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Nom i Cognoms</label>
            <input 
              type="text" 
              placeholder="Ex: Joan Garcia i Mas"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-10 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                pin.length > i 
                  ? (error ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-indigo-600 bg-indigo-50 text-indigo-600 scale-105') 
                  : 'border-slate-100 bg-slate-50 text-slate-300'
              }`}
            >
              {pin[i] ? '●' : ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-lg font-bold text-slate-700 active:bg-indigo-600 active:text-white transition-colors outline-none"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumberClick('0')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-lg font-bold text-slate-700 active:bg-indigo-600 active:text-white transition-colors outline-none"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-rose-500 flex items-center justify-center active:bg-rose-500 active:text-white transition-colors outline-none"
          >
            <Delete size={20} />
          </button>
        </div>

        <div className="text-center mt-8">
            <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">HorariPro Security</p>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
