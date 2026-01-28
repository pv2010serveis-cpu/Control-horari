
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
  const [firstUser, setFirstUser] = useState(false);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('horari_users') || '[]');
    if (savedUsers.length === 0) {
      setIsRegistering(true);
      setFirstUser(true);
    }
  }, []);

  const handleAuth = (currentPin: string) => {
    const users: UserType[] = JSON.parse(localStorage.getItem('horari_users') || '[]');
    if (isRegistering) {
      if (name.trim().length < 3) { setError('Nom massa curt'); setPin(''); return; }
      const newUser: UserType = { 
        id: Math.random().toString(36).substr(2,9), 
        name: name.trim(), 
        pin: currentPin, 
        role: users.length === 0 ? 'ADMIN' : 'EMPLOYEE' 
      };
      localStorage.setItem('horari_users', JSON.stringify([...users, newUser]));
      onUserCreated(newUser);
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
    <div className="min-h-screen bg-[#F9FBFF] flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-100">
          <Fingerprint size={32} />
        </div>
        
        <h1 className="text-xl font-bold text-slate-800 mb-1 uppercase tracking-tight">CONTROL HORARI</h1>
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-8">
          {isRegistering ? 'Registre de perfil' : 'Accés amb PIN'}
        </p>

        <div className="space-y-6">
          {isRegistering && (
            <input 
              type="text" 
              placeholder="El teu nom" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-center text-sm" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          )}

          <div className="flex justify-center gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${pin.length > i ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-2 h-2 rounded-full ${pin.length > i ? 'bg-white' : 'bg-transparent'}`}></div>
              </div>
            ))}
          </div>

          {error && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}

          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','C','0','DEL'].map(k => (
              <button 
                key={k} 
                onClick={() => k === 'C' ? setPin('') : k === 'DEL' ? setPin(pin.slice(0,-1)) : addDigit(k)} 
                className="h-14 bg-slate-50 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center text-slate-700 hover:bg-indigo-50"
              >
                {k === 'DEL' ? <Delete size={18} /> : k}
              </button>
            ))}
          </div>

          {!firstUser && (
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setPin(''); setError(''); }} 
              className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto mt-4"
            >
              {isRegistering ? 'Login' : 'Nou perfil'} <ArrowRight size={12}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
