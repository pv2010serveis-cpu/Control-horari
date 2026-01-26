
import React, { useState, useEffect } from 'react';
import { User, Lock, Fingerprint, Delete, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUsers = localStorage.getItem('horacerta_users');
    if (!savedUsers) setIsRegistering(true);
  }, []);

  const handleAuth = (currentPin: string) => {
    const users: UserType[] = JSON.parse(localStorage.getItem('horacerta_users') || '[]');
    if (isRegistering) {
      if (name.length < 3) { setError('Nom massa curt'); setPin(''); return; }
      const newUser: UserType = { id: Math.random().toString(36).substr(2,9), name, pin: currentPin, role: users.length === 0 ? 'ADMIN' : 'EMPLOYEE' };
      localStorage.setItem('horacerta_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.pin === currentPin);
      if (user) onLogin(user);
      else { setError('PIN incorrecte'); setPin(''); }
    }
  };

  const addDigit = (d: string) => {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      if (next.length === 4) setTimeout(() => handleAuth(next), 300);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl rotate-6">
          <Fingerprint size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">CONTROL HORARI</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">{isRegistering ? 'Nou Registre' : 'Accés Segur'}</p>

        <div className="space-y-8">
          {isRegistering && (
            <input type="text" placeholder="El teu nom" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-center" value={name} onChange={e => setName(e.target.value)} />
          )}

          <div className="flex justify-center gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${pin.length > i ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-3 h-3 rounded-full ${pin.length > i ? 'bg-white' : 'bg-transparent'}`}></div>
              </div>
            ))}
          </div>

          {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}

          <div className="grid grid-cols-3 gap-4">
            {['1','2','3','4','5','6','7','8','9','C','0','DEL'].map(k => (
              <button key={k} onClick={() => k === 'C' ? setPin('') : k === 'DEL' ? setPin(pin.slice(0,-1)) : addDigit(k)} className="h-20 bg-slate-50 rounded-2xl font-black text-2xl active:scale-90 transition-all flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600">
                {k === 'DEL' ? <Delete /> : k}
              </button>
            ))}
          </div>

          <button onClick={() => { setIsRegistering(!isRegistering); setPin(''); setError(''); }} className="text-[10px] text-indigo-500 font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
            {isRegistering ? 'Ja tinc PIN' : 'Crear nou usuari'} <ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
