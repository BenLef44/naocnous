import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RegleFilters, EMPTY_FILTERS, CATEGORIE_ICONS } from './types';
import { Filter, X, ChevronDown } from 'lucide-react';

interface Site { id: string; nom: string; code: string; }

interface FilterBarProps {
  filters: RegleFilters;
  onChange: (f: RegleFilters) => void;
  totalCount: number;
}

const CATEGORIES = ['Électricité', 'Sécurité incendie', 'Équipements de levage', 'Gaz & Chauffage', 'CVC & Ventilation', 'Risques', 'Accessibilité'];
const ECHEANCE_OPTIONS = [
  { value: '', label: 'Toutes échéances' },
  { value: 'semaine', label: 'Semaine en cours' },
  { value: 'mois', label: 'Mois en cours' },
  { value: 'trimestre', label: 'Trimestre en cours' },
  { value: 'annee', label: 'Année en cours' },
];
const STATUT_OPTIONS = [
  { value: '', label: 'Tous statuts' },
  { value: 'manquant', label: 'Manquants' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'a_venir', label: 'À venir' },
  { value: 'realise', label: 'Réalisés' },
];

export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    supabase.from('sites').select('id, nom, code').order('nom').then(({ data }) => setSites(data || []));
  }, []);

  const activeCount = [filters.categorieType, filters.siteId, filters.statut, filters.echeance].filter(Boolean).length;
  const hasFilters = activeCount > 0;

  const set = (key: keyof RegleFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white border-b border-slate-100 px-6 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${expanded || hasFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtres
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">{activeCount}</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Opérateur logique */}
        {hasFilters && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['ET', 'OU'] as const).map((op) => (
              <button
                key={op}
                onClick={() => onChange({ ...filters, logicOp: op })}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${filters.logicOp === op ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {op}
              </button>
            ))}
          </div>
        )}

        {/* Active filter chips */}
        {filters.categorieType && (
          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {CATEGORIE_ICONS[filters.categorieType]} {filters.categorieType}
            <button onClick={() => set('categorieType', '')}><X className="w-3 h-3" /></button>
          </span>
        )}
        {filters.siteId && (
          <span className="flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
            {sites.find((s) => s.id === filters.siteId)?.nom}
            <button onClick={() => set('siteId', '')}><X className="w-3 h-3" /></button>
          </span>
        )}
        {filters.statut && (
          <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
            {STATUT_OPTIONS.find((s) => s.value === filters.statut)?.label}
            <button onClick={() => set('statut', '')}><X className="w-3 h-3" /></button>
          </span>
        )}
        {filters.echeance && (
          <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            {ECHEANCE_OPTIONS.find((e) => e.value === filters.echeance)?.label}
            <button onClick={() => set('echeance', '')}><X className="w-3 h-3" /></button>
          </span>
        )}

        {hasFilters && (
          <button onClick={() => onChange(EMPTY_FILTERS)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <X className="w-3 h-3" /> Effacer tout
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">{totalCount} contrôle{totalCount !== 1 ? 's' : ''}</span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Catégorie */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">A. Type de contrôle</label>
            <select
              value={filters.categorieType}
              onChange={(e) => set('categorieType', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORIE_ICONS[c] || ''} {c}</option>
              ))}
            </select>
          </div>

          {/* Échéance */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">B. Période échéance</label>
            <select
              value={filters.echeance}
              onChange={(e) => set('echeance', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              {ECHEANCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Site parent */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">D. Site parent</label>
            <select
              value={filters.siteId}
              onChange={(e) => set('siteId', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              <option value="">Tous les sites</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Statut contrôle</label>
            <select
              value={filters.statut}
              onChange={(e) => set('statut', e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
