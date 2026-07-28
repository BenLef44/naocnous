import { useState, useMemo } from 'react';
import { Bell, Mail, Smartphone, Check, CheckCheck, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from './commData';
import type { Notification, Canal, ModuleSource } from './commTypes';
import { CANAL_LABELS, MODULE_LABELS, STATUT_COLORS } from './commTypes';

const CANAL_ICONS: Record<Canal, React.ElementType> = {
  email:       Mail,
  notif:       Bell,
  email_notif: Bell,
  sms:         Smartphone,
};

const FILTERS = [
  { id: 'all',              label: 'Toutes'          },
  { id: 'unread',           label: 'Non lues'        },
  { id: 'today',            label: "Aujourd'hui"     },
  { id: 'week',             label: 'Cette semaine'   },
  { id: 'interventions',    label: 'Interventions'   },
  { id: 'maintenance',      label: 'Maintenance'     },
  { id: 'contrats',         label: 'Contrats'        },
  { id: 'reglementaire',    label: 'Réglementaire'   },
  { id: 'approvisionnements', label: 'Appros'        },
];

export default function CommNotifications() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [items,  setItems]  = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === 'unread')          list = list.filter(n => !n.lu);
    else if (filter === 'today')      list = list.filter(n => n.date.startsWith('2026-06-07'));
    else if (filter === 'week')       list = list.filter(n => n.date >= '2026-06-01');
    else if (filter !== 'all')        list = list.filter(n => n.module === filter);
    if (search) list = list.filter(n => n.objet.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [items, filter, search]);

  const markRead  = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, lu: true,  statut: 'lue'     } : n));
  const markUnread = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, lu: false, statut: 'envoyee' } : n));
  const remove    = (id: string) => setItems(prev => prev.filter(n => n.id !== id));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, lu: true, statut: 'lue' as const })));

  const unreadCount = items.filter(n => !n.lu).length;

  const selectedItem = items.find(n => n.id === selected);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Centre de notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount} non lues</span>
            )}
          </div>
          <p className="text-xs text-slate-400">Toutes les communications de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-44" />
          </div>
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Tout marquer lu
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-6 py-2 border-b border-slate-50 flex items-center gap-1.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-3 py-1 text-[11px] font-semibold rounded-full border transition-colors ${filter === f.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* List */}
        <div className={`${selected ? 'w-1/2' : 'flex-1'} border-r border-slate-100 overflow-y-auto transition-all`} style={{ scrollbarWidth: 'thin' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Bell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(n => {
                const Icon = CANAL_ICONS[n.canal];
                const sc   = STATUT_COLORS[n.statut];
                const isSelected = selected === n.id;
                return (
                  <div key={n.id}
                    onClick={() => { setSelected(isSelected ? null : n.id); if (!n.lu) markRead(n.id); }}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50' : n.lu ? 'hover:bg-slate-50' : 'bg-amber-50/40 hover:bg-amber-50/80'}`}>
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${n.lu ? 'bg-slate-100' : 'bg-blue-100'}`}>
                        <Icon className={`w-3.5 h-3.5 ${n.lu ? 'text-slate-400' : 'text-blue-600'}`} />
                      </div>
                      {!n.lu && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{n.type}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{CANAL_LABELS[n.canal]}</span>
                      </div>
                      <p className={`text-xs truncate ${n.lu ? 'text-slate-600' : 'text-slate-800 font-semibold'}`}>{n.objet}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.destinataire} · {n.date}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); n.lu ? markUnread(n.id) : markRead(n.id); }}
                        title={n.lu ? 'Marquer non lu' : 'Marquer lu'}
                        className="p-1 hover:bg-white rounded-lg transition-colors">
                        {n.lu ? <Bell className="w-3 h-3 text-slate-400" /> : <Check className="w-3 h-3 text-blue-500" />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); remove(n.id); }}
                        className="p-1 hover:bg-white rounded-lg transition-colors">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail pane */}
        {selectedItem && (
          <div className="w-1/2 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedItem.type}</span>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">{selectedItem.objet}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-100 rounded-lg flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Date',         value: selectedItem.date },
                { label: 'Module',       value: MODULE_LABELS[selectedItem.module] },
                { label: 'Canal',        value: CANAL_LABELS[selectedItem.canal]   },
                { label: 'Destinataire', value: selectedItem.destinataire           },
                { label: 'Statut',       value: selectedItem.statut.charAt(0).toUpperCase() + selectedItem.statut.slice(1) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-slate-800 font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Ouvrir l'objet
              </button>
              <button onClick={() => { selectedItem.lu ? markUnread(selectedItem.id) : markRead(selectedItem.id); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                <Check className="w-3.5 h-3.5" /> {selectedItem.lu ? 'Marquer non lu' : 'Marquer lu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
