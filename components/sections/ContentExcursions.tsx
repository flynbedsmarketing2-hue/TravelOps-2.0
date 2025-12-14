import React from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { BulletInput } from '../BulletInput'; // Import the new component

interface ContentExcursionsProps {
  content: { included: string; excluded: string };
  excursions: { included: string; extra: string };
  onContentChange: (field: 'included' | 'excluded', val: string) => void;
  onExcursionChange: (field: 'included' | 'extra', val: string) => void;
  isReadOnly?: boolean; // New prop
}

export const ContentExcursions: React.FC<ContentExcursionsProps> = ({ 
  content, excursions, onContentChange, onExcursionChange, isReadOnly = false
}) => {
  return (
    <>
      <SectionWrapper title="6. Contenu du Package" icon="list_alt">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Ce qui est inclus
            </div>
            <BulletInput
              className="border-green-200 bg-green-50/30 focus:border-green-500 focus:ring-green-500 min-h-[160px]"
              placeholder="• Billet d'avion A/R&#10;• Transferts aéroport-hôtel&#10;• Hébergement en Petit Déjeuner"
              value={content.included}
              onChange={(val) => onContentChange('included', val)}
              disabled={isReadOnly} // Disable based on prop
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              Ce qui n'est pas inclus
            </div>
            <BulletInput
              className="border-red-200 bg-red-50/30 focus:border-red-500 focus:ring-red-500 min-h-[160px]"
              placeholder="• Dépenses personnelles&#10;• Assurance voyage&#10;• Repas non mentionnés"
              value={content.excluded}
              onChange={(val) => onContentChange('excluded', val)}
              disabled={isReadOnly} // Disable based on prop
            />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper title="7. Excursions" icon="attractions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <label className="font-bold text-sm text-slate-700 dark:text-slate-300">Excursions Incluses</label>
            <BulletInput
              className="border-slate-300 bg-white min-h-[120px]"
              placeholder="• Croisière sur le Bosphore&#10;• Visite guidée de Sultanahmet"
              value={excursions.included}
              onChange={(val) => onExcursionChange('included', val)}
              disabled={isReadOnly} // Disable based on prop
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-bold text-sm text-slate-700 dark:text-slate-300">Excursions en Extra (Optionnel)</label>
            <BulletInput
              className="border-slate-300 bg-white min-h-[120px]"
              placeholder="• Dîner Spectacle&#10;• Îles aux Princes"
              value={excursions.extra}
              onChange={(val) => onExcursionChange('extra', val)}
              disabled={isReadOnly} // Disable based on prop
            />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
};