import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ControleWithMeta, STATUT_CONFIG, CATEGORIE_ICONS } from './types';
import { PointControle, ActionCorrective } from '../../types/patrimoine';
import { X, CheckCircle2, XCircle, Clock, Plus, Check, ChevronDown } from 'lucide-react';

interface Props {
  controle: ControleWithMeta;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ControleDetail({ controle, onClose, onUpdate }: Props) {
  const [points, setPoints] = useState<PointControle[]>([]);
  const [actions, setActions] = useState<ActionCorrective[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'points' | 'actions'>('info');
  const [addingPoint, setAddingPoint] = useState(false);
  const [newPoint, setNewPoint] = useState({ libelle: '', statut: 'conforme', observation: '' });

  useEffect(() => {
    supabase.from('points_controle').select('*').eq('controle_id', controle.id).then(({ data }) => setPoints(data || []));
    supabase.from('actions_correctives').select('*').eq('controle_id', controle.id).order('created_at').then(({ data }) => setActions(data || []));
  }, [controle.id]);

  const config = STATUT_CONFIG[controle.statut];

  const handleAddPoint = async () => {
    await supabase.from('points_controle').insert([{ controle_id: controle.id, ...newPoint }]);
    // Update counts
    const newConf = newPoint.statut === 'conforme' ? controle.nb_conformes + 1 : controle.nb_conformes;
    const newNonConf = newPoint.statut === 'non_conforme' ? controle.nb_non_conformes + 1 : controle.nb_non_conformes;
    await supabase.from('controles_reglementaires').update({ nb_conformes: newConf, nb_non_conformes: newNonConf }).eq('id', controle.id);
    setAddingPoint(false);
    setNewPoint({ libelle: '', statut: 'conforme', observation: '' });
    const { data } = await supabase.from('points_controle').select('*').eq('controle_id', controle.id);
    setPoints(data || []);
    onUpdate();
  };

  const handleActionStatus = async (id: string, statut: string) => {
    await supabase.from('actions_correctives').update({ statut, date_realisation: statut === 'terminee' ? new Date().toISOString().split('T')[0] : null }).eq('id', id);
    const { data } = await supabase.from('actions_correctives').select('*').eq('controle_id', controle.id);
    setActions(data || []);
  };

  const nonConformPoints = points.filter((p) => p.statut === 'non_conforme');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${config.bg} border-b ${config.border}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORIE_ICONS[controle.type_controle?.categorie || ''] || '📋'}</span>
              <div>
                <h2 className="font-semibold text-slate-800">{controle.type_controle?.nom}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[controle.site_nom, controle.batiment_nom].filter(Boolean).join(' › ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                {config.label}
              </span>
              <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {[
            { id: 'info', label: 'Informations' },
            { id: 'points', label: `Points (${points.length})` },
            { id: 'actions', label: `Actions (${actions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Organisme</div>
                  <div className="text-sm font-medium text-slate-700">{controle.organisme || '—'}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Périodicité</div>
                  <div className="text-sm font-medium text-slate-700">{controle.type_controle?.periodicite_label || '—'}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Dernier contrôle</div>
                  <div className="text-sm font-medium text-slate-700">
                    {controle.date_dernier_controle ? new Date(controle.date_dernier_controle).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Prochain contrôle</div>
                  <div className="text-sm font-medium text-slate-700">
                    {controle.date_prochain_controle ? new Date(controle.date_prochain_controle).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
              </div>
              {/* Points résumé */}
              <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="text-xl font-bold text-emerald-700">{controle.nb_conformes}</div>
                    <div className="text-xs text-emerald-600">Points conformes</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="text-xl font-bold text-red-700">{controle.nb_non_conformes}</div>
                    <div className="text-xs text-red-600">Non conformes</div>
                  </div>
                </div>
              </div>
              {controle.observations && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                  <span className="font-medium">Observations : </span>{controle.observations}
                </div>
              )}
              {controle.type_controle?.reference_reglementaire && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                  <span className="font-medium">Référence réglementaire : </span>{controle.type_controle.reference_reglementaire}
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {points.length === 0 && !addingPoint && (
                  <div className="text-center py-8 text-slate-400 text-sm">Aucun point de contrôle enregistré</div>
                )}
                {points.map((p) => (
                  <div key={p.id} className={`flex items-start gap-3 p-3 rounded-xl border ${p.statut === 'conforme' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    {p.statut === 'conforme'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{p.libelle}</p>
                      {p.observation && <p className="text-xs text-slate-500 mt-0.5 italic">{p.observation}</p>}
                    </div>
                  </div>
                ))}
                {addingPoint && (
                  <div className="p-3 border border-blue-200 bg-blue-50 rounded-xl space-y-2">
                    <input
                      value={newPoint.libelle}
                      onChange={(e) => setNewPoint({ ...newPoint, libelle: e.target.value })}
                      placeholder="Libellé du point de contrôle"
                      className="w-full text-sm px-3 py-1.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newPoint.statut}
                        onChange={(e) => setNewPoint({ ...newPoint, statut: e.target.value })}
                        className="text-sm border border-blue-200 rounded-lg px-2 py-1.5 flex-1 bg-white"
                      >
                        <option value="conforme">Conforme</option>
                        <option value="non_conforme">Non conforme</option>
                      </select>
                      <button onClick={handleAddPoint} disabled={!newPoint.libelle} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setAddingPoint(false)} className="px-3 py-1.5 hover:bg-slate-200 rounded-lg">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                    {newPoint.statut === 'non_conforme' && (
                      <input
                        value={newPoint.observation}
                        onChange={(e) => setNewPoint({ ...newPoint, observation: e.target.value })}
                        placeholder="Observation (optionnel)"
                        className="w-full text-sm px-3 py-1.5 border border-blue-200 rounded-lg focus:outline-none"
                      />
                    )}
                  </div>
                )}
              </div>
              {!addingPoint && (
                <button onClick={() => setAddingPoint(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Plus className="w-4 h-4" /> Ajouter un point
                </button>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="p-4 space-y-2">
              {actions.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {nonConformPoints.length === 0 ? 'Aucun point non conforme → pas d\'action requise' : 'Aucune action corrective enregistrée'}
                </div>
              )}
              {actions.map((a) => (
                <div key={a.id} className={`p-3 rounded-xl border ${a.statut === 'terminee' ? 'bg-emerald-50 border-emerald-100' : a.statut === 'planifiee' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">{a.description}</p>
                    <select
                      value={a.statut}
                      onChange={(e) => handleActionStatus(a.id, e.target.value)}
                      className={`text-xs border rounded-lg px-2 py-1 flex-shrink-0 focus:outline-none ${a.statut === 'terminee' ? 'border-emerald-200 bg-white' : a.statut === 'planifiee' ? 'border-blue-200 bg-white' : 'border-amber-200 bg-white'}`}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="planifiee">Planifiée</option>
                      <option value="terminee">Terminée</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    {a.responsable && <span>👤 {a.responsable}</span>}
                    {a.date_echeance && (
                      <span className={`flex items-center gap-1 ${new Date(a.date_echeance) < new Date() && a.statut !== 'terminee' ? 'text-red-600 font-medium' : ''}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(a.date_echeance).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {a.date_realisation && <span className="text-emerald-600">✓ {new Date(a.date_realisation).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
