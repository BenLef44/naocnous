import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronUp, ChevronRight, Filter,
  Download, Plus, AlertTriangle, FileText,
} from 'lucide-react';
import type { Charge } from './financeTypes';
import { STATUT_CHARGE_CFG, fmtEur, fmtDate } from './financeTypes';
import { StatutChargeChip, ResponsableChip, SourceBadge } from './FinanceShared';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  charges: Charge[];
  onSelectCharge?: (c: Charge) => void;
}

const SORT_COLS = ['reference', 'type_charge', 'responsable', 'cout_estime', 'date_declaration', 'statut'] as const;
type SortCol = typeof SORT_COLS[number];

export default function FinanceTableau({ charges, onSelectCharge }: Props) {
  const [search,           setSearch]           = useState('');
  const [filterResp,       setFilterResp]       = useState('');
  const [filterStatut,     setFilterStatut]     = useState('');
  const [filterSource,     setFilterSource]     = useState('');
  const [sortCol,          setSortCol]          = useState<SortCol>('date_declaration');
  const [sortDir,          setSortDir]          = useState<'asc'|'desc'>('desc');
  const [expandedRows,     setExpandedRows]     = useState<Set<string>>(new Set());
  const [showFilters,      setShowFilters]      = useState(false);

  const filtered = useMemo(() => {
    let list = charges;
    if (search)       list = list.filter(c =>
      c.reference.toLowerCase().includes(search.toLowerCase()) ||
      c.type_charge.toLowerCase().includes(search.toLowerCase()) ||
      c.type_intervention.toLowerCase().includes(search.toLowerCase()) ||
      (c.commentaire ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterResp)   list = list.filter(c => c.responsable === filterResp);
    if (filterStatut) list = list.filter(c => c.statut === filterStatut);
    if (filterSource) list = list.filter(c => c.source_systeme === filterSource);

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'cout_estime') cmp = a.cout_estime - b.cout_estime;
      else if (sortCol === 'date_declaration') cmp = a.date_declaration.localeCompare(b.date_declaration);
      else cmp = (a[sortCol] as string ?? '').localeCompare(b[sortCol] as string ?? '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [charges, search, filterResp, filterStatut, filterSource, sortCol, sortDir]);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }
  function toggleExpand(id: string) {
    setExpandedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const SortIcon = ({ col }: { col: SortCol }) => sortCol === col
    ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
    : <ChevronDown className="w-3 h-3 text-slate-200" />;

  const totalEstime = filtered.reduce((s, c) => s + c.cout_estime, 0);
  const totalReel   = filtered.reduce((s, c) => s + (c.cout_reel ?? 0), 0);
  const nbLitiges   = filtered.filter(c => c.statut === 'litige').length;
  const activeFilters = [filterResp, filterStatut, filterSource].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Barre outils ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        {/* Stats */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">{filtered.length} charge{filtered.length !== 1 ? 's' : ''}</span>
          <span className="text-xs text-slate-400">{fmtEur(totalEstime)} estimé</span>
          {totalReel > 0 && <span className="text-xs text-slate-400">{fmtEur(totalReel)} réel</span>}
          {nbLitiges > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertTriangle className="w-3 h-3" /> {nbLitiges} litige{nbLitiges > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 w-44" />
        </div>

        {/* Filtres toggle */}
        <button onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors
            ${showFilters || activeFilters > 0 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          <Filter className="w-3 h-3" />
          Filtres
          {activeFilters > 0 && <span className="bg-white text-blue-600 rounded-full w-3.5 h-3.5 text-[10px] font-bold flex items-center justify-center">{activeFilters}</span>}
        </button>

        {/* Export CSV */}
        <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <Download className="w-3 h-3" /> Export
        </button>

        {/* Nouvelle charge */}
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">
          <Plus className="w-3.5 h-3.5" /> Nouvelle charge
        </button>
      </div>

      {/* ── Filtres ──────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50 flex-shrink-0 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtres :</span>
          <select value={filterResp} onChange={e => setFilterResp(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Tous responsables</option>
            <option value="Propriétaire">Propriétaire</option>
            <option value="Gestionnaire">Gestionnaire</option>
            <option value="Partagé">Partagé</option>
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Tous statuts</option>
            {Object.entries(STATUT_CHARGE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Toutes sources</option>
            {['Manuel','BNS','SI Logement','Epona','OPERAT/OSFI'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {activeFilters > 0 && (
            <button onClick={() => { setFilterResp(''); setFilterStatut(''); setFilterSource(''); }}
              className="text-xs text-red-500 hover:text-red-700 underline">Effacer</button>
          )}
        </div>
      )}

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
            <tr>
              {[
                { col: 'reference' as SortCol,         label: 'Référence' },
                { col: 'type_charge' as SortCol,       label: 'Nature / Intervention' },
                { col: 'responsable' as SortCol,       label: 'Responsable' },
                { col: 'cout_estime' as SortCol,       label: 'Coût estimé' },
                { col: 'date_declaration' as SortCol,  label: 'Déclaration' },
                { col: 'statut' as SortCol,            label: 'Statut' },
              ].map(({ col, label }) => (
                <th key={col} className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-slate-600 transition-colors"
                  onClick={() => toggleSort(col)}>
                  <span className="flex items-center gap-1">{label} <SortIcon col={col} /></span>
                </th>
              ))}
              <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest">Source</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const expanded = expandedRows.has(c.id);
              const ecart = c.cout_reel != null ? c.cout_reel - c.cout_estime : null;
              return (
                <>
                  <tr key={c.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => { toggleExpand(c.id); onSelectCharge?.(c); }}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className={`w-3 h-3 text-slate-300 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                        <span className="font-mono font-bold text-slate-700">{c.reference}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-52">
                      <p className="font-semibold text-slate-700 leading-tight truncate">{c.type_charge}</p>
                      <p className="text-[10px] text-slate-400 truncate">{c.type_intervention}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <ResponsableChip responsable={c.responsable} />
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-700">{fmtEur(c.cout_estime)}</p>
                      {c.cout_reel != null && (
                        <p className={`text-[10px] font-semibold ${ecart! > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          Réel: {fmtEur(c.cout_reel)} ({ecart! > 0 ? '+' : ''}{fmtEur(ecart)})
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{fmtDate(c.date_declaration)}</td>
                    <td className="py-2.5 px-3">
                      <StatutChargeChip statut={c.statut} />
                      {c.date_intervention && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Interv. {fmtDate(c.date_intervention)}</p>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <SourceBadge source={c.source_systeme} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {c.contrat_id && <FileText className="w-3.5 h-3.5 text-blue-400" title="Contrat associé" />}
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${c.id}-exp`} className="border-b border-slate-100 bg-slate-50/60">
                      <td colSpan={8} className="px-8 py-3">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Détails</p>
                            <div className="space-y-1">
                              {c.commentaire && <p><span className="text-slate-400">Note : </span><span className="text-slate-600">{c.commentaire}</span></p>}
                              <p><span className="text-slate-400">Date déclaration : </span><span className="text-slate-600 font-medium">{fmtDate(c.date_declaration)}</span></p>
                              {c.date_intervention && <p><span className="text-slate-400">Date intervention : </span><span className="text-slate-600 font-medium">{fmtDate(c.date_intervention)}</span></p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rattachement</p>
                            <div className="space-y-1">
                              {c.batiment?.nom && <p><span className="text-slate-400">Bâtiment : </span><span className="text-slate-600">{c.batiment.nom}</span></p>}
                              {c.residence?.nom && <p><span className="text-slate-400">Résidence : </span><span className="text-slate-600">{c.residence.nom}</span></p>}
                              {c.contrat?.nom && <p><span className="text-slate-400">Contrat : </span><span className="text-blue-600 font-medium">{c.contrat.nom}</span></p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Actions rapides</p>
                            <div className="flex flex-wrap gap-2">
                              {c.statut === 'en_attente' && (
                                <button className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
                                  Valider
                                </button>
                              )}
                              {c.statut !== 'litige' && c.statut !== 'clos' && (
                                <button className="px-2.5 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold">
                                  Litige
                                </button>
                              )}
                              <button className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-semibold">
                                Lier contrat
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Aucune charge ne correspond aux filtres
          </div>
        )}
      </div>
    </div>
  );
}
