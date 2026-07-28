import { useState } from 'react';
import {
  Plus, Trash2, Calendar, Users, Clock, CheckCircle2, XCircle,
  AlertTriangle, Activity,
} from 'lucide-react';
import type { ExerciceEvacuation } from './registreTypes';

interface Props {
  exercices: ExerciceEvacuation[];
  onChange: (e: ExerciceEvacuation[]) => void;
  nbIncidents: string;
  onNbIncidentsChange: (v: string) => void;
  observations: string;
  onObservationsChange: (v: string) => void;
}

const EXERCICE_TYPES = [
  { value: 'partiel',   label: 'Évacuation partielle' },
  { value: 'complet',   label: 'Évacuation complète' },
  { value: 'incendie',  label: 'Exercice incendie' },
  { value: 'intrusion', label: 'Exercice intrusion / lock-down' },
];

export default function SectionIncidents({
  exercices, onChange, nbIncidents, onNbIncidentsChange, observations, onObservationsChange,
}: Props) {
  const add = () => {
    const ex: ExerciceEvacuation = {
      id: `ex-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'complet',
      effectif_participants: null,
      duree_evacuation: null,
      observations: '',
      satisfaisant: true,
    };
    onChange([ex, ...exercices]);
  };

  const update = (id: string, field: keyof ExerciceEvacuation, value: string | number | boolean | null) => {
    onChange(exercices.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const remove = (id: string) => onChange(exercices.filter(e => e.id !== id));

  const totalParticipants = exercices.reduce((sum, e) => sum + (e.effectif_participants ?? 0), 0);
  const avgDuree = exercices.length > 0
    ? Math.round(exercices.reduce((sum, e) => sum + (e.duree_evacuation ?? 0), 0) / exercices.length)
    : 0;
  const satisfaisants = exercices.filter(e => e.satisfaisant).length;

  return (
    <div className="space-y-4">
      {/* Exercises stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-slate-700 tabular-nums">{exercices.length}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Exercices</p>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-blue-700 tabular-nums">{totalParticipants}</p>
          <p className="text-[10px] font-semibold text-blue-400 uppercase">Participants</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-amber-700 tabular-nums">{avgDuree}'</p>
          <p className="text-[10px] font-semibold text-amber-500 uppercase">Durée moy.</p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
          <p className="text-base font-bold text-emerald-700 tabular-nums">{satisfaisants}/{exercices.length}</p>
          <p className="text-[10px] font-semibold text-emerald-500 uppercase">Satisfaisants</p>
        </div>
      </div>

      {/* Add exercise button */}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
        <Plus className="w-3.5 h-3.5" /> Ajouter un exercice
      </button>

      {/* Exercise list */}
      {exercices.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-6 text-center">
          <Activity className="w-5 h-5 text-slate-300 mx-auto mb-1" />
          <p className="text-xs text-slate-400 font-medium">Aucun exercice enregistré</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exercices.map(ex => {
            const typeLabel = EXERCICE_TYPES.find(t => t.value === ex.type)?.label ?? ex.type;
            return (
              <div key={ex.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                {/* Row 1: date + type */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Date</label>
                    <input type="date" value={ex.date}
                      onChange={e => update(ex.id, 'date', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Type</label>
                    <select value={ex.type}
                      onChange={e => update(ex.id, 'type', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40">
                      {EXERCICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                {/* Row 2: participants + duration */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Participants</label>
                    <input type="number" value={ex.effectif_participants ?? ''}
                      onChange={e => update(ex.id, 'effectif_participants', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Durée évac. (min)</label>
                    <input type="number" value={ex.duree_evacuation ?? ''}
                      onChange={e => update(ex.id, 'duree_evacuation', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                  </div>
                </div>
                {/* Row 3: observations */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Observations</label>
                  <textarea value={ex.observations}
                    onChange={e => update(ex.id, 'observations', e.target.value)}
                    rows={2} placeholder="Observations sur le déroulement…"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none" />
                </div>
                {/* Row 4: satisfactory toggle + delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => update(ex.id, 'satisfaisant', !ex.satisfaisant)}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        ex.satisfaisant
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                      {ex.satisfaisant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {ex.satisfaisant ? 'Satisfaisant' : 'Non satisfaisant'}
                    </button>
                  </div>
                  <button type="button" onClick={() => remove(ex.id)}
                    className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 font-semibold">
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incidents count */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Incidents de l'année</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Nombre d'incidents déclarés</label>
            <input type="number" value={nbIncidents} onChange={e => onNbIncidentsChange(e.target.value)}
              placeholder="0"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Observations générales</label>
          <textarea value={observations} onChange={e => onObservationsChange(e.target.value)}
            rows={3} placeholder="Remarques sur les incidents, points d'attention, actions correctives…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none bg-white" />
        </div>
      </div>
    </div>
  );
}
