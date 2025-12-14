import React from 'react';

interface SectionWrapperProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, icon, children, action, className = '' }) => {
  return (
    <section className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-primary p-1.5 rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
};