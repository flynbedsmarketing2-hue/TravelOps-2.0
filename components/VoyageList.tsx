import React, { useState, useMemo } from 'react';
import { PackageState, RoomType } from '../types';
import { usePackageStore } from '../store/usePackageStore';
import { useBookingStore } from '../store/useBookingStore';

interface VoyageListProps {
  onBook: (pkg: PackageState) => void;
}

export const VoyageList: React.FC<VoyageListProps> = ({ onBook }) => {
  const { packages } = usePackageStore();
  const { bookings } = useBookingStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedPackage, setSelectedPackage] = useState<PackageState | null>(null);

  // Filter only published packages
  const activePackages = useMemo(() => packages.filter(p => p.status === 'published'), [packages]);

  // Extract unique destinations and months for filters
  const destinations = useMemo(() => {
    const dests = new Set(
      activePackages
        .map(p => p.destination)
        .filter((d): d is string => !!d)
    );
    return ['All', ...Array.from(dests)];
  }, [activePackages]);

  const months = useMemo(() => {
    const ms = new Set(
      activePackages
        .map(p => {
          const date = p.flights[0]?.departureDate;
          if (!date) return null;
          return new Date(date).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        })
        .filter((m): m is string => !!m)
    );
    return ['All', ...Array.from(ms)];
  }, [activePackages]);

  // Filter Logic
  const filteredPackages = useMemo(() => {
    return activePackages.filter(pkg => {
      const matchesSearch = 
        pkg.general.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.general.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDest = selectedDestination === 'All' || pkg.destination === selectedDestination;
      
      const flightDate = pkg.flights[0]?.departureDate;
      const pkgMonth = flightDate ? new Date(flightDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }) : null;
      const matchesMonth = selectedMonth === 'All' || pkgMonth === selectedMonth;

      return matchesSearch && matchesDest && matchesMonth;
    });
  }, [activePackages, searchTerm, selectedDestination, selectedMonth]);

  // Helper: Calculate Days Remaining (J-X)
  const getCountdown = (dateStr: string) => {
    if (!dateStr) return { label: 'N/A', color: 'bg-slate-100 text-slate-500' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Passé', color: 'bg-slate-200 text-slate-500' };
    if (diffDays === 0) return { label: 'Départ Aujourd\'hui', color: 'bg-green-600 text-white' };
    
    let color = 'bg-green-100 text-green-700';
    if (diffDays <= 7) color = 'bg-red-100 text-red-700 animate-pulse';
    else if (diffDays <= 30) color = 'bg-orange-100 text-orange-800';

    return { label: `J-${diffDays}`, color };
  };

  // Helper: Get Lowest Price
  const getMinPrice = (pkg: PackageState) => {
    const prices = pkg.pricing.map(p => parseInt(p.unitPrice) || 0).filter(p => p > 0);
    if (prices.length === 0) return 0;
    return Math.min(...prices);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000'; // Reliable Fallback
  };

  // Helper: Get row background color based on room type
  const getRowColor = (roomType: RoomType) => {
    switch (roomType) {
        case 'SINGLE':
            return 'bg-[#dadae5]'; // Lavenderish
        case 'DEMI DOUBLE HOMME':
        case 'DEMI DOUBLE FEMME':
            return 'bg-[#e6e8eb]'; // Light Gray/Blueish
        case 'DOUBLE':
        case 'TWIN':
            return 'bg-[#d3d7cf]'; // Sage Greenish
        case 'TRIPLE':
            return 'bg-[#fff5e6]'; // Light Orange tint
        case 'QUADRUPLE':
            return 'bg-[#ffe6e6]'; // Light Red tint
        default:
            return 'bg-white';
    }
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1400px] w-full gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary">travel_explore</span>
                    Catalogue Voyages
                </h1>
                <p className="text-slate-500 text-base mt-2">
                    Explorez les {activePackages.length} voyages disponibles à la vente.
                </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-primary"
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                >
                    <option value="All">Toutes Destinations</option>
                    {destinations.filter((d) => d !== 'All').map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-primary"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    <option value="All">Tous les Mois</option>
                    {months.filter((m) => m !== 'All').map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPackages.map(pkg => {
                const countdown = getCountdown(pkg.flights[0]?.departureDate);
                const minPrice = getMinPrice(pkg);
                const stock = pkg.general.stock ?? 0;
                
                return (
                    <div key={pkg.id} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                        {/* Image Header */}
                        <div className="relative h-56 overflow-hidden bg-slate-200">
                            {pkg.general.imageUrl ? (
                                <img 
                                    src={pkg.general.imageUrl} 
                                    alt={pkg.general.productName} 
                                    onError={handleImageError}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${countdown.color}`}>
                                    {countdown.label}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {pkg.destination}
                                </span>
                            </div>

                            {/* Title over Image */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <div className="text-xs font-medium opacity-90 mb-1">{pkg.flights[0]?.duration}</div>
                                <h3 className="text-xl font-black leading-tight shadow-black drop-shadow-md">{pkg.general.productName}</h3>
                                <div className="text-xs font-medium opacity-80 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                    Conçu par {pkg.general.responsible}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col gap-4">
                            {/* Key Info */}
                            <div className="flex justify-between items-start text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                                        {pkg.flights[0]?.departureDate ? new Date(pkg.flights[0].departureDate).toLocaleDateString('fr-FR') : 'Date N/A'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-slate-400">flight</span>
                                        {pkg.flights[0]?.airline}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-slate-400 uppercase font-bold">À partir de</span>
                                    <span className="text-xl font-black text-primary">
                                        {minPrice.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">DZD</span>
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>

                            {/* Stock & Quick Actions */}
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="relative size-10">
                                        <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                                            <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                            <path className={`${stock > 10 ? 'text-green-500' : stock > 0 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000`} strokeDasharray={`${Math.min(stock, 50) * 2}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-white">{stock}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Places</span>
                                        <span className="text-[10px] text-slate-400 uppercase">Restantes</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setSelectedPackage(pkg)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors"
                                    >
                                        Détails
                                    </button>
                                    <button 
                                        onClick={() => onBook(pkg)}
                                        disabled={stock === 0}
                                        className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {stock === 0 ? 'Complet' : 'Réserver'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {filteredPackages.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">travel_explore</span>
                <p>Aucun voyage ne correspond à vos critères.</p>
             </div>
        )}

        {/* Detailed View Modal */}
        {selectedPackage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-[95%] xl:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                    {/* Modal Header */}
                    <div className="relative h-48 md:h-64 shrink-0 bg-slate-200">
                         {selectedPackage.general.imageUrl && (
                            <img 
                                src={selectedPackage.general.imageUrl} 
                                className="w-full h-full object-cover" 
                                alt="" 
                                onError={handleImageError}
                            />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                         <button 
                            onClick={() => setSelectedPackage(null)}
                            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-md transition-colors"
                         >
                            <span className="material-symbols-outlined">close</span>
                         </button>
                         <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{selectedPackage.destination}</span>
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded text-xs font-bold">{selectedPackage.flights[0]?.duration}</span>
                            </div>
                            <h2 className="text-3xl font-black">{selectedPackage.general.productName}</h2>
                         </div>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            
                            {/* Left Column: Details */}
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                
                                {/* Intro */}
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">verified</span>
                                        Inclus dans l'offre
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                        {selectedPackage.content.included}
                                    </p>
                                </div>

                                {/* Itinerary */}
                                {selectedPackage.itinerary.active && (
                                    <div>
                                        <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Programme</h3>
                                        <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                                            {selectedPackage.itinerary.days.map((day) => (
                                                <div key={day.id} className="relative pl-8">
                                                    <div className="absolute -left-[9px] top-0 size-4 bg-primary rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Jour {day.dayNumber}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                                                        {day.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Flights & Hotels */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="border border-slate-200 rounded-xl p-4">
                                        <div className="text-xs font-bold uppercase text-slate-400 mb-2">Vols</div>
                                        {selectedPackage.flights.map((f, i) => (
                                            <div key={i} className="text-sm">
                                                <div className="font-bold text-slate-800">{f.airline}</div>
                                                <div className="text-slate-500">{f.departureDate} ➔ {f.returnDate}</div>
                                            </div>
                                        ))}
                                     </div>
                                     <div className="border border-slate-200 rounded-xl p-4">
                                        <div className="text-xs font-bold uppercase text-slate-400 mb-2">Hébergement</div>
                                        {selectedPackage.accommodations.map((h, i) => (
                                            <div key={i} className="text-sm">
                                                <div className="font-bold text-slate-800">{h.name}</div>
                                                <div className="text-slate-500">{h.category}</div>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            </div>

                            {/* Right Column: Pricing & Action */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-lg">
                                    <div className="mb-6">
                                        <span className="text-sm text-slate-500">À partir de</span>
                                        <div className="text-3xl font-black text-primary">
                                            {getMinPrice(selectedPackage).toLocaleString('fr-FR')} DZD
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Par personne en chambre double</div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {selectedPackage.pricing.map(p => (
                                            <div key={p.id} className="flex justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                                                <span className="text-slate-600">{p.label}</span>
                                                <span className="font-bold">{parseInt(p.unitPrice).toLocaleString('fr-FR')}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => {
                                            onBook(selectedPackage);
                                            setSelectedPackage(null);
                                        }}
                                        disabled={selectedPackage.general.stock === 0}
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {selectedPackage.general.stock === 0 ? 'Complet' : 'Réserver Maintenant'}
                                    </button>

                                    {selectedPackage.general.stock !== undefined && selectedPackage.general.stock < 10 && (
                                        <div className="mt-4 text-center text-xs text-orange-600 font-bold bg-orange-50 py-2 rounded">
                                            Attention : Plus que {selectedPackage.general.stock} places !
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- NEW: DETAILED BOOKINGS TABLE (BOTTOM) --- */}
                        <div className="mt-12 border-t border-slate-200 pt-8">
                             <h3 className="font-bold text-xl mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list_alt</span>
                                Liste des Réservations
                            </h3>
                            
                            <div className="overflow-x-auto border border-slate-900 rounded-sm">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-900">
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest">Nom du client</th>
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest text-center">Type de chambre</th>
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest">Téléphone</th>
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest min-w-[200px]">Informations supp</th>
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest">Agence</th>
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest">Agent commercial</th>
                                            <th className="px-4 py-4 border-r border-slate-300 font-bold text-slate-900 uppercase text-xs tracking-widest text-center">Confirmation</th>
                                            <th className="px-4 py-4 font-bold text-slate-900 uppercase text-xs tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-300">
                                        {bookings.filter(b => b.packageId === selectedPackage.id).length === 0 ? (
                                            <tr className="bg-white">
                                                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                                                    Aucune réservation pour ce package.
                                                </td>
                                            </tr>
                                        ) : (
                                            bookings.filter(b => b.packageId === selectedPackage.id).map((booking) => {
                                                const rowBg = getRowColor(booking.roomType);
                                                const confirmDate = new Date(booking.bookingDate);
                                                const dateStr = confirmDate.toISOString().split('T')[0];
                                                const timeStr = confirmDate.toTimeString().split(' ')[0];

                                                return (
                                                    <tr key={booking.id} className={`${rowBg} border-b border-slate-300/50 hover:brightness-95 transition-all`}>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 font-black text-slate-900 uppercase">
                                                            {booking.clientName}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 font-bold text-slate-800 text-center text-[11px] uppercase tracking-wide leading-tight">
                                                            {booking.rooms && booking.rooms.length > 0 ? (
                                                                booking.rooms.map((room, idx) => (
                                                                    <div key={room.id} className="mb-2 last:mb-0 text-left border-b border-slate-300/50 last:border-0 pb-1 last:pb-0">
                                                                        <div className="text-primary font-black mb-0.5">{room.roomType.replace(/_/g, ' ')}</div>
                                                                        <div className="pl-1 border-l-2 border-slate-400">
                                                                            {room.occupants.map(occ => (
                                                                                <div key={occ.id} className="text-[10px] font-medium text-slate-600 truncate max-w-[120px]" title={occ.fullName}>
                                                                                    • {occ.fullName || 'Anonyme'}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                booking.roomType.replace(/_/g, ' ')
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 whitespace-nowrap font-mono text-slate-700 text-xs">
                                                            {booking.phoneNumber || '-'}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 text-xs text-slate-600 leading-snug min-w-[250px]">
                                                            {booking.otherInfo}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 uppercase font-bold text-xs text-slate-700">
                                                            {booking.agencyName}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 uppercase font-bold text-xs text-slate-700">
                                                            {booking.salesAgentName}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-slate-300/50 text-center align-middle">
                                                            <div className="inline-flex flex-col items-center justify-center bg-[#2ecc71] text-white px-2 py-1.5 rounded w-24">
                                                                <span className="text-[10px] font-black uppercase tracking-widest mb-0.5">Confirmé</span>
                                                                <span className="text-[10px] font-mono leading-none">{dateStr}</span>
                                                                <span className="text-[9px] opacity-90">{timeStr}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center whitespace-nowrap align-middle">
                                                            <div className="flex flex-col gap-2 items-center justify-center">
                                                                <button className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-[10px] font-bold py-1.5 rounded shadow-sm transition-colors w-24 uppercase tracking-widest block">
                                                                    Modifier
                                                                </button>
                                                                <button className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-[10px] font-bold py-1.5 rounded shadow-sm transition-colors w-24 uppercase tracking-widest block">
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};