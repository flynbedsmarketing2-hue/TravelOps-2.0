import React, { useState, useMemo } from 'react';
import { PackageState, User } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

interface DashboardProps {
  packages: PackageState[];
  currentUser: User;
  onCreate: () => void;
  onEdit: (pkg: PackageState) => void;
  onDuplicate: (pkg: PackageState) => void;
  onDelete: (id: string) => void;
  canCreatePackage: boolean;
  canEditPackage: boolean;
  canDeletePackage: boolean;
  canDuplicatePackage: boolean;
  canGeneratePdf: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  packages, onCreate, onEdit, onDuplicate, onDelete, 
  currentUser, canCreatePackage, canEditPackage, canDeletePackage, canDuplicatePackage, canGeneratePdf
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const publishedCount = packages.filter(p => p.status === 'published').length;
  const draftCount = packages.filter(p => p.status !== 'published').length;

  // Calculate stock overview
  const publishedPackages = packages.filter(p => p.status === 'published');
  const totalAvailablePax = publishedPackages.reduce((sum, pkg) => sum + (pkg.general.stock || 0), 0);
  const lowStockPackagesCount = publishedPackages.filter(pkg => (pkg.general.stock || 0) > 0 && (pkg.general.stock || 0) <= 10).length;
  const outOfStockPackagesCount = publishedPackages.filter(pkg => (pkg.general.stock || 0) === 0).length;

  // Filter packages based on search and status
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        pkg.general.productName.toLowerCase().includes(searchLower) ||
        pkg.destination.toLowerCase().includes(searchLower) ||
        pkg.general.productCode.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [packages, searchTerm, statusFilter]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; 
    e.currentTarget.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000';
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1200px] w-full gap-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 pb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Backoffice</h1>
                    <p className="text-slate-500 text-base">Gérez vos offres de voyages et packages.</p>
                </div>
                <button 
                    onClick={onCreate}
                    disabled={!canCreatePackage}
                    className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
                    Nouveau Package
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div 
                    onClick={() => setStatusFilter('all')}
                    className={`p-6 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${statusFilter === 'all' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                >
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Packages</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{packages.length}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">folder_open</span>
                    </div>
                </div>
                <div 
                    onClick={() => setStatusFilter('published')}
                    className={`p-6 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${statusFilter === 'published' ? 'border-green-500 ring-1 ring-green-500 bg-green-50/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-500/50'}`}
                >
                    <div>
                        <p className="text-sm font-medium text-slate-500">Publiés</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{publishedCount}</p>
                    </div>
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">public</span>
                    </div>
                </div>
                <div 
                    onClick={() => setStatusFilter('draft')}
                    className={`p-6 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${statusFilter === 'draft' ? 'border-slate-400 ring-1 ring-slate-400 bg-slate-100/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400/50'}`}
                >
                    <div>
                        <p className="text-sm font-medium text-slate-500">Brouillons</p>
                        <p className="text-3xl font-bold text-slate-600 mt-1">{draftCount}</p>
                    </div>
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">edit_note</span>
                    </div>
                </div>
                {/* Stock Overview Card - Non clickable filter, just stats */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <p className="text-sm font-medium text-slate-500 mb-2">Aperçu du Stock Global</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-green-600 text-[18px]">group</span> Total Pax:
                            </span>
                            <span className="font-bold text-green-600">{totalAvailablePax}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-orange-600 text-[18px]">warning</span> Alertes:
                            </span>
                            <span className="font-bold text-orange-600">{lowStockPackagesCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-red-600 text-[18px]">cancel</span> Épuisés:
                            </span>
                            <span className="font-bold text-red-600">{outOfStockPackagesCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Search & List Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
                <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, code ou destination..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-lg">
                <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${statusFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Tous
                </button>
                <button 
                    onClick={() => setStatusFilter('published')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${statusFilter === 'published' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Publiés
                </button>
                <button 
                    onClick={() => setStatusFilter('draft')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${statusFilter === 'draft' ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Brouillons
                </button>
            </div>
        </div>

        {/* New Package List (Cards) */}
        <div className="flex flex-col gap-4">
            {filteredPackages.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center bg-white rounded-xl border border-dashed border-slate-300">
                    <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                    <p className="text-slate-500 font-medium">Aucun package ne correspond à votre recherche.</p>
                    <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="mt-4 text-primary font-bold text-sm hover:underline">
                        Réinitialiser les filtres
                    </button>
                </div>
            ) : (
                filteredPackages.map((pkg) => {
                    const stock = pkg.general.stock ?? 0;
                    let stockBadgeClass = "bg-green-100 text-green-700";
                    let stockIcon = "inventory_2";
                    if (stock === 0) {
                        stockBadgeClass = "bg-red-100 text-red-700";
                        stockIcon = "production_quantity_limits";
                    } else if (stock <= 10) {
                        stockBadgeClass = "bg-orange-100 text-orange-700";
                        stockIcon = "warning";
                    }

                    const firstFlight = pkg.flights[0];
                    const departureDisplay = firstFlight ? firstFlight.departureDate : 'Date non définie';

                    return (
                        <div key={pkg.id} className="group relative flex flex-col sm:flex-row gap-5 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all items-start sm:items-center">
                            
                            {/* Image */}
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                                {pkg.general.imageUrl ? (
                                    <img 
                                        src={pkg.general.imageUrl} 
                                        alt={pkg.general.productName} 
                                        onError={handleImageError}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                        <span className="material-symbols-outlined text-3xl">image</span>
                                    </div>
                                )}
                                <div className={`absolute top-0 right-0 px-1.5 py-0.5 rounded-bl-lg text-[10px] font-bold uppercase text-white ${pkg.status === 'published' ? 'bg-green-500' : 'bg-slate-500'}`}>
                                    {pkg.status === 'published' ? 'Publié' : 'Brouillon'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate pr-4" title={pkg.general.productName}>
                                        {pkg.general.productName || 'Sans nom'}
                                    </h3>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                                        {pkg.general.productCode}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        {pkg.destination}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                        {departureDisplay}
                                    </span>
                                    {firstFlight && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            {firstFlight.duration}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-1 mt-2 sm:mt-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0">
                                
                                {/* Stock Badge */}
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stockBadgeClass}`}>
                                    <span className="material-symbols-outlined text-[14px]">{stockIcon}</span>
                                    {stock} Pax
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-2">
                                    {/* Edit Button */}
                                    <button 
                                        onClick={() => onEdit(pkg)}
                                        disabled={!canEditPackage}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Modifier"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>

                                    {/* Duplicate Button */}
                                    <button 
                                        onClick={() => onDuplicate(pkg)}
                                        disabled={!canDuplicatePackage}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Dupliquer"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                    </button>

                                    {/* PDF Button */}
                                    {canGeneratePdf && (
                                        <div className="relative group/pdf">
                                            <button 
                                                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
                                                title="Télécharger PDF"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 hidden group-hover/pdf:block z-10 animate-fadeIn">
                                                <button onClick={() => generatePDF(pkg, 'b2c')} className="block w-full text-left px-4 py-2 text-xs hover:bg-slate-50">Version Client (B2C)</button>
                                                <button onClick={() => generatePDF(pkg, 'b2b')} className="block w-full text-left px-4 py-2 text-xs hover:bg-slate-50">Version B2B</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button 
                                        onClick={() => onDelete(pkg.id!)}
                                        disabled={!canDeletePackage}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Supprimer"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    );
                })
            )}
        </div>

      </div>
    </div>
  );
};