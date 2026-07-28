import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronUp, Download, Plus, Eye, Pencil, Copy, Ban,
  FileDown, History, Paperclip, Filter, X, SlidersHorizontal, Users,
} from 'lucide-react';
import type { Bail, StatutBail, TypeBail } from './locatifTypes';
import { STATUT_BAIL_CFG, TYPE_BAIL_CFG } from './locatifTypes';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Badge components ─────────────────────────────────────────────────────────
function StatutBadge({ statut }: { statut: StatutBail }) {
  const c = STATUT_BAIL_CFG[statut];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
function TypeBadge({ type }: { type: TypeBail }) {
  const c = TYPE_BAIL_CFG[type];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${c.bg} ${c.color}`}>
      {c.label}
    </span>
  );
}

// ─── Sortable column header ───────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;
function Th({ label, field, sortField, sortDir, onSort, className = '' }: {
  label: string; field: string; sortField: string; sortDir: SortDir;
  onSort: (f: string) => void; className?: string;
}) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 whitespace-nowrap cursor-pointer select-none hover:text-slate-700 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </th>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────
function RowMenu({ bail, onView, onEdit }: { bail: Bail; onView: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 w-44 min-w-max">
            {[
              { icon: Eye,     label: 'Consulter',   action: onView  },
              { icon: Pencil,  label: 'Modifier',    action: onEdit  },
              { icon: Copy,    label: 'Dupliquer',   action: () => {} },
              { icon: FileDown,label: 'Télécharger', action: () => {} },
              { icon: History, label: 'Historique',  action: () => {} },
              { icon: Paperclip,label:'Documents',   action: () => {} },
              { icon: Ban,     label: 'Résilier',    action: () => {}, danger: true },
            ].map(({ icon: Icon, label, action, danger }) => (
              <button
                key={label}
                onClick={() => { action(); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  baux: Bail[];
  onViewBail: (b: Bail) => void;
  onEditBail: (b: Bail) => void;
  onCreateBail: () => void;
}

const PAGE_SIZE = 12;

export default function BauxTableau({ baux, onViewBail, onEditBail, onCreateBail }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutBail | ''>('');
  const [filterType, setFilterType]     = useState<TypeBail | ''>('');
  const [filterGest, setFilterGest]     = useState('');
  const [sortField, setSortField]       = useState('reference');
  const [sortDir, setSortDir]           = useState<SortDir>('asc');
  const [page, setPage]                 = useState(0);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const gestionnaires = useMemo(() => [...new Set(baux.map(b => b.gestionnaire).filter(Boolean))].sort(), [baux]);

  function handleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(0);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baux
      .filter(b => {
        if (filterStatut && b.statut !== filterStatut) return false;
        if (filterType   && b.type_bail !== filterType) return false;
        if (filterGest   && b.gestionnaire !== filterGest) return false;
        if (q && ![b.reference, b.locataire_nom, b.gestionnaire].join(' ').toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let va: string | number = '', vb: string | number = '';
        if (sortField === 'reference')      { va = a.reference;      vb = b.reference; }
        if (sortField === 'locataire_nom')  { va = a.locataire_nom ?? ''; vb = b.locataire_nom ?? ''; }
        if (sortField === 'loyer_mensuel')  { va = a.loyer_mensuel;  vb = b.loyer_mensuel; }
        if (sortField === 'date_debut')     { va = a.date_debut ?? ''; vb = b.date_debut ?? ''; }
        if (sortField === 'date_fin')       { va = a.date_fin ?? '';   vb = b.date_fin ?? ''; }
        if (sortField === 'statut')         { va = a.statut;          vb = b.statut; }
        const cmp = typeof va === 'number' ? va - (vb as number) : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [baux, search, filterStatut, filterType, filterGest, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const activeFilters = [filterStatut, filterType, filterGest].filter(Boolean).length;

  const fmtDate = (d?: string) => d ? format(parseISO(d), 'dd/MM/yy', { locale: fr }) : '—';
  const today = new Date();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Référence, locataire..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>}
        </div>

        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            filtersOpen || activeFilters > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtres
          {activeFilters > 0 && <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">{activeFilters}</span>}
        </button>

        <div className="flex-1" />

        <span className="text-xs text-slate-400">{filtered.length} bail{filtered.length > 1 ? 'x' : ''}</span>

        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        <button
          onClick={onCreateBail}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouveau bail
        </button>
      </div>

      {/* Filter bar */}
      {filtersOpen && (
        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value as StatutBail | ''); setPage(0); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_BAIL_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value as TypeBail | ''); setPage(0); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Tous les types</option>
            {Object.entries(TYPE_BAIL_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterGest} onChange={e => { setFilterGest(e.target.value); setPage(0); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Tous les gestionnaires</option>
            {gestionnaires.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterStatut(''); setFilterType(''); setFilterGest(''); setPage(0); }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full text-xs min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <Th label="Statut"      field="statut"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <Th label="Référence"   field="reference"    sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <Th label="Type"        field="type_bail"    sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <Th label="Locataire"   field="locataire_nom" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <Th label="Début"       field="date_debut"   sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <Th label="Fin"         field="date_fin"     sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <Th label="Loyer"       field="loyer_mensuel" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="text-right" />
              <Th label="Charges"     field="charges"      sortField={sortField} sortDir={sortDir} onSort={handleSort} className="text-right" />
              <Th label="Gestionnaire" field="gestionnaire" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 w-10" />
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-slate-400 text-sm">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  Aucun bail trouvé
                </td>
              </tr>
            ) : pageData.map(b => {
              const dateFin = b.date_fin ? parseISO(b.date_fin) : null;
              const daysLeft = dateFin ? differenceInDays(dateFin, today) : null;
              const soonEnding = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
              return (
                <tr
                  key={b.id}
                  className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  onClick={() => onViewBail(b)}
                >
                  <td className="px-3 py-2.5"><StatutBadge statut={b.statut} /></td>
                  <td className="px-3 py-2.5 font-mono text-slate-700 font-medium">{b.reference}</td>
                  <td className="px-3 py-2.5"><TypeBadge type={b.type_bail} /></td>
                  <td className="px-3 py-2.5 text-slate-800 font-medium">{b.locataire_nom ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{fmtDate(b.date_debut)}</td>
                  <td className="px-3 py-2.5">
                    <span className={soonEnding ? 'text-amber-700 font-semibold' : 'text-slate-600'}>{fmtDate(b.date_fin)}</span>
                    {soonEnding && <span className="ml-1 text-[10px] text-amber-600 font-medium">J-{daysLeft}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{b.loyer_mensuel.toLocaleString('fr-FR')} €</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{b.charges} €</td>
                  <td className="px-3 py-2.5 text-slate-600">{b.gestionnaire ?? '—'}</td>
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <RowMenu bail={b} onView={() => onViewBail(b)} onEdit={() => onEditBail(b)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} sur {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
              className="px-2.5 py-1 text-xs rounded-md border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
              Préc.
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const idx = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
              return (
                <button key={idx} onClick={() => setPage(idx)}
                  className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${page === idx ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {idx + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs rounded-md border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
              Suiv.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
