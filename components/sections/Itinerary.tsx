import React, { useState } from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { ItineraryDay } from '../../types';
import { generateItineraryWithAI } from '../../utils/ai';

interface ItineraryProps {
  active: boolean;
  days: ItineraryDay[];
  partner: string;
  emergency: string;
  internalNotes: string; // Renamed from 'notes'
  clientInformation: string; // New prop for client-visible notes
  // Context needed for AI
  destination?: string;
  cities?: string[];
  duration?: string;

  onActiveChange: (val: boolean) => void;
  onDaysChange: (val: ItineraryDay[]) => void;
  onPartnerChange: (val: string) => void;
  onEmergencyChange: (val: string) => void;
  onInternalNotesChange: (val: string) => void; // Renamed from onNotesChange
  onClientInformationChange: (val: string) => void; // New change handler
  isReadOnly?: boolean; // New prop
}

export const Itinerary: React.FC<ItineraryProps> = ({ 
  active, days, partner, emergency, internalNotes, clientInformation,
  destination = '', cities = [], duration = '',
  onActiveChange, onDaysChange, onPartnerChange, onEmergencyChange, onInternalNotesChange, onClientInformationChange,
  isReadOnly = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (isReadOnly) return; // Prevent action if read-only
    if (!destination) {
      alert("Veuillez d'abord renseigner la destination dans la section Vols.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const generatedDays = await generateItineraryWithAI(destination, cities, duration || '7 jours');
      onDaysChange(generatedDays);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsGenerating(false);
    }
  };

  const addDay = () => {
    if (isReadOnly) return; // Prevent action if read-only
    onDaysChange([...days, { 
      id: Date.now().toString(), 
      dayNumber: days.length + 1, 
      description: '' 
    }]);
  };

  const updateDay = (id: string, text: string) => {
    if (isReadOnly) return; // Prevent action if read-only
    onDaysChange(days.map(d => d.id === id ? { ...d, description: text } : d));
  };

  const deleteDay = (id: string) => {
      if (isReadOnly) return; // Prevent action if read-only
      const filtered = days.filter(d => d.id !== id);
      const reordered = filtered.map((d, index) => ({...d, dayNumber: index + 1}));
      onDaysChange(reordered);
  }

  return (
    <SectionWrapper 
      title="8. Programme Détaillé" 
      icon="event_note"
      className="mb-8"
      action={
        <label className="inline-flex items-center cursor-pointer select-none">
          <span className="mr-3 text-sm font-medium text-slate-900 dark:text-slate-300">Activer le programme</span>
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={active}
            onChange={(e) => onActiveChange(e.target.checked)}
            disabled={isReadOnly} // Disable based on prop
          />
          <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
        </label>
      }
    >
      {active && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex justify-between items-start gap-4">
             <p className="text-sm text-slate-500 italic mb-2">Décrivez le programme jour par jour. Cette section est visible par le client si activée.</p>
             <button
                onClick={handleGenerateAI}
                disabled={isGenerating || isReadOnly} // Disable if generating or read-only
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isGenerating ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">spark</span>
                )}
                {isGenerating ? 'Génération...' : 'Générer avec IA'}
             </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {days.map((day) => (
                <div key={day.id} className="flex gap-4 group">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
                    <div className={`${day.dayNumber === 1 ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600'} font-bold text-sm rounded-md px-3 py-1.5 shadow-sm min-w-[3rem] text-center`}>
                        J{day.dayNumber}
                    </div>
                    <div className="w-0.5 h-full bg-slate-200 grow rounded-full mt-1"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 pb-4 relative">
                    <textarea 
                        className="form-input w-full rounded-lg border-slate-300 text-sm p-4 h-32 shadow-sm focus:outline-none" 
                        placeholder={`Description détaillée de la journée J${day.dayNumber}...`}
                        value={day.description}
                        onChange={(e) => updateDay(day.id, e.target.value)}
                        disabled={isReadOnly} // Disable based on prop
                    ></textarea>
                    {days.length > 1 && (
                         <button 
                         onClick={() => deleteDay(day.id)}
                         disabled={isReadOnly} // Disable based on prop
                         className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
                         title="Supprimer la journée"
                       >
                         <span className="material-symbols-outlined text-[18px]">close</span>
                       </button>
                    )}
                    </div>
                </div>
            ))}
          </div>

          <button 
            onClick={addDay}
            disabled={isReadOnly} // Disable based on prop
            className="ml-12 w-fit text-primary bg-primary/5 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Ajouter Jour
          </button>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Partenaire Local</span>
              <input 
                className="form-input w-full rounded-lg border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none" 
                placeholder="Nom de l'agence partenaire" 
                type="text"
                value={partner}
                onChange={(e) => onPartnerChange(e.target.value)}
                disabled={isReadOnly} // Disable based on prop
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Urgence (WhatsApp)</span>
              <div className="relative">
                <span className="absolute left-3 top-2.5 material-symbols-outlined text-green-500 text-[18px]">call</span>
                <input 
                  className="form-input w-full rounded-lg border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none" 
                  placeholder="+90 555 ..." 
                  type="tel"
                  value={emergency}
                  onChange={(e) => onEmergencyChange(e.target.value)}
                  disabled={isReadOnly} // Disable based on prop
                />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Remarques Spéciales (Interne)</span>
              <input 
                className="form-input w-full rounded-lg border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none" 
                placeholder="Notes internes..." 
                type="text"
                value={internalNotes}
                onChange={(e) => onInternalNotesChange(e.target.value)}
                disabled={isReadOnly} // Disable based on prop
              />
            </label>
          </div>
          
          {/* New Section for Client Information */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-4">
             <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Informations Importantes Client</span>
              <textarea 
                className="form-input w-full rounded-lg border-slate-300 bg-white p-3 text-sm resize-none focus:outline-none min-h-[100px]" 
                placeholder="Informations additionnelles visibles par le client (ex: conseils voyage, documents nécessaires...)" 
                value={clientInformation}
                onChange={(e) => onClientInformationChange(e.target.value)}
                disabled={isReadOnly} // Disable based on prop
              ></textarea>
            </label>
          </div>

        </div>
      )}
      {!active && (
          <div className="py-8 text-center text-slate-400 italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              Le programme détaillé est désactivé.
          </div>
      )}
    </SectionWrapper>
  );
};