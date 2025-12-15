import React from 'react';
import { PackageState, OpsDepartureGroup } from '../types';
import { usePackageStore } from '../store/usePackageStore';
import { useUserStore } from '../store/useUserStore';

interface OpsDashboardProps {
  onSelectGroup: (pkg: PackageState, group: OpsDepartureGroup) => void;
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({ onSelectGroup }) => {
  const { packages, opsRecords } = usePackageStore();
  const { currentUser } = useUserStore();

  // Only show published packages for Ops
  const activePackages = packages.filter(p => p.status === 'published');

  // Helper to get days remaining J-X
  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Flatten the list to show all departures
  const allDepartures = activePackages.flatMap(pkg => {
      const opsRecord = opsRecords.find(r => r.packageId === pkg.id);
      if (!opsRecord) return [];
      
      return opsRecord.groups.map(group => ({
          pkg,
          group,
          daysLeft: getDaysRemaining(group.departureDate)
      }));
  }).sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));

  // Filter based on user role
  const filteredDepartures = allDepartures.filter(item => {
      if (currentUser?.role === 'administrator') return true;
      if (item.group.status === 'validated') return true;
      if (currentUser?.role === 'travel_designer') return true; 
      return false; 
  });

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1200px] w-full gap-8">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Opérations</h1>
                <p className="text-slate-500 text-base">Suivi des départs, fournisseurs, et logistique.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {filteredDepartures.length === 0 && (
                <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    Aucun départ actif ou validé.
                </div>
            )}
            
            {filteredDepartures.map(({ pkg, group, daysLeft }) => {
                let statusColor = "bg-green-100 text-green-700";
                if (daysLeft !== null) {
                    if (daysLeft < 0) statusColor = "bg-slate-100 text-slate-500"; // Passed
                    else if (daysLeft < 7) statusColor = "bg-red-100 text-red-700 animate-pulse"; // Critical
                    else if (daysLeft < 30) statusColor = "bg-orange-100 text-orange-700"; // Warning
                }

                const isPending = group.status === 'pending_validation';

                return (
                    <div key={group.id} onClick={() => onSelectGroup(pkg, group)} className={`group cursor-pointer bg-white dark:bg-slate-800 rounded-xl border p-5 shadow-sm hover:shadow-md transition-all hover:border-primary relative overflow-hidden ${isPending ? 'border-dashed border-slate-300' : 'border-slate-200 dark:border-slate-700'}`}>
                        {isPending && (
                            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                EN ATTENTE VALIDATION
                            </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            
                            {/* Countdown Badge */}
                            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${statusColor} shrink-0`}>
                                <span className="text-xl font-black">J{daysLeft !== null && daysLeft >= 0 ? `-${daysLeft}` : '+'}</span>
                                <span className="text-[10px] font-bold uppercase">{daysLeft !== null && daysLeft < 0 ? 'Passé' : 'Jours'}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                        {pkg.general.productName}
                                    </h3>
                                    <span className="text-xs text-slate-400 border border-slate-200 px-1.5 rounded bg-slate-50">{pkg.general.productCode}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1 font-medium text-slate-700">
                                        <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                                        Départ: {group.departureDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        {pkg.destination}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">group</span>
                                        {pkg.general.stock} places
                                    </span>
                                </div>
                            </div>

                            {/* Key Indicators */}
                            <div className="flex items-center gap-6 border-l border-slate-100 pl-6 shrink-0">
                                <div className="text-right min-w-[120px]">
                                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Fournisseur Air</div>
                                    <div className="font-bold text-sm text-slate-700 truncate max-w-[120px]">
                                        {group.isSubcontracted ? 'Sous-traitance' : (group.airSupplierName || '-')}
                                    </div>
                                    <div className={`text-xs ${group.airBalance.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {group.airBalance.status === 'paid' ? 'Solde Payé' : 'Solde en attente'}
                                    </div>
                                </div>
                                
                                <div className="text-right min-w-[120px] hidden sm:block">
                                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Partenaire Terre</div>
                                    <div className="font-bold text-sm text-slate-700 truncate max-w-[120px]">
                                        {group.isLandSubcontracted ? 'Sous-traitance' : (group.landSupplierName || pkg.itinerary.partnerName || '-')}
                                    </div>
                                     <div className={`text-xs ${group.landBalance.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {group.landBalance.status === 'paid' ? 'Solde Payé' : 'Solde en attente'}
                                    </div>
                                </div>

                                <div className="text-slate-300">
                                    <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};