import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Identifiants incorrects.');
      }
    } catch (err) {
      setError('Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fadeIn">
        <div className="text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-5xl">travel_explore</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                TravelOps
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
                Plateforme de gestion de voyages
            </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-[20px]">person</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 pl-10 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                  placeholder="ex: admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 pl-10 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            {isLoading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
                "Se connecter"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Comptes démo</p>
            <div className="flex justify-center gap-4 text-xs font-mono text-slate-500">
               <span className="bg-slate-100 px-2 py-1 rounded">admin / password</span>
               <span className="bg-slate-100 px-2 py-1 rounded">agent / password</span>
            </div>
        </div>
      </div>
    </div>
  );
};