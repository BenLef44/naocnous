import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download, Upload, Copy, Trash2, X, Save, Loader2, Check, ChevronRight, BookOpen, Sparkles, Grid3x3 as Grid3X3, List } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ALL_MODULES, PERMISSION_ACTIONS, DASHBOARD_OPTIONS } from './configTypes';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModulePermission {
  module_id: string;
  peut_voir: boolean;
  peut_creer: boolean;
  peut_modifier: boolean;
  peut_supprimer: boolean;
  peut_exporter: boolean;
  peut_administrer: boolean;
}

interface RoleBibliotheque {
  id: string;
  nom: string;
  description: string | null;
  categorie: string;
  icone: string | null;
  couleur: string | null;
  modules: ModulePermission[];
  dashboard_defaut: string | null;
  perimetre: string | null;
  nb_utilisations: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'table' | 'gallery';

const CATEGORIES = ['Tous', 'Métier', 'Direction', 'Prestataire', 'Administration', 'Technique'];

const CATEGORIE_COLORS: Record<string, string> = {
  'Métier':         'bg-sky-50 text-sky-700 border-sky-200',
  'Direction':      'bg-red-50 text-red-700 border-red-200',
  'Prestataire':    'bg-slate-100 text-slate-600 border-slate-200',
  'Administration': 'bg-amber-50 text-amber-700 border-amber-200',
  'Technique':      'bg-violet-50 text-violet-700 border-violet-200',
};

const MODULE_GROUPES = [...new Set(ALL_MODULES.map(m => m.groupe))];

const EMPTY_PERMISSIONS: ModulePermission = {
  module_id: '',
  peut_voir: false,
  peut_creer: false,
  peut_modifier: false,
  peut_supprimer: false,
  peut_exporter: false,
  peut_administrer: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function categorieBadge(cat: string) {
  const cls = CATEGORIE_COLORS[cat] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cls}`}>
      {cat}
    </span>
  );
}

function moduleCount(modules: ModulePermission[]) {
  return modules.length;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ConfigBibliotheque() {
  const [roles, setRoles] = useState<RoleBibliotheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('Tous');
  const [view, setView] = useState<ViewMode>('table');
  const [selected, setSelected] = useState<RoleBibliotheque | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<RoleBibliotheque | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('config_roles_bibliotheque')
      .select('*')
      .order('nom');
    if (data) setRoles(data as RoleBibliotheque[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = roles.filter(r => {
    const matchCat = categorie === 'Tous' || r.categorie === categorie;
    const matchSearch = r.nom.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function handleDelete(role: RoleBibliotheque) {
    if (!window.confirm(`Supprimer le rôle "${role.nom}" ?`)) return;
    await supabase.from('config_roles_bibliotheque').delete().eq('id', role.id);
    await logAction('Suppression', role.nom, null);
    if (selected?.id === role.id) setSelected(null);
    load();
  }

  async function handleDuplicate(role: RoleBibliotheque) {
    setDuplicateSource(role);
    setShowCreate(true);
  }

  function handleExport(role: RoleBibliotheque) {
    const json = JSON.stringify(role, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-${role.nom.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Partial<RoleBibliotheque>;
      const { id: _id, created_at: _c, updated_at: _u, ...payload } = data as RoleBibliotheque;
      await supabase.from('config_roles_bibliotheque').insert({
        ...payload,
        nom: `${payload.nom ?? 'Rôle importé'} (copie)`,
      });
      await logAction('Import', payload.nom ?? 'Rôle importé', 'Importé depuis fichier JSON');
      load();
    } catch {
      alert('Fichier JSON invalide.');
    }
    e.target.value = '';
  }

  async function logAction(type: string, nom: string, details: string | null) {
    await supabase.from('config_journal').insert({
      type_action: type,
      objet_type: 'Rôle bibliothèque',
      objet_nom: nom,
      details,
    });
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* Left panel */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-5 py-3 space-y-2.5">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un rôle..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>

            <div className="flex-1" />

            {/* View toggle */}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('table')}
                className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView('gallery')}
                className={`p-1.5 rounded-md transition-colors ${view === 'gallery' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Import */}
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Importer
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            {/* New role */}
            <button
              onClick={() => { setDuplicateSource(null); setShowCreate(true); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau rôle
            </button>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategorie(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                  categorie === cat
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                }`}
              >
                {cat}
                {cat !== 'Tous' && (
                  <span className="ml-1 text-[10px] opacity-60">
                    {roles.filter(r => r.categorie === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <BookOpen className="w-8 h-8 mb-2 text-slate-200" />
              <p className="text-sm">Aucun rôle trouvé</p>
            </div>
          ) : view === 'table' ? (
            <TableView
              roles={filtered}
              selected={selected}
              onSelect={setSelected}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
              onDelete={handleDelete}
            />
          ) : (
            <GalleryView
              roles={filtered}
              onSelect={setSelected}
              onDuplicate={handleDuplicate}
              onExport={handleExport}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <RoleDetailPanel
          role={selected}
          onClose={() => setSelected(null)}
          onDuplicate={() => handleDuplicate(selected)}
          onExport={() => handleExport(selected)}
          onRefresh={load}
        />
      )}

      {/* Create / duplicate modal */}
      {showCreate && (
        <RoleFormModal
          source={duplicateSource}
          onClose={() => { setShowCreate(false); setDuplicateSource(null); }}
          onSaved={async () => { await load(); setShowCreate(false); setDuplicateSource(null); }}
          logAction={logAction}
        />
      )}
    </div>
  );
}

// ── Table view ─────────────────────────────────────────────────────────────────

function TableView({
  roles, selected, onSelect, onDuplicate, onExport, onDelete,
}: {
  roles: RoleBibliotheque[];
  selected: RoleBibliotheque | null;
  onSelect: (r: RoleBibliotheque) => void;
  onDuplicate: (r: RoleBibliotheque) => void;
  onExport: (r: RoleBibliotheque) => void;
  onDelete: (r: RoleBibliotheque) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Nom du rôle</th>
            <th className="text-left py-2.5 px-3 font-semibold text-slate-500">Catégorie</th>
            <th className="text-left py-2.5 px-3 font-semibold text-slate-500">Modules</th>
            <th className="text-left py-2.5 px-3 font-semibold text-slate-500">Dashboard</th>
            <th className="text-center py-2.5 px-3 font-semibold text-slate-500">Utilisations</th>
            <th className="text-left py-2.5 px-3 font-semibold text-slate-500">Mise à jour</th>
            <th className="py-2.5 px-3" />
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr
              key={role.id}
              onClick={() => onSelect(role)}
              className={`border-b border-slate-50 cursor-pointer transition-colors group ${
                selected?.id === role.id ? 'bg-slate-50' : 'hover:bg-slate-50/60'
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: `${role.couleur}18`, border: `1px solid ${role.couleur}30` }}
                  >
                    {role.icone ?? '👤'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{role.nom}</p>
                    {role.description && (
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{role.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-3">{categorieBadge(role.categorie)}</td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700">{moduleCount(role.modules)}</span>
                  <span className="text-slate-400">module{moduleCount(role.modules) > 1 ? 's' : ''}</span>
                </div>
              </td>
              <td className="py-3 px-3 text-slate-500">
                {role.dashboard_defaut
                  ? (DASHBOARD_OPTIONS.find(d => d.id === role.dashboard_defaut)?.label ?? role.dashboard_defaut)
                  : <span className="text-slate-300">—</span>}
              </td>
              <td className="py-3 px-3 text-center">
                <span className={`font-semibold ${role.nb_utilisations > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                  {role.nb_utilisations}
                </span>
              </td>
              <td className="py-3 px-3 text-slate-400">{formatDate(role.updated_at)}</td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); onDuplicate(role); }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                    title="Dupliquer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onExport(role); }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                    title="Exporter JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(role); }}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Gallery view ───────────────────────────────────────────────────────────────

function GalleryView({
  roles, onSelect, onDuplicate, onExport, onDelete,
}: {
  roles: RoleBibliotheque[];
  onSelect: (r: RoleBibliotheque) => void;
  onDuplicate: (r: RoleBibliotheque) => void;
  onExport: (r: RoleBibliotheque) => void;
  onDelete: (r: RoleBibliotheque) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <p className="text-xs font-bold text-slate-700">Modèles recommandés</p>
        <span className="text-[10px] text-slate-400">Cliquez pour voir les détails ou dupliquer</span>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {roles.map(role => (
          <div
            key={role.id}
            onClick={() => onSelect(role)}
            className="bg-white rounded-xl border border-slate-100 p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${role.couleur}18`, border: `1px solid ${role.couleur}30` }}
              >
                {role.icone ?? '👤'}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); onDuplicate(role); }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  title="Dupliquer"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onExport(role); }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  title="Exporter"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(role); }}
                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-800 mb-0.5">{role.nom}</p>
            <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">{role.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {categorieBadge(role.categorie)}
              <span className="text-[10px] text-slate-400">{moduleCount(role.modules)} modules</span>
              {role.nb_utilisations > 0 && (
                <span className="text-[10px] text-slate-400">{role.nb_utilisations} utilisations</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function RoleDetailPanel({
  role, onClose, onDuplicate, onExport, onRefresh,
}: {
  role: RoleBibliotheque;
  onClose: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<'infos' | 'modules' | 'permissions'>('infos');

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-l border-slate-100 bg-white overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: `${role.couleur}18`, border: `1px solid ${role.couleur}30` }}
        >
          {role.icone ?? '👤'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{role.nom}</p>
          <div className="mt-0.5">{categorieBadge(role.categorie)}</div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg flex-shrink-0">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Action bar */}
      <div className="px-4 py-2 border-b border-slate-100 flex gap-2">
        <button
          onClick={onDuplicate}
          className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Copy className="w-3 h-3" />
          Dupliquer
        </button>
        <button
          onClick={onExport}
          className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Download className="w-3 h-3" />
          Exporter JSON
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100 flex gap-0">
        {(['infos', 'modules', 'permissions'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[10px] font-semibold capitalize border-b-2 transition-colors ${
              tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'infos' ? 'Infos' : t === 'modules' ? 'Modules' : 'Permissions'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tab === 'infos' && (
          <RoleDetailInfos role={role} onRefresh={onRefresh} />
        )}
        {tab === 'modules' && (
          <RoleDetailModules modules={role.modules} />
        )}
        {tab === 'permissions' && (
          <RoleDetailPermissions modules={role.modules} />
        )}
      </div>
    </div>
  );
}

function RoleDetailInfos({ role, onRefresh }: { role: RoleBibliotheque; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState(role.nom);
  const [description, setDescription] = useState(role.description ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNom(role.nom);
    setDescription(role.description ?? '');
    setEditing(false);
  }, [role.id]);

  async function save() {
    setSaving(true);
    await supabase.from('config_roles_bibliotheque')
      .update({ nom, description })
      .eq('id', role.id);
    await supabase.from('config_journal').insert({
      type_action: 'Modification',
      objet_type: 'Rôle bibliothèque',
      objet_nom: nom,
      details: 'Nom/description mis à jour',
    });
    setSaving(false);
    setEditing(false);
    onRefresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Nom</label>
        {editing ? (
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        ) : (
          <p className="text-xs font-semibold text-slate-800">{role.nom}</p>
        )}
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</label>
        {editing ? (
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none"
          />
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed">{role.description ?? '—'}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Catégorie</label>
          {categorieBadge(role.categorie)}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Utilisations</label>
          <p className="text-xs font-bold text-slate-700">{role.nb_utilisations}</p>
        </div>
      </div>
      {role.dashboard_defaut && (
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Dashboard par défaut</label>
          <p className="text-xs text-slate-600">
            {DASHBOARD_OPTIONS.find(d => d.id === role.dashboard_defaut)?.label ?? role.dashboard_defaut}
          </p>
        </div>
      )}
      <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
        <p>Créé le {formatDate(role.created_at)}</p>
        <p>Mis à jour le {formatDate(role.updated_at)}</p>
      </div>
      {editing ? (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 text-[10px] font-semibold text-slate-600 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-white bg-slate-800 py-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Enregistrer
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-[10px] font-semibold text-slate-600 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Modifier
        </button>
      )}
    </div>
  );
}

function RoleDetailModules({ modules }: { modules: ModulePermission[] }) {
  const activeIds = new Set(modules.map(m => m.module_id));
  return (
    <div className="space-y-4">
      {MODULE_GROUPES.map(groupe => {
        const groupeMods = ALL_MODULES.filter(m => m.groupe === groupe);
        const hasActive = groupeMods.some(m => activeIds.has(m.id));
        return (
          <div key={groupe}>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{groupe}</p>
            <div className="space-y-1">
              {groupeMods.map(mod => {
                const active = activeIds.has(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${active ? 'bg-slate-50' : 'opacity-30'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-slate-800 border-slate-800' : 'border-slate-300'
                    }`}>
                      {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                    </span>
                    <span className={`text-[10px] ${active ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>{mod.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleDetailPermissions({ modules }: { modules: ModulePermission[] }) {
  if (modules.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-4">Aucun module activé</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-1.5 pr-2 font-semibold text-slate-400 w-28">Module</th>
            {PERMISSION_ACTIONS.map(a => (
              <th key={a.key} className="text-center py-1.5 px-1 font-semibold text-slate-400 w-8" title={a.label}>
                {a.label.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map(mod => {
            const info = ALL_MODULES.find(m => m.id === mod.module_id);
            return (
              <tr key={mod.module_id} className="border-b border-slate-50">
                <td className="py-1.5 pr-2 font-medium text-slate-600 truncate max-w-[112px]">
                  {info?.label ?? mod.module_id}
                </td>
                {PERMISSION_ACTIONS.map(a => {
                  const val = mod[a.key as keyof ModulePermission] as boolean;
                  return (
                    <td key={a.key} className="py-1.5 px-1 text-center">
                      {val
                        ? <Check className="w-3 h-3 text-emerald-500 mx-auto" strokeWidth={2.5} />
                        : <span className="text-slate-200 text-xs">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Role form modal ────────────────────────────────────────────────────────────

type FormTab = 'infos' | 'modules' | 'dashboard';

function RoleFormModal({
  source, onClose, onSaved, logAction,
}: {
  source: RoleBibliotheque | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  logAction: (type: string, nom: string, details: string | null) => Promise<void>;
}) {
  const [tab, setTab] = useState<FormTab>('infos');
  const [nom, setNom] = useState(source ? `${source.nom} (copie)` : '');
  const [description, setDescription] = useState(source?.description ?? '');
  const [categorie, setCategorie] = useState(source?.categorie ?? 'Métier');
  const [icone, setIcone] = useState(source?.icone ?? '👤');
  const [couleur, setCouleur] = useState(source?.couleur ?? '#64748b');
  const [dashboard, setDashboard] = useState(source?.dashboard_defaut ?? '');
  const [modulePerms, setModulePerms] = useState<ModulePermission[]>(
    source ? source.modules.map(m => ({ ...m })) : []
  );
  const [saving, setSaving] = useState(false);

  const ICONES = ['👤', '🔧', '🛠️', '📋', '📦', '📄', '🏗️', '🎯', '🏢', '⚙️', '🔑', '🌐', '📊', '🔒', '✅'];
  const COULEURS = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ef4444', '#64748b', '#f97316', '#84cc16'];

  function hasModule(id: string) {
    return modulePerms.some(m => m.module_id === id);
  }

  function toggleModule(id: string) {
    if (hasModule(id)) {
      setModulePerms(prev => prev.filter(m => m.module_id !== id));
    } else {
      setModulePerms(prev => [...prev, { ...EMPTY_PERMISSIONS, module_id: id, peut_voir: true }]);
    }
  }

  function togglePerm(moduleId: string, perm: keyof ModulePermission) {
    setModulePerms(prev => prev.map(m =>
      m.module_id === moduleId ? { ...m, [perm]: !(m[perm] as boolean) } : m
    ));
  }

  async function submit() {
    if (!nom.trim()) return;
    setSaving(true);
    await supabase.from('config_roles_bibliotheque').insert({
      nom: nom.trim(),
      description: description || null,
      categorie,
      icone,
      couleur,
      modules: modulePerms,
      dashboard_defaut: dashboard || null,
    });
    await logAction(source ? 'Duplication' : 'Création', nom.trim(),
      source ? `Dupliqué depuis "${source.nom}"` : 'Nouveau rôle créé');
    await onSaved();
  }

  const FORM_TABS: { id: FormTab; label: string }[] = [
    { id: 'infos',    label: 'Informations' },
    { id: 'modules',  label: 'Modules & permissions' },
    { id: 'dashboard',label: 'Dashboard' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">
              {source ? 'Dupliquer un rôle' : 'Nouveau rôle'}
            </h3>
            {source && (
              <span className="text-xs text-slate-400">depuis "{source.nom}"</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-6 flex gap-1 flex-shrink-0">
          {FORM_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'infos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom du rôle *</label>
                <input
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Ex : Agent terrain"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez le rôle et ses responsabilités..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.slice(1).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategorie(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                        categorie === cat
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Icône</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONES.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setIcone(ic)}
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                        icone === ic ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {COULEURS.map(col => (
                    <button
                      key={col}
                      onClick={() => setCouleur(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        couleur === col ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'modules' && (
            <div className="space-y-5">
              {MODULE_GROUPES.map(groupe => (
                <div key={groupe}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{groupe}</p>
                  <div className="space-y-1.5">
                    {ALL_MODULES.filter(m => m.groupe === groupe).map(mod => {
                      const active = hasModule(mod.id);
                      const perm = modulePerms.find(m => m.module_id === mod.id);
                      return (
                        <div key={mod.id} className={`rounded-lg border transition-all ${active ? 'border-slate-200 bg-slate-50' : 'border-slate-100'}`}>
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left"
                          >
                            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              active ? 'bg-slate-800 border-slate-800' : 'border-slate-300 bg-white'
                            }`}>
                              {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </span>
                            <span className={`text-xs flex-1 ${active ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{mod.label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                          {active && perm && (
                            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                              {PERMISSION_ACTIONS.map(a => {
                                const val = perm[a.key as keyof ModulePermission] as boolean;
                                return (
                                  <button
                                    key={a.key}
                                    onClick={() => togglePerm(mod.id, a.key as keyof ModulePermission)}
                                    className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border transition-all ${
                                      val
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                                    }`}
                                  >
                                    {val && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                                    {a.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'dashboard' && (
            <div className="space-y-3 max-w-md">
              <p className="text-xs text-slate-500">
                Sélectionnez le tableau de bord affiché par défaut pour les utilisateurs ayant ce rôle.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setDashboard('')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    !dashboard ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    !dashboard ? 'border-slate-800' : 'border-slate-300'
                  }`}>
                    {!dashboard && <span className="w-2 h-2 rounded-full bg-slate-800" />}
                  </span>
                  <span className="text-sm text-slate-500">Aucun (laisser le choix à l'utilisateur)</span>
                </button>
                {DASHBOARD_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setDashboard(opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      dashboard === opt.id ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      dashboard === opt.id ? 'border-slate-800' : 'border-slate-300'
                    }`}>
                      {dashboard === opt.id && <span className="w-2 h-2 rounded-full bg-slate-800" />}
                    </span>
                    <span className={`text-sm font-medium ${dashboard === opt.id ? 'text-slate-800' : 'text-slate-600'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!nom.trim() || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {source ? 'Enregistrer la copie' : 'Créer le rôle'}
          </button>
        </div>
      </div>
    </div>
  );
}
