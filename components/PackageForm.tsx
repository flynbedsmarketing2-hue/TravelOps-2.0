import React, { useState } from 'react';
import { GeneralInfo } from './sections/GeneralInfo';
import { Flights } from './sections/Flights';
import { Accommodations } from './sections/Accommodations';
import { Pricing } from './sections/Pricing';
import { AgencyCommissions } from './sections/AgencyCommissions';
import { ContentExcursions } from './sections/ContentExcursions';
import { Itinerary } from './sections/Itinerary';
import { PackageState } from '../types';
import { generatePackageInspiration } from '../utils/ai'; 

const INITIAL_STATE: PackageState = {
  general: {
    productName: '',
    productCode: '025', 
    responsible: '', 
    creationDate: new Date().toLocaleDateString('fr-FR'),
    imageUrl: '',
    stock: 0,
  },
  destination: '',
  cities: [],
  flights: [
    {
      id: '1',
      airline: 'Turkish Airlines (TK)',
      departureDate: '',
      returnDate: '',
      duration: '7 N / 8 J',
      details: ''
    }
  ],
  visaStatus: 'inclus',
  transferStatus: 'inclus',
  accommodations: [
    { id: '1', name: '', category: '5 Étoiles', pension: 'BB', mapLink: '' }
  ],
  pricing: [
    { id: '1', label: 'Adulte (Chambre Double)', unitPrice: '', commission: '' },
    { id: '2', label: 'Adulte (Chambre Single)', unitPrice: '', commission: '' },
    { id: '3', label: 'Adulte (Chambre Triple)', unitPrice: '', commission: '' },
    { id: '4', label: 'Enfant (Avec Lit)', subLabel: 'Age: 2-12', unitPrice: '', commission: '' },
    { id: '5', label: 'Enfant (Sans Lit)', subLabel: 'Age: 2-6', unitPrice: '', commission: '' },
    { id: '6', label: 'Bébé (0-2 ans)', unitPrice: '', commission: '' },
  ],
  agencyCommission: {
    adulte: { t1: '', t2: '', t3: '' },
    enfant: '', // Updated to single string
    bebe: ''    // Updated to single string
  },
  content: {
    included: '',
    excluded: ''
  },
  excursions: {
    included: '',
    extra: ''
  },
  itinerary: {
    active: true,
    days: [
      { id: '1', dayNumber: 1, description: '' },
      { id: '2', dayNumber: 2, description: '' }
    ],
    partnerName: '',
    emergencyContact: '',
    internalNotes: '', // Renamed from 'notes'
    clientInformation: '', // New field
  }
};

interface PackageFormProps {
  initialData?: PackageState | null;
  onSave: (data: PackageState, isDraft: boolean) => void;
  onCancel: () => void;
  isReadOnlyForm: boolean;
  canSaveDraft: boolean;
  canPublishPackage: boolean;
}

