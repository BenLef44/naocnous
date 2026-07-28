import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { usePatrimoineStore } from '../store/patrimoineStore';
import { Intervention, Document, Contrat, Equipement } from '../types/patrimoine';
import StatusBadge from './StatusBadge';
import { Building2, MapPin, Layers, Home, Pencil, FileText, Wrench, ClipboardList, Calendar, User, Users, Euro, Tag, Download, Eye, Trash2, AlertTriangle, X, Check, ShieldCheck, Activity, Droplets, Zap, Flame, BarChart3, ClipboardPen, Link2, Image, ChevronRight, TrendingUp, BookOpen, Phone, Mail, Maximize2, Accessibility, ArrowUpDown, Bike, Wifi, WashingMachine, BookOpen as BookOpenIcon, Tv2, FlaskConical, Grid2x2 as Grid2X2, ChevronLeft, ChevronDown } from 'lucide-react';
import photoMainLogement from '../assets/Photo-Principale-Logement_CROUS_LYON-Cavalier.jpg';
import plan108           from '../assets/Plan-Logement-108.png';
import planEvac          from '../assets/Plan-Evac-Exemple.png';
import cartoCavalier     from '../assets/Cartouche-Carto-OpenStreetMap-Residence-Jacques-Cavalier.png';
import photoSignalement  from '../assets/Plaques-Cuisson-Elec-Dernier-Signalement.png';
import photoCampusManufacture from '../assets/Photo-Campus-Manufacture-by-night.png';
import planCampusManufacture  from '../assets/Plan-Campus-Manufacture.png';
import localisationManufacture from '../assets/Localisation-RU-Manu-Tabacs copy copy.png';
import photoCampusCentreLyon6  from '../assets/Photo-Campus_Centre-Lyon_6.png';
import planCampusCentreLyon6   from '../assets/Plan-Campus_Centre-Lyon_6.png';
import localisationLyon6       from '../assets/Localisation-Lyon-6-OSM.png';
import photoRestoU    from '../assets/Photo-Resto-U-Manu.png';
import planRestoU     from '../assets/Plan-Resto-U.png';
import localisationRestoU from '../assets/Localisation-RU-Manu-Tabacs.png';
const photoJacquesCavalier = new URL('../assets/Photo-Résidence_Jacques_Cavalier.png', import.meta.url).href;
const photo1erEtage = new URL('../assets/Photo-1er-étage-Jacques-Cavalier.png', import.meta.url).href;
import planJacquesCavalier  from '../assets/Plan-Jacques-Cavalier.png';
import OccupantsTableau      from './OccupantsTableau';
import EquipementsTableau, { buildMockEquipements } from './EquipementsTableau';
import FicheEquipement, { EquipementFiche } from './FicheEquipement';
import InterventionsTableau, { Intervention as IntervRow } from './InterventionsTableau';
import ConsommationsTableau, { buildMockRelevesSite } from './ConsommationsTableau';
import ControlesOnglet from './ControlesOnglet';
import DocumentsArborescence from './DocumentsArborescence';
import ContratsTableau from './ContratsTableau';
import OngletFinanceBatiment from './finance/OngletFinanceBatiment';
import QRCodeButton from './QRCodeButton';
import MaintenancePreventive from './MaintenancePreventive';
import FichePiece from './FichePiece';
import ModifierSiteModal from './ModifierSiteModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | 'details'
  | 'occupants'
  | 'controles'
  | 'renouvellement'
  | 'carnet'
  | 'consommations'
  | 'etat_lieux'
  | 'liaison_bns'
  | 'interventions'
  | 'documents'
  | 'contrats'
  | 'equipements'
  | 'finance'
  | 'maintenance';

// Bâtiment / Étage — tous les onglets
const TAB_LABELS: { id: Tab; label: string; icon: React.ElementType; priority?: 'high' }[] = [
  { id: 'details',        label: 'Détails',                icon: Building2 },
  { id: 'equipements',    label: 'Équipements',             icon: Wrench },
  { id: 'documents',      label: 'Documents',               icon: FileText },
  { id: 'occupants',      label: 'Occupants',               icon: Users },
  { id: 'controles',      label: 'Contrôles régl.',         icon: ShieldCheck,  priority: 'high' },
  { id: 'contrats',       label: 'Contrats',                icon: ClipboardList },
  { id: 'maintenance',    label: 'Maintenance préventive',  icon: ShieldCheck,  priority: 'high' },
  { id: 'renouvellement', label: 'Renouvellement',          icon: TrendingUp,   priority: 'high' },
  { id: 'carnet',         label: 'Carnet de santé',         icon: BookOpen,     priority: 'high' },
  { id: 'consommations',  label: 'Consommations',           icon: BarChart3 },
  { id: 'etat_lieux',     label: 'État des lieux',          icon: ClipboardPen, priority: 'high' },
  { id: 'liaison_bns',    label: 'Liaison BNS',             icon: Link2,        priority: 'high' },
  { id: 'interventions',  label: 'Interventions',           icon: ClipboardList },
  { id: 'finance',        label: 'Finances',                icon: Euro },
];

// Site (campus) / Résidence — sans État des lieux, Renouvellement, Liaison BNS
const TAB_LABELS_SITE_RESIDENCE: { id: Tab; label: string; icon: React.ElementType; priority?: 'high' }[] = [
  { id: 'details',       label: 'Détails',                 icon: Building2 },
  { id: 'occupants',     label: 'Occupants',                icon: Users },
  { id: 'controles',     label: 'Contrôles régl.',          icon: ShieldCheck,  priority: 'high' },
  { id: 'contrats',      label: 'Contrats',                 icon: ClipboardList },
  { id: 'maintenance',   label: 'Maintenance préventive',   icon: ShieldCheck,  priority: 'high' },
  { id: 'carnet',        label: 'Carnet de santé',          icon: BookOpen,     priority: 'high' },
  { id: 'consommations', label: 'Consommations',            icon: BarChart3 },
  { id: 'interventions', label: 'Interventions',            icon: ClipboardList },
  { id: 'documents',     label: 'Documents',                icon: FileText },
  { id: 'equipements',   label: 'Équipements',              icon: Wrench },
  { id: 'finance',       label: 'Finances',                 icon: Euro },
];

const TAB_LABELS_LOGEMENT: { id: Tab; label: string; icon: React.ElementType; priority?: 'high' }[] = [
  { id: 'details',        label: 'Détails',             icon: Building2 },
  { id: 'equipements',    label: 'Équipements',         icon: Wrench },
  { id: 'occupants',      label: 'Occupants',           icon: Users },
  { id: 'etat_lieux',     label: 'État des lieux',      icon: ClipboardPen, priority: 'high' },
  { id: 'consommations',  label: 'Consommations',       icon: BarChart3 },
  { id: 'interventions',  label: 'Interventions',       icon: ClipboardList },
  { id: 'controles',      label: 'Contrôles',           icon: ShieldCheck,  priority: 'high' },
  { id: 'contrats',       label: 'Contrats',            icon: ClipboardList },
  { id: 'documents',      label: 'Documents',           icon: FileText },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function formatCurrency(n?: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

/**
 * Génère un code court : 1ère lettre du nom (maj) + 4 premiers chiffres de l'UUID.
 * Ex : "Laboratoire Nord" + uuid "9950-..." → "L9950"
 */
function buildCodeCourt(nom: string, id: string): string {
  const letter = nom.trim()[0]?.toUpperCase() ?? 'X';
  const digits  = id.replace(/-/g, '').replace(/\D/g, '').slice(0, 4);
  return `${letter}${digits}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 min-w-0">{value ?? '—'}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-5 mb-1 first:mt-0">{children}</h3>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <FileText className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Responsabilité technique (multi-select) ─────────────────────────────────

const RESPONSABILITE_TECHNIQUE_OPTIONS = [
  'Direction Générale Adjointe Aménagement, Cadre de Vie et Transitions',
  'Direction du Patrimoine (DPE)',
  "Direction de l'Ecologie Urbaine (DEU)",
  'Direction Gestion des Risques',
  'Direction Logistique et Achats',
  "Direction de la Voirie et de l'Usage",
  'Direction Mutualisée des Ressources',
  "Direction Autonomie, Inclusion de l'espace public",
  'Direction mutualisée du Droit des Sols',
  'Pôle Attractivité - Action Cœur de Ville',
  'Pôle Coordination',
  'Pôle Transitions et Développement Durable',
];

function ResponsabiliteTechniqueField({ siteId }: { siteId: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('site_id', siteId)
        .eq('key', 'responsabilite_technique')
        .maybeSingle();
      if (!cancelled && !error && data?.value) {
        try { setSelected(JSON.parse(data.value)); } catch { /* ignore */ }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [siteId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (opt: string) => {
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt]
    );
  };

  const persist = async (next: string[]) => {
    setSaving(true);
    await supabase
      .from('site_meta')
      .upsert(
        { site_id: siteId, key: 'responsabilite_technique', value: JSON.stringify(next) },
        { onConflict: 'site_id,key' }
      );
    setSaving(false);
  };

  const handleToggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter(v => v !== opt)
      : [...selected, opt];
    setSelected(next);
    persist(next);
  };

  return (
    <>
      <SectionTitle>Responsabilité technique</SectionTitle>
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          disabled={loading}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors disabled:opacity-50"
        >
          <span className={selected.length > 0 ? 'text-slate-800' : 'text-slate-400'}>
            {loading
              ? 'Chargement…'
              : selected.length > 0
                ? `${selected.length} direction${selected.length > 1 ? 's' : ''} / pôle${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}`
                : 'Sélectionner les directions / pôles responsables'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {selected.length > 0 && !open && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selected.map(s => (
              <span key={s} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                {s}
              </span>
            ))}
          </div>
        )}

        {open && (
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {RESPONSABILITE_TECHNIQUE_OPTIONS.map(opt => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(opt)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 leading-tight">{opt}</span>
                </label>
              );
            })}
            <div className="sticky bottom-0 bg-white px-3 py-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {saving ? 'Enregistrement…' : `${selected.length} sélectionnée${selected.length > 1 ? 's' : ''}`}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function getMockControles() {
  return [
    { id: '1', type: 'Électricité', organisme: 'Bureau Veritas', statut: 'conforme',     date: '2025-11-14', echeance: '2026-11-14', reserve: false },
    { id: '2', type: 'Ascenseurs',  organisme: 'APAVE',          statut: 'non_conforme', date: '2025-09-03', echeance: '2026-03-03', reserve: true  },
    { id: '3', type: 'Gaz',         organisme: 'SOCOTEC',        statut: 'a_venir',      date: null,         echeance: '2026-07-01', reserve: false },
    { id: '4', type: 'Incendie',    organisme: 'Alpes Contrôles',statut: 'conforme',     date: '2025-12-01', echeance: '2026-12-01', reserve: false },
  ];
}


function getMockEtatLieux() {
  return [
    { id: '1', logement: 'Logement 101', type: 'Entrée', date: '2025-09-01', agent: 'Martin D.', statut: 'signé'    },
    { id: '2', logement: 'Logement 203', type: 'Sortie', date: '2025-06-30', agent: 'Leroy P.',  statut: 'signé'    },
    { id: '3', logement: 'Logement 305', type: 'Entrée', date: '2025-09-02', agent: 'Martin D.', statut: 'en_cours' },
  ];
}

function getMockBNS(nom: string) {
  const slug = nom.slice(0, 3).toUpperCase();
  return {
    id_bns:           `BNS-LYO-${slug}-042`,
    derniere_sync:    '2026-05-22T08:47:00',
    referent_bns:     'Sophie Lambert',
    contact_bns:      'sophie.lambert@crous-lyon.fr',
    code_osis:        `OSIS-${slug}-042`,
    nb_places_bns:    142,
    nb_places_naofix: 139,
    ecart:            3,
  };
}

// ─── Contrôle statut badge ────────────────────────────────────────────────────

function ControleStatut({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    conforme:     { label: 'Conforme',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    non_conforme: { label: 'Non conforme', cls: 'bg-red-50 text-red-700 border-red-200'             },
    a_venir:      { label: 'À venir',      cls: 'bg-blue-50 text-blue-700 border-blue-200'          },
    en_attente:   { label: 'En attente',   cls: 'bg-amber-50 text-amber-700 border-amber-200'       },
  };
  const cfg = map[statut] ?? { label: statut, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Tab components ───────────────────────────────────────────────────────────

function TabControles() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ControlesOnglet hideLocalisation />
    </div>
  );
}

function TabRenouvellement() {
  const items = [
    { nom: 'Chaudière collective',         categorie: 'Chauffage',   fin_vie: 2027, cout: 42000, priorite: 'haute'   },
    { nom: 'Tableau électrique principal', categorie: 'Électricité', fin_vie: 2029, cout: 18500, priorite: 'moyenne' },
    { nom: 'Ascenseur bât. A',             categorie: 'Ascenseurs',  fin_vie: 2031, cout: 75000, priorite: 'basse'   },
  ];
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-slate-500 mb-3">Programme pluriannuel de renouvellement des équipements.</p>
      {items.map((item, i) => {
        const vetustePercent = Math.min(100, Math.round(((2026 - (item.fin_vie - 20)) / 20) * 100));
        return (
          <div key={i} className="p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-medium text-sm text-slate-800">{item.nom}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0
                ${item.priorite === 'haute'   ? 'bg-red-50 text-red-700 border-red-200'
                : item.priorite === 'moyenne'  ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {item.priorite.charAt(0).toUpperCase() + item.priorite.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2.5 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {item.categorie}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Fin de vie : <span className="font-medium text-slate-700 ml-0.5">{item.fin_vie}</span></span>
              <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> {formatCurrency(item.cout)}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                <span>Vétusté</span><span>{vetustePercent}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.priorite === 'haute' ? 'bg-red-400' : item.priorite === 'moyenne' ? 'bg-amber-400' : 'bg-slate-300'}`}
                  style={{ width: `${vetustePercent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabCarnet() {
  const entries = [
    { date: '2026-03-15', auteur: 'Martin D.', titre: 'Inspection toiture',      note: 'Infiltrations détectées côté Nord. Bâche provisoire posée. Devis en cours.',   niveau: 'alerte'       },
    { date: '2025-11-20', auteur: 'Leroy P.',  titre: 'Vérification chaufferie', note: 'RAS. Chaudière en bon état.',                                                     niveau: 'ok'           },
    { date: '2025-09-05', auteur: 'Martin D.', titre: 'État façades',            note: 'Fissures superficielles sur façade Est. Surveillance recommandée.',               niveau: 'avertissement' },
  ];
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Historique de l'état général du patrimoine.</p>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> Nouvelle entrée
        </button>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
              ${e.niveau === 'alerte' ? 'bg-red-500' : e.niveau === 'avertissement' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-sm text-slate-800">{e.titre}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(e.date)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{e.note}</p>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                <User className="w-3 h-3" /> {e.auteur}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabConsommations() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ConsommationsTableau releves={buildMockRelevesSite()} />
    </div>
  );
}

function TabEtatLieux() {
  const items = getMockEtatLieux();
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{items.length} état(s) des lieux enregistré(s)</p>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          <ClipboardPen className="w-3.5 h-3.5" /> Nouveau EDL
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mb-1">
        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-amber-50 text-amber-700 border-amber-200">2 logements indisponibles</span>
        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-blue-50 text-blue-700 border-blue-200">1 EDL en cours</span>
      </div>
      {items.map(item => (
        <div key={item.id} className="p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="font-medium text-sm text-slate-800">{item.logement}</span>
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${item.type === 'Entrée' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.type}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${item.statut === 'signé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {item.statut === 'signé' ? 'Signé' : 'En cours'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(item.date)}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.agent}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabLiaisonBNS({ nom }: { nom: string }) {
  const bns = getMockBNS(nom);
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-700">Synchronisé avec BNS</p>
          <p className="text-xs text-emerald-600">Dernière sync : {new Date(bns.derniere_sync).toLocaleString('fr-FR')}</p>
        </div>
        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0">
          Sync manuelle
        </button>
      </div>
      <SectionTitle>Identifiants BNS</SectionTitle>
      <div className="space-y-0">
        <DetailRow label="ID BNS"    value={<span className="font-mono">{bns.id_bns}</span>} />
        <DetailRow label="Code OSIS" value={<span className="font-mono">{bns.code_osis}</span>} />
      </div>
      <SectionTitle>Données BNS</SectionTitle>
      <div className="space-y-0">
        <DetailRow label="Places BNS"    value={bns.nb_places_bns} />
        <DetailRow label="Places Naofix" value={bns.nb_places_naofix} />
        <DetailRow label="Écart"         value={
          <span className={`font-semibold ${bns.ecart !== 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {bns.ecart > 0 ? `+${bns.ecart}` : bns.ecart}
          </span>
        } />
      </div>
      <SectionTitle>Contact référent BNS</SectionTitle>
      <div className="space-y-0">
        <DetailRow label="Référent" value={
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {bns.referent_bns}</span>
        } />
        <DetailRow label="Email" value={
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <a href={`mailto:${bns.contact_bns}`} className="text-blue-600 hover:underline">{bns.contact_bns}</a>
          </span>
        } />
      </div>
    </div>
  );
}

// ─── SVG Floor Plan Placeholder ──────────────────────────────────────────────

function FloorPlanSVG() {
  return (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="160" fill="#f8f9fa" />
      {/* Couloir principal */}
      <rect x="5" y="5" width="190" height="150" fill="none" stroke="#adb5bd" strokeWidth="2.5" />
      {/* Cloison verticale */}
      <line x1="120" y1="5" x2="120" y2="100" stroke="#adb5bd" strokeWidth="1.5" />
      {/* Cloison horizontale */}
      <line x1="5" y1="100" x2="120" y2="100" stroke="#adb5bd" strokeWidth="1.5" />
      {/* Porte couloir */}
      <path d="M50,100 A18,18 0 0,1 68,100" fill="none" stroke="#6c757d" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="50" y1="100" x2="50" y2="82" stroke="#6c757d" strokeWidth="1" />
      {/* Porte entrée */}
      <path d="M5,75 A18,18 0 0,0 5,57" fill="none" stroke="#6c757d" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="5" y1="75" x2="23" y2="75" stroke="#6c757d" strokeWidth="1" />
      {/* Fenêtre chambre */}
      <rect x="120" y="5" width="40" height="4" fill="#74c0fc" />
      {/* Fenêtre séjour */}
      <rect x="5" y="100" width="4" height="30" fill="#74c0fc" />
      {/* Lit */}
      <rect x="130" y="20" width="45" height="25" rx="2" fill="#dee2e6" stroke="#adb5bd" strokeWidth="1" />
      <rect x="130" y="20" width="45" height="6" rx="2" fill="#ced4da" />
      {/* Bureau */}
      <rect x="130" y="70" width="35" height="15" rx="1" fill="#dee2e6" stroke="#adb5bd" strokeWidth="1" />
      {/* Salle de bain */}
      <rect x="15" y="110" width="30" height="35" rx="2" fill="#e7f5ff" stroke="#adb5bd" strokeWidth="1" />
      <ellipse cx="30" cy="130" rx="10" ry="7" fill="#a5d8ff" stroke="#74c0fc" strokeWidth="1" />
      {/* Cuisine */}
      <rect x="60" y="110" width="50" height="15" rx="1" fill="#fff3bf" stroke="#adb5bd" strokeWidth="1" />
      {/* Labels */}
      <text x="62" y="65" fontSize="8" fill="#495057" fontFamily="sans-serif" fontWeight="600">Chambre</text>
      <text x="25" y="55" fontSize="7" fill="#6c757d" fontFamily="sans-serif">Séjour</text>
      <text x="16" y="121" fontSize="5.5" fill="#495057" fontFamily="sans-serif">SDB</text>
      <text x="63" y="121" fontSize="5.5" fill="#495057" fontFamily="sans-serif">Cuisine</text>
      {/* Boussole */}
      <text x="172" y="148" fontSize="7" fill="#adb5bd" fontFamily="sans-serif">N↑</text>
      {/* Échelle */}
      <line x1="10" y1="152" x2="40" y2="152" stroke="#adb5bd" strokeWidth="1" />
      <text x="12" y="158" fontSize="5" fill="#adb5bd" fontFamily="sans-serif">2 m</text>
    </svg>
  );
}

// ─── Logement Gallery (Airbnb-style) ─────────────────────────────────────────

interface GalleryPhoto { src: string; alt: string; type: 'photo' | 'plan' | 'plan_etage' | 'occupant' | 'signalement'; label?: string; }

function GalleryModal({ photos, initialIndex, onClose }: { photos: GalleryPhoto[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  const photo = photos[idx];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, photos.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
          <X className="w-5 h-5" /> Fermer
        </button>
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ maxHeight: '80vh' }}>
          <img src={photo.src} alt={photo.alt} className="w-full object-contain" style={{ maxHeight: '70vh' }} />
          {photo.label && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-sm text-white font-medium">{photo.label}</p>
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
            <button onClick={() => setIdx(i => (i + 1) % photos.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Campus Centre / Lyon 6 gallery ──────────────────────────────────────────

function CampusCentreLyon6Gallery() {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const allPhotos: GalleryPhoto[] = [
    { src: photoCampusCentreLyon6, alt: 'Campus Centre / Lyon 6',              type: 'photo', label: 'Campus Centre / Lyon 6' },
    { src: planCampusCentreLyon6,  alt: 'Plan du Campus Centre / Lyon 6',      type: 'plan',  label: 'Plan — Campus Centre / Lyon 6' },
    { src: localisationLyon6,      alt: 'Localisation — Campus Centre Lyon 6', type: 'plan',  label: 'Localisation — Campus Centre / Lyon 6' },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex gap-1.5" style={{ height: 240 }}>
        {/* Photo principale — moitié gauche */}
        <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal([allPhotos[0]], 0)}>
          <img src={photoCampusCentreLyon6} alt="Campus Centre / Lyon 6"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
            <Grid2X2 className="w-3.5 h-3.5" />
            Afficher toutes les photos
          </button>
        </div>

        {/* 2 vignettes — moitié droite */}
        <div className="flex gap-1.5 w-1/2 flex-shrink-0">

          {/* Plan campus */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[1]], 0)}>
            <img src={planCampusCentreLyon6} alt="Plan du Campus Centre / Lyon 6"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[1]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan campus
            </button>
          </div>

          {/* Localisation */}
          <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
            onClick={() => openModal([allPhotos[2]], 0)}>
            <img src={localisationLyon6} alt="Localisation — Campus Centre Lyon 6"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[2]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              Localisation
            </button>
          </div>

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── Campus gallery (Campus de la Manufacture des Tabacs) ────────────────────

function CampusManufactureGallery() {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const allPhotos: GalleryPhoto[] = [
    { src: photoCampusManufacture,  alt: 'Campus de la Manufacture des Tabacs — nuit', type: 'photo', label: 'Campus de la Manufacture des Tabacs' },
    { src: planCampusManufacture,   alt: 'Plan du campus',                              type: 'plan',  label: 'Plan du campus — Manufacture des Tabacs' },
    { src: localisationManufacture, alt: 'Localisation — Campus Manufacture',           type: 'plan',  label: 'Localisation — Campus Manufacture des Tabacs' },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex gap-1.5" style={{ height: 240 }}>
        {/* Photo principale — moitié gauche */}
        <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal([allPhotos[0]], 0)}>
          <img src={photoCampusManufacture} alt="Campus de la Manufacture des Tabacs"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm hover:bg-black/60 px-3 py-1.5 rounded-lg border border-white/20 shadow-sm transition-colors">
            <Grid2X2 className="w-3.5 h-3.5" />
            Afficher toutes les photos
          </button>
        </div>

        {/* 2 vignettes — moitié droite */}
        <div className="flex gap-1.5 w-1/2 flex-shrink-0">

          {/* Plan campus */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[1]], 0)}>
            <img src={planCampusManufacture} alt="Plan du campus"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[1]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan campus
            </button>
          </div>

          {/* Localisation */}
          <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
            onClick={() => openModal([allPhotos[2]], 0)}>
            <img src={localisationManufacture} alt="Localisation — Campus Manufacture"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[2]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              Localisation
            </button>
          </div>

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── Resto'U Manufacture gallery ─────────────────────────────────────────────

function RestoUManufactureGallery() {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const allPhotos: GalleryPhoto[] = [
    { src: photoRestoU,         alt: "Resto'U Manufacture des Tabacs — salle de restauration", type: 'photo', label: "Resto'U Manufacture des Tabacs" },
    { src: planRestoU,          alt: 'Plan du Resto\'U',                                        type: 'plan',  label: "Plan — Resto'U Manufacture des Tabacs" },
    { src: localisationRestoU,  alt: 'Localisation — Resto\'U Manufacture',                    type: 'plan',  label: "Localisation — Resto'U Manufacture des Tabacs" },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex gap-1.5" style={{ height: 240 }}>
        {/* Photo principale — moitié gauche */}
        <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal([allPhotos[0]], 0)}>
          <img src={photoRestoU} alt="Resto'U Manufacture des Tabacs"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm hover:bg-black/60 px-3 py-1.5 rounded-lg border border-white/20 shadow-sm transition-colors">
            <Grid2X2 className="w-3.5 h-3.5" />
            Afficher toutes les photos
          </button>
        </div>

        {/* 2 vignettes — moitié droite */}
        <div className="flex gap-1.5 w-1/2 flex-shrink-0">

          {/* Plan Resto'U */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[1]], 0)}>
            <img src={planRestoU} alt="Plan du Resto'U"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[1]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan Resto'U
            </button>
          </div>

          {/* Localisation */}
          <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
            onClick={() => openModal([allPhotos[2]], 0)}>
            <img src={localisationRestoU} alt="Localisation — Resto'U Manufacture"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[2]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              Localisation
            </button>
          </div>

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── Résidence Jacques Cavalier gallery ──────────────────────────────────────

function JacquesCavalierGallery() {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const allPhotos: GalleryPhoto[] = [
    { src: photoJacquesCavalier,  alt: 'Résidence Jacques Cavalier — façade', type: 'photo', label: 'Résidence Jacques Cavalier' },
    { src: planJacquesCavalier,   alt: 'Plan de la résidence — Rez-de-chaussée', type: 'plan', label: 'Plan — Résidence Jacques Cavalier — RdC' },
    { src: cartoCavalier,         alt: 'Localisation — Résidence Jacques Cavalier', type: 'plan', label: 'Localisation — Résidence Jacques Cavalier' },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex gap-1.5" style={{ height: 240 }}>
        {/* Photo principale — moitié gauche */}
        <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal([allPhotos[0]], 0)}>
          <img src={photoJacquesCavalier} alt="Résidence Jacques Cavalier"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
            <Grid2X2 className="w-3.5 h-3.5" />
            Afficher toutes les photos
          </button>
        </div>

        {/* 2 vignettes — moitié droite */}
        <div className="flex gap-1.5 w-1/2 flex-shrink-0">

          {/* Plan résidence */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[1]], 0)}>
            <img src={planJacquesCavalier} alt="Plan de la résidence"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[1]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan résidence
            </button>
          </div>

          {/* Localisation */}
          <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
            onClick={() => openModal([allPhotos[2]], 0)}>
            <img src={cartoCavalier} alt="Localisation — Résidence Jacques Cavalier"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[2]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              Localisation
            </button>
          </div>

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── École Angèle Vannier — Saint-Malo gallery ───────────────────────────────

const photoAngeleVannier = '/images/site/Ecole-Angele-Vannier/Ecole-Angele-Vannier_Saint-Malo.png';

function AngeleVannierGallery() {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const allPhotos: GalleryPhoto[] = [
    { src: photoAngeleVannier, alt: 'École élémentaire publique Angèle Vannier — Saint-Malo', type: 'photo', label: 'École Angèle Vannier — Saint-Malo' },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl cursor-pointer group" style={{ height: 240 }}
        onClick={() => openModal(allPhotos, 0)}>
        <img src={photoAngeleVannier} alt="École élémentaire publique Angèle Vannier — Saint-Malo"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
        <button
          onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
          Agrandir la photo
        </button>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── 1er étage — Résidence Jacques Cavalier gallery ──────────────────────────

function EtageCavalierGallery() {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const allPhotos: GalleryPhoto[] = [
    { src: photo1erEtage,       alt: '1er étage — Résidence Jacques Cavalier', type: 'photo', label: '1er étage — Résidence Jacques Cavalier' },
    { src: planJacquesCavalier, alt: 'Plan du 1er étage',                      type: 'plan',  label: 'Plan — 1er étage — Résidence Jacques Cavalier' },
    { src: cartoCavalier,       alt: 'Localisation — Résidence Jacques Cavalier', type: 'plan', label: 'Localisation — Résidence Jacques Cavalier' },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex gap-1.5" style={{ height: 240 }}>
        {/* Photo principale — moitié gauche */}
        <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal([allPhotos[0]], 0)}>
          <img src={photo1erEtage} alt="1er étage — Résidence Jacques Cavalier"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
            <Grid2X2 className="w-3.5 h-3.5" />
            Afficher toutes les photos
          </button>
        </div>

        {/* 2 vignettes — moitié droite */}
        <div className="flex gap-1.5 w-1/2 flex-shrink-0">

          {/* Plan étage */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[1]], 0)}>
            <img src={planJacquesCavalier} alt="Plan du 1er étage"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[1]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan étage
            </button>
          </div>

          {/* Localisation */}
          <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
            onClick={() => openModal([allPhotos[2]], 0)}>
            <img src={cartoCavalier} alt="Localisation — Résidence Jacques Cavalier"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[2]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              Localisation
            </button>
          </div>

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── Logement gallery ─────────────────────────────────────────────────────────

function LogementGallery({ data }: { data: Record<string, string | number | boolean | null | undefined> }) {
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPhotos, setModalPhotos] = useState<GalleryPhoto[]>([]);
  const [modalIdx,    setModalIdx]    = useState(0);

  const occupantUrl = (data.photo_occupant_url as string | undefined) ||
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1';
  const occupantName = [data.prenom_occupant, data.nom_occupant].filter(Boolean).map(String).join(' ') || 'Occupant';
  const dateEntree   = data.date_entree_occupant ? formatDate(String(data.date_entree_occupant)) : null;

  const allPhotos: GalleryPhoto[] = [
    { src: photoMainLogement, alt: 'Vue principale du logement', type: 'photo', label: 'Vue principale du logement' },
    { src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Coin cuisine', type: 'photo', label: 'Coin cuisine' },
    { src: 'https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Salle de bain', type: 'photo', label: 'Salle de bain' },
    { src: plan108, alt: 'Plan du logement', type: 'plan', label: 'Plan du logement — Chambre Type a 10m²' },
    { src: planEvac, alt: "Plan étage — 1er étage", type: 'plan', label: "Plan étage — Rez-de-chaussée" },
    { src: occupantUrl, alt: occupantName, type: 'occupant', label: occupantName },
    { src: photoSignalement, alt: 'Dernier signalement : Plaque de cuisson défaillante', type: 'signalement', label: 'Dernier signalement — Plaque de cuisson défaillante' },
  ];

  function openModal(photos: GalleryPhoto[], startIdx: number) {
    setModalPhotos(photos);
    setModalIdx(startIdx);
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex gap-1.5" style={{ height: 240 }}>
        {/* Photo principale — moitié gauche */}
        <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal(allPhotos.filter(p => p.type === 'photo'), 0)}>
          <img src={photoMainLogement} alt="Vue principale"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {/* Bouton "Afficher toutes les photos" */}
          <button
            onClick={e => { e.stopPropagation(); openModal(allPhotos, 0); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
            <Grid2X2 className="w-3.5 h-3.5" />
            Afficher toutes les photos
          </button>
        </div>

        {/* 3 vignettes — moitié droite, chacune pleine hauteur sur 1/3 de largeur */}
        <div className="flex gap-1.5 w-1/2 flex-shrink-0">

          {/* Plan du logement */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[3]], 0)}>
            <img src={plan108} alt="Plan du logement"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[3]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan logement
            </button>
          </div>

          {/* Plan étage */}
          <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
            onClick={() => openModal([allPhotos[4]], 0)}>
            <img src={planEvac} alt="Plan étage"
              className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => { e.stopPropagation(); openModal([allPhotos[4]], 0); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <Maximize2 className="w-3 h-3" />
              Plan étage
            </button>
          </div>

          {/* Localisation — image cartographique */}
          <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
            onClick={() => window.open('https://www.openstreetmap.org/?mlat=45.7472&mlon=4.8612&zoom=17', '_blank')}>
            <img src={cartoCavalier} alt="Localisation — Résidence Jacques Cavalier"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
              onClick={e => {
                e.stopPropagation();
                window.open('https://www.openstreetmap.org/?mlat=45.7472&mlon=4.8612&zoom=17', '_blank');
              }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              Localisation
            </button>
          </div>

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// ─── Services logement ────────────────────────────────────────────────────────

interface Service { id: string; label: string; actif: boolean; }

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  pmr:           <Accessibility className="w-4 h-4" />,
  ascenseur:     <ArrowUpDown   className="w-4 h-4" />,
  protections:   <FlaskConical  className="w-4 h-4" />,
  velos:         <Bike          className="w-4 h-4" />,
  wifi:          <Wifi          className="w-4 h-4" />,
  laverie:       <WashingMachine className="w-4 h-4" />,
  salle_travail: <BookOpenIcon  className="w-4 h-4" />,
  salle_tv:      <Tv2           className="w-4 h-4" />,
};

const DEFAULT_SERVICES: Service[] = [
  { id: 'pmr',           label: 'Accessible PMR',                    actif: false },
  { id: 'ascenseur',     label: 'Ascenseur',                          actif: false },
  { id: 'protections',   label: 'Distribution protections périodiques', actif: false },
  { id: 'velos',         label: 'Garage à vélos',                    actif: false },
  { id: 'wifi',          label: 'Internet / Wifi',                   actif: false },
  { id: 'laverie',       label: 'Laverie',                            actif: false },
  { id: 'salle_travail', label: 'Salle de travail',                  actif: false },
  { id: 'salle_tv',      label: 'Salle TV',                          actif: false },
];

function ServicesLogement({ services }: { services: Service[] }) {
  const merged = DEFAULT_SERVICES.map(def => {
    const stored = services.find(s => s.id === def.id);
    return stored ?? def;
  });

  return (
    <div className="mt-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Services</h3>
      <div className="grid grid-cols-3 gap-y-2 gap-x-3">
        {merged.map(service => (
          <div key={service.id} className="flex items-center gap-2 text-xs font-medium text-slate-800">
            <span className="text-slate-800 flex-shrink-0">
              {SERVICE_ICONS[service.id] ?? <Check className="w-4 h-4" />}
            </span>
            <span className="leading-tight">{service.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Maintenance cost field (calculated from interventions) ────────────────
function MaintenanceCostField({ node }: { node: TreeNode }) {
  const [cost, setCost] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = node.data as Record<string, unknown>;
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      let batimentIds: string[] = [];
      if (node.type === 'batiment') {
        batimentIds = [node.id];
      } else if (node.type === 'site') {
        const { data: residences } = await supabase.from('residences').select('id').eq('site_id', node.id);
        for (const res of (residences ?? [])) {
          const { data: bats } = await supabase.from('batiments').select('id').eq('residence_id', res.id);
          batimentIds.push(...(bats ?? []).map(b => b.id));
        }
      } else if (node.type === 'residence') {
        const { data: bats } = await supabase.from('batiments').select('id').eq('residence_id', node.id);
        batimentIds = (bats ?? []).map(b => b.id);
      }

      if (batimentIds.length === 0) { if (!cancelled) { setCost(0); setCount(0); setLoading(false); } return; }

      const { data: interventions, error } = await supabase
        .from('interventions')
        .select('cout, date_planifiee')
        .in('batiment_id', batimentIds)
        .gte('date_planifiee', threeYearsAgo.toISOString());

      if (cancelled) return;
      if (!error && interventions) {
        const validInterventions = interventions.filter(i => i.cout != null);
        const total = validInterventions.reduce((sum, i) => sum + Number(i.cout), 0);
        setCost(total);
        setCount(validInterventions.length);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [node]);

  if (loading) {
    return (
      <>
        <SectionTitle>Coût de maintenance (3 dernières années)</SectionTitle>
        <div className="text-sm text-slate-400 py-2">Calcul en cours…</div>
      </>
    );
  }

  return (
    <>
      <SectionTitle>Coût de maintenance (3 dernières années)</SectionTitle>
      <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total calculé</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">
            {cost != null ? `${cost.toLocaleString('fr-FR')} €` : '—'}
          </span>
          <span className="text-[10px] text-slate-400">({count} intervention{count > 1 ? 's' : ''})</span>
        </div>
      </div>
    </>
  );
}

export default function FicheDetail() {
  const { selectedNode, setSelectedNode } = usePatrimoineStore();
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [savingStatut, setSavingStatut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!selectedNode) return;
    setActiveTab('details');
    setEditing(false);

    const id   = selectedNode.id;
    const type = selectedNode.type;

    const batimentId = type === 'batiment' ? id : undefined;
    const siteId     = type === 'site'     ? id : undefined;

    if (batimentId) {
      supabase.from('interventions').select('*').eq('batiment_id', batimentId).order('created_at', { ascending: false }).then(({ data }) => setInterventions(data || []));
      supabase.from('documents').select('*').eq('batiment_id', batimentId).order('created_at', { ascending: false }).then(({ data }) => setDocuments(data || []));
      supabase.from('contrats').select('*').eq('batiment_id', batimentId).order('created_at', { ascending: false }).then(({ data }) => setContrats(data || []));
      supabase.from('equipements').select('*').eq('batiment_id', batimentId).order('designation').then(({ data }) => setEquipements(data || []));
    } else if (type === 'logement') {
      supabase.from('equipements').select('*').eq('logement_id', id).order('designation').then(({ data }) => setEquipements(data || []));
      setInterventions([]); setDocuments([]); setContrats([]);
    } else if (siteId) {
      supabase.from('interventions').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).then(({ data }) => setInterventions(data || []));
      supabase.from('documents').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).then(({ data }) => setDocuments(data || []));
      supabase.from('contrats').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).then(({ data }) => setContrats(data || []));
    } else {
      setInterventions([]); setDocuments([]); setContrats([]); setEquipements([]);
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <Building2 className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm font-medium">Sélectionnez un élément</p>
        <p className="text-xs mt-1">Cliquez sur un nœud dans l'arborescence</p>
      </div>
    );
  }

  // equipement → full fiche panel
  if (selectedNode.type === 'equipement') {
    const eq = selectedNode.data as EquipementFiche;
    return (
      <FicheEquipement
        eq={{ ...eq, ancestors: (selectedNode.ancestors as { type: string; nom: string; id: string }[] | undefined) ?? [] }}
        onClose={() => setSelectedNode(null)}
      />
    );
  }

  // piece → fiche pièce Limoges
  if (selectedNode.type === 'piece') {
    return <FichePiece node={selectedNode as Parameters<typeof FichePiece>[0]['node']} />;
  }

  // categorie → empty state
  if (selectedNode.type === 'categorie') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <Building2 className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm font-medium">Sélectionnez un élément</p>
        <p className="text-xs mt-1">Cliquez sur un nœud dans l'arborescence</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (selectedNode.data as any) as Record<string, string | number | boolean | null | undefined>;

  const typeIconMap: Record<string, React.ReactNode> = {
    site:      <MapPin    className="w-5 h-5 text-blue-500"  />,
    residence: <Building2 className="w-5 h-5 text-teal-500" />,
    batiment:  <Layers    className="w-5 h-5 text-slate-500" />,
    etage:     <Layers    className="w-5 h-5 text-slate-400" />,
    logement:  <Home      className="w-5 h-5 text-slate-400" />,
  };
  const typeIcon  = typeIconMap[selectedNode.type] ?? <Building2 className="w-5 h-5 text-slate-400" />;

  const typeLabelMap: Record<string, string> = {
    site: 'Site', residence: 'Résidence', batiment: 'Bâtiment', etage: 'Étage', logement: 'Logement',
  };
  const typeLabel = typeLabelMap[selectedNode.type] ?? selectedNode.type;

  const handleSave = async () => {
    const tableMap: Record<string, string> = { site: 'sites', residence: 'residences', batiment: 'batiments', etage: 'etages', logement: 'logements' };
    const table = tableMap[selectedNode.type];
    if (!table) return;
    await supabase.from(table).update(editData).eq('id', selectedNode.id);
    setEditing(false);
  };

  const handleStatutChange = async (newStatut: string, raisonIndispo?: string) => {
    const tableMap: Record<string, string> = { site: 'sites', residence: 'residences', batiment: 'batiments', etage: 'etages', logement: 'logements' };
    const table = tableMap[selectedNode.type];
    if (!table) return;
    setSavingStatut(true);
    const patch: Record<string, string | null> = { statut: newStatut };
    if (newStatut === 'indisponible' && raisonIndispo) patch.raison_indisponibilite = raisonIndispo;
    if (newStatut !== 'indisponible') patch.raison_indisponibilite = null;
    await supabase.from(table).update(patch).eq('id', selectedNode.id);
    // Optimistic update on selectedNode
    Object.assign(selectedNode.data as Record<string, unknown>, patch);
    setSavingStatut(false);
  };

  // Code court : 1ère lettre du nom + 4 premiers chiffres de l'UUID
  const codeCourt = buildCodeCourt(selectedNode.nom, selectedNode.id);

  // Ancestors from arborescence context (vrais noms)
  const ancestors = (selectedNode.ancestors as { type: string; nom: string; id: string }[] | undefined) ?? [];

  // Adresse : propre ou héritée du parent
  const adressePropre = [
    data.adresse as string,
    data.ville   as string,
    data.code_postal as string,
  ].filter(Boolean).join(', ');
  const adresseAffichee = adressePropre || (selectedNode.adresse_heritee as string | undefined) || '';

  // Representative photo per type (Pexels)
  const photoMap: Record<string, string> = {
    site:      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    residence: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    batiment:  'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800',
    etage:     'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    logement:  'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
  };
  const photoUrl = photoMap[selectedNode.type];

  const isLogement          = selectedNode.type === 'logement';
  const isSiteOrResidence   = selectedNode.type === 'site' || selectedNode.type === 'residence';
  const isBatiment          = selectedNode.type === 'batiment';
  const isEtage             = selectedNode.type === 'etage';
  // Modal available for all node levels
  const canEditNode         = true;

  const logementInterventions: IntervRow[] = isLogement ? [
    {
      id: 'li-1', categorie: 'reparation', libelle: 'Remplacement plaque de cuisson induction défectueuse',
      assigne_a: 'M. Fabre (Électroménager CROUS)', priorite: 'haute',
      date_prevue: '2026-05-28T09:00:00', duree_estimee_min: 90, recurrente: false,
      date_realisee: null, duree_reelle_min: null,
      cout_total: 320, has_pieces: true, has_photos: true, has_pj: true,
      statut: 'planifiee', demandeur: 'Thomas Leroy', canal: 'my_residence',
    },
    {
      id: 'li-2', categorie: 'entretien', libelle: 'Entretien VMC — nettoyage bouche extraction',
      assigne_a: 'Équipe technique interne', priorite: 'normale',
      date_prevue: '2026-04-15T08:00:00', duree_estimee_min: 20, recurrente: true,
      date_realisee: '2026-04-15T08:25:00', duree_reelle_min: 25,
      cout_total: 0, has_pieces: false, has_photos: false, has_pj: false,
      statut: 'realisee', demandeur: null, canal: null,
    },
    {
      id: 'li-3', categorie: 'reparation', libelle: 'Fuite robinetterie — joint bague lavabo',
      assigne_a: 'M. Girard (Plomberie)', priorite: 'urgente',
      date_prevue: '2026-03-10T10:00:00', duree_estimee_min: 45, recurrente: false,
      date_realisee: '2026-03-10T11:10:00', duree_reelle_min: 70,
      cout_total: 85, has_pieces: true, has_photos: true, has_pj: false,
      statut: 'realisee', demandeur: 'Thomas Leroy', canal: 'my_residence',
    },
    {
      id: 'li-4', categorie: 'action_corrective', libelle: 'Remplacement détecteur fumée non conforme (DTA)',
      assigne_a: null, priorite: 'haute',
      date_prevue: '2026-04-01T09:00:00', duree_estimee_min: 15, recurrente: false,
      date_realisee: null, duree_reelle_min: null,
      cout_total: null, has_pieces: false, has_photos: false, has_pj: true,
      statut: 'en_retard', demandeur: null, canal: null,
    },
    {
      id: 'li-5', categorie: 'reparation', libelle: 'Remplacement poignée de porte d\'entrée',
      assigne_a: 'Agent de maintenance', priorite: 'basse',
      date_prevue: '2026-05-20T14:00:00', duree_estimee_min: 30, recurrente: false,
      date_realisee: '2026-05-20T14:20:00', duree_reelle_min: 20,
      cout_total: 45, has_pieces: true, has_photos: false, has_pj: false,
      statut: 'realisee', demandeur: 'Thomas Leroy', canal: 'telephone',
    },
    {
      id: 'li-6', categorie: 'entretien', libelle: 'Vérification tableau électrique — bilan annuel',
      assigne_a: 'Legrand Maintenance', priorite: 'normale',
      date_prevue: '2026-09-10T14:00:00', duree_estimee_min: 45, recurrente: true,
      date_realisee: null, duree_reelle_min: null,
      cout_total: null, has_pieces: false, has_photos: false, has_pj: false,
      statut: 'en_attente', demandeur: null, canal: null,
    },
    {
      id: 'li-7', categorie: 'reparation', libelle: 'Réparation store vénitien chambre — cordon cassé',
      assigne_a: null, priorite: 'basse',
      date_prevue: '2026-06-05T10:00:00', duree_estimee_min: 20, recurrente: false,
      date_realisee: null, duree_reelle_min: null,
      cout_total: null, has_pieces: false, has_photos: false, has_pj: false,
      statut: 'en_attente', demandeur: 'Thomas Leroy', canal: 'my_residence',
    },
    {
      id: 'li-8', categorie: 'entretien', libelle: 'Désinfection pommeau de douche — légionelle',
      assigne_a: 'Équipe hygiène CROUS', priorite: 'haute',
      date_prevue: '2026-02-20T09:00:00', duree_estimee_min: 15, recurrente: true,
      date_realisee: '2026-02-20T09:10:00', duree_reelle_min: 10,
      cout_total: 0, has_pieces: false, has_photos: false, has_pj: false,
      statut: 'realisee', demandeur: null, canal: null,
    },
  ] : [];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              {typeIcon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{typeLabel}</span>
                <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {codeCourt}
                </span>
              </div>
              <h1 className="text-lg font-semibold text-slate-800 leading-tight">{selectedNode.nom}</h1>

              {/* Fil d'ariane avec vrais noms */}
              {ancestors.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  {ancestors.map((anc, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-slate-400">
                      {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                      <span className="truncate max-w-[120px]" title={anc.nom}>{anc.nom}</span>
                    </span>
                  ))}
                  <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700">{selectedNode.nom}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <StatusBadge status={selectedNode.statut} />
            <QRCodeButton value={codeCourt} label={selectedNode.nom} />
            <button
              onClick={() => {
                setShowEditModal(true);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
            </button>
            <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
            <input
              type="text"
              value={editData.nom || ''}
              onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
              className="flex-1 text-sm px-3 py-1.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Nom"
            />
            <button onClick={handleSave} className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {(isLogement ? TAB_LABELS_LOGEMENT : isSiteOrResidence ? TAB_LABELS_SITE_RESIDENCE : TAB_LABELS).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0
                ${activeTab === tab.id
                  ? tab.priority === 'high' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'interventions' && interventions.length > 0 && (
                <span className="bg-blue-100 text-blue-700 px-1 rounded-full text-xs">{interventions.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`flex-1 min-h-0 flex flex-col ${activeTab === 'consommations' || activeTab === 'controles' || activeTab === 'documents' || activeTab === 'contrats' || activeTab === 'finance' ? 'overflow-hidden' : 'overflow-y-auto'}`}>

        {/* ── Détails ── */}
        {activeTab === 'details' && (
          <div>
            {/* Galerie style Airbnb pour les logements */}
            {isLogement ? (
              <div className="px-4 pt-4">
                <LogementGallery data={data} />
              </div>
            ) : selectedNode.type === 'site' && selectedNode.nom.toLowerCase().includes('manufacture') ? (
              <div className="px-4 pt-4">
                <CampusManufactureGallery />
              </div>
            ) : selectedNode.type === 'site' && selectedNode.nom.toLowerCase().includes('lyon 6') ? (
              <div className="px-4 pt-4">
                <CampusCentreLyon6Gallery />
              </div>
            ) : selectedNode.type === 'residence' && selectedNode.nom.toLowerCase().includes("resto") && selectedNode.nom.toLowerCase().includes('manufacture') ? (
              <div className="px-4 pt-4">
                <RestoUManufactureGallery />
              </div>
            ) : selectedNode.type === 'site' && selectedNode.nom.toLowerCase().includes('vannier') ? (
              <div className="px-4 pt-4">
                <AngeleVannierGallery />
              </div>
            ) : selectedNode.type === 'residence' && selectedNode.nom.toLowerCase().includes('vannier') ? (
              <div className="px-4 pt-4">
                <AngeleVannierGallery />
              </div>
            ) : selectedNode.type === 'residence' && selectedNode.nom.toLowerCase().includes('cavalier') ? (
              <div className="px-4 pt-4">
                <JacquesCavalierGallery />
              </div>
            ) : selectedNode.type === 'etage' && selectedNode.nom === '1er étage' && ancestors.some(a => a.nom.toLowerCase().includes('cavalier')) ? (
              <div className="px-4 pt-4">
                <EtageCavalierGallery />
              </div>
            ) : photoUrl ? (
              <div className="relative overflow-hidden" style={{ height: 180 }}>
                <img src={photoUrl} alt={selectedNode.nom} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <button className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg transition-colors border border-white/20">
                  <Image className="w-3 h-3" /> Modifier la photo
                </button>
              </div>
            ) : null}

            <div className="px-6 py-4">

              {/* Adresse postale */}
              {isLogement ? (
                (() => {
                  const adresse = (data.adresse_complete as string | undefined) || '8 Rue Jeanne Koehler, 69003 Lyon';
                  return (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-slate-700">{adresse}</p>
                    </div>
                  );
                })()
              ) : adresseAffichee ? (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${adressePropre ? 'bg-slate-50 text-slate-600' : 'bg-slate-50/60 text-slate-500'}`}>
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{adresseAffichee}</span>
                    {!adressePropre && (
                      <span className="ml-2 text-[11px] text-slate-400 italic">(adresse héritée)</span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Services — logement uniquement */}
              {isLogement && (() => {
                const rawServices = data.services;
                let parsed: Service[] = [];
                if (Array.isArray(rawServices)) parsed = rawServices as Service[];
                else if (typeof rawServices === 'string') {
                  try { parsed = JSON.parse(rawServices); } catch { parsed = []; }
                }
                return <ServicesLogement services={parsed} />;
              })()}

              {/* Identification */}
              <SectionTitle>Identification</SectionTitle>
              <div className="space-y-0">
                <DetailRow
                  label="Code site"
                  value={
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-sm">
                        {codeCourt}
                      </span>
                      {data.code && (
                        <span className="text-xs text-slate-400 font-mono">{data.code as string}</span>
                      )}
                    </span>
                  }
                />

                {/* Sélecteur de statut inline */}
                <DetailRow label="Statut" value={
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['disponible', 'occupé', 'indisponible'] as const).map(s => {
                      const current = String(data.statut ?? '');
                      const active = current === s;
                      const cls = active
                        ? s === 'disponible'   ? 'bg-emerald-500 text-white border-emerald-500'
                          : s === 'occupé'     ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700';
                      return (
                        <button key={s}
                          disabled={savingStatut}
                          onClick={() => handleStatutChange(s)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${cls} ${savingStatut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      );
                    })}
                    {/* Sous-liste raison si indisponible */}
                    {String(data.statut ?? '') === 'indisponible' && (
                      <select
                        defaultValue={String(data.raison_indisponibilite ?? '')}
                        onChange={e => handleStatutChange('indisponible', e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-300/40 ml-1">
                        <option value="">— Raison —</option>
                        {['Travaux', 'Sinistre', 'Intervention technique', 'Insalubrité', 'Rénovation'].map(r => (
                          <option key={r} value={r.toLowerCase()}>{r}</option>
                        ))}
                      </select>
                    )}
                  </div>
                } />

                {/* Type / Surface / Capacité sur une seule ligne */}
                {((data as { type_logement?: string }).type_logement || data.surface_m2 || data.surface || data.capacite_accueil != null || (data as { type_erp?: string }).type_erp) && (
                  <div className="flex items-start gap-4 py-2.5 border-b border-slate-50 flex-wrap">
                    {/* Type ERP */}
                    {(data as { type_erp?: string }).type_erp && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-shrink-0">ERP</span>
                        <span className="text-sm text-slate-700 ml-1 font-semibold">
                          {String((data as { type_erp: string }).type_erp)}
                        </span>
                      </div>
                    )}
                    {/* Type logement */}
                    {(data as { type_logement?: string }).type_logement && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-shrink-0">Type</span>
                        <span className="text-sm text-slate-700 ml-1">
                          {(data as { type_logement: string }).type_logement}
                        </span>
                      </div>
                    )}
                    {/* Séparateur */}
                    {((data as { type_erp?: string }).type_erp || (data as { type_logement?: string }).type_logement) && (data.surface_m2 || data.surface) && (
                      <span className="text-slate-200 self-stretch">|</span>
                    )}
                    {/* Surface */}
                    {(data.surface_m2 || data.surface) && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-shrink-0">Surface</span>
                        <span className="text-sm text-slate-700 ml-1">
                          {String(data.surface_m2 ?? data.surface)} m²
                        </span>
                      </div>
                    )}
                    {/* Séparateur */}
                    {(data.surface_m2 || data.surface) && data.capacite_accueil != null && (
                      <span className="text-slate-200 self-stretch">|</span>
                    )}
                    {/* Capacité d'accueil */}
                    {data.capacite_accueil != null && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex-shrink-0">Capacité</span>
                        <span className="text-sm text-slate-700 ml-1">
                          {String(data.capacite_accueil)} {isSiteOrResidence || isBatiment ? 'pers.' : 'lit' + (Number(data.capacite_accueil) > 1 ? 's' : '')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Structure hiérarchique — fil d'ariane avec vrais noms */}
              {ancestors.length > 0 && (
                <>
                  <SectionTitle>Structure hiérarchique</SectionTitle>
                  <div className="space-y-0">
                    <DetailRow
                      label="Échelon"
                      value={
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                          {typeLabel}
                        </span>
                      }
                    />
                    <DetailRow
                      label="Fil d'ariane"
                      value={
                        <div className="flex items-center gap-1 flex-wrap">
                          {ancestors.map((anc, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs">
                              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium truncate max-w-[110px]" title={anc.nom}>
                                {anc.nom}
                              </span>
                            </span>
                          ))}
                          <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-700 font-bold text-xs">
                            {selectedNode.nom}
                          </span>
                        </div>
                      }
                    />
                    {/* Parent direct */}
                    {ancestors.length > 0 && (
                      <DetailRow
                        label="Niveau parent"
                        value={
                          <span className="text-sm text-slate-700">
                            {ancestors[ancestors.length - 1].nom}
                            <span className="ml-1.5 text-xs text-slate-400">
                              ({typeLabelMap[ancestors[ancestors.length - 1].type as string] ?? ancestors[ancestors.length - 1].type})
                            </span>
                          </span>
                        }
                      />
                    )}
                  </div>
                </>
              )}

              {/* Caractéristiques physiques — toujours visible pour bâtiments et sites */}
              {(isBatiment || isSiteOrResidence || data.annee_construction || data.annee_derniere_renovation ||
                data.surface_totale || data.surface || data.nombre_etages != null || (data as { valeur_amortissement?: number }).valeur_amortissement) && (
                <>
                  <SectionTitle>Caractéristiques</SectionTitle>
                  <div className="space-y-0">
                    {data.annee_construction && (
                      <DetailRow label="Année de construction" value={
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {String(data.annee_construction)}
                        </span>
                      } />
                    )}
                    {data.annee_derniere_renovation && (
                      <DetailRow label="Dernière rénovation" value={
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {String(data.annee_derniere_renovation)}
                        </span>
                      } />
                    )}
                    {(data.surface_totale || data.surface_m2 || data.surface) && (
                      <DetailRow label="Surface" value={`${data.surface_totale ?? data.surface_m2 ?? data.surface} m²`} />
                    )}
                    {(data as { valeur_amortissement?: number }).valeur_amortissement != null && (
                      <DetailRow label="Valeur d'amortissement" value={
                        <span className="flex items-center gap-1.5">
                          <Euro className="w-3.5 h-3.5 text-slate-400" />
                          {Number((data as { valeur_amortissement: number }).valeur_amortissement).toLocaleString('fr-FR')} €
                        </span>
                      } />
                    )}
                    {data.nombre_etages != null && (
                      <DetailRow label="Étages" value={String(data.nombre_etages)} />
                    )}
                  </div>
                </>
              )}

              {/* Coût maintenance 3 dernières années — pour bâtiments et sites */}
              {(isBatiment || isSiteOrResidence) && (
                <MaintenanceCostField node={selectedNode} />
              )}

              {/* Responsabilité technique — sites uniquement */}
              {isSiteOrResidence && (
                <ResponsabiliteTechniqueField siteId={selectedNode.id} />
              )}

              {/* Occupation — logement uniquement */}
              {isLogement && (
                <>
                  <SectionTitle>Occupation</SectionTitle>
                  <div className="space-y-0">
                    {data.statut_occupation && (
                      <DetailRow label="Statut" value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border
                          ${String(data.statut_occupation) === 'occupé'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {String(data.statut_occupation)}
                        </span>
                      } />
                    )}
                    {(data.nom_occupant || data.prenom_occupant) && (
                      <DetailRow label="Occupant" value={
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">
                            {[data.prenom_occupant, data.nom_occupant].filter(Boolean).map(String).join(' ')}
                          </span>
                        </span>
                      } />
                    )}
                    {data.email_occupant && (
                      <DetailRow label="Email occupant" value={
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${String(data.email_occupant)}`} className="text-blue-600 hover:underline text-sm">
                            {String(data.email_occupant)}
                          </a>
                        </span>
                      } />
                    )}
                    {data.telephone_occupant && (
                      <DetailRow label="Tél. occupant" value={
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {String(data.telephone_occupant)}
                        </span>
                      } />
                    )}
                    {!data.nom_occupant && (
                      <div className="py-3 text-xs text-slate-400 italic">Aucun occupant enregistré</div>
                    )}
                  </div>
                </>
              )}

              {/* Indisponibilité (si colonne présente) */}
              {data.raison_indisponibilite && (
                <>
                  <SectionTitle>Indisponibilité</SectionTitle>
                  <div className="space-y-0">
                    <DetailRow label="Raison" value={
                      <span className="flex items-center gap-1 text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {String(data.raison_indisponibilite)}
                      </span>
                    } />
                    {data.date_fin_indisponibilite && (
                      <DetailRow label="Fin indisponibilité" value={formatDate(String(data.date_fin_indisponibilite))} />
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* ── Occupants ── */}
        {activeTab === 'occupants' && (
          isLogement
            ? <OccupantsTableau logementId={selectedNode.id} />
            : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p>Disponible uniquement pour les logements</p>
              </div>
            )
        )}

        {activeTab === 'controles'      && <TabControles />}
        {activeTab === 'renouvellement' && <TabRenouvellement />}
        {activeTab === 'carnet'         && <TabCarnet />}
        {activeTab === 'consommations'  && <TabConsommations />}
        {activeTab === 'etat_lieux'     && <TabEtatLieux />}
        {activeTab === 'liaison_bns'    && <TabLiaisonBNS nom={selectedNode.nom} />}

        {activeTab === 'interventions' && (
          isLogement
            ? (
              <div className="flex flex-col" style={{ minHeight: 420 }}>
                <InterventionsTableau interventions={logementInterventions} isLogement={true} />
              </div>
            )
            : (
              <div className="p-4">
                {interventions.length === 0 ? (
                  <EmptyState message="Aucune intervention enregistrée" />
                ) : (
                  <div className="space-y-2">
                    {interventions.map((i) => (
                      <div key={i.id} className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-medium text-sm text-slate-700">{i.titre}</span>
                          <StatusBadge status={i.statut} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1 text-xs text-slate-500"><Calendar className="w-3 h-3" />{formatDate(i.date_planifiee)}</div>
                          {i.agent_nom   && <div className="flex items-center gap-1 text-xs text-slate-500"><User className="w-3 h-3" />{i.agent_nom}</div>}
                          {i.prestataire && <div className="text-xs text-slate-500 col-span-2">Prestataire: {i.prestataire}</div>}
                          {i.cout != null && <div className="flex items-center gap-1 text-xs text-slate-500"><Euro className="w-3 h-3" />{formatCurrency(i.cout)}</div>}
                        </div>
                        {i.compte_rendu && <p className="mt-2 text-xs text-slate-500 italic border-t border-slate-50 pt-2">{i.compte_rendu}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
        )}

        {activeTab === 'documents' && (
          <DocumentsArborescence context={isLogement ? 'logement' : 'site'} />
        )}

        {activeTab === 'contrats' && (
          <ContratsTableau context={isLogement ? 'logement' : 'site'} />
        )}

        {activeTab === 'equipements' && (
          <div className="flex flex-col" style={{ height: '100%' }}>
            <EquipementsTableau
              equipements={
                equipements.length > 0
                  ? equipements
                  : buildMockEquipements(selectedNode.id)
              }
            />
          </div>
        )}

        {activeTab === 'finance' && !isLogement && (
          <div className="flex-1 overflow-auto">
            <OngletFinanceBatiment
              batiment_id={selectedNode.id}
              residence_id={selectedNode.type === 'residence' ? selectedNode.id : undefined}
            />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <MaintenancePreventive />
        )}

      </div>

      {showEditModal && canEditNode && (
        <ModifierSiteModal
          node={selectedNode}
          documents={documents}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
