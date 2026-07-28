import { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, UserX, X, Loader2, Mail, Phone, Building2, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ConfigUtilisateur, ConfigProfil } from './configTypes';

function Avatar({ nom, prenom }: { nom: string; prenom: string }) {
  const initials = `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
  return (
    <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
      {initials}
    </span>
  );
}

export default function ConfigUtilisateurs() {
  const [users, setUsers] = useState<ConfigUtilisateur[]>([]);
  const [profils, setProfils] = useState<ConfigProfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProfil, setFilterProfil] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<ConfigUtilisateur | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from('config_utilisateurs').select('*, config_profils(nom, emoji)').order('nom'),
      supabase.from('config_profils').select('*').eq('actif', true).order('nom'),
    ]);
    if (u) setUsers(u.map((r: any) => ({ ...r, _profil_nom: r.config_profils?.nom, _profil_emoji: r.config_profils?.emoji })));
    if (p) setProfils(p);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchProfil = !filterProfil || u.profil_id === filterProfil;
    return matchSearch && matchProfil;
  });

  async function toggleActif(u: ConfigUtilisateur) {
    await supabase.from('config_utilisateurs').update({ actif: !u.actif }).eq('id', u.id);
    await supabase.from('config_journal').insert({ type_action: 'Modification', objet_type: 'Utilisateur', objet_nom: `${u.prenom} ${u.nom}`, details: `Compte ${u.actif ? 'désactivé' : 'réactivé'}` });
    load();
  }

  return (
    <div className="p-6 space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>
        <select
          value={filterProfil}
          onChange={e => setFilterProfil(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300"
        >
          <option value="">Tous les profils</option>
          {profils.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
        <div className="ml-auto">
          <button
            onClick={() => { setEditUser(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',   value: users.length,                     color: 'text-slate-700' },
          { label: 'Actifs',  value: users.filter(u => u.actif).length, color: 'text-emerald-600' },
          { label: 'Inactifs',value: users.filter(u => !u.actif).length,color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
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
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Utilisateur</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Contact</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Profil</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Périmètre</th>
                <th className="text-left py-2.5 px-4 font-semibold text-slate-500">Statut</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar nom={u.nom} prenom={u.prenom} />
                      <div>
                        <p className="font-semibold text-slate-800">{u.prenom} {u.nom}</p>
                        {u.service && <p className="text-[10px] text-slate-400">{u.service}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-1 text-slate-600"><Mail className="w-3 h-3 text-slate-400" />{u.email}</p>
                      {u.telephone && <p className="flex items-center gap-1 text-slate-500"><Phone className="w-3 h-3 text-slate-400" />{u.telephone}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {u._profil_nom ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                        <Shield className="w-3 h-3 text-slate-500" />
                        {u._profil_nom}
                      </span>
                    ) : <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {u.perimetre ? (
                      <span className="flex items-center gap-1 text-slate-600"><Building2 className="w-3 h-3 text-slate-400" />{u.perimetre}</span>
                    ) : <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      u.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => { setEditUser(u); setShowModal(true); }}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                        title="Modifier"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActif(u)}
                        className={`p-1 rounded-lg transition-colors ${u.actif ? 'hover:bg-red-50 text-slate-400 hover:text-red-600' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'}`}
                        title={u.actif ? 'Désactiver' : 'Réactiver'}
                      >
                        {u.actif ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-8">Aucun utilisateur trouvé.</p>
          )}
        </div>
      )}

      {showModal && (
        <UtilisateurModal
          user={editUser}
          profils={profils}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}

function UtilisateurModal({ user, profils, onClose, onSaved }: {
  user: ConfigUtilisateur | null;
  profils: ConfigProfil[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    email: user?.email ?? '',
    profil_id: user?.profil_id ?? '',
    service: user?.service ?? '',
    perimetre: user?.perimetre ?? '',
    telephone: user?.telephone ?? '',
    actif: user?.actif ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.nom || !form.prenom || !form.email) return;
    setSaving(true);
    if (user) {
      await supabase.from('config_utilisateurs').update({ ...form, updated_at: new Date().toISOString() }).eq('id', user.id);
      await supabase.from('config_journal').insert({ type_action: 'Modification', objet_type: 'Utilisateur', objet_nom: `${form.prenom} ${form.nom}`, details: 'Informations mises à jour' });
    } else {
      await supabase.from('config_utilisateurs').insert(form);
      await supabase.from('config_journal').insert({ type_action: 'Création', objet_type: 'Utilisateur', objet_nom: `${form.prenom} ${form.nom}`, details: 'Nouvel utilisateur créé' });
    }
    onSaved();
    onClose();
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-800">{user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Prénom *', 'prenom')}
          {field('Nom *', 'nom')}
          <div className="col-span-2">{field('Email *', 'email', 'email')}</div>
          {field('Service', 'service')}
          {field('Téléphone', 'telephone', 'tel')}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Profil</label>
            <select value={form.profil_id} onChange={e => setForm(f => ({ ...f, profil_id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
              <option value="">Aucun profil</option>
              {profils.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          {field('Périmètre', 'perimetre')}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={submit} disabled={!form.nom || !form.prenom || !form.email || saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
