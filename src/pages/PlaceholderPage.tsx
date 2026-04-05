import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500">
      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
        <Construction size={32} className="text-indigo-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-300 capitalize">{pageName}</h2>
      <p className="text-sm mt-2">This module is under construction.</p>
    </div>
  );
}
