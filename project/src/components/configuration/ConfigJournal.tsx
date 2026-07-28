import { useState, useEffect } from 'react';
import { BookOpen, Filter, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ConfigJournalEntry } from './configTypes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_COLORS: Record<string, string> = {
  Création:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Modification: 'bg-blue-50 text-blue-700 border-blue-200',
  Suppression:  'bg-red-50 text-red-700 border-red-200',
  Partage:      'bg-violet-50 text-violet-700 border-violet-200',
};

const OBJET_COLORS: Record<string, string> = {
  Profil:       'text-slate-700',
  Utilisateur:  'text-blue-700',
  Dashboard:    'text-violet-700',
  Périmètre:    'text-teal-700',
  Permission:   'text-amber-700',
};

export default function ConfigJournal() {
  const [entries, setEntries] = useState<ConfigJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterObjet, setFilterObjet] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('config_journal')
      .select('*')
      .order('date_action', { ascending: false })
      .limit(200);
    if (data) setEntries(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e => {
    const matchType  = !filterType  || e.type_action === filterType;
    const matchObjet = !filterObjet || e.objet_type  === filterObjet;
    return matchType && matchObjet;
  });

  const types  = [...new Set(entries.map(e => e.type_action))];
  const objets = [...new Set(entries.map(e => e.objet_type))];

  function fmtDate(d: string) {
    try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: fr }); }
    catch { return d; }
  }

  return (
    <div className="p-6 space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300">
          <option value="">Toutes les actions</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterObjet} onChange={e => setFilterObjet(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300">
          <option value="">Tous les objets</option>
          {objets.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <button onClick={load} disabled={loading}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 ml-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: entries.length, color: 'text-slate-700' },
          { label: 'Créations', value: entries.filter(e => e.type_action === 'Création').length, color: 'text-emerald-600' },
          { label: 'Modifications', value: entries.filter(e => e.type_action === 'Modification').length, color: 'text-blue-600' },
          { label: 'Suppressions', value: entries.filter(e => e.type_action === 'Suppression').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3">
            <p className="text-[10px] text-slate-400">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500 whitespace-nowrap">Date</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Utilisateur</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Action</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Objet</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[10px]">{fmtDate(e.date_action)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                        {e.utilisateur_nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                      <span className="font-medium text-slate-700">{e.utilisateur_nom}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${TYPE_COLORS[e.type_action] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {e.type_action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${OBJET_COLORS[e.objet_type] ?? 'text-slate-500'}`}>{e.objet_type}</span>
                      <p className="font-medium text-slate-800 mt-0.5">{e.objet_nom}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-48 truncate">{e.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucune entrée dans le journal</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
