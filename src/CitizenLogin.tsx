import React, { useState } from 'react';
import { ShieldCheck, User, Phone, ArrowRight, Building2 } from 'lucide-react';

interface CitizenLoginProps {
  onLogin: (userData: { name: string; phone: string }) => void;
}

export default function CitizenLogin({ onLogin }: CitizenLoginProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError('Please enter your full legal name.');
      return;
    }
    if (phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    // Save to browser's secure local storage
    const userData = { name: name.trim(), phone: phone.trim() };
    localStorage.setItem('civic_user_session', JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          CivicTech Portal Access
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Verify your identity to log infrastructure & safety reports
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Citizen Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm placeholder-slate-400 transition-shadow outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mobile Number (For OTP Verification)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm placeholder-slate-400 transition-shadow outline-none"
                />
              </div>
            </div>

            <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
              Your data is encrypted locally. By logging in, you agree to civic reporting guidelines.
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              Authenticate & Enter
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
