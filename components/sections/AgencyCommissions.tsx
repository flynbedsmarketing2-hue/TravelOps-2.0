import React from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { AgencyCommission, CommissionValues } from '../../types';

interface AgencyCommissionsProps {
  commission: AgencyCommission;
  onChange: (val: AgencyCommission) => void;
  isReadOnly?: boolean;
}

export const AgencyCommissions: React.FC<AgencyCommissionsProps> = ({ commission, onChange, isReadOnly = false }) => {

  // Update function to handle both tiered (adulte) and single (enfant, bebe) commissions
  const updateCommission = (
    type: keyof AgencyCommission, 
    tier: keyof CommissionValues | null, // `tier` is null for 'enfant' and 'bebe'
    value: string
  ) => {
    if (isReadOnly) return;
    
    if (type === 'adulte' && tier) {
      onChange({
        ...commission,
        adulte: {
          ...commission.adulte,
          [tier]: value
        }
      });
    } else if (type === 'enfant' || type === 'bebe') {
      onChange({
        ...commission,
        [type]: value // Directly update the string value
      });
    }
  };

  return (
    <SectionWrapper title="5. Commissions Agences" icon="monetization_on">
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100/50 text-slate-800 font-bold uppercase text-xs tracking-wider">
              <th className="px-6 py-4 border-r border-slate-200 w-1/4">/</th>
              <th className="px-6 py-4 border-r border-slate-200 w-1/4">1 à 5 Pax</th>
              <th className="px-6 py-4 border-r border-slate-200 w-1/4">6 à 9 Pax</th>
              <th className="px-6 py-4 w-1/4">10 à 15 Pax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* Adulte Row */}
            <tr className="bg-white hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-700 border-r border-slate-200 text-left">Adulte</td>
              <td className="px-6 py-4 border-r border-slate-200">
                <div className="flex items-center justify-center gap-2">
                    <input 
                        type="text" 
                        className="form-input w-full text-center font-bold text-primary border-none bg-transparent focus:ring-0 placeholder:text-slate-300"
                        placeholder="0"
                        value={commission.adulte.t1}
                        onChange={(e) => updateCommission('adulte', 't1', e.target.value)}
                        disabled={isReadOnly}
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">DZD /pers</span>
                </div>
              </td>
              <td className="px-6 py-4 border-r border-slate-200">
                <div className="flex items-center justify-center gap-2">
                    <input 
                        type="text" 
                        className="form-input w-full text-center font-bold text-primary border-none bg-transparent focus:ring-0 placeholder:text-slate-300"
                        placeholder="0"
                        value={commission.adulte.t2}
                        onChange={(e) => updateCommission('adulte', 't2', e.target.value)}
                        disabled={isReadOnly}
                    />
                     <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">DZD /pers</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <input 
                        type="text" 
                        className="form-input w-full text-center font-bold text-primary border-none bg-transparent focus:ring-0 placeholder:text-slate-300"
                        placeholder="0"
                        value={commission.adulte.t3}
                        onChange={(e) => updateCommission('adulte', 't3', e.target.value)}
                        disabled={isReadOnly}
                    />
                     <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">DZD /pers</span>
                </div>
              </td>
            </tr>

            {/* Enfant Row */}
            <tr className="bg-white hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-700 border-r border-slate-200 text-left">Enfant</td>
              <td className="px-6 py-4" colSpan={3}> {/* This td spans the last three columns */}
                <div className="flex items-center justify-center gap-2">
                     <input 
                        type="text" 
                        className="form-input w-full text-center font-bold text-[#eb4077] border-none bg-transparent focus:ring-0 placeholder:text-slate-300"
                        placeholder="0"
                        value={commission.enfant}
                        onChange={(e) => updateCommission('enfant', null, e.target.value)}
                        disabled={isReadOnly}
                    />
                     <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">DZD /personne</span>
                </div>
              </td>
            </tr>

            {/* Bébé Row */}
            <tr className="bg-white hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-700 border-r border-slate-200 text-left">Bébé</td>
              <td className="px-6 py-4" colSpan={3}> {/* This td spans the last three columns */}
                 <div className="flex items-center justify-center gap-2">
                    <input 
                        type="text" 
                        className="form-input w-full text-center font-bold text-[#eb4077] border-none bg-transparent focus:ring-0 placeholder:text-slate-300"
                        placeholder="0"
                        value={commission.bebe}
                        onChange={(e) => updateCommission('bebe', null, e.target.value)}
                        disabled={isReadOnly}
                    />
                     <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">DZD /personne</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
};