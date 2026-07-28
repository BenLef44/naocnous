import { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck, LayoutDashboard, AlertTriangle, FileText,
  TrendingUp, Building2, MapPin, ChevronDown, Plus, X, BookOpen,
  BarChart3,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ERP, ControleERP, IncidentERP, ActionCorrectiveERP, RegistreSecuriteRecord } from './registreTypes';
import { STATUT_CONTROLE_CFG, CATEGORIE_ERP_LABELS, TYPE_ERP_LABELS, fmtDate, getControleAlerte } from './registreTypes';
import ERPDashboard from './ERPDashboard';
import ComplianceDashboard from './ComplianceDashboard';
import ControlesERP from './ControlesERP';
import IncidentsERP from './IncidentsERP';
import ActionsCorrectivesERP from './ActionsCorrectivesERP';
import ConsignesPlans from './ConsignesPlans';
import NouveauRegistreModal from './NouveauRegistreModal';
import RegistreSecuriteTable from './RegistreSecuriteTable';
import RegistreDetailModal from './RegistreDetailModal';
import PatrimoinePicker from './PatrimoinePicker';
import type { PickedNode } from './PatrimoinePicker';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ERPTab = 'dashboard' | 'controles' | 'incidents' | 'actions' | 'consignes' | 'registres' | 'conformite';

const ERP_TABS: { id: ERPTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',   label: 'Tableau de bord',      icon: LayoutDashboard },
  { id: 'controles',   label: 'Contrôles',           icon: ShieldCheck     },
  { id: 'incidents',   label: 'Incidents',            icon: AlertTriangle   },
  { id: 'actions',     label: 'Actions correctives',  icon: TrendingUp      },
  { id: 'consignes',   label: 'Consignes & Plans',   icon: FileText        },
  { id: 'registres',   label: 'Registres',            icon: BookOpen        },
  { id: 'conformite',  label: 'Conformité globale',   icon: BarChart3       },
];

// ─── ERP list sidebar ──────────────────────────────────────────────────────────

