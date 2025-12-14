import React, { useState } from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { Flight } from '../../types';

interface FlightsProps {
  destination: string;
  cities: string[];
  flights: Flight[];
  visaStatus: string;
  transferStatus: string;
  onDestinationChange: (val: string) => void;
  onCitiesChange: (val: string[]) => void;
  onFlightsChange: (val: Flight[]) => void;
  onVisaChange: (val: any) => void;
  onTransferChange: (val: any) => void;
  isReadOnly?: boolean; 
}

// Helper to parse duration string into nights and days
const parseDuration = (str: string) => {
  const nMatch = str.match(/(\d+)\s*(?:N|Nuit|Nuits)/i);
  const dMatch = str.match(/(\d+)\s*(?:J|Jour|Jours)/i);

  let nights = 0;
  let days = 0;

  if (nMatch) nights = parseInt(nMatch[1], 10);
  
  if (dMatch) {
    days = parseInt(dMatch[1], 10);
  } else if (nights > 0) {
    // If only nights are present (e.g. old data "7 Nuits"), default days to nights + 1
    days = nights + 1;
  }

  return { nights, days };
};

export const Flights: React.FC<FlightsProps> = ({ 
  destination, cities, flights, visaStatus, transferStatus,
  onDestinationChange, onCitiesChange, onFlightsChange, onVisaChange, onTransferChange,
  isReadOnly = false 
}) => {
  const [cityInput, setCityInput] = useState('');

  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (isReadOnly) return; 
    if (e.key === 'Enter' && cityInput.trim()) {
      e.preventDefault();
      if (!cities.includes(cityInput.trim())) {
        onCitiesChange([...cities, cityInput.trim()]);
      }
      setCityInput('');
    }
  };

  const removeCity = (city: string) => {
    if (isReadOnly) return; 
    onCitiesChange(cities.filter(c => c !== city));
  };

  const addFlight = () => {
    if (isReadOnly) return; 
    const newFlight: Flight = {
      id: Date.now().toString(),
      airline: 'Turkish Airlines (TK)',
      departureDate: '',
      returnDate: '',
      duration: '0 N / 0 J',
      details: ''
    };
    onFlightsChange([...flights, newFlight]);
  };

  const removeFlight = (id: string) => {
    if (isReadOnly) return; 
    onFlightsChange(flights.filter(f => f.id !== id));
  };

  const updateFlight = (id: string, field: keyof Flight, value: string) => {
    if (isReadOnly) return; 
    onFlightsChange(flights.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleDateChange = (id: string, field: 'departureDate' | 'returnDate', value: string) => {
    if (isReadOnly) return;
    
    const currentFlight = flights.find(f => f.id === id);
    if (!currentFlight) return;

    const updatedFlight = { ...currentFlight, [field]: value };
    
    // Auto-calculate duration if both dates are present and valid
    if (updatedFlight.departureDate && updatedFlight.returnDate) {
        const start = new Date(updatedFlight.departureDate);
        const end = new Date(updatedFlight.returnDate);
        
        // Calculate diff only if dates are valid and start <= end
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
             const diffTime = Math.abs(end.getTime() - start.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             
             // Logic: difference in days usually equals "nights". Days = Nights + 1.
             const nights = diffDays;
             const days = diffDays + 1;
             updatedFlight.duration = `${nights} N / ${days} J`;
        }
    }
    
    onFlightsChange(flights.map(f => f.id === id ? updatedFlight : f));
  };

  const handleDurationChange = (id: string, type: 'nights' | 'days', operation: 'increment' | 'decrement' | 'set', value?: number) => {
     if (isReadOnly) return;
     const currentFlight = flights.find(f => f.id === id);
     if (!currentFlight) return;
     
     let { nights, days } = parseDuration(currentFlight.duration || '0 N / 0 J');
     
     if (type === 'nights') {
         if (operation === 'increment') nights++;
         if (operation === 'decrement') nights = Math.max(0, nights - 1);
         if (operation === 'set' && value !== undefined) nights = Math.max(0, value);
     } else {
         if (operation === 'increment') days++;
         if (operation === 'decrement') days = Math.max(0, days - 1);
         if (operation === 'set' && value !== undefined) days = Math.max(0, value);
     }
     
     const newDuration = `${nights} N / ${days} J`;
     onFlightsChange(flights.map(f => f.id === id ? { ...f, duration: newDuration } : f));
  };

  return (
    <SectionWrapper title="2. Détails Vols & Séjour" icon="flight">
      <div className="flex flex-col gap-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Destination Principale</span>
            <div className="relative">
              <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-[20px]">location_on</span>
              <input 
                className="form-input w-full rounded-lg border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none" 
                placeholder="Pays ou Ville" 
                type="text"
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                disabled={isReadOnly} 
              />
            </div>
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Villes Visitées</span>
            <div className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              {cities.map(city => (
                <span key={city} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 animate-fadeIn">
                  #{city}
                  <button 
                    onClick={() => removeCity(city)} 
                    className="hover:text-red-500 flex items-center"
                    disabled={isReadOnly}
                    type="button" 
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              <input 
                className="bg-transparent border-none text-sm p-1 focus:ring-0 placeholder:text-slate-400 flex-1 min-w-[120px] focus:outline-none" 
                placeholder="Ajouter une ville + Entrée" 
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={handleCityKeyDown}
                disabled={isReadOnly} 
              />
            </div>
          </label>
        </div>

        {/* Flight Plans */}
        <div className="flex flex-col gap-4">
          {flights.map((flight, index) => {
            const { nights, days } = parseDuration(flight.duration || '0 N / 0 J');

            return (
              <div key={flight.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:bg-slate-900/50 dark:border-slate-600 transition-all">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Plan de Vol #{index + 1}</h3>
                  {flights.length > 1 && (
                    <button 
                      onClick={() => removeFlight(flight.id)} 
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      disabled={isReadOnly}
                      type="button" 
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Compagnie</span>
                    <select 
                      className="form-select w-full rounded-lg border-slate-300 bg-white py-2 text-sm focus:border-primary focus:ring-primary outline-none"
                      value={flight.airline}
                      onChange={(e) => updateFlight(flight.id, 'airline', e.target.value)}
                      disabled={isReadOnly} 
                    >
                      <option>Turkish Airlines (TK)</option>
                      <option>Air Algérie (AH)</option>
                      <option>Emirates (EK)</option>
                      <option>Air France (AF)</option>
                      <option>Qatar Airways (QR)</option>
                      <option>Lufthansa (LH)</option>
                      <option>Saudi Airlines (SV)</option>
                      <option>Tassili Airlines (SF)</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Date Aller</span>
                    <input 
                      className="form-input w-full rounded-lg border-slate-300 bg-white py-2 text-sm" 
                      type="date"
                      value={flight.departureDate}
                      onChange={(e) => handleDateChange(flight.id, 'departureDate', e.target.value)}
                      disabled={isReadOnly} 
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Date Retour</span>
                    <input 
                      className="form-input w-full rounded-lg border-slate-300 bg-white py-2 text-sm" 
                      type="date"
                      value={flight.returnDate}
                      onChange={(e) => handleDateChange(flight.id, 'returnDate', e.target.value)}
                      disabled={isReadOnly} 
                    />
                  </label>
                  
                  {/* SPLIT DURATION: Nights & Days */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Durée (Nuits / Jours)</span>
                    <div className="flex gap-2 h-[38px]">
                        {/* Nights Input */}
                        <div className="flex flex-1 items-center rounded-lg border border-slate-300 bg-white overflow-hidden">
                            <button 
                                onClick={() => handleDurationChange(flight.id, 'nights', 'decrement')}
                                disabled={isReadOnly}
                                type="button"
                                className="px-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 h-full flex items-center justify-center text-slate-600 font-bold disabled:opacity-50 transition-colors"
                            >-</button>
                            <input 
                                className="w-full text-center border-none text-sm p-0 h-full focus:ring-0 outline-none font-medium bg-transparent" 
                                type="text" 
                                value={`${nights} N`}
                                readOnly
                            />
                            <button 
                                onClick={() => handleDurationChange(flight.id, 'nights', 'increment')}
                                disabled={isReadOnly}
                                type="button"
                                className="px-3 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 h-full flex items-center justify-center text-primary font-bold disabled:opacity-50 transition-colors"
                            >+</button>
                        </div>
                        
                        {/* Days Input */}
                        <div className="flex flex-1 items-center rounded-lg border border-slate-300 bg-white overflow-hidden">
                            <button 
                                onClick={() => handleDurationChange(flight.id, 'days', 'decrement')}
                                disabled={isReadOnly}
                                type="button"
                                className="px-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 h-full flex items-center justify-center text-slate-600 font-bold disabled:opacity-50 transition-colors"
                            >-</button>
                             <input 
                                className="w-full text-center border-none text-sm p-0 h-full focus:ring-0 outline-none font-medium bg-transparent" 
                                type="text"
                                value={`${days} J`}
                                readOnly
                            />
                            <button 
                                onClick={() => handleDurationChange(flight.id, 'days', 'increment')}
                                disabled={isReadOnly}
                                type="button"
                                className="px-3 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 h-full flex items-center justify-center text-primary font-bold disabled:opacity-50 transition-colors"
                            >+</button>
                        </div>
                    </div>
                  </div>
                </div>
                <label className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Détails (Numéros de vol, horaires)</span>
                  <textarea 
                    className="form-input w-full rounded-lg border-slate-300 bg-white p-3 text-sm resize-none focus:outline-none" 
                    placeholder="ex: Vol TK123 ALG 14:00 - IST 19:00" 
                    rows={2}
                    value={flight.details}
                    onChange={(e) => updateFlight(flight.id, 'details', e.target.value)}
                    disabled={isReadOnly} 
                  />
                </label>
              </div>
            );
          })}

          <button 
            onClick={addFlight}
            disabled={isReadOnly}
            type="button" 
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Ajouter un autre départ
          </button>
        </div>

        {/* Visa & Transfers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Visa</span>
            <div className="flex rounded-lg bg-slate-100 p-1 w-full max-w-md">
              {['Inclus', 'Non Inclus', 'Client'].map((opt) => {
                  const val = opt.toLowerCase().replace(' ', '-') as any;
                  return (
                    <label key={opt} className="flex-1 text-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="visa" 
                            className="peer sr-only" 
                            checked={visaStatus === val}
                            onChange={() => onVisaChange(val)}
                            disabled={isReadOnly} 
                        />
                        <span className="block py-1.5 px-3 text-xs font-bold rounded-md transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm text-slate-500 select-none">
                            {opt}
                        </span>
                    </label>
                  );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Transferts</span>
            <div className="flex rounded-lg bg-slate-100 p-1 w-full max-w-xs">
             {['Inclus', 'Non Inclus'].map((opt) => {
                  const val = opt.toLowerCase().replace(' ', '-') as any;
                  return (
                    <label key={opt} className="flex-1 text-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="transferts" 
                            className="peer sr-only" 
                            checked={transferStatus === val}
                            onChange={() => onTransferChange(val)}
                            disabled={isReadOnly} 
                        />
                        <span className="block py-1.5 px-3 text-xs font-bold rounded-md transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm text-slate-500 select-none">
                            {opt}
                        </span>
                    </label>
                  );
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};