import { useState, useEffect } from 'react';
import { Plus, X, Loader2, MapPin, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ConfigPerimetre } from './configTypes';
import { PERIMETRE_TYPES } from './configTypes';

const TYPE_COLORS: Record<string, string> = {
  CROUS:      'bg-blue-100 text-blue-700 border-blue-200',
  Campus:     'bg-violet-100 text-violet-700 border-violet-200',
  Résidence:  'bg-teal-100 text-teal-700 border-teal-200',
  Bâtiment:   'bg-amber-100 text-amber-700 border-amber-200',
  Service:    'bg-orange-100 text-orange-700 border-orange-200',
  Patrimoine: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function ConfigPerimetres() {
  const [perimetres, setPerimetres] = useState<ConfigPerimetre[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(PERIMETRE_TYPES));
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('config_perimetres').select('*').order('type').order('nom');
    if (data) setPerimetres(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggleType(type: string) {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  async function toggleActif(p: ConfigPerimetre) {
    await supabase.from('config_perimetres').update({ actif: !p.actif }).eq('id', p.id);
    load();
  }

  const byType = PERIMETRE_TYPES.reduce((acc, type) => {
    acc[type] = perimetres.filter(p => p.type === type);
    return acc;
  }, {} as Record<string, ConfigPerimetre[]>);

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">Définissez les périmètres pour limiter les données visibles par utilisateur.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouveau périmètre
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
        <p className="font-semibold mb-1">Fonctionnement des périmètres</p>
        <p>Un utilisateur assigné à un périmètre ne voit que les données (équipements, interventions, contrôles) appartenant à ce périmètre.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
      ) : (
        <div className="space-y-3">
          {PERIMETRE_TYPES.map(type => {
            const items = byType[type] ?? [];
            const expanded = expandedTypes.has(type);
            return (
              <div key={type} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {type}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{type}</span>
                  <span className="ml-auto text-xs text-slate-400">{items.length} entrée{items.length > 1 ? 's' : ''}</span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-50">
                    {items.length === 0 ? (
                      <p className="text-xs text-slate-400 px-4 py-3 italic">Aucun périmètre de ce type.</p>
                    ) : (
                      items.map(p => (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 group">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800">{p.nom}</p>
                            {p.description && <p className="text-[10px] text-slate-400">{p.description}</p>}
                          </div>
                          <button
                            onClick={() => toggleActif(p)}
                            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                              p.actif
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                            }`}
                          >
                            {p.actif ? <><Check className="w-2.5 h-2.5" />Actif</> : <>Inactif</>}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <NouveauPerimetreModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  );
}

function NouveauPerimetreModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ type: 'Campus', nom: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.nom.trim()) return;
    setSaving(true);
    await supabase.from('config_perimetres').insert(form);
    await supabase.from('config_journal').insert({ type_action: 'Création', objet_type: 'Périmètre', objet_nom: form.nom, details: `Type : ${form.type}` });
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Nouveau périmètre</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
              {PERIMETRE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nom *</label>
            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex : Campus Berges du Rhône"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={submit} disabled={!form.nom || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
