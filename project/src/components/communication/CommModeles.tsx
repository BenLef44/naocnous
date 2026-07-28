import { useState, useMemo } from 'react';
import {
  MessageSquare, Plus, Search, Mail, Bell, Smartphone, Check, X,
  ChevronRight, ToggleLeft, ToggleRight, Eye, Send, Pencil,
} from 'lucide-react';
import { MOCK_MODELES } from './commData';
import type { ModeleComm, Canal } from './commTypes';
import { MODULE_LABELS, CANAL_LABELS, STATUT_COLORS } from './commTypes';
import CommModeleDetail from './CommModeleDetail';

const CANAL_COLORS: Record<Canal, string> = {
  email:       'bg-blue-100 text-blue-700',
  notif:       'bg-amber-100 text-amber-700',
  email_notif: 'bg-violet-100 text-violet-700',
  sms:         'bg-teal-100 text-teal-700',
};

const CANAL_ICONS: Record<Canal, React.ElementType> = {
  email: Mail, notif: Bell, email_notif: Bell, sms: Smartphone,
};

export default function CommModeles() {
  const [items,    setItems]    = useState<ModeleComm[]>(MOCK_MODELES);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<string>('all');
  const [selected, setSelected] = useState<ModeleComm | null>(null);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter !== 'all') list = list.filter(m => m.module === filter || m.type === filter || (filter === 'actif' ? m.actif : !m.actif));
    if (search) list = list.filter(m => m.nom.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [items, filter, search]);

  const toggle = (id: string) => setItems(prev => prev.map(m => m.id === id ? { ...m, actif: !m.actif } : m));

  if (selected) {
    return <CommModeleDetail modele={selected} onBack={() => setSelected(null)} onSave={updated => { setItems(prev => prev.map(m => m.id === updated.id ? updated : m)); setSelected(updated); }} />;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Modèles de communication</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{items.length} modèles</span>
          </div>
          <p className="text-xs text-slate-400">Créez et gérez vos modèles d'emails et notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-44" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nouveau modèle
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-6 py-2 border-b border-slate-50 flex items-center gap-1.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        {['all', 'actif', 'email', 'notif', 'email_notif'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1 text-[11px] font-semibold rounded-full border transition-colors ${filter === f ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}>
            {f === 'all' ? 'Tous' : f === 'actif' ? 'Actifs' : CANAL_LABELS[f as Canal]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-100">
              {['Modèle','Module','Événement','Canal','Envois','Ouverture','Actif',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const Icon = CANAL_ICONS[m.type];
              return (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/60 group cursor-pointer" onClick={() => setSelected(m)}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{m.nom}</p>
                    {m.dernierEnvoi && <p className="text-[10px] text-slate-400 mt-0.5">Dernier envoi : {m.dernierEnvoi}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{MODULE_LABELS[m.module]}</td>
                  <td className="px-4 py-3 text-slate-500">{m.evenement}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CANAL_COLORS[m.type]}`}>
                      <Icon className="w-2.5 h-2.5" />{CANAL_LABELS[m.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">{m.nbEnvois.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {m.nbEnvois > 0 ? (
                      <span className={`font-bold ${m.tauxOuverture >= 90 ? 'text-emerald-600' : m.tauxOuverture >= 70 ? 'text-amber-600' : 'text-red-500'}`}>{m.tauxOuverture}%</span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={e => { e.stopPropagation(); toggle(m.id); }}
                      className={`w-9 h-5 rounded-full transition-colors relative ${m.actif ? 'bg-blue-500' : 'bg-slate-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${m.actif ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); setSelected(m); }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-blue-600 text-[11px] font-semibold transition-opacity">
                      <Pencil className="w-3 h-3" /> Éditer
                    </button>
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
