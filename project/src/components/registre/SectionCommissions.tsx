import { useState } from 'react';
import {
  Plus, Trash2, Calendar, FileText, CheckCircle2, AlertTriangle,
  Users, ClipboardList, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { CommissionERP } from './registreTypes';

interface Props {
  commissions: CommissionERP[];
  onChange: (c: CommissionERP[]) => void;
}

const COMMISSION_TYPES = [
  'Visite de réception',
  'Visite périodique',
  'Visite inopinée',
  'Visite de contrôle',
  'Réunion de coordination',
];

export default function SectionCommissions({ commissions, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const c: CommissionERP = {
      id: `comm-${Date.now()}`,
      date_visite: new Date().toISOString().split('T')[0],
      type: COMMISSION_TYPES[1],
      prescriptions: '',
      reserves: '',
      levee_reserves: '',
      rapport_url: null,
    };
    onChange([c, ...commissions]);
    setExpanded(c.id);
  };

  const update = (id: string, field: keyof CommissionERP, value: string) => {
    onChange(commissions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const remove = (id: string) => {
    onChange(commissions.filter(c => c.id !== id));
  };

  const stats = {
    total: commissions.length,
    pendingReserves: commissions.filter(c => c.reserves && !c.levee_reserves).length,
    liftedReserves: commissions.filter(c => c.reserves && c.levee_reserves).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-slate-700 tabular-nums">{stats.total}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Visites</p>
        </div>
        <div className="rounded-lg bg-orange-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-orange-700 tabular-nums">{stats.pendingReserves}</p>
          <p className="text-[10px] font-semibold text-orange-500 uppercase">Réserves en cours</p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-emerald-700 tabular-nums">{stats.liftedReserves}</p>
          <p className="text-[10px] font-semibold text-emerald-500 uppercase">Réserves levées</p>
        </div>
      </div>

      {/* Add button */}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
        <Plus className="w-3.5 h-3.5" /> Ajouter une visite de commission
      </button>

      {/* Commission cards */}
      {commissions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
          <Users className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Aucune visite de commission enregistrée</p>
          <p className="text-[10px] text-slate-300 mt-0.5">Ajoutez les visites, prescriptions et réserves</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commissions.map(comm => {
            const isOpen = expanded === comm.id;
            const hasReserves = !!comm.reserves;
            const hasLevee = !!comm.levee_reserves;
            return (
              <div key={comm.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {/* Header row */}
                <button type="button" onClick={() => setExpanded(isOpen ? null : comm.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{comm.type}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(comm.date_visite).toLocaleDateString('fr-FR')}
                      {hasReserves && (
                        <span className={`ml-2 inline-flex items-center gap-1 ${hasLevee ? 'text-emerald-600' : 'text-orange-600'}`}>
                          {hasLevee ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                          {hasLevee ? 'Réserves levées' : 'Réserves en cours'}
                        </span>
                      )}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Date</label>
                        <input type="date" value={comm.date_visite}
                          onChange={e => update(comm.id, 'date_visite', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Type</label>
                        <select value={comm.type}
                          onChange={e => update(comm.id, 'type', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                          {COMMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1 flex items-center gap-1">
                        <ClipboardList className="w-2.5 h-2.5" /> Prescriptions
                      </label>
                      <textarea value={comm.prescriptions}
                        onChange={e => update(comm.id, 'prescriptions', e.target.value)}
                        rows={2} placeholder="Prescriptions de la commission…"
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Réserves
                      </label>
                      <textarea value={comm.reserves}
                        onChange={e => update(comm.id, 'reserves', e.target.value)}
                        rows={2} placeholder="Réserves émises…"
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none" />
                    </div>
                    {comm.reserves && (
                      <div>
                        <label className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide block mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Levée des réserves
                        </label>
                        <textarea value={comm.levee_reserves}
                          onChange={e => update(comm.id, 'levee_reserves', e.target.value)}
                          rows={2} placeholder="Décrire les actions menées pour lever les réserves…"
                          className="w-full border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none bg-emerald-50/30" />
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Rapport / référence GED
                      </label>
                      <input value={comm.rapport_url ?? ''}
                        onChange={e => update(comm.id, 'rapport_url', e.target.value)}
                        placeholder="URL ou référence GED du rapport"
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
                    </div>
                    <button type="button" onClick={() => remove(comm.id)}
                      className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 font-semibold">
                      <Trash2 className="w-3 h-3" /> Supprimer cette visite
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
