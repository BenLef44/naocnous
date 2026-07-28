import { useState, useMemo } from 'react';
import { Search, Plus, AlertTriangle, ChevronRight } from 'lucide-react';
import type { ActionCorrectiveERP } from './registreTypes';
import { STATUT_ACTION_CFG, PRIORITE_CFG, fmtDate } from './registreTypes';

interface Props {
  actions: ActionCorrectiveERP[];
  onAdd?: () => void;
}

export default function ActionsCorrectivesERP({ actions, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = actions;
    if (search) list = list.filter(a =>
      a.reference.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      (a.responsable ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatut)   list = list.filter(a => a.statut === filterStatut);
    if (filterPriorite) list = list.filter(a => a.priorite === Number(filterPriorite));
    return [...list].sort((a, b) => {
      // Sort: highest priority first, then by date_limite
      if (b.priorite !== a.priorite) return b.priorite - a.priorite;
      if (a.date_limite && b.date_limite) return a.date_limite.localeCompare(b.date_limite);
      return 0;
    });
  }, [actions, search, filterStatut, filterPriorite]);

  const nbOuvertes   = actions.filter(a => a.statut !== 'termine' && a.statut !== 'annule').length;
  const nbCritiques  = actions.filter(a => a.priorite >= 3 && a.statut !== 'termine').length;
  const nbEnRetard   = actions.filter(a => {
    if (!a.date_limite || a.statut === 'termine' || a.statut === 'annule') return false;
    return new Date(a.date_limite) < new Date();
  }).length;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">{filtered.length} action{filtered.length !== 1 ? 's' : ''}</span>
          {nbEnRetard > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertTriangle className="w-3 h-3" /> {nbEnRetard} en retard
            </span>
          )}
          {nbCritiques > 0 && (
            <span className="text-xs font-bold text-orange-600">{nbCritiques} haute priorité</span>
          )}
        </div>
        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 w-40" />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_ACTION_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterPriorite} onChange={e => setFilterPriorite(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITE_CFG).sort((a, b) => Number(b[0]) - Number(a[0])).map(([k, v]) =>
            <option key={k} value={k}>{'★'.repeat(v.stars)} {v.label}</option>
          )}
        </select>

        <button onClick={onAdd}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-semibold">
          <Plus className="w-3.5 h-3.5" /> Nouvelle action
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
            <tr>
              <th className="py-2.5 px-3 w-6" />
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Référence</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Origine</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsable</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date limite</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Statut</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Priorité</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ac => {
              const cfg = STATUT_ACTION_CFG[ac.statut] ?? STATUT_ACTION_CFG.ouvert;
              const prioCfg = PRIORITE_CFG[ac.priorite] ?? PRIORITE_CFG[2];
              const expanded = expandedId === ac.id;
              const enRetard = ac.date_limite && ac.statut !== 'termine' && ac.statut !== 'annule'
                && new Date(ac.date_limite) < new Date();
              const origine = ac.incident_id ? 'Incident' : ac.controle_id ? 'Contrôle' : 'Manuel';
              return (
                <>
                  <tr key={ac.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${enRetard ? 'bg-red-50/30' : ''}`}
                    onClick={() => setExpandedId(expanded ? null : ac.id)}>
                    <td className="py-2.5 px-3">
                      <ChevronRight className={`w-3 h-3 text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{ac.reference}</td>
                    <td className="py-2.5 px-3 max-w-52">
                      <p className="font-semibold text-slate-700 leading-tight line-clamp-2">{ac.description}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border
                        ${origine === 'Incident' ? 'bg-amber-50 text-amber-700 border-amber-200' : origine === 'Contrôle' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {origine}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{ac.responsable ?? '—'}</td>
                    <td className="py-2.5 px-3">
                      <p className={`font-medium ${enRetard ? 'text-red-600' : 'text-slate-600'}`}>
                        {fmtDate(ac.date_limite)}
                      </p>
                      {enRetard && (
                        <p className="text-[10px] font-bold text-red-500">
                          {Math.abs(Math.round((new Date(ac.date_limite!).getTime() - Date.now()) / 86400000))}j de retard
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-bold ${prioCfg.color}`}>
                        {'★'.repeat(prioCfg.stars)}{'☆'.repeat(4 - prioCfg.stars)}
                        <span className="ml-1 text-[10px] font-medium text-slate-500">{prioCfg.label}</span>
                      </span>
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${ac.id}-exp`} className="border-b border-slate-100 bg-slate-50/60">
                      <td colSpan={8} className="px-8 py-3">
                        <div className="grid grid-cols-3 gap-5 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description complète</p>
                            <p className="text-slate-600 leading-relaxed">{ac.description}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Commentaire</p>
                            <p className="text-slate-600">{ac.commentaire ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Liens</p>
                            <div className="space-y-1">
                              {ac.ot_gmao_ref && (
                                <p><span className="text-slate-400">OT GMAO : </span>
                                  <span className="font-mono font-bold text-blue-600">{ac.ot_gmao_ref}</span>
                                </p>
                              )}
                              {ac.incident_id && <p className="text-slate-500">Origine : Incident associé</p>}
                              {ac.controle_id && <p className="text-slate-500">Origine : Contrôle associé</p>}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {ac.statut === 'en_cours' && (
                                <button className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
                                  Marquer terminé
                                </button>
                              )}
                              {ac.statut === 'ouvert' && (
                                <button className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-semibold">
                                  Démarrer
                                </button>
                              )}
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
          <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
            Aucune action corrective
          </div>
        )}
      </div>
    </div>
  );
}
