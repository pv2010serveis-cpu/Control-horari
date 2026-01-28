
import React, { useState, useEffect } from 'react';
import { Fingerprint, Delete, ArrowRight, Shield } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
  onUserCreated: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onUserCreated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // L'Albert és l'admin per defecte
  const ADMIN_USER: UserType = {
    id: 'admin-albert',
    name: 'Albert',
    pin: '9999',
    role: 'ADMIN'
  };

  const handleAuth = (currentPin: string) => {
    setError('');
    
    // Cas especial: Administrador Albert
    if (currentPin === '9999') {
      onLogin(ADMIN_USER);
      return;
    }

    const users: UserType[] = JSON.parse(localStorage.getItem('horari_users') || '[]');
    
    if (isRegistering) {
      if (name.trim().length < 3) { 
        setError('Nom massa curt'); 
        setPin(''); 
        return; 
      }
      if (currentPin === '9999') {
        setError('Aquest PIN està reservat');
        setPin('');
        return;
      }
      
      const newUser: UserType = { 
        id: Math.random().toString(36).substr(2,9), 
        name: name.trim(), 
        pin: currentPin, 
        role: 'EMPLOYEE' // Tots els nous són empleats
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('horari_users', JSON.stringify(updatedUsers));
      onUserCreated(newUser);
      onLogin(newUser);
    } else {
      const user = users.find(u => u.pin === currentPin);
      if (user) {
        onLogin(user);
      } else {
        setError('PIN incorrecte');
        setPin('');
      }
    }
  };

  const addDigit = (d: string) => {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => handleAuth(next), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-100">
          <Fingerprint size={32} />
        </div>
        
        <h1 className="text-xl font-bold text-slate-800 mb-1 uppercase tracking-tight">CONTROL HORARI</h1>
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-8">
          {isRegistering ? 'Registre de nou empleat' : 'Accés amb PIN'}
        </p>

        <div className="space-y-6">
          {isRegistering && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <input 
                type="text" 
                placeholder="Nom de l'empleat" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-center text-sm focus:border-indigo-400 transition-all" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}

          <div className="flex justify-center gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${pin.length > i ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-2 h-2 rounded-full ${pin.length > i ? 'bg-white' : 'bg-transparent'}`}></div>
              </div>
            ))}
          </div>

          {error && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">{error}</p>}

          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','C','0','DEL'].map(k => (
              <button 
                key={k} 
                onClick={() => k === 'C' ? setPin('') : k === 'DEL' ? setPin(pin.slice(0,-1)) : addDigit(k)} 
                className="h-14 bg-slate-50 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center text-slate-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 shadow-sm"
              >
                {k === 'DEL' ? <Delete size={18} /> : k}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setPin(''); setError(''); }} 
            className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto mt-4 hover:text-indigo-700 transition-colors"
          >
            {isRegistering ? 'Ja tinc un compte (Login)' : 'Nou treballador (Registre)'} <ArrowRight size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
