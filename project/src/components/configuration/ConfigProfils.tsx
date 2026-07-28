import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, ChevronRight, Check, X, Save, Loader2, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ConfigProfil, ConfigProfilModule } from './configTypes';
import { ALL_MODULES, PERMISSION_ACTIONS, DASHBOARD_OPTIONS } from './configTypes';

type DetailTab = 'infos' | 'modules' | 'permissions' | 'dashboard';

const MODULE_GROUPES = [...new Set(ALL_MODULES.map(m => m.groupe))];

function ProfilBadge({ profil }: { profil: ConfigProfil }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
        {(profil.emoji ?? '?')}
      </span>
      <span className="text-sm font-medium text-slate-800">{profil.nom}</span>
    </div>
  );
}

export default function ConfigProfils() {
  const [profils, setProfils] = useState<ConfigProfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ConfigProfil | null>(null);
  const [tab, setTab] = useState<DetailTab>('infos');
  const [modules, setModules] = useState<ConfigProfilModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('config_profils').select('*').order('nom');
    if (data) {
      const withCounts = await Promise.all(data.map(async (p) => {
        const { count } = await supabase.from('config_utilisateurs').select('*', { count: 'exact', head: true }).eq('profil_id', p.id);
        return { ...p, _nb_utilisateurs: count ?? 0 };
      }));
      setProfils(withCounts);
    }
    setLoading(false);
  }

  async function loadModules(profilId: string) {
    setLoadingModules(true);
    const { data } = await supabase.from('config_profil_modules').select('*').eq('profil_id', profilId);
    setModules(data ?? []);
    setLoadingModules(false);
  }

  useEffect(() => { load(); }, []);

  function handleSelect(p: ConfigProfil) {
    setSelected(p);
    setTab('infos');
    loadModules(p.id);
  }

  function getModule(moduleId: string) {
    return modules.find(m => m.module_id === moduleId);
  }

  function hasModule(moduleId: string) {
    return !!getModule(moduleId);
  }

  async function toggleModule(moduleId: string) {
    if (!selected) return;
    if (hasModule(moduleId)) {
      await supabase.from('config_profil_modules').delete().eq('profil_id', selected.id).eq('module_id', moduleId);
    } else {
      await supabase.from('config_profil_modules').insert({ profil_id: selected.id, module_id: moduleId, peut_voir: true });
    }
    await logAction('Modification', 'Profil', selected.nom, `Module ${moduleId} ${hasModule(moduleId) ? 'retiré' : 'ajouté'}`);
    loadModules(selected.id);
  }

  async function togglePermission(moduleId: string, perm: string, current: boolean) {
    if (!selected) return;
    const mod = getModule(moduleId);
    if (!mod) return;
    await supabase.from('config_profil_modules').update({ [perm]: !current }).eq('id', mod.id);
    loadModules(selected.id);
  }

  async function saveProfil(updates: Partial<ConfigProfil>) {
    if (!selected) return;
    setSaving(true);
    await supabase.from('config_profils').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', selected.id);
    await logAction('Modification', 'Profil', selected.nom, JSON.stringify(updates));
    await load();
    setSaving(false);
  }

  async function deleteProfil(p: ConfigProfil) {
    if (!window.confirm(`Supprimer le profil "${p.nom}" ?`)) return;
    await supabase.from('config_profils').delete().eq('id', p.id);
    await logAction('Suppression', 'Profil', p.nom, null);
    if (selected?.id === p.id) setSelected(null);
    load();
  }

  async function logAction(type: string, objetType: string, objetNom: string, details: string | null) {
    await supabase.from('config_journal').insert({ type_action: type, objet_type: objetType, objet_nom: objetNom, details });
  }

  const filtered = profils.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'infos',       label: 'Informations générales' },
    { id: 'modules',     label: 'Modules accessibles' },
    { id: 'permissions', label: 'Actions autorisées' },
    { id: 'dashboard',   label: 'Dashboard par défaut' },
  ];

  return (
    <div className="flex h-full overflow-hidden">

      {/* List */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-slate-100 bg-white overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un profil..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
            title="Nouveau profil"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`w-full text-left px-3 py-3 border-b border-slate-50 flex items-center gap-3 group transition-colors ${
                  selected?.id === p.id ? 'bg-slate-50 border-l-2 border-l-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  {(p.emoji ?? '?')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{p.nom}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p._nb_utilisateurs} utilisateur{(p._nb_utilisateurs ?? 0) > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.actif ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Profile header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-base font-bold text-slate-600">
              {selected.emoji ?? '?'}
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">{selected.nom}</p>
              <p className="text-xs text-slate-400">{selected.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${
                selected.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selected.actif ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                {selected.actif ? 'Actif' : 'Inactif'}
              </span>
              <button
                onClick={() => deleteProfil(selected)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-100 px-6 flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Tab 1 — Informations */}
            {tab === 'infos' && (
              <InfosTab profil={selected} onSave={saveProfil} saving={saving} />
            )}

            {/* Tab 2 — Modules */}
            {tab === 'modules' && (
              <div className="space-y-6">
                {loadingModules ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                ) : (
                  MODULE_GROUPES.map(groupe => (
                    <div key={groupe}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{groupe}</p>
                      <div className="space-y-1">
                        {ALL_MODULES.filter(m => m.groupe === groupe).map(mod => {
                          const active = hasModule(mod.id);
                          return (
                            <button
                              key={mod.id}
                              onClick={() => toggleModule(mod.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left ${
                                active ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                active ? 'bg-slate-800 border-slate-800' : 'border-slate-300 bg-white'
                              }`}>
                                {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                              </span>
                              <span className={`text-sm ${active ? 'font-medium text-slate-800' : 'text-slate-500'}`}>{mod.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3 — Permissions */}
            {tab === 'permissions' && (
              <div>
                {loadingModules ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 pr-4 font-semibold text-slate-500 w-40">Module</th>
                          {PERMISSION_ACTIONS.map(a => (
                            <th key={a.key} className="text-center py-2 px-2 font-semibold text-slate-500 w-20">{a.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_MODULES.map(mod => {
                          const modPerm = getModule(mod.id);
                          if (!modPerm) return null;
                          return (
                            <tr key={mod.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                              <td className="py-2 pr-4 font-medium text-slate-700">{mod.label}</td>
                              {PERMISSION_ACTIONS.map(a => {
                                const val = modPerm[a.key as keyof ConfigProfilModule] as boolean;
                                return (
                                  <td key={a.key} className="py-2 px-2 text-center">
                                    <button
                                      onClick={() => togglePermission(mod.id, a.key, val)}
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                                        val ? 'bg-slate-800 border-slate-800' : 'border-slate-300 bg-white hover:border-slate-400'
                                      }`}
                                    >
                                      {val && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {modules.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-8">Aucun module activé pour ce profil.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4 — Dashboard */}
            {tab === 'dashboard' && (
              <div className="max-w-md space-y-4">
                <p className="text-xs text-slate-500">Sélectionnez le tableau de bord affiché par défaut à la connexion pour ce profil.</p>
                <div className="space-y-2">
                  {DASHBOARD_OPTIONS.map(opt => {
                    const active = selected.dashboard_defaut === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => saveProfil({ dashboard_defaut: opt.id })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          active ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          active ? 'border-slate-800' : 'border-slate-300'
                        }`}>
                          {active && <span className="w-2 h-2 rounded-full bg-slate-800" />}
                        </span>
                        <span className={`text-sm font-medium ${active ? 'text-slate-800' : 'text-slate-600'}`}>{opt.label}</span>
                        {saving && active && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <Shield className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">Sélectionnez un profil</p>
            <p className="text-xs text-slate-300 mt-1">pour en voir les détails</p>
          </div>
        </div>
      )}

      {/* New profil modal */}
      {showNewModal && <NouveauProfilModal onClose={() => setShowNewModal(false)} onCreated={load} />}
    </div>
  );
}

// ── InfosTab ──────────────────────────────────────────────────────────────────

function InfosTab({ profil, onSave, saving }: { profil: ConfigProfil; onSave: (u: Partial<ConfigProfil>) => Promise<void>; saving: boolean }) {
  const [nom, setNom] = useState(profil.nom);
  const [description, setDescription] = useState(profil.description ?? '');
  const [actif, setActif] = useState(profil.actif);

  useEffect(() => {
    setNom(profil.nom);
    setDescription(profil.description ?? '');
    setActif(profil.actif);
  }, [profil.id]);

  const dirty = nom !== profil.nom || description !== (profil.description ?? '') || actif !== profil.actif;

  return (
    <div className="max-w-md space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom du profil</label>
        <input
          value={nom}
          onChange={e => setNom(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActif(v => !v)}
          className={`relative inline-flex w-10 h-5 rounded-full transition-colors flex-shrink-0 ${actif ? 'bg-slate-800' : 'bg-slate-200'}`}
        >
          <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${actif ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-sm text-slate-700">{actif ? 'Profil actif' : 'Profil inactif'}</span>
      </div>

      {dirty && (
        <button
          onClick={() => onSave({ nom, description, actif })}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Enregistrer
        </button>
      )}

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
        <p>Créé le {new Date(profil.created_at).toLocaleDateString('fr-FR')}</p>
        <p>Modifié le {new Date(profil.updated_at).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
  );
}

// ── NouveauProfilModal ────────────────────────────────────────────────────────

function NouveauProfilModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!nom.trim()) return;
    setSaving(true);
    await supabase.from('config_profils').insert({ nom: nom.trim(), description });
    await supabase.from('config_journal').insert({ type_action: 'Création', objet_type: 'Profil', objet_nom: nom.trim(), details: 'Nouveau profil créé' });
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Nouveau profil</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nom du profil *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Chef de projet" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={submit} disabled={!nom.trim() || saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
