import { useState } from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import ControlesTableau from './ControlesTableau';
import ControlesPlanning from './ControlesPlanning';
import type { ControleRow } from './ControlesTableau';

// Contrôles réalistes pour l'armoire positive 5°C ± 2°C 1361 L
const CONTROLES_ARMOIRE: ControleRow[] = [
  {
    id: 'arm-fgas-1',
    type: '❄️ Contrôle F-Gas',
    categorie: 'Contrôle F-Gas',
    periodicite: 'Annuelle',
    localisation: 'R.U Manufacture › Cuisine › Armoire positive',
    organisme: 'APAVE',
    dateProchain: '2026-10-05',
    dateDernier:  '2025-10-08',
    conformes: 6,
    nonConformes: 0,
    statut: 'a_venir',
    criticite: 'Critique',
    actions: 0,
  },
  {
    id: 'arm-haccp-1',
    type: '🌡️ Audit température HACCP',
    categorie: 'Audit température HACCP',
    periodicite: 'Annuelle',
    localisation: 'R.U Manufacture › Cuisine › Armoire positive',
    organisme: 'SOCOTEC',
    dateProchain: '2026-11-15',
    dateDernier:  '2025-11-18',
    conformes: 12,
    nonConformes: 1,
    statut: 'a_venir',
    criticite: 'Majeure',
    actions: 1,
  },
  {
    id: 'arm-elec-1',
    type: '⚡ Contrôle électrique NF C 15-100',
    categorie: 'Contrôle électrique NF C 15-100',
    periodicite: 'Quinquennale',
    localisation: 'R.U Manufacture › Cuisine › Armoire positive',
    organisme: 'Bureau Veritas',
    dateProchain: '2028-03-01',
    dateDernier:  '2023-03-12',
    conformes: 18,
    nonConformes: 0,
    statut: 'a_venir',
    criticite: 'Majeure',
    actions: 0,
  },
];

interface Props {
  hideLocalisation?: boolean;
}

export default function ControlesOnglet({ hideLocalisation = false }: Props) {
  const [vue, setVue] = useState<'tableau' | 'planning'>('tableau');

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Vue switcher */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setVue('tableau')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${vue === 'tableau' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Table2 className="w-3.5 h-3.5" /> Vue tableau
          </button>
          <button
            onClick={() => setVue('planning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${vue === 'planning' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Vue planning
          </button>
        </div>
      </div>

      {vue === 'tableau'  && <ControlesTableau  rows={CONTROLES_ARMOIRE} hideLocalisation={hideLocalisation} />}
      {vue === 'planning' && <ControlesPlanning />}
    </div>
  );
}
