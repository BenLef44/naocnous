import { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import type { IncidentERP } from './registreTypes';
import { STATUT_INCIDENT_CFG, TYPE_INCIDENT_LABELS, fmtDateTime, fmtDate } from './registreTypes';

interface Props {
  incidents: IncidentERP[];
  onAdd?: () => void;
}

export default function IncidentsERP({ incidents, onAdd }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = incidents;
    if (search) list = list.filter(i =>
      i.reference.toLowerCase().includes(search.toLowerCase()) ||
      (i.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (i.lieu ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterType)   list = list.filter(i => i.type_incident === filterType);
    if (filterStatut) list = list.filter(i => i.statut === filterStatut);
    return [...list].sort((a, b) => b.date_incident.localeCompare(a.date_incident));
  }, [incidents, search, filterType, filterStatut]);

  const nbOuverts = incidents.filter(i => i.statut !== 'cloture').length;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">{filtered.length} incident{filtered.length !== 1 ? 's' : ''}</span>
          {nbOuverts > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <AlertTriangle className="w-3 h-3" /> {nbOuverts} ouvert{nbOuverts > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 w-40" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Tous types</option>
          {Object.entries(TYPE_INCIDENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_INCIDENT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <button onClick={onAdd}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-semibold">
          <Plus className="w-3.5 h-3.5" /> Nouvel incident
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
            <tr>
              <th className="py-2.5 px-3 w-6" />
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Référence</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Type</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date / Heure</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Lieu</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Statut</th>
              <th className="text-left py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsable</th>
              <th className="text-center py-2.5 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Dégâts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inc => {
              const cfg = STATUT_INCIDENT_CFG[inc.statut] ?? STATUT_INCIDENT_CFG.ouvert;
              const typeCfg = TYPE_INCIDENT_LABELS[inc.type_incident];
              const expanded = expandedId === inc.id;
              return (
                <>
                  <tr key={inc.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${inc.statut === 'en_cours' ? 'bg-amber-50/20' : ''}`}
                    onClick={() => setExpandedId(expanded ? null : inc.id)}>
                    <td className="py-2.5 px-3">
                      <ChevronRight className={`w-3 h-3 text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{inc.reference}</td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base flex-shrink-0">{typeCfg?.icon ?? '📋'}</span>
                        <span className="font-medium text-slate-700">{typeCfg?.label ?? inc.type_incident}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{fmtDateTime(inc.date_incident)}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-40 truncate">{inc.lieu ?? '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{inc.responsable ?? '—'}</td>
                    <td className="py-2.5 px-3 text-center">
                      {inc.degats_materiels
                        ? <span className="text-xs font-bold text-red-600">Oui</span>
                        : <span className="text-[10px] text-slate-300">Non</span>}
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${inc.id}-exp`} className="border-b border-slate-100 bg-slate-50/60">
                      <td colSpan={8} className="px-8 py-4">
                        <div className="grid grid-cols-3 gap-5 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                            <p className="text-slate-600 leading-relaxed">{inc.description ?? '—'}</p>
                            {inc.degats_materiels && inc.degats_description && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-[10px] font-bold text-red-500 mb-0.5">Dégâts matériels</p>
                                <p className="text-red-700">{inc.degats_description}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Personnes impliquées</p>
                            <p className="text-slate-600">{inc.personnes_impliquees ?? '—'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-3">Actions immédiates</p>
                            <p className="text-slate-600">{inc.actions_immediates ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Détails</p>
                            <div className="space-y-1">
                              <p><span className="text-slate-400">Date : </span><span className="text-slate-600 font-medium">{fmtDateTime(inc.date_incident)}</span></p>
                              <p><span className="text-slate-400">Lieu : </span><span className="text-slate-600">{inc.lieu ?? '—'}</span></p>
                              <p><span className="text-slate-400">Responsable : </span><span className="text-slate-600">{inc.responsable ?? '—'}</span></p>
                              <p><span className="text-slate-400">Statut : </span>
                                <span className={`font-semibold ${cfg.text}`}>{cfg.label}</span>
                              </p>
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
            Aucun incident enregistré
          </div>
        )}
      </div>
    </div>
  );
}
