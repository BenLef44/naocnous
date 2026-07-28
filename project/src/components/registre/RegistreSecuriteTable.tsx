import { useState, useMemo } from 'react';
import {
  Search, Plus, Eye, Pencil, Trash2, Filter,
  CheckCircle2, Clock, FileText, Archive, AlertCircle,
  ShieldCheck, ChevronUp, ChevronDown,
} from 'lucide-react';
import type { RegistreSecuriteRecord } from './registreTypes';
import { STATUT_REGISTRE_CFG, CATEGORIE_ERP_LABELS, fmtDate } from './registreTypes';
import type { ERP } from './registreTypes';

// ─── Completude bar ────────────────────────────────────────────────────────────

function ComplBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-bold tabular-nums ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Statut badge ──────────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: string }) {
  const cfg = STATUT_REGISTRE_CFG[statut] ?? STATUT_REGISTRE_CFG['brouillon'];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Sig icons ─────────────────────────────────────────────────────────────────

function SigRow({ sigs }: { sigs: RegistreSecuriteRecord['signatures'] }) {
  const valides = sigs.filter(s => s.valide).length;
  const total   = sigs.length;
  if (total === 0) return <span className="text-[10px] text-slate-300">—</span>;
  return (
    <span className="flex items-center gap-1 text-[10px]">
      <CheckCircle2 className={`w-3 h-3 ${valides === total ? 'text-emerald-500' : 'text-amber-400'}`} />
      <span className={valides === total ? 'text-emerald-600 font-bold' : 'text-slate-500'}>{valides}/{total}</span>
    </span>
  );
}

// ─── Column sort button ─────────────────────────────────────────────────────────

function SortBtn({ label, col, sort, onSort }: { label: string; col: string; sort: { col: string; asc: boolean }; onSort: (c: string) => void }) {
  const active = sort.col === col;
  return (
    <button onClick={() => onSort(col)} className="flex items-center gap-1 group">
      <span className={`text-[11px] font-bold ${active ? 'text-slate-800' : 'text-slate-500'} group-hover:text-slate-700`}>{label}</span>
      {active ? (sort.asc ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />) : null}
    </button>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  registres: RegistreSecuriteRecord[];
  erps: ERP[];
  loading: boolean;
  onView:   (r: RegistreSecuriteRecord) => void;
  onEdit:   (r: RegistreSecuriteRecord) => void;
  onDelete: (r: RegistreSecuriteRecord) => void;
  onNew:    () => void;
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function RegistreSecuriteTable({ registres, erps, loading, onView, onEdit, onDelete, onNew }: Props) {
  const [search, setSearch] = useState('');
  const [filterErp,     setFilterErp]     = useState('');
  const [filterCateg,   setFilterCateg]   = useState('');
  const [filterStatut,  setFilterStatut]  = useState('');
  const [filterAnnee,   setFilterAnnee]   = useState('');
  const [minCompletude, setMinCompletude] = useState(0);
  const [showFilters,   setShowFilters]   = useState(false);
  const [sort, setSort] = useState<{ col: string; asc: boolean }>({ col: 'annee', asc: false });

  const handleSort = (col: string) => setSort(s => ({ col, asc: s.col === col ? !s.asc : true }));

  const erpOptions = useMemo(() => [...new Map(erps.map(e => [e.id, e])).values()], [erps]);
  const annees = useMemo(() => [...new Set(registres.map(r => r.annee))].sort((a, b) => b - a), [registres]);

  const categErpOptions = useMemo(() =>
    [...new Set(erps.map(e => e.categorie_erp))].sort(), [erps]);

  const filtered = useMemo(() => {
    let list = [...registres];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.reference.toLowerCase().includes(q) ||
        (r.erp?.nom ?? '').toLowerCase().includes(q) ||
        (r.responsable_registre ?? '').toLowerCase().includes(q)
      );
    }
    if (filterErp)    list = list.filter(r => r.erp_id === filterErp);
    if (filterStatut) list = list.filter(r => r.statut === filterStatut);
    if (filterAnnee)  list = list.filter(r => r.annee === parseInt(filterAnnee));
    if (filterCateg)  list = list.filter(r => erps.find(e => e.id === r.erp_id)?.categorie_erp === filterCateg);
    if (minCompletude > 0) list = list.filter(r => r.completude_pct >= minCompletude);
    list.sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sort.col === 'annee') { va = a.annee; vb = b.annee; }
      else if (sort.col === 'reference') { va = a.reference; vb = b.reference; }
      else if (sort.col === 'erp') { va = a.erp?.nom ?? ''; vb = b.erp?.nom ?? ''; }
      else if (sort.col === 'completude') { va = a.completude_pct; vb = b.completude_pct; }
      else if (sort.col === 'statut') { va = a.statut; vb = b.statut; }
      if (va < vb) return sort.asc ? -1 : 1;
      if (va > vb) return sort.asc ? 1 : -1;
      return 0;
    });
    return list;
  }, [registres, erps, search, filterErp, filterStatut, filterAnnee, filterCateg, minCompletude, sort]);

  const nbTotal = registres.length;
  const nbValides = registres.filter(r => r.statut === 'valide').length;
  const nbBrouillons = registres.filter(r => r.statut === 'brouillon' || r.statut === 'en_cours').length;
  const avgCompletude = nbTotal > 0 ? Math.round(registres.reduce((s, r) => s + r.completude_pct, 0) / nbTotal) : 0;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* KPI strip */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-700">{nbTotal}</span>
          <span className="text-slate-400">registre{nbTotal !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-bold text-emerald-700">{nbValides}</span>
          <span className="text-slate-400">validé{nbValides !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-amber-700">{nbBrouillons}</span>
          <span className="text-slate-400">en cours</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-700">{avgCompletude}%</span>
          <span className="text-slate-400">complétude moy.</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un registre…"
            className="w-full text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300" />
        </div>

        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-semibold
            ${showFilters ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          <Filter className="w-3 h-3" /> Filtres
          {(filterErp || filterStatut || filterAnnee || filterCateg || minCompletude > 0) && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">!</span>
          )}
        </button>

        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_REGISTRE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <div className="flex-1" />
        <button onClick={onNew}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-semibold flex-shrink-0">
          <Plus className="w-3.5 h-3.5" /> Nouveau registre
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex-shrink-0 flex-wrap">
          <select value={filterErp} onChange={e => setFilterErp(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Tous les ERP</option>
            {erpOptions.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
          <select value={filterCateg} onChange={e => setFilterCateg(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Toutes catégories</option>
            {categErpOptions.map(c => <option key={c} value={c}>{CATEGORIE_ERP_LABELS[c] ?? c}</option>)}
          </select>
          <select value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Toutes les années</option>
            {annees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500 whitespace-nowrap">Complétude min.</label>
            <input type="range" min={0} max={100} step={10} value={minCompletude}
              onChange={e => setMinCompletude(parseInt(e.target.value))}
              className="w-24 accent-emerald-600" />
            <span className="text-[11px] font-bold text-slate-600 w-8">{minCompletude}%</span>
          </div>
          <button onClick={() => { setFilterErp(''); setFilterCateg(''); setFilterAnnee(''); setMinCompletude(0); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline">Réinitialiser</button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-xs gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <AlertCircle className="w-8 h-8 opacity-30" />
            <p className="text-xs font-medium">Aucun registre trouvé</p>
            <button onClick={onNew} className="text-xs text-emerald-600 hover:underline font-semibold">
              Créer le premier registre
            </button>
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">
                  <SortBtn label="Référence" col="reference" sort={sort} onSort={handleSort} />
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">
                  <SortBtn label="ERP" col="erp" sort={sort} onSort={handleSort} />
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Catégorie</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">
                  <SortBtn label="Année" col="annee" sort={sort} onSort={handleSort} />
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Responsable</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">
                  <SortBtn label="Statut" col="statut" sort={sort} onSort={handleSort} />
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap w-36">
                  <SortBtn label="Complétude" col="completude" sort={sort} onSort={handleSort} />
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Signatures</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">Modifié</th>
                <th className="px-3 py-2.5 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => {
                const erpRecord = erps.find(e => e.id === r.erp_id);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-3 py-2.5">
                      <button onClick={() => onView(r)}
                        className="flex items-center gap-1.5 text-left group/ref">
                        <FileText className="w-3.5 h-3.5 text-slate-300 group-hover/ref:text-emerald-500 transition-colors flex-shrink-0" />
                        <span className="font-bold text-slate-700 group-hover/ref:text-emerald-700 transition-colors">{r.reference}</span>
                      </button>
                    </td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <p className="font-semibold text-slate-700 truncate">{r.erp?.nom ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-[11px] text-slate-500">
                      {erpRecord ? CATEGORIE_ERP_LABELS[erpRecord.categorie_erp]?.replace('ème catégorie', 'e').replace('ère catégorie', 'e') ?? erpRecord.categorie_erp : '—'}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-slate-600 whitespace-nowrap">{r.annee}</td>
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{r.responsable_registre ?? '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><StatutBadge statut={r.statut} /></td>
                    <td className="px-3 py-2.5 w-36"><ComplBar pct={r.completude_pct} /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><SigRow sigs={r.signatures} /></td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-400 whitespace-nowrap">{fmtDate(r.updated_at)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onView(r)} title="Consulter"
                          className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onEdit(r)} title="Modifier"
                          className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(r)} title="Archiver"
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(r)} title="Supprimer"
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-white flex-shrink-0">
          <p className="text-[11px] text-slate-400">
            {filtered.length === nbTotal ? `${nbTotal} registre${nbTotal !== 1 ? 's' : ''}` : `${filtered.length} / ${nbTotal} registres`}
          </p>
        </div>
      )}
    </div>
  );
}
