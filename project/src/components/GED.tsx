import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import GedFilterBar, { GedFilters, EMPTY_FILTERS, countActiveFilters } from './GedFilterBar';
import DocumentsArborescence from './DocumentsArborescence';

// ─── Scope tag ────────────────────────────────────────────────────────────────

function GedScopeTag({ filters }: { filters: GedFilters }) {
  const parts: string[] = [];

  if (filters.rootCategories.length > 0 || filters.specialCategories.length > 0) {
    const cats = [
      ...filters.rootCategories.map(r =>
        ({ technique: 'Technique', administratif: 'Administratif', reglementaire: 'Réglementaire' } as Record<string, string>)[r]),
      ...filters.specialCategories.map(s => s === 'DTA' ? 'DTA' : 'Charges Bailleur-Preneur'),
    ];
    parts.push(cats.join(', '));
  }
  if (filters.siteIds.length + filters.residenceIds.length > 0) {
    const n = filters.siteIds.length + filters.residenceIds.length;
    parts.push(`${n} site${n > 1 ? 's' : ''}`);
  }
  if (filters.equipementCats.length + filters.equipementSubCats.length > 0) {
    const n = filters.equipementCats.length + filters.equipementSubCats.length;
    parts.push(`${n} équipement${n > 1 ? 's' : ''}`);
  }
  if (filters.periodPreset || filters.dateFrom || filters.dateTo) {
    parts.push('période filtrée');
  }
  if (parts.length === 0) return null;

  return (
    <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-shrink-0">
      <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
      <span className="text-[11px] text-blue-700 font-medium">
        Vue filtrée : {parts.join(' · ')}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GED() {
  const [filters, setFilters] = useState<GedFilters>(EMPTY_FILTERS);

  const handleChange  = (patch: Partial<GedFilters>) => setFilters(p => ({ ...p, ...patch }));
  const handleReset   = () => setFilters(EMPTY_FILTERS);
  const activeCount   = countActiveFilters(filters);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800 leading-tight">
              Gestion Électronique des Documents
            </h1>
            <p className="text-xs text-slate-400 leading-tight">
              Ensemble du patrimoine CROUS Lyon
              {activeCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  — {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter un document
        </button>
      </div>

      {/* Filter bar */}
      <GedFilterBar filters={filters} onChange={handleChange} onReset={handleReset} />

      {/* Active filter scope indicator */}
      <GedScopeTag filters={filters} />

      {/* Document explorer */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DocumentsArborescence context="ged" gedFilters={filters} />
      </div>
    </div>
  );
}