export const PackageForm: React.FC<PackageFormProps> = ({ 
  initialData, 
  onSave, 
  onCancel, 
  isReadOnlyForm, 
  canSaveDraft, 
  canPublishPackage 
}) => {
  const [data, setData] = useState<PackageState>(initialData 
    ? { 
        ...INITIAL_STATE, 
        ...initialData, 
        agencyCommission: { // Ensure agencyCommission is correctly structured
          ...INITIAL_STATE.agencyCommission,
          ...initialData.agencyCommission,
          adulte: { ...INITIAL_STATE.agencyCommission.adulte, ...initialData.agencyCommission?.adulte },
        },
        itinerary: { // Ensure itinerary is correctly structured
          ...INITIAL_STATE.itinerary,
          ...initialData.itinerary,
        }
      } 
    : { 
        ...INITIAL_STATE, 
        id: undefined, 
        general: { ...INITIAL_STATE.general, productCode: `PK-${Date.now().toString().slice(-5)}` } 
      }
  );
  const [isGeneratingInspiration, setIsGeneratingInspiration] = useState(false);

  const updateState = <K extends keyof PackageState>(key: K, value: PackageState[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateInspiration = async () => {
    if (isReadOnlyForm) return;
    setIsGeneratingInspiration(true);
    try {
      const generatedData = await generatePackageInspiration();
      
      setData(prevData => {
        return {
          ...prevData,
          ...generatedData, 
          general: {
            ...prevData.general,
            ...generatedData.general,
            productCode: prevData.general.productCode || `PK-${Date.now().toString().slice(-5)}`, 
            creationDate: prevData.general.creationDate || new Date().toLocaleDateString('fr-FR'),
            responsible: prevData.general.responsible || '', 
          },
          // Merge agencyCommission carefully
          agencyCommission: generatedData.agencyCommission ? {
            ...prevData.agencyCommission,
            ...generatedData.agencyCommission,
            adulte: {
              ...prevData.agencyCommission?.adulte,
              ...generatedData.agencyCommission?.adulte,
            }
          } : prevData.agencyCommission,
          flights: generatedData.flights?.map(f => ({ ...f, id: f.id || Date.now().toString() + Math.random().toString() })) || [],
          accommodations: generatedData.accommodations?.map(a => ({ ...a, id: a.id || Date.now().toString() + Math.random().toString() })) || [],
          pricing: generatedData.pricing?.map(p => ({ ...p, id: p.id || Date.now().toString() + Math.random().toString() })) || [],
          itinerary: {
            ...prevData.itinerary,
            ...generatedData.itinerary,
            days: generatedData.itinerary?.days?.map(d => ({ ...d, id: d.id || Date.now().toString() + Math.random().toString() })) || [],
          }
        };
      });
      alert("Suggestions de package générées par l'IA !");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de la génération de l'inspiration.");
    } finally {
      setIsGeneratingInspiration(false);
    }
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1024px] w-full gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={onCancel} className="hover:text-primary transition-colors">Dashboard</button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-semibold text-slate-900 dark:text-white">
                {initialData ? 'Modifier le Package' : 'Création de Package'}
            </span>
          </div>
          <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                 {initialData ? data.general.productName : 'Nouveau Package Voyage'}
              </h1>
              <p className="text-slate-500 text-base">
                  {initialData ? 'Modifiez les détails du package ci-dessous.' : 'Remplissez les détails ci-dessous pour créer une nouvelle offre.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleGenerateInspiration}
                disabled={isGeneratingInspiration || isReadOnlyForm}
                className="flex items-center justify-center rounded-lg h-10 px-6 bg-purple-100 text-purple-700 text-sm font-bold shadow-md shadow-purple-200/20 hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Générer des suggestions par l'IA"
                type="button"
              >
                {isGeneratingInspiration ? (
                  <span className="material-symbols-outlined mr-2 text-[18px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined mr-2 text-[18px]">auto_awesome</span>
                )}
                Inspiration
              </button>

              <button 
                onClick={() => onSave(data, true)} 
                disabled={!canSaveDraft || isReadOnlyForm}
                className="flex items-center justify-center rounded-lg h-10 px-6 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="material-symbols-outlined mr-2 text-[18px]">save</span>
                Brouillon
              </button>
              <button 
                onClick={() => onSave(data, false)}
                disabled={!canPublishPackage || isReadOnlyForm}
                className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="material-symbols-outlined mr-2 text-[18px]">publish</span>
                {initialData ? 'Mettre à jour' : 'Publier'}
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <GeneralInfo 
          data={data.general} 
          onChange={(field, value) => updateState('general', { ...data.general, [field]: value })}
          isReadOnly={isReadOnlyForm}
        />

        <Flights 
          destination={data.destination}
          cities={data.cities}
          flights={data.flights}
          visaStatus={data.visaStatus}
          transferStatus={data.transferStatus}
          onDestinationChange={(val) => updateState('destination', val)}
          onCitiesChange={(val) => updateState('cities', val)}
          onFlightsChange={(val) => updateState('flights', val)}
          onVisaChange={(val) => updateState('visaStatus', val)}
          onTransferChange={(val) => updateState('transferStatus', val)}
          isReadOnly={isReadOnlyForm}
        />

        <Accommodations 
          hotels={data.accommodations}
          onChange={(val) => updateState('accommodations', val)}
          isReadOnly={isReadOnlyForm}
        />

        <Pricing 
          rows={data.pricing}
          onChange={(val) => updateState('pricing', val)}
          isReadOnly={isReadOnlyForm}
        />

        {data.agencyCommission && (
            <AgencyCommissions 
                commission={data.agencyCommission}
                onChange={(val) => updateState('agencyCommission', val)}
                isReadOnly={isReadOnlyForm}
            />
        )}

        <ContentExcursions 
          content={data.content}
          excursions={data.excursions}
          onContentChange={(field, val) => updateState('content', { ...data.content, [field]: val })}
          onExcursionChange={(field, val) => updateState('excursions', { ...data.excursions, [field]: val })}
          isReadOnly={isReadOnlyForm}
        />

        <Itinerary 
          active={data.itinerary.active}
          days={data.itinerary.days}
          partner={data.itinerary.partnerName}
          emergency={data.itinerary.emergencyContact}
          internalNotes={data.itinerary.internalNotes} // Renamed prop
          clientInformation={data.itinerary.clientInformation} // New prop
          destination={data.destination}
          cities={data.cities}
          duration={data.flights[0]?.duration}
          
          onActiveChange={(val) => updateState('itinerary', { ...data.itinerary, active: val })}
          onDaysChange={(val) => updateState('itinerary', { ...data.itinerary, days: val })}
          onPartnerChange={(val) => updateState('itinerary', { ...data.itinerary, partnerName: val })}
          onEmergencyChange={(val) => updateState('itinerary', { ...data.itinerary, emergencyContact: val })}
          onInternalNotesChange={(val) => updateState('itinerary', { ...data.itinerary, internalNotes: val })} // Renamed handler
          onClientInformationChange={(val) => updateState('itinerary', { ...data.itinerary, clientInformation: val })} // New handler
          isReadOnly={isReadOnlyForm}
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pb-12">
          <button onClick={onCancel} className="flex items-center justify-center rounded-lg h-12 px-8 bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors" type="button">
            Annuler
          </button>
          <button 
            onClick={() => onSave(data, false)}
            disabled={!canPublishPackage || isReadOnlyForm}
            className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <span className="material-symbols-outlined mr-2">save</span>
            {initialData ? 'Sauvegarder les modifications' : 'Enregistrer et Publier'}
          </button>
        </div>

      </div>
    </div>
  );
};