interface ERPSidebarProps {
  erps: ERP[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddERP: () => void;
}

function ERPListSidebar({ erps, selectedId, onSelect, onAddERP }: ERPSidebarProps) {
  const [openSites, setOpenSites] = useState<Set<string>>(new Set());

  // Group ERP by site
  const grouped = useMemo(() => {
    const map = new Map<string, { siteNom: string; erps: ERP[] }>();
    erps.forEach(e => {
      const siteNom = e.site?.nom ?? 'Sans site';
      const key = e.site_id ?? 'none';
      if (!map.has(key)) map.set(key, { siteNom, erps: [] });
      map.get(key)!.erps.push(e);
    });
    // Open all by default
    if (openSites.size === 0 && map.size > 0) {
      setOpenSites(new Set(map.keys()));
    }
    return [...map.entries()];
  }, [erps]);

  const STATUT_DOT: Record<string, string> = {
    conforme: 'bg-emerald-500', en_retard: 'bg-red-500',
    non_realise: 'bg-slate-400', non_conforme: 'bg-orange-500', a_venir: 'bg-blue-400',
  };

  return (
    <div className="flex-shrink-0 w-56 border-r border-slate-200 bg-white flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-600 flex-1">ERP — {erps.length} établissement{erps.length !== 1 ? 's' : ''}</span>
        <button onClick={onAddERP} className="p-1 hover:bg-slate-100 rounded-lg transition-colors" title="Ajouter un ERP">
          <Plus className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {grouped.map(([siteKey, { siteNom, erps: siteErps }]) => {
          const isOpen = openSites.has(siteKey);
          return (
            <div key={siteKey}>
              <button
                onClick={() => setOpenSites(prev => { const n = new Set(prev); isOpen ? n.delete(siteKey) : n.add(siteKey); return n; })}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-50 transition-colors">
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 truncate flex-1">{siteNom}</span>
                <span className="text-[10px] text-slate-300">{siteErps.length}</span>
              </button>
              {isOpen && siteErps.map(erp => {
                const sel = selectedId === erp.id;
                return (
                  <button key={erp.id} onClick={() => onSelect(erp.id)}
                    className={`w-full flex items-start gap-2 pl-7 pr-2 py-2 transition-colors text-left
                      ${sel ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <Building2 className={`w-3 h-3 flex-shrink-0 mt-0.5 ${sel ? 'text-emerald-100' : 'text-slate-300'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-tight truncate ${sel ? 'text-white' : 'text-slate-700'}`}>{erp.nom}</p>
                      <p className={`text-[10px] leading-tight ${sel ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {erp.categorie_erp?.replace('eme','ème').replace('ere','ère')} · Type {erp.type_erp}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Add ERP modal ─────────────────────────────────────────────────────────────

interface AddERPModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function AddERPModal({ onClose, onSaved }: AddERPModalProps) {
  const [pickedNode, setPickedNode] = useState<PickedNode | null>(null);
  const [form, setForm] = useState({
    nom: '', categorie_erp: '5eme', type_erp: 'R', capacite: '', adresse: '',
    responsable_securite: '', email_responsable: '', coordonnees_secours: 'Pompiers : 18 | SAMU : 15 | Police : 17',
    date_mise_en_service: '', organisme_controle: '',
  });
  const [saving, setSaving] = useState(false);

  // When user picks a node, auto-fill nom + adresse
  const handlePick = (node: PickedNode | null) => {
    setPickedNode(node);
    if (node) {
      setForm(f => ({
        ...f,
        nom:     f.nom || node.nom,
        adresse: f.adresse || node.adresse || '',
      }));
    }
  };

  const nomEffectif = form.nom || pickedNode?.nom || '';

  const handleSave = async () => {
    if (!nomEffectif || !form.capacite) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      ...form,
      nom: nomEffectif,
      capacite: parseInt(form.capacite) || 0,
      date_mise_en_service: form.date_mise_en_service || null,
    };

    // Link to patrimoine node if picked
    if (pickedNode) {
      if (pickedNode.type === 'site') {
        payload.site_id = pickedNode.id;
      } else if (pickedNode.type === 'residence') {
        payload.residence_id = pickedNode.id;
        payload.site_id      = pickedNode.site_id ?? null;
      } else if (pickedNode.type === 'batiment' || pickedNode.type === 'batiment_ext') {
        payload.residence_id = pickedNode.residence_id ?? null;
        payload.site_id      = pickedNode.site_id ?? null;
      }
    }

    await supabase.from('erp').insert([payload]);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-bold text-slate-800">Nouvel ERP</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* Patrimoine tree picker */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Bâtiment / Site du patrimoine *
              <span className="ml-1 text-[10px] text-slate-400 font-normal">(sélectionnez dans l'arborescence)</span>
            </label>
            <PatrimoinePicker
              value={pickedNode}
              onChange={handlePick}
              placeholder="Rechercher un bâtiment dans le patrimoine…"
            />
          </div>

          {/* Nom ERP — pre-filled from picker but editable */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Nom de l'ERP *
              <span className="ml-1 text-[10px] text-slate-400 font-normal">(pré-rempli depuis la sélection, modifiable)</span>
            </label>
            <input
              value={form.nom || pickedNode?.nom || ''}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder={pickedNode?.nom ?? 'Résidence Jean Jaurès'}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Catégorie ERP *</label>
              <select value={form.categorie_erp} onChange={e => setForm(f => ({ ...f, categorie_erp: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                {Object.entries(CATEGORIE_ERP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Type ERP *</label>
              <select value={form.type_erp} onChange={e => setForm(f => ({ ...f, type_erp: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                {Object.entries(TYPE_ERP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Capacité d'accueil *</label>
              <input type="number" value={form.capacite} onChange={e => setForm(f => ({ ...f, capacite: e.target.value }))}
                placeholder="200"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Date mise en service</label>
              <input type="date" value={form.date_mise_en_service} onChange={e => setForm(f => ({ ...f, date_mise_en_service: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Adresse</label>
            <input
              value={form.adresse || pickedNode?.adresse || ''}
              onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
              placeholder={pickedNode?.adresse ?? '12 Rue des Étudiants, 69000 Lyon'}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Responsable sécurité</label>
              <input value={form.responsable_securite} onChange={e => setForm(f => ({ ...f, responsable_securite: e.target.value }))}
                placeholder="Dupont Jean"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Organisme de contrôle</label>
              <input value={form.organisme_controle} onChange={e => setForm(f => ({ ...f, organisme_controle: e.target.value }))}
                placeholder="SOCOTEC, APAVE..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Coordonnées secours</label>
            <input value={form.coordonnees_secours} onChange={e => setForm(f => ({ ...f, coordonnees_secours: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving || !nomEffectif || !form.capacite}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Enregistrement...' : 'Créer l\'ERP'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

interface RegistreSecuriteProps {
  requestNewRegistre?: number;
}

export default function RegistreSecurite({ requestNewRegistre }: RegistreSecuriteProps = {}) {
  const [erps, setErps] = useState<ERP[]>([]);
  const [selectedERPId, setSelectedERPId] = useState<string | null>(null);
  const [controles, setControles] = useState<ControleERP[]>([]);
  const [incidents, setIncidents] = useState<IncidentERP[]>([]);
  const [actions, setActions] = useState<ActionCorrectiveERP[]>([]);
  const [registres, setRegistres] = useState<RegistreSecuriteRecord[]>([]);
  const [registresLoading, setRegistresLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ERPTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showAddERP, setShowAddERP] = useState(false);
  const [showNewRegistre, setShowNewRegistre] = useState(false);
  const [viewRegistre, setViewRegistre] = useState<RegistreSecuriteRecord | null>(null);
  const [editRegistre, setEditRegistre] = useState<RegistreSecuriteRecord | null>(null);

  const selectedERP = useMemo(() => erps.find(e => e.id === selectedERPId) ?? null, [erps, selectedERPId]);

  useEffect(() => {
    if (requestNewRegistre && requestNewRegistre > 0 && selectedERP) {
      setShowNewRegistre(true);
    }
  }, [requestNewRegistre, selectedERP]);

  const loadERPs = async () => {
    const { data } = await supabase
      .from('erp')
      .select('*, residence:residences(nom), site:sites(nom)')
      .order('nom');
    setErps((data ?? []) as ERP[]);
    if (data && data.length > 0 && !selectedERPId) {
      setSelectedERPId(data[0].id);
    }
  };

  const loadERPData = async (erpId: string) => {
    const [{ data: ctrl }, { data: inc }, { data: act }] = await Promise.all([
      supabase.from('controles_erp').select('*').eq('erp_id', erpId).order('categorie').order('type_controle'),
      supabase.from('incidents_erp').select('*').eq('erp_id', erpId).order('date_incident', { ascending: false }),
      supabase.from('actions_correctives_erp').select('*').eq('erp_id', erpId).order('priorite', { ascending: false }),
    ]);
    setControles((ctrl ?? []) as ControleERP[]);
    setIncidents((inc ?? []) as IncidentERP[]);
    setActions((act ?? []) as ActionCorrectiveERP[]);
  };

  const loadRegistres = async (erpId: string) => {
    setRegistresLoading(true);
    const { data } = await supabase
      .from('registres_securite')
      .select('*, erp:erp(nom, categorie_erp, type_erp)')
      .eq('erp_id', erpId)
      .order('annee', { ascending: false });
    setRegistres((data ?? []) as RegistreSecuriteRecord[]);
    setRegistresLoading(false);
  };

  useEffect(() => {
    loadERPs().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedERPId) {
      loadERPData(selectedERPId);
      loadRegistres(selectedERPId);
    }
  }, [selectedERPId]);

  const tabBadges: Partial<Record<ERPTab, number>> = useMemo(() => ({
    controles: controles.filter(c => c.statut === 'en_retard' || c.statut === 'non_realise' || c.statut === 'non_conforme').length || 0,
    incidents: incidents.filter(i => i.statut !== 'cloture').length || 0,
    actions:   actions.filter(a => a.statut !== 'termine' && a.statut !== 'annule').length || 0,
    registres: registres.length,
  }), [controles, incidents, actions, registres]);

  const handleDeleteRegistre = async (r: RegistreSecuriteRecord) => {
    if (!confirm(`Supprimer le registre ${r.reference} ?`)) return;
    await supabase.from('registres_securite').delete().eq('id', r.id);
    if (selectedERPId) loadRegistres(selectedERPId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
        <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
        Chargement du registre de sécurité…
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ERP list sidebar */}
      <ERPListSidebar
        erps={erps}
        selectedId={selectedERPId}
        onSelect={id => { setSelectedERPId(id); setActiveTab('dashboard'); }}
        onAddERP={() => setShowAddERP(true)}
      />

      {/* Main area */}
      {selectedERP ? (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ERP header */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">{selectedERP.nom}</h2>
                <p className="text-[11px] text-slate-400">
                  {CATEGORIE_ERP_LABELS[selectedERP.categorie_erp] ?? selectedERP.categorie_erp} ·
                  {' '}{TYPE_ERP_LABELS[selectedERP.type_erp] ?? `Type ${selectedERP.type_erp}`} ·
                  Capacité : {selectedERP.capacite} pers.
                </p>
              </div>
              {selectedERP.adresse && (
                <div className="hidden md:flex items-center gap-1 ml-4 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {selectedERP.adresse}
                </div>
              )}
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-0.5 mt-3 overflow-x-auto">
              {ERP_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap
                    ${activeTab === id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {(tabBadges[id] ?? 0) > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0
                      ${activeTab === id ? 'bg-white text-emerald-600' : id === 'registres' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                      {tabBadges[id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className={`flex-1 min-h-0 flex flex-col ${
            activeTab === 'controles' || activeTab === 'incidents' || activeTab === 'actions' || activeTab === 'registres' || activeTab === 'conformite'
              ? 'overflow-hidden' : 'overflow-y-auto'
          }`}>
            <div className={activeTab === 'dashboard' || activeTab === 'consignes' || activeTab === 'conformite' ? 'p-5' : 'h-full flex flex-col'}>
              {activeTab === 'dashboard' && (
                <ERPDashboard erp={selectedERP} controles={controles} incidents={incidents} actions={actions} />
              )}
              {activeTab === 'controles' && (
                <ControlesERP controles={controles} />
              )}
              {activeTab === 'incidents' && (
                <IncidentsERP incidents={incidents} />
              )}
              {activeTab === 'actions' && (
                <ActionsCorrectivesERP actions={actions} />
              )}
              {activeTab === 'consignes' && (
                <ConsignesPlans erp={selectedERP} />
              )}
              {activeTab === 'registres' && (
                <RegistreSecuriteTable
                  registres={registres}
                  erps={erps}
                  loading={registresLoading}
                  onView={r => setViewRegistre(r)}
                  onEdit={r => { setViewRegistre(null); setEditRegistre(r); }}
                  onDelete={handleDeleteRegistre}
                  onNew={() => setShowNewRegistre(true)}
                />
              )}
              {activeTab === 'conformite' && (
                <div className="p-5">
                  <ComplianceDashboard onOpenRegistre={r => setViewRegistre(r)} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <ShieldCheck className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">Sélectionnez un ERP dans la liste</p>
          <button onClick={() => setShowAddERP(true)}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-semibold mt-2">
            <Plus className="w-3.5 h-3.5" /> Créer un ERP
          </button>
        </div>
      )}

      {showAddERP && (
        <AddERPModal
          onClose={() => setShowAddERP(false)}
          onSaved={() => { setShowAddERP(false); loadERPs(); }}
        />
      )}

      {(showNewRegistre || editRegistre) && selectedERP && (
        <NouveauRegistreModal
          erp={selectedERP}
          existingRegistre={editRegistre}
          onClose={() => { setShowNewRegistre(false); setEditRegistre(null); }}
          onSaved={() => {
            setShowNewRegistre(false);
            setEditRegistre(null);
            if (selectedERPId) loadRegistres(selectedERPId);
            setActiveTab('registres');
          }}
        />
      )}

      {viewRegistre && (
        <RegistreDetailModal
          registre={viewRegistre}
          erp={erps.find(e => e.id === viewRegistre.erp_id)}
          onClose={() => setViewRegistre(null)}
          onEdit={(reg) => { setViewRegistre(null); setEditRegistre(reg); }}
        />
      )}
    </div>
  );
}
