import { useState, useMemo } from 'react';
import { Search, Plus, AlertTriangle, Clock, CheckCircle2, Filter } from 'lucide-react';
import type { ControleERP } from './registreTypes';
import { STATUT_CONTROLE_CFG, fmtDate, getControleAlerte } from './registreTypes';

interface Props {
  controles: ControleERP[];
  onAdd?: () => void;
}

export default function ControlesERP({ controles, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPrestataire, setFilterPrestataire] = useState('');

  const categories = useMemo(() => [...new Set(controles.map(c => c.categorie))].sort(), [controles]);
  const prestataires = useMemo(() => [...new Set(controles.map(c => c.prestataire).filter(Boolean))].sort() as string[], [controles]);

  const filtered = useMemo(() => {
    let list = controles;
    if (search) list = list.filter(c =>
      c.type_controle.toLowerCase().includes(search.toLowerCase()) ||
      (c.prestataire ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterCategorie) list = list.filter(c => c.categorie === filterCategorie);
    if (filterStatut)    list = list.filter(c => c.statut === filterStatut);
    if (filterPrestataire) list = list.filter(c => c.prestataire === filterPrestataire);
    return [...list].sort((a, b) => {
      // Sort: retard first, then a_venir, then conforme
      const order = { en_retard: 0, non_realise: 1, non_conforme: 2, a_venir: 3, conforme: 4 };
      return (order[a.statut as keyof typeof order] ?? 5) - (order[b.statut as keyof typeof order] ?? 5);
    });
  }, [controles, search, filterCategorie, filterStatut, filterPrestataire]);

  const nbRetard = controles.filter(c => c.statut === 'en_retard' || c.statut === 'non_realise').length;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">{filtered.length} contrôle{filtered.length !== 1 ? 's' : ''}</span>
          {nbRetard > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertTriangle className="w-3 h-3" /> {nbRetard} en retard
            </span>
          )}
        </div>
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 w-40" />
        </div>

        {/* Filters */}
        <select value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_CONTROLE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterPrestataire} onChange={e => setFilterPrestataire(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Tous prestataires</option>
          {prestataires.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <button onClick={onAdd}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-semibold">
          <Plus className="w-3.5 h-3.5" /> Ajouter un contrôle
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[800px]">
          <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
            <tr>
              <th className="text-left py-2.5 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Type de contrôle</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Catégorie</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Périodicité</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Dernier contrôle</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Prochain contrôle</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Statut</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Prestataire</th>
              <th className="text-right py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Conformité</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const cfg = STATUT_CONTROLE_CFG[c.statut] ?? STATUT_CONTROLE_CFG.a_venir;
              const alerte = getControleAlerte(c);
              const diff = c.date_prochain_controle
                ? Math.round((new Date(c.date_prochain_controle).getTime() - Date.now()) / 86400000) : null;
              return (
                <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${alerte === 'retard' ? 'bg-red-50/30' : ''}`}>
                  <td className="py-2.5 px-4">
                    <p className="font-semibold text-slate-700">{c.type_controle}</p>
                    {c.commentaire && <p className="text-[10px] text-slate-400 truncate max-w-52">{c.commentaire}</p>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{c.categorie}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{c.periodicite}</td>
                  <td className="py-2.5 px-3 text-slate-600">{fmtDate(c.date_dernier_controle)}</td>
                  <td className="py-2.5 px-3">
                    <p className={`font-medium ${alerte === 'retard' ? 'text-red-600' : alerte === 'bientot' ? 'text-amber-600' : 'text-slate-600'}`}>
                      {fmtDate(c.date_prochain_controle)}
                    </p>
                    {diff !== null && diff < 30 && (
                      <p className={`text-[10px] font-bold ${diff < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {diff < 0 ? `${Math.abs(diff)}j de retard` : `dans ${diff}j`}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{c.prestataire ?? '—'}</td>
                  <td className="py-2.5 px-3 text-right">
                    {c.conformite_pct != null ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: `${c.conformite_pct}%`, background: c.conformite_pct >= 90 ? '#10b981' : c.conformite_pct >= 70 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className={`font-bold text-xs ${c.conformite_pct >= 90 ? 'text-emerald-600' : c.conformite_pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {c.conformite_pct}%
                        </span>
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
            Aucun contrôle ne correspond aux filtres
          </div>
        )}
      </div>
    </div>
  );
}
