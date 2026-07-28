import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Equipement } from '../types/patrimoine';
import StatusBadge from './StatusBadge';
import { Wrench, Search, Plus, X, ChevronUp, ChevronDown, Calendar, CreditCard as Edit3, Trash2, AlertTriangle, Check, Filter } from 'lucide-react';

const CATEGORIES = ['Chauffage', 'Ascenseur', 'Électricité', 'Plomberie', 'Sécurité', 'Ventilation', 'Autre'];
const ETATS = ['fonctionnel', 'en_panne', 'a_remplacer', 'hors_service'];

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function formatCurrency(n?: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

type SortField = 'designation' | 'categorie' | 'etat' | 'prochaine_echeance';
type SortDir = 'asc' | 'desc';

interface FormData {
  identifiant: string;
  designation: string;
  categorie: string;
  etat: string;
  marque: string;
  modele: string;
  date_mise_en_service: string;
  cout_acquisition: string;
  frequence_controle: string;
  prochaine_echeance: string;
}

const emptyForm: FormData = {
  identifiant: '', designation: '', categorie: 'Chauffage', etat: 'fonctionnel',
  marque: '', modele: '', date_mise_en_service: '', cout_acquisition: '', frequence_controle: '', prochaine_echeance: '',
};

export default function ListeEquipements() {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterEtat, setFilterEtat] = useState('');
  const [sortField, setSortField] = useState<SortField>('designation');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('equipements').select('*').order(sortField, { ascending: sortDir === 'asc' });
    setEquipements(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [sortField, sortDir]);

  const filtered = equipements.filter((eq) => {
    const matchSearch = !search || eq.designation.toLowerCase().includes(search.toLowerCase()) || eq.identifiant.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategorie || eq.categorie === filterCategorie;
    const matchEtat = !filterEtat || eq.etat === filterEtat;
    return matchSearch && matchCat && matchEtat;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />;
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      cout_acquisition: form.cout_acquisition ? parseFloat(form.cout_acquisition) : null,
      date_mise_en_service: form.date_mise_en_service || null,
      prochaine_echeance: form.prochaine_echeance || null,
    };

    if (editingId) {
      await supabase.from('equipements').update(payload).eq('id', editingId);
    } else {
      await supabase.from('equipements').insert([payload]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (eq: Equipement) => {
    setForm({
      identifiant: eq.identifiant,
      designation: eq.designation,
      categorie: eq.categorie,
      etat: eq.etat,
      marque: eq.marque || '',
      modele: eq.modele || '',
      date_mise_en_service: eq.date_mise_en_service || '',
      cout_acquisition: eq.cout_acquisition?.toString() || '',
      frequence_controle: eq.frequence_controle || '',
      prochaine_echeance: eq.prochaine_echeance || '',
    });
    setEditingId(eq.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('equipements').delete().eq('id', id);
    setDeleteId(null);
    load();
  };

  const activeFiltersCount = [filterCategorie, filterEtat].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-semibold text-slate-800">Référentiel Équipements</h1>
            <span className="text-sm text-slate-400">({filtered.length} résultat{filtered.length !== 1 ? 's' : ''})</span>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un équipement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters || activeFiltersCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && <span className="bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterEtat}
              onChange={(e) => setFilterEtat(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              <option value="">Tous états</option>
              {ETATS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
            </select>
            {activeFiltersCount > 0 && (
              <button onClick={() => { setFilterCategorie(''); setFilterEtat(''); }} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Effacer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('designation')}
                >
                  <span className="flex items-center gap-1">Désignation <SortIcon field="designation" /></span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('categorie')}
                >
                  <span className="flex items-center gap-1">Catégorie <SortIcon field="categorie" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Marque / Modèle</th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('etat')}
                >
                  <span className="flex items-center gap-1">État <SortIcon field="etat" /></span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort('prochaine_echeance')}
                >
                  <span className="flex items-center gap-1">Proch. échéance <SortIcon field="prochaine_echeance" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Coût acq.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Aucun équipement trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((eq) => {
                  const isEcheanceProche = eq.prochaine_echeance && new Date(eq.prochaine_echeance) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{eq.identifiant}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{eq.designation}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{eq.categorie}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {[eq.marque, eq.modele].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={eq.etat} /></td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs ${isEcheanceProche ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                          {isEcheanceProche && <AlertTriangle className="w-3 h-3" />}
                          <Calendar className="w-3 h-3" />
                          {formatDate(eq.prochaine_echeance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatCurrency(eq.cout_acquisition)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(eq)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button onClick={() => setDeleteId(eq.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editingId ? 'Modifier équipement' : 'Nouvel équipement'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Identifiant *</label>
                  <input value={form.identifiant} onChange={(e) => setForm({ ...form, identifiant: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Catégorie *</label>
                  <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Désignation *</label>
                <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Marque</label>
                  <input value={form.marque} onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Modèle</label>
                  <input value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">État</label>
                  <select value={form.etat} onChange={(e) => setForm({ ...form, etat: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    {ETATS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Fréquence contrôle</label>
                  <select value={form.frequence_controle} onChange={(e) => setForm({ ...form, frequence_controle: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option value="">—</option>
                    <option value="mensuelle">Mensuelle</option>
                    <option value="trimestrielle">Trimestrielle</option>
                    <option value="semestrielle">Semestrielle</option>
                    <option value="annuelle">Annuelle</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Mise en service</label>
                  <input type="date" value={form.date_mise_en_service} onChange={(e) => setForm({ ...form, date_mise_en_service: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Prochaine échéance</label>
                  <input type="date" value={form.prochaine_echeance} onChange={(e) => setForm({ ...form, prochaine_echeance: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Coût d'acquisition (€)</label>
                <input type="number" value={form.cout_acquisition} onChange={(e) => setForm({ ...form, cout_acquisition: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
              <button onClick={handleSubmit}
                disabled={!form.identifiant || !form.designation}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
                <Check className="w-4 h-4" /> {editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Supprimer l'équipement ?</h3>
                <p className="text-sm text-slate-500">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
