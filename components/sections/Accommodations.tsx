import React from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { Accommodation } from '../../types';

interface AccommodationsProps {
  hotels: Accommodation[];
  onChange: (hotels: Accommodation[]) => void;
  isReadOnly?: boolean; // New prop
}

export const Accommodations: React.FC<AccommodationsProps> = ({ hotels, onChange, isReadOnly = false }) => {
  const addHotel = () => {
    if (isReadOnly) return; // Prevent action if read-only
    onChange([
      ...hotels, 
      { id: Date.now().toString(), name: '', category: '5 Étoiles', pension: 'BB', mapLink: '' }
    ]);
  };

  const removeHotel = (id: string) => {
    if (isReadOnly) return; // Prevent action if read-only
    onChange(hotels.filter(h => h.id !== id));
  };

  const updateHotel = (id: string, field: keyof Accommodation, value: string) => {
    if (isReadOnly) return; // Prevent action if read-only
    onChange(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  return (
    <SectionWrapper 
      title="3. Hébergements" 
      icon="hotel"
      action={
        <button 
          onClick={addHotel}
          disabled={isReadOnly} // Disable based on prop
          className="text-primary text-sm font-bold flex items-center hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] mr-1">add</span>
          Ajouter Hôtel
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {hotels.length === 0 && (
            <p className="text-sm text-slate-400 italic text-center py-4">Aucun hôtel ajouté.</p>
        )}
        {hotels.map((hotel, index) => (
          <div key={hotel.id} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-center bg-slate-200 text-slate-500 font-bold rounded-full size-8 min-w-[2rem] text-sm mb-1">
              {index + 1}
            </div>
            <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <span className="text-xs font-bold text-slate-500">Nom de l'Hôtel</span>
              <input 
                className="form-input w-full rounded-md border-slate-300 py-2 text-sm focus:outline-none px-3" 
                placeholder="ex: Hilton Bomonti" 
                type="text"
                value={hotel.name}
                onChange={(e) => updateHotel(hotel.id, 'name', e.target.value)}
                disabled={isReadOnly} // Disable based on prop
              />
            </label>
            <label className="flex flex-col gap-1 w-28">
              <span className="text-xs font-bold text-slate-500">Catégorie</span>
              <select 
                className="form-select w-full rounded-md border-slate-300 py-2 text-sm focus:outline-none px-2"
                value={hotel.category}
                onChange={(e) => updateHotel(hotel.id, 'category', e.target.value)}
                disabled={isReadOnly} // Disable based on prop
              >
                <option>5 Étoiles</option>
                <option>4 Étoiles</option>
                <option>3 Étoiles</option>
                <option>Appartement</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 w-36">
              <span className="text-xs font-bold text-slate-500">Pension</span>
              <select 
                className="form-select w-full rounded-md border-slate-300 py-2 text-sm focus:outline-none px-2"
                value={hotel.pension || 'BB'} // Default to BB if undefined
                onChange={(e) => updateHotel(hotel.id, 'pension', e.target.value)}
                disabled={isReadOnly} // Disable based on prop
              >
                <option value="RO">Sans Repas (RO)</option>
                <option value="BB">Petit Déj (BB)</option>
                <option value="HB">Demi-Pension (HB)</option>
                <option value="FB">Pension Complète (FB)</option>
                <option value="AI">All Inclusive (AI)</option>
                <option value="UAI">Ultra All Inc (UAI)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <span className="text-xs font-bold text-slate-500">Lien Google Maps</span>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 material-symbols-outlined text-slate-400 text-[18px]">map</span>
                <input 
                  className="form-input w-full rounded-md border-slate-300 pl-9 py-2 text-sm focus:outline-none pr-3" 
                  placeholder="https://maps.google.com/..." 
                  type="url"
                  value={hotel.mapLink}
                  onChange={(e) => updateHotel(hotel.id, 'mapLink', e.target.value)}
                  disabled={isReadOnly} // Disable based on prop
                />
              </div>
            </label>
            <button 
              onClick={() => removeHotel(hotel.id)}
              disabled={isReadOnly} // Disable based on prop
              className="mb-1 text-slate-400 hover:text-red-500 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};