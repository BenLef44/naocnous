import { useState, useMemo } from 'react';
import { History, Search, Filter, Mail, Bell, Smartphone } from 'lucide-react';
import { MOCK_HISTORIQUE } from './commData';
import type { Canal, ModuleSource } from './commTypes';
import { MODULE_LABELS, CANAL_LABELS, STATUT_COLORS } from './commTypes';

const CANAL_ICONS: Record<Canal, React.ElementType> = {
  email: Mail, notif: Bell, email_notif: Bell, sms: Smartphone,
};

export default function CommHistorique() {
  const [search, setSearch] = useState('');
  const [modFilter, setModFilter] = useState<string>('all');
  const [statFilter, setStatFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let list = [...MOCK_HISTORIQUE];
    if (modFilter !== 'all')  list = list.filter(h => h.module === modFilter);
    if (statFilter !== 'all') list = list.filter(h => h.statut === statFilter);
    if (search) list = list.filter(h => h.objet.toLowerCase().includes(search.toLowerCase()) || h.destinataire.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [search, modFilter, statFilter]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Historique & traçabilité</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{filtered.length} envois</span>
          </div>
          <p className="text-xs text-slate-400">Traçabilité complète de toutes les communications</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-44" />
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-2 border-b border-slate-50 flex items-center gap-3 flex-shrink-0">
        <select value={modFilter} onChange={e => setModFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
          <option value="all">Tous modules</option>
          {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
          <option value="all">Tous statuts</option>
          {['envoyee','distribuee','lue','erreur'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-100">
              {['Date','Canal','Destinataire','Modèle utilisé','Objet','Module','Statut'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => {
              const Icon = CANAL_ICONS[h.canal];
              const sc   = STATUT_COLORS[h.statut];
              return (
                <tr key={h.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{h.date}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />{CANAL_LABELS[h.canal]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{h.destinataire}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{h.modele}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{h.objet}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{MODULE_LABELS[h.module]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {h.statut.charAt(0).toUpperCase() + h.statut.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
