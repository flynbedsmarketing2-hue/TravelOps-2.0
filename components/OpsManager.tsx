import React, { useState, useEffect } from 'react';
import { PackageState, OpsProject, Booking, OpsDepartureGroup, User, OpsPaymentStep } from '../types';
import { SectionWrapper } from './SectionWrapper';

interface OpsManagerProps {
  pkg: PackageState;
  opsGroup: OpsDepartureGroup;
  opsRecord: OpsProject;
  bookings: Booking[];
  currentUser: User;
  onUpdateOps: (updatedRecord: OpsProject) => void;
  onBack: () => void;
}

export const OpsManager: React.FC<OpsManagerProps> = ({ pkg, opsGroup, opsRecord, bookings, currentUser, onUpdateOps, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'air' | 'land' | 'team'>('overview');
  
  const today = new Date().toISOString().split('T')[0]; // Current date as YYYY-MM-DD string
  
  const updateGroup = (updates: Partial<OpsDepartureGroup>) => {
      const updatedGroups = opsRecord.groups.map(g => g.id === opsGroup.id ? { ...g, ...updates } : g);
      onUpdateOps({ ...opsRecord, groups: updatedGroups });
  };

  const updatePaymentStep = (
      type: 'airDeposit' | 'airBalance' | 'landDeposit' | 'landBalance', 
      updates: Partial<OpsPaymentStep>
  ) => {
      const currentStep = opsGroup[type];
      
      // Auto-calc logic
      let newAmountToPay = updates.amountToPay ?? currentStep.amountToPay;
      
      if (updates.percentage !== undefined || updates.totalAmount !== undefined) {
          const total = updates.totalAmount ?? currentStep.totalAmount;
          const pct = updates.percentage ?? currentStep.percentage;
          if (total && pct) {
              newAmountToPay = (total * pct) / 100;
              // If updating deposit, might want to update balance too, but let's keep it simple for now or manual
          }
      }

      updateGroup({
          [type]: { ...currentStep, ...updates, amountToPay: newAmountToPay }
      });
  };

  const handleValidate = () => {
      if (window.confirm("Valider ce départ ? Il sera visible pour toute l'équipe.")) {
          updateGroup({ status: 'validated', validationDate: today }); // NEW: Set validationDate
      }
  };

  // Helper to get days remaining J-X
  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };


  // --- Chronologie des Opérations Logic ---
  const flight = pkg.flights.find(f => f.id === opsGroup.flightId);
  const packageReturnDate = flight?.returnDate;

  // Determine the full span of the timeline to visualize
  let timelineDates: Date[] = [];
  if (opsGroup.departureDate) timelineDates.push(new Date(opsGroup.departureDate));
  if (packageReturnDate) timelineDates.push(new Date(packageReturnDate));
  if (opsGroup.namesDeadline) timelineDates.push(new Date(opsGroup.namesDeadline));
  if (opsGroup.roomingListDeadline) timelineDates.push(new Date(opsGroup.roomingListDeadline));
  if (opsGroup.airDeposit.deadline) timelineDates.push(new Date(opsGroup.airDeposit.deadline));
  if (opsGroup.airBalance.deadline) timelineDates.push(new Date(opsGroup.airBalance.deadline));
  if (opsGroup.landDeposit.deadline) timelineDates.push(new Date(opsGroup.landDeposit.deadline));
  if (opsGroup.landBalance.deadline) timelineDates.push(new Date(opsGroup.landBalance.deadline));
  if (opsGroup.guideAssignmentDeadline) timelineDates.push(new Date(opsGroup.guideAssignmentDeadline));
  if (opsGroup.validationDate) timelineDates.push(new Date(opsGroup.validationDate)); // NEW: Add validation date
  timelineDates.push(new Date(today)); // Always include today

  let timelineMinDate = new Date();
  let timelineMaxDate = new Date();

  if (timelineDates.length > 0) {
      // NEW: If validated, start timeline from validation date (minus buffer)
      if (opsGroup.status === 'validated' && opsGroup.validationDate) {
          timelineMinDate = new Date(opsGroup.validationDate);
          timelineMinDate.setMonth(timelineMinDate.getMonth() - 1); // 1 month buffer before validation
          timelineMinDate.setDate(1); 
      } else {
          // Otherwise (pending validation), start from earliest event (minus buffer)
          timelineMinDate = new Date(Math.min(...timelineDates.map(d => d.getTime())));
          timelineMinDate.setMonth(timelineMinDate.getMonth() - 2); // 2 months buffer before earliest event
          timelineMinDate.setDate(1); 
      }

      // Latest event plus 1 month
      timelineMaxDate = new Date(Math.max(...timelineDates.map(d => d.getTime())));
      timelineMaxDate.setMonth(timelineMaxDate.getMonth() + 1);
      timelineMaxDate.setDate(new Date(timelineMaxDate.getFullYear(), timelineMaxDate.getMonth() + 1, 0).getDate()); 
  } else {
      // Default to a 6-month window around today if no dates are set
      timelineMinDate = new Date();
      timelineMinDate.setMonth(timelineMinDate.getMonth() - 3);
      timelineMinDate.setDate(1);
      timelineMaxDate = new Date();
      timelineMaxDate.setMonth(timelineMaxDate.getMonth() + 3);
      timelineMaxDate.setDate(new Date(timelineMaxDate.getFullYear(), timelineMaxDate.getMonth() + 1, 0).getDate());
  }

  const timelineTotalDays = (timelineMaxDate.getTime() - timelineMinDate.getTime()) / (1000 * 3600 * 24);

  const getPosProps = (dateStr: string | undefined, type: 'point' | 'duration', endDateStr?: string) => {
      if (!dateStr || !timelineTotalDays || timelineTotalDays === 0) return { left: 0, width: 0, show: false };
      const date = new Date(dateStr);
      const offsetDays = (date.getTime() - timelineMinDate.getTime()) / (1000 * 3600 * 24);
      const left = (offsetDays / timelineTotalDays) * 100;

      if (type === 'point') {
          return { left: Math.max(0, left), width: 0, show: true };
      } else { // type === 'duration'
          if (!endDateStr) return { left: 0, width: 0, show: false };
          const endDate = new Date(endDateStr);
          const durationDays = (endDate.getTime() - date.getTime()) / (1000 * 3600 * 24);
          const width = (durationDays / timelineTotalDays) * 100;
          return { left: Math.max(0, left), width: Math.max(0, width), show: true };
      }
  };

  // Helper for To-Do List Item
  const renderToDoItem = (
    label: string, 
    dateStr: string | undefined, 
    isCompleted?: boolean, 
    isCriticalDeadline?: boolean, // e.g. departure date
    isPayment?: boolean,
  ) => {
    const daysLeft = getDaysRemaining(dateStr || '');
    let statusBadge = '';
    let statusClass = '';
    let dateDisplay = dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : 'Non définie';

    if (!dateStr) {
        statusBadge = 'Non définie';
        statusClass = 'text-slate-400';
    } else if (isCompleted) {
        statusBadge = 'Terminé';
        statusClass = 'bg-green-100 text-green-700';
    } else if (daysLeft !== null) {
        if (daysLeft < 0) {
            statusBadge = `J+${Math.abs(daysLeft)} (Dépassé)`;
            statusClass = 'bg-red-100 text-red-700 font-bold';
        } else if (daysLeft === 0) {
            statusBadge = 'Aujourd\'hui !';
            statusClass = 'bg-red-500 text-white font-bold animate-pulse';
        } else if (daysLeft <= 7 || isCriticalDeadline) {
            statusBadge = `J-${daysLeft}`;
            statusClass = 'bg-orange-100 text-orange-700 font-bold';
        } else {
            statusBadge = `J-${daysLeft}`;
            statusClass = 'bg-blue-100 text-blue-700';
        }
    }

    if (isPayment) {
        if (isCompleted) {
            statusBadge = 'Payé';
            statusClass = 'bg-green-100 text-green-700';
        } else if (daysLeft !== null && daysLeft < 0) {
            statusBadge = 'Impayé (Dépassé)';
            statusClass = 'bg-red-100 text-red-700 font-bold';
        } else if (daysLeft !== null && daysLeft <= 7) {
            statusBadge = `J-${daysLeft} (Urgent)`;
            statusClass = 'bg-orange-100 text-orange-700 font-bold';
        } else if (!isCompleted) {
            statusBadge = 'En attente';
            statusClass = 'bg-blue-100 text-blue-700';
        }
    }


    return (
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 dark:text-white">{label}</span>
          <span className="text-xs text-slate-500">{dateDisplay}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
          {statusBadge}
        </span>
      </div>
    );
  };


  // --- Render Sections ---

  const renderOverview = () => (
    <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Validation Banner */}
        {opsGroup.status === 'pending_validation' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-yellow-600">warning</span>
                    <div>
                        <h3 className="font-bold text-yellow-800">En attente de validation</h3>
                        <p className="text-sm text-yellow-700">Ce départ n'est pas encore visible pour les agents commerciaux.</p>
                    </div>
                </div>
                {currentUser.role === 'administrator' && (
                    <button 
                        onClick={handleValidate}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-sm"
                    >
                        Valider le Produit
                    </button>
                )}
            </div>
        )}

        {/* Chronologie des Opérations */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">timeline</span> Chronologie des Opérations
            </h3>
            <div className="relative w-full overflow-x-auto pb-4">
                <div className="min-w-[700px] pr-4"> {/* Min width to ensure scrollability on smaller screens, add padding-right for overflow */}
                    {/* Timeline Axis (Months) */}
                    <div className="flex text-xs text-slate-500 mb-4 border-b pb-2 border-slate-100 dark:border-slate-700">
                        {Array.from({ length: timelineMaxDate.getMonth() - timelineMinDate.getMonth() + (timelineMaxDate.getFullYear() - timelineMinDate.getFullYear()) * 12 + 1 }).map((_, i) => {
                            const monthDate = new Date(timelineMinDate.getFullYear(), timelineMinDate.getMonth() + i, 1);
                            const nextMonthDate = new Date(timelineMinDate.getFullYear(), timelineMinDate.getMonth() + i + 1, 1);
                            const monthDays = (nextMonthDate.getTime() - monthDate.getTime()) / (1000 * 3600 * 24);
                            const monthWidth = (monthDays / timelineTotalDays) * 100;

                            return (
                                <div key={i} style={{ width: `${monthWidth}%` }} className="text-center font-semibold text-slate-600 dark:text-slate-300 relative">
                                    {monthDate.toLocaleString('fr-FR', { month: 'short', year: 'numeric' })}
                                    {/* Optional: Add a vertical line for the start of each month */}
                                    <div className="absolute left-0 top-0 h-full w-px bg-slate-200 dark:bg-slate-700"></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Package Bar */}
                    <div className="relative h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-full flex items-center px-2">
                        {getPosProps(opsGroup.departureDate, 'duration', packageReturnDate).show && (
                            <div 
                                className="absolute h-6 bg-primary/40 rounded-full border border-primary/60" 
                                style={{ 
                                    left: `${getPosProps(opsGroup.departureDate, 'duration', packageReturnDate).left}%`, 
                                    width: `${getPosProps(opsGroup.departureDate, 'duration', packageReturnDate).width}%` 
                                }}
                                title={`Départ: ${opsGroup.departureDate} - Retour: ${packageReturnDate || 'N/A'}`}
                            ></div>
                        )}
                        <span className="relative z-10 text-xs font-bold text-slate-700 dark:text-white ml-2">{pkg.general.productName}</span>

                        {/* NEW: Validation Date Marker */}
                        {opsGroup.status === 'validated' && opsGroup.validationDate && getPosProps(opsGroup.validationDate, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-slate-300 rounded-full z-10" 
                                style={{ left: `${getPosProps(opsGroup.validationDate, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Validé le: {opsGroup.validationDate}</span>
                            </div>
                        )}

                        {/* Deadlines as Markers */}
                        {getPosProps(opsGroup.namesDeadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-red-500 rounded-full animate-pulse z-20" 
                                style={{ left: `${getPosProps(opsGroup.namesDeadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Deadline Noms: {opsGroup.namesDeadline}</span>
                            </div>
                        )}
                        {getPosProps(opsGroup.roomingListDeadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-orange-500 rounded-full z-20" 
                                style={{ left: `${getPosProps(opsGroup.roomingListDeadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Deadline Rooming: {opsGroup.roomingListDeadline}</span>
                            </div>
                        )}
                        {getPosProps(opsGroup.airDeposit.deadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-blue-500 rounded-full z-20" 
                                style={{ left: `${getPosProps(opsGroup.airDeposit.deadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Acompte Air: {opsGroup.airDeposit.deadline}</span>
                            </div>
                        )}
                        {getPosProps(opsGroup.airBalance.deadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-blue-700 rounded-full z-20" 
                                style={{ left: `${getPosProps(opsGroup.airBalance.deadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Solde Air: {opsGroup.airBalance.deadline}</span>
                            </div>
                        )}
                        {getPosProps(opsGroup.landDeposit.deadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-green-500 rounded-full z-20" 
                                style={{ left: `${getPosProps(opsGroup.landDeposit.deadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Acompte Terre: {opsGroup.landDeposit.deadline}</span>
                            </div>
                        )}
                        {getPosProps(opsGroup.landBalance.deadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-green-700 rounded-full z-20" 
                                style={{ left: `${getPosProps(opsGroup.landBalance.deadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Solde Terre: {opsGroup.landBalance.deadline}</span>
                            </div>
                        )}
                        {getPosProps(opsGroup.guideAssignmentDeadline, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-purple-500 rounded-full z-20" 
                                style={{ left: `${getPosProps(opsGroup.guideAssignmentDeadline, 'point').left}%` }}
                            >
                                <span className="timeline-marker-tooltip">Deadline Guide: {opsGroup.guideAssignmentDeadline}</span>
                            </div>
                        )}
                        {/* Today's marker */}
                        {getPosProps(today, 'point').show && (
                            <div 
                                className="timeline-marker absolute top-0 bottom-0 w-0.5 bg-slate-500 border-l border-r border-slate-300 z-30" 
                                style={{ left: `${getPosProps(today, 'point').left}%` }}
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap dark:bg-slate-900 dark:text-white">Aujourd'hui</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-primary/40 border border-primary/60 shrink-0"></span> Durée du voyage</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-slate-300 shrink-0"></span> Validé le</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-red-500 shrink-0"></span> Deadline Noms</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-orange-500 shrink-0"></span> Deadline Rooming</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-blue-500 shrink-0"></span> Acompte Air</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-blue-700 shrink-0"></span> Solde Air</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-green-500 shrink-0"></span> Acompte Terre</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-green-700 shrink-0"></span> Solde Terre</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded-full bg-purple-500 shrink-0"></span> Deadline Guide</span>
            </div>
        </div>

        {/* NEW: To-Do List des Opérations */}
        <SectionWrapper title="To-Do List des Opérations" icon="checklist">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderToDoItem("Départ du Vol", opsGroup.departureDate, undefined, true)}
                {renderToDoItem("Deadline Noms & Émission", opsGroup.namesDeadline)}
                {renderToDoItem("Acompte Aérien", opsGroup.airDeposit.deadline, opsGroup.airDeposit.status === 'paid', false, true)}
                {renderToDoItem("Solde Aérien", opsGroup.airBalance.deadline, opsGroup.airBalance.status === 'paid', false, true)}
                {renderToDoItem("Deadline Rooming List", opsGroup.roomingListDeadline)}
                {renderToDoItem("Acompte Terrestre", opsGroup.landDeposit.deadline, opsGroup.landDeposit.status === 'paid', false, true)}
                {renderToDoItem("Solde Terrestre", opsGroup.landBalance.deadline, opsGroup.landBalance.status === 'paid', false, true)}
                {renderToDoItem("Deadline Assignation Guide", opsGroup.guideAssignmentDeadline)}
            </div>
        </SectionWrapper>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">flight</span> Aérien
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Mode</span>
                        <span className="font-bold">{opsGroup.isSubcontracted ? 'Sous-traitance' : 'Gestion Directe'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Deadline Noms</span>
                        <span className={`font-bold ${!opsGroup.namesDeadline ? 'text-red-400' : ''}`}>{opsGroup.namesDeadline || 'Non définie'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Statut Paiement</span>
                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${opsGroup.airBalance.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {opsGroup.airBalance.status === 'paid' ? 'Payé' : 'En cours'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">hotel</span> Terrestre
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Mode</span>
                        <span className="font-bold">{opsGroup.isLandSubcontracted ? 'Sous-traitance' : 'Gestion Directe'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Partenaire</span>
                        <span className="font-bold">{opsGroup.landSupplierName || pkg.itinerary.partnerName || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Deadline Rooming</span>
                        <span className={`font-bold ${!opsGroup.roomingListDeadline ? 'text-red-400' : ''}`}>{opsGroup.roomingListDeadline || 'Non définie'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Statut Paiement</span>
                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${opsGroup.landBalance.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {opsGroup.landBalance.status === 'paid' ? 'Payé' : 'En cours'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderAir = () => (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <SectionWrapper title="Configuration Aérienne" icon="airlines">
            <label className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 w-fit">
                <input 
                    type="checkbox" 
                    checked={opsGroup.isSubcontracted}
                    onChange={(e) => updateGroup({ isSubcontracted: e.target.checked })}
                    className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <span className="text-sm font-bold text-slate-700">Il s'agit d'une sous-traitance (pas de gestion fournisseur directe)</span>
            </label>

            {!opsGroup.isSubcontracted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                         <label className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">Fournisseur / Compagnie</span>
                            <input 
                                type="text" 
                                className="form-input rounded-lg border-slate-300" 
                                placeholder="ex: Turkish Airlines"
                                value={opsGroup.airSupplierName || ''}
                                onChange={e => updateGroup({ airSupplierName: e.target.value })}
                            />
                        </label>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">Acompte (Deposit)</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date Limite</span>
                                    <input type="date" className="form-input rounded text-sm p-1.5" 
                                        value={opsGroup.airDeposit.deadline}
                                        onChange={e => updatePaymentStep('airDeposit', { deadline: e.target.value })}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Coût Total Vol</span>
                                    <input type="number" className="form-input rounded text-sm p-1.5" placeholder="DA"
                                        value={opsGroup.airDeposit.totalAmount || ''}
                                        onChange={e => updatePaymentStep('airDeposit', { totalAmount: parseFloat(e.target.value) })}
                                    />
                                </label>
                            </div>
                            <div className="flex gap-3 items-end">
                                <label className="flex flex-col gap-1 w-20">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">%</span>
                                    <input type="number" className="form-input rounded text-sm p-1.5" placeholder="30"
                                        value={opsGroup.airDeposit.percentage || ''}
                                        onChange={e => updatePaymentStep('airDeposit', { percentage: parseFloat(e.target.value) })}
                                    />
                                </label>
                                <div className="flex-1 pb-2 text-sm font-bold text-slate-700">
                                    = {opsGroup.airDeposit.amountToPay?.toLocaleString('fr-FR')} DZD
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" 
                                        checked={opsGroup.airDeposit.status === 'paid'}
                                        onChange={e => updatePaymentStep('airDeposit', { status: e.target.checked ? 'paid' : 'pending' })}
                                        className="rounded text-green-600 focus:ring-green-600" 
                                    />
                                    <span className="text-xs font-bold text-slate-600">Payé</span>
                                </label>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <button className="text-xs flex items-center gap-1 text-primary hover:underline">
                                    <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                    {opsGroup.airDeposit.receiptUrl ? 'Voir Reçu' : 'Uploader Reçu'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                         <div className="h-[62px]"></div> {/* Spacer for alignment */}
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">Solde Restant (100%)</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date Limite</span>
                                    <input type="date" className="form-input rounded text-sm p-1.5" 
                                        value={opsGroup.airBalance.deadline}
                                        onChange={e => updatePaymentStep('airBalance', { deadline: e.target.value })}
                                    />
                                </label>
                                <div className="flex flex-col gap-1 justify-end pb-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reste à payer</span>
                                    <div className="text-sm font-bold">
                                        {/* Simple calc: Total - Deposit paid */}
                                        {((opsGroup.airDeposit.totalAmount || 0) - (opsGroup.airDeposit.amountToPay || 0)).toLocaleString('fr-FR')} DZD
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center justify-end pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" 
                                        checked={opsGroup.airBalance.status === 'paid'}
                                        onChange={e => updatePaymentStep('airBalance', { status: e.target.checked ? 'paid' : 'pending' })}
                                        className="rounded text-green-600 focus:ring-green-600" 
                                    />
                                    <span className="text-xs font-bold text-slate-600">Solde Payé</span>
                                </label>
                            </div>
                             <div className="mt-3 pt-3 border-t border-slate-200">
                                <button className="text-xs flex items-center gap-1 text-primary hover:underline">
                                    <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                    {opsGroup.airBalance.receiptUrl ? 'Voir Reçu' : 'Uploader Reçu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SectionWrapper>

        <SectionWrapper title="Manifeste & Émission" icon="group">
            <div className="flex justify-between items-end mb-4">
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Deadline Noms & Émission</span>
                    <input type="date" className="form-input rounded-lg border-slate-300"
                        value={opsGroup.namesDeadline}
                        onChange={e => updateGroup({ namesDeadline: e.target.value })}
                    />
                </label>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span> Exporter Excel
                    </button>
                </div>
            </div>
            
            {/* Passenger List Simulation */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3">Nom Passager</th>
                            <th className="px-4 py-3">Passeport</th>
                            <th className="px-4 py-3">Nationalité</th>
                            <th className="px-4 py-3 text-right">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.flatMap(b => b.passportScans).map((scan, i) => (
                            <tr key={i} className="bg-white">
                                <td className="px-4 py-3 font-medium">{scan.extractedInfo?.fullName || 'N/A'}</td>
                                <td className="px-4 py-3 font-mono text-slate-600">{scan.extractedInfo?.passportNumber || '-'}</td>
                                <td className="px-4 py-3">{scan.extractedInfo?.nationality || '-'}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Confirmé</span>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-400">Aucune réservation confirmée.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
      </div>
  );

  const renderLand = () => (
      <div className="flex flex-col gap-6 animate-fadeIn">
         <SectionWrapper title="Configuration Terrestre" icon="landscape">
            <label className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 w-fit">
                <input 
                    type="checkbox" 
                    checked={opsGroup.isLandSubcontracted}
                    onChange={(e) => updateGroup({ isLandSubcontracted: e.target.checked })}
                    className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <span className="text-sm font-bold text-slate-700">Il s'agit d'une sous-traitance (pas de gestion fournisseur directe)</span>
            </label>

            {!opsGroup.isLandSubcontracted && (
                <>
                    <div className="flex gap-4 mb-6">
                        <label className="flex flex-col gap-1 flex-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">Partenaire / DMC</span>
                            <input 
                                type="text" 
                                className="form-input rounded-lg border-slate-300" 
                                value={opsGroup.landSupplierName || pkg.itinerary.partnerName || ''}
                                onChange={e => updateGroup({ landSupplierName: e.target.value })}
                            />
                        </label>
                        <label className="flex flex-col gap-1 w-32">
                            <span className="text-xs font-bold text-slate-500 uppercase">Devise</span>
                            <select 
                                className="form-select rounded-lg border-slate-300"
                                value={opsGroup.landCurrency}
                                onChange={e => updateGroup({ landCurrency: e.target.value as any })}
                            >
                                <option value="DZD">DZD</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                                <option value="SAR">SAR</option>
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Deposit Land */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">Acompte (Deposit)</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date Limite</span>
                                    <input type="date" className="form-input rounded text-sm p-1.5" 
                                        value={opsGroup.landDeposit.deadline}
                                        onChange={e => updatePaymentStep('landDeposit', { deadline: e.target.value })}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Coût Total ({opsGroup.landCurrency})</span>
                                    <input type="number" className="form-input rounded text-sm p-1.5"
                                        value={opsGroup.landDeposit.totalAmount || ''}
                                        onChange={e => updatePaymentStep('landDeposit', { totalAmount: parseFloat(e.target.value) })}
                                    />
                                </label>
                            </div>
                            <div className="flex gap-3 items-end">
                                <label className="flex flex-col gap-1 w-20">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">%</span>
                                    <input type="number" className="form-input rounded text-sm p-1.5" placeholder="30"
                                        value={opsGroup.landDeposit.percentage || ''}
                                        onChange={e => updatePaymentStep('landDeposit', { percentage: parseFloat(e.target.value) })}
                                    />
                                </label>
                                <div className="flex-1 pb-2 text-sm font-bold text-slate-700">
                                    = {opsGroup.landDeposit.amountToPay?.toLocaleString('fr-FR')} {opsGroup.landCurrency}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" 
                                        checked={opsGroup.landDeposit.status === 'paid'}
                                        onChange={e => updatePaymentStep('landDeposit', { status: e.target.checked ? 'paid' : 'pending' })}
                                        className="rounded text-green-600 focus:ring-green-600" 
                                    />
                                    <span className="text-xs font-bold text-slate-600">Payé</span>
                                </label>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <button className="text-xs flex items-center gap-1 text-primary hover:underline">
                                    <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                    {opsGroup.landDeposit.receiptUrl ? 'Voir Reçu' : 'Uploader Reçu'}
                                </button>
                            </div>
                        </div>

                        {/* Balance Land */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">Solde Restant</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date Limite</span>
                                    <input type="date" className="form-input rounded text-sm p-1.5" 
                                        value={opsGroup.landBalance.deadline}
                                        onChange={e => updatePaymentStep('landBalance', { deadline: e.target.value })}
                                    />
                                </label>
                                <div className="flex flex-col gap-1 justify-end pb-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reste à payer</span>
                                    <div className="text-sm font-bold">
                                        {((opsGroup.landDeposit.totalAmount || 0) - (opsGroup.landDeposit.amountToPay || 0)).toLocaleString('fr-FR')} {opsGroup.landCurrency}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center justify-end pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" 
                                        checked={opsGroup.landBalance.status === 'paid'}
                                        onChange={e => updatePaymentStep('landBalance', { status: e.target.checked ? 'paid' : 'pending' })}
                                        className="rounded text-green-600 focus:ring-green-600" 
                                    />
                                    <span className="text-xs font-bold text-slate-600">Solde Payé</span>
                                </label>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <button className="text-xs flex items-center gap-1 text-primary hover:underline">
                                    <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                    {opsGroup.landBalance.receiptUrl ? 'Voir Reçu' : 'Uploader Reçu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
         </SectionWrapper>

         <SectionWrapper title="Rooming List" icon="bed">
             <div className="flex justify-between items-end mb-4">
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Deadline Rooming List</span>
                    <input type="date" className="form-input rounded-lg border-slate-300"
                        value={opsGroup.roomingListDeadline}
                        onChange={e => updateGroup({ roomingListDeadline: e.target.value })}
                    />
                </label>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span> Exporter Rooming List
                    </button>
                </div>
            </div>
            
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl opacity-20 block mb-2">hotel</span>
                <p>La Rooming List est générée automatiquement à partir des réservations confirmées.</p>
                <p className="font-bold mt-2">{bookings.reduce((acc, b) => acc + b.numberOfRooms, 0)} Chambres totales</p>
             </div>
         </SectionWrapper>
      </div>
  );

  const renderTeam = () => (
      <SectionWrapper title="Guide & Accompagnateur" icon="badge">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Nom du Guide / Chef de Groupe</span>
                  <input 
                    type="text" 
                    className="form-input rounded-lg border-slate-300"
                    placeholder="ex: Ahmed Benali"
                    value={opsGroup.guideName || ''}
                    onChange={e => updateGroup({ guideName: e.target.value })}
                  />
              </label>
               <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Téléphone de contact</span>
                  <input 
                    type="tel" 
                    className="form-input rounded-lg border-slate-300"
                    placeholder="ex: +213 555 ..."
                    value={opsGroup.guidePhone || ''}
                    onChange={e => updateGroup({ guidePhone: e.target.value })}
                  />
              </label>
              {/* NEW: Guide Assignment Deadline */}
              <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Deadline Assignation Guide</span>
                  <input
                      type="date"
                      className="form-input rounded-lg border-slate-300"
                      value={opsGroup.guideAssignmentDeadline || ''}
                      onChange={e => updateGroup({ guideAssignmentDeadline: e.target.value })}
                  />
              </label>
          </div>
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-3">
              <span className="material-symbols-outlined">info</span>
              <p>Ces informations seront synchronisées avec le carnet de voyage du client une fois le départ validé.</p>
          </div>
      </SectionWrapper>
  );

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1200px] w-full gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-bold w-fit">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Retour aux Départs
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{pkg.general.productName}</h1>
                        {opsGroup.status === 'validated' && <span className="material-symbols-outlined text-green-500 text-2xl" title="Validé">check_circle</span>}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500 font-bold">
                         <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[18px]">flight_takeoff</span> {opsGroup.departureDate}</span>
                         <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">location_on</span> {pkg.destination}</span>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                     {[
                        {id: 'overview', label: 'Vue Globale', icon: 'dashboard'},
                        {id: 'air', label: 'Aérien', icon: 'flight'},
                        {id: 'land', label: 'Terrestre', icon: 'landscape'},
                        {id: 'team', label: 'Équipe', icon: 'groups'},
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="material-symbols-outlined text-[18px] hidden md:block">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'air' && renderAir()}
            {activeTab === 'land' && renderLand()}
            {activeTab === 'team' && renderTeam()}
        </div>

      </div>
    </div>
  );
};