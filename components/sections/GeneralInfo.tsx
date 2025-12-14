import React from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { GeneralInfo as GeneralInfoType } from '../../types';

interface GeneralInfoProps {
  data: GeneralInfoType;
  onChange: <F extends keyof GeneralInfoType>(field: F, value: GeneralInfoType[F]) => void; // Updated for type safety
  isReadOnly?: boolean;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({ data, onChange, isReadOnly = false }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; 
    e.currentTarget.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000';
  };

  return (
    <SectionWrapper title="1. Informations Générales" icon="info">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom du Produit</span>
          <input 
            className="form-input w-full rounded-lg border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none" 
            placeholder="ex: Istanbul Fin d'Année" 
            type="text" 
            value={data.productName}
            onChange={(e) => onChange('productName', e.target.value)}
            disabled={isReadOnly}
          />
        </label>
        <label className="flex flex-col gap-2 lg:col-span-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Image de couverture (URL)</span>
          <div className="relative">
            <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-[20px]">image</span>
            <input 
              className="form-input w-full rounded-lg border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none" 
              placeholder="https://..." 
              type="url" 
              value={data.imageUrl || ''}
              onChange={(e) => onChange('imageUrl', e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </label>
        <label className="flex flex-col gap-2 opacity-70">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            Code Produit 
            <span className="material-symbols-outlined text-[14px] text-slate-400" title="Généré automatiquement">help</span>
          </span>
          <input 
            className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 font-mono" 
            disabled
            type="text" 
            value={data.productCode}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 mt-6">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de Pax Disponible (Stock)</span>
          <input 
            className="form-input w-full rounded-lg border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none" 
            placeholder="ex: 100" 
            type="number"
            min="0"
            value={data.stock ?? ''}
            onChange={(e) => onChange('stock', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isReadOnly} // Disable based on prop
          />
        </label>

      {data.imageUrl && (
        <div className="mt-4 w-full h-48 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative group">
          <img 
            src={data.imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-sm font-medium">
            Aperçu de l'image
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};