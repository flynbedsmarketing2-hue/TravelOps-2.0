import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  user?: User;
  currentView?: 'dashboard' | 'form' | 'users' | 'sales' | 'voyages' | 'ops';
  onNavigateHome: () => void;
  onNavigateUsers?: () => void;
  onNavigateSales?: () => void;
  onNavigateVoyages?: () => void;
  onNavigateOps?: () => void;
  onLogout?: () => void;
  showSaveDraft?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  currentView,
  onNavigateHome, 
  onNavigateUsers, 
  onNavigateSales, 
  onNavigateVoyages,
  onNavigateOps,
  onLogout, 
  showSaveDraft = false 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Helper for desktop nav classes
  const getNavClass = (isActive: boolean) => 
    `hidden md:flex items-center justify-center rounded-lg h-9 px-4 text-sm font-bold transition-all ${
      isActive 
      ? 'bg-primary/10 text-primary shadow-sm' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`;

  // Helper for mobile nav classes
  const getMobileNavClass = (isActive: boolean) => 
    `flex items-center w-full px-4 py-3 text-sm font-bold transition-all rounded-xl ${
      isActive 
      ? 'bg-primary/10 text-primary' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const handleMobileNav = (action?: () => void) => {
      if (action) action();
      setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={onNavigateHome}
            title="Retour au Dashboard"
          >
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 p-2 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-2xl">travel_explore</span>
            </div>
            <h2 className="text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              TravelOps
            </h2>
          </div>
          
          {user && (
            <>
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    {showSaveDraft && (
                        <button 
                            onClick={() => alert('Brouillon sauvegardé temporairement !')}
                            className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors mr-2"
                        >
                        <span className="mr-2 material-symbols-outlined text-[18px]">save</span>
                        Sauvegarder
                        </button>
                    )}

                    <button onClick={onNavigateHome} className={getNavClass(currentView === 'dashboard')}>
                        <span className="mr-2 material-symbols-outlined text-[18px]">dashboard</span>
                        Dashboard
                    </button>

                    {onNavigateVoyages && (
                        <button onClick={onNavigateVoyages} className={getNavClass(currentView === 'voyages')}>
                        <span className="mr-2 material-symbols-outlined text-[18px]">public</span>
                        Voyages
                        </button>
                    )}

                    {onNavigateSales && (
                        <button onClick={onNavigateSales} className={getNavClass(currentView === 'sales')}>
                        <span className="mr-2 material-symbols-outlined text-[18px]">sell</span>
                        Ventes
                        </button>
                    )}

                    {onNavigateOps && (
                         <button onClick={onNavigateOps} className={getNavClass(currentView === 'ops')}>
                         <span className="mr-2 material-symbols-outlined text-[18px]">flight_takeoff</span>
                         Opérations
                         </button>
                    )}

                    {user.role === 'administrator' && onNavigateUsers && (
                        <button onClick={onNavigateUsers} className={getNavClass(currentView === 'users')}>
                        <span className="mr-2 material-symbols-outlined text-[18px]">group</span>
                        Équipe
                        </button>
                    )}
                </nav>

                {/* Desktop User Profile */}
                <div className="hidden md:flex items-center gap-4 border-l border-slate-200 pl-4 ml-2">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="relative group">
                        <div 
                            className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-100 flex items-center justify-center bg-slate-50 text-slate-400 cursor-pointer hover:border-primary transition-colors" 
                            style={user.avatarUrl ? { backgroundImage: `url("${user.avatarUrl}")` } : {}}
                        >
                            {!user.avatarUrl && <span className="material-symbols-outlined">person</span>}
                        </div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 hidden group-hover:block animate-fadeIn">
                            <button 
                                onClick={onLogout}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </>
          )}
      </div>

      {/* Mobile Menu Dropdown */}
      {user && isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-xl p-4 flex flex-col gap-2 z-40 animate-fadeIn">
                {/* User Info Mobile */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
                    <div 
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-slate-200 flex items-center justify-center bg-white text-slate-400" 
                        style={user.avatarUrl ? { backgroundImage: `url("${user.avatarUrl}")` } : {}}
                    >
                        {!user.avatarUrl && <span className="material-symbols-outlined">person</span>}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                        <p className="text-xs text-slate-500 uppercase">{user.role.replace('_', ' ')}</p>
                    </div>
                </div>

                {showSaveDraft && (
                    <button 
                        onClick={() => handleMobileNav(() => alert('Brouillon sauvegardé !'))}
                        className="flex items-center w-full px-4 py-3 text-sm font-bold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                    >
                    <span className="mr-3 material-symbols-outlined text-[20px]">save</span>
                    Sauvegarder Brouillon
                    </button>
                )}

                <button onClick={() => handleMobileNav(onNavigateHome)} className={getMobileNavClass(currentView === 'dashboard')}>
                    <span className="mr-3 material-symbols-outlined text-[20px]">dashboard</span>
                    Dashboard
                </button>

                {onNavigateVoyages && (
                    <button onClick={() => handleMobileNav(onNavigateVoyages)} className={getMobileNavClass(currentView === 'voyages')}>
                    <span className="mr-3 material-symbols-outlined text-[20px]">public</span>
                    Catalogue Voyages
                    </button>
                )}

                {onNavigateSales && (
                    <button onClick={() => handleMobileNav(onNavigateSales)} className={getMobileNavClass(currentView === 'sales')}>
                    <span className="mr-3 material-symbols-outlined text-[20px]">sell</span>
                    Gestion Ventes
                    </button>
                )}

                {onNavigateOps && (
                    <button onClick={() => handleMobileNav(onNavigateOps)} className={getMobileNavClass(currentView === 'ops')}>
                    <span className="mr-3 material-symbols-outlined text-[20px]">flight_takeoff</span>
                    Opérations
                    </button>
                )}

                {user.role === 'administrator' && onNavigateUsers && (
                    <button onClick={() => handleMobileNav(onNavigateUsers)} className={getMobileNavClass(currentView === 'users')}>
                    <span className="mr-3 material-symbols-outlined text-[20px]">group</span>
                    Équipe
                    </button>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                <button 
                    onClick={() => handleMobileNav(onLogout)}
                    className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <span className="mr-3 material-symbols-outlined text-[20px]">logout</span>
                    Déconnexion
                </button>
          </div>
      )}
    </header>
  );
};