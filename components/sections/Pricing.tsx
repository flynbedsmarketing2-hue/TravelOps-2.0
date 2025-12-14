import React from 'react';
import { SectionWrapper } from '../SectionWrapper';
import { PricingRow } from '../../types';

interface PricingProps {
  rows: PricingRow[];
  onChange: (rows: PricingRow[]) => void;
  isReadOnly?: boolean; // New prop
}

export const Pricing: React.FC<PricingProps> = ({ rows, onChange, isReadOnly = false }) => {
  const updateRow = (id: string, field: 'unitPrice' | 'commission' | 'subLabel', value: string) => {
    if (isReadOnly) return; // Prevent action if read-only
    onChange(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <SectionWrapper title="4. Tarification (DZD)" icon="payments" className="pb-0">
      <div className="p-0 overflow-x-auto -mx-6 mb-[-24px]">
        <table className="w-full text-left text-sm whitespace-nowrap mb-6">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Type de Chambre / Pax</th>
              <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-48 text-right">Prix Unitaire (DZD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((row) => (
              <tr key={row.id} className={row.subLabel ? "bg-slate-50/30" : ""}>
                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                  {row.subLabel !== undefined ? (
                     <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{row.label}</span>
                        <input 
                            className="w-24 text-xs p-1 rounded border-slate-200 bg-white border focus:outline-none focus:border-primary" 
                            placeholder="Age..." 
                            type="text"
                            value={row.subLabel}
                            onChange={(e) => updateRow(row.id, 'subLabel', e.target.value)}
                            disabled={isReadOnly} // Disable based on prop
                        />
                    </div>
                  ) : (
                    row.label
                  )}
                </td>
                <td className="px-6 py-3">
                  <input 
                    className="form-input w-full rounded-md border-slate-300 py-1.5 px-3 text-sm text-right font-mono focus:outline-none" 
                    placeholder="0.00" 
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(row.id, 'unitPrice', e.target.value)}
                    disabled={isReadOnly} // Disable based on prop
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
};