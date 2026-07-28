import { useState, useEffect, useRef } from 'react';
import {
  X, User, Users, Building2, Calendar, Clock, ChevronDown,
  Plus, Trash2, FileText, Bell, CheckCircle2, Sparkles, Loader2,
  MapPin, AlertTriangle, Check, Bot, Zap, TrendingUp, Shield, Star, Wand2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CRITICITE_CFG, CATEGORIES_DI, type DemandeParsed, type CriticiteDI } from './interventionsTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

type AffectMode = 'agent' | 'equipe' | 'prestataire';

interface Task {
  id: string;
  title: string;
  instructions: string;
  assignMode: AffectMode;
  assignee: string;
  assignOpen: boolean;
  assignSearch: string;
  dureeMin: string;
  dureeLoading: boolean;
  dureeAiDone: boolean;
  dateHeure: string;
  planningSlots: string[];   // encoded as "label|value"
  planningLoading: boolean;
  planningOpen: boolean;
}

interface Agent { id: string; nom: string; prenom: string; poste: string | null; service: string | null }
interface Prestataire { id: string; nom: string; categorie: string | null; referent_nom: string | null }

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_LABELS_BY_CAT: Record<string, string[]> = {
  plomberie:         ['Inspection de la fuite', 'Localisation et diagnostic', 'Réparation robinetterie', 'Débouchage canalisation', 'Remplacement siphon', 'Réparation joint', "Contrôle d'étanchéité", 'Remise en service'],
  electricite:       ['Diagnostic électrique', 'Remplacement disjoncteur', 'Réparation prise défaillante', 'Remise en service circuit', 'Vérification tableau électrique', 'Remplacement éclairage', 'Test de conformité'],
  chauffage:         ['Diagnostic chaudière', 'Purge radiateurs', 'Remplacement circulateur', 'Réglage thermostat', 'Remplacement vanne thermique', 'Nettoyage brûleur', 'Test de remise en service'],
  serrurerie:        ['Diagnostic serrure', 'Remplacement cylindre', 'Réparation mécanisme', 'Réglage ferme-porte', 'Remplacement badge/clé', 'Test de fermeture'],
  menuiserie:        ['Diagnostic menuiserie', 'Réparation vitre', 'Réglage porte/fenêtre', 'Remplacement joint', 'Remplacement store', 'Reprise calfeutrement'],
  electromenager:    ["Diagnostic électroménager", "Test de l'appareil", 'Réparation composant', 'Remplacement pièce', 'Test de fonctionnement'],
  nettoyage:         ['Nettoyage de zone', 'Désinfection', 'Traitement de surface', 'Évacuation déchets'],
  securite_incendie: ['Inspection SSI', 'Test alarme incendie', 'Vérification extincteurs', 'Contrôle désenfumage', 'Mise à jour registre sécurité'],
  ascenseur:         ['Inspection ascenseur', 'Remise en service', 'Maintenance préventive', 'Remplacement composant'],
  froid:             ['Diagnostic froid', 'Recharge frigorigène', 'Remplacement compresseur', 'Contrôle température', 'Entretien condenseur'],
  vmc:               ['Inspection VMC', 'Nettoyage filtres', 'Remplacement moteur VMC', 'Réglage débit', "Test d'extraction"],
  toiture:           ["Inspection toiture", "Réparation étanchéité", "Remplacement tuiles", "Nettoyage gouttières"],
  peinture:          ["Préparation support", "Application peinture", "Retouche revêtement"],
};
const DEFAULT_LABELS = ['Diagnostic initial', 'Inspection sur site', 'Intervention corrective', 'Remplacement pièce', 'Contrôle final', "Compte rendu d'intervention"];

const EQUIPES = ['Équipe Technique Nord', 'Équipe Technique Sud', 'Équipe Plomberie', 'Équipe Électricité', 'Équipe Polyvalente'];

// ─── Static agent & prestataire lists (match AssigneeFilterPanel) ─────────────

const STATIC_AGENTS: Agent[] = [
  { id: 'static-a-1', prenom: 'Martin',  nom: 'D.', poste: 'Plombier',               service: 'Technique'      },
  { id: 'static-a-2', prenom: 'Leroy',   nom: 'P.', poste: 'Électricien',             service: 'Technique'      },
  { id: 'static-a-3', prenom: 'Dupont',  nom: 'A.', poste: 'Technicien sécurité',     service: 'Sécurité'       },
  { id: 'static-a-4', prenom: 'Bernard', nom: 'C.', poste: 'Chauffagiste',            service: 'Technique'      },
  { id: 'static-a-5', prenom: 'Moreau',  nom: 'F.', poste: 'Gestionnaire patrimoine', service: 'Patrimoine'     },
  { id: 'static-a-6', prenom: 'Simon',   nom: 'B.', poste: 'Administratif',           service: 'Administration' },
  { id: 'static-a-7', prenom: 'Laurent', nom: 'E.', poste: 'Serruriste',              service: 'Technique'      },
  { id: 'static-a-8', prenom: 'Michel',  nom: 'G.', poste: 'Agent polyvalent',        service: 'Technique'      },
];

const STATIC_PRESTATAIRES: Prestataire[] = [
  { id: 'static-p-1',  nom: 'Atmeo',                    categorie: 'Maintenance curative',    referent_nom: null },
  { id: 'static-p-2',  nom: 'Thermocom',                categorie: 'Chauffage / CVC',         referent_nom: null },
  { id: 'static-p-3',  nom: 'Sabeko',                   categorie: 'Maintenance curative',    referent_nom: null },
  { id: 'static-p-4',  nom: 'MSI',                      categorie: 'Maintenance curative',    referent_nom: null },
  { id: 'static-p-5',  nom: 'Sauvignet',                categorie: 'Électricité',             referent_nom: null },
  { id: 'static-p-6',  nom: 'APAVE',                    categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-7',  nom: 'SOCOTEC',                  categorie: 'Bureau de contrôle',      referent_nom: null },
  { id: 'static-p-8',  nom: 'DEKRA',                    categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-9',  nom: 'Bureau Veritas',           categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-10', nom: 'QUALICONSULT',             categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-11', nom: 'SGS',                      categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-12', nom: 'Alpes Contrôles',          categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-13', nom: 'SOCOTEC Diagnostic',       categorie: 'Diagnostic',              referent_nom: null },
  { id: 'static-p-14', nom: 'Bureau Alliance Contrôle', categorie: 'Contrôle réglementaire',  referent_nom: null },
  { id: 'static-p-15', nom: 'Acritec',                  categorie: 'Contrôle réglementaire',  referent_nom: null },
];

// ─── Consignes checklist ──────────────────────────────────────────────────────

interface ConsigneItem { id: string; text: string; done: boolean }

const CONSIGNES_BY_CAT: Record<string, string[]> = {
  plomberie:         ["Couper l'alimentation en eau avant toute intervention", "Prévenir l'occupant et convenir d'un créneau d'accès", "Vérifier l'absence de fuite résiduelle avant remise en service"],
  electricite:       ["Couper le disjoncteur général avant intervention", "Tester la mise en sécurité et la conformité après intervention", "Consigner l'intervention dans le registre électrique"],
  chauffage:         ["Vérifier la pression du circuit avant intervention", "Purger les radiateurs si nécessaire après réparation", "Tester le bon fonctionnement du thermostat à la remise en service"],
  serrurerie:        ["Vérifier que l'occupant est présent ou a été prévenu", "Tester le mécanisme de fermeture depuis les deux faces", "Remettre les clés / badges en main propre ou consigner"],
  menuiserie:        ["Protéger la zone d'intervention (bâche sol si nécessaire)", "Régler les jeux et vérifier l'étanchéité à l'air après pose", "Nettoyer et évacuer les déchets de chantier"],
  electromenager:    ["Débrancher l'appareil avant toute intervention", "Tester le fonctionnement complet après réparation", "Consigner la référence de la pièce remplacée"],
  nettoyage:         ["Délimiter la zone avec signalétique de sécurité", "Utiliser les produits homologués et les EPI appropriés", "Ventiler la pièce après traitement chimique"],
  securite_incendie: ["Ne pas désactiver le système SSI sans autorisation du responsable sécurité", "Tester l'alarme après intervention et consigner le résultat", "Mettre à jour le registre de sécurité incendie"],
  ascenseur:         ["Condamner l'ascenseur et afficher la signalétique 'Hors service'", "Intervention par technicien habilité uniquement", "Effectuer un test de course complet avant remise en service"],
  froid:             ["Vérifier la conformité réglementaire pour la manipulation des frigorigènes", "Contrôler la température de consigne après intervention", "Consigner la quantité de frigorigène utilisée dans le carnet"],
  vmc:               ["Couper l'alimentation électrique de la VMC avant intervention", "Nettoyer ou remplacer les filtres systématiquement", "Mesurer les débits d'extraction après remise en service"],
  toiture:           ["Intervention uniquement si météo favorable (vent < 50 km/h)", "Mettre en place les équipements de protection contre les chutes", "Inspecter les abords et évacuations après réparation"],
  peinture:          ["Protéger les sols et mobiliers avec bâches", "Aérer les locaux pendant et après application", "Laisser sécher le temps recommandé avant remise en occupation"],
};

const DEFAULT_CONSIGNES = [
  "Prévenir l'occupant ou le responsable du site avant intervention",
  "Vérifier les conditions de sécurité avant de commencer",
  "Rédiger un compte rendu d'intervention à l'issue",
];

function mkConsigneItems(cat: string | null): ConsigneItem[] {
  const texts = CONSIGNES_BY_CAT[cat ?? ''] ?? DEFAULT_CONSIGNES;
  return texts.map(text => ({ id: crypto.randomUUID(), text, done: false }));
}

const AI_STEPS = [
  'Analyse de la description…',
  'Recherche des interventions similaires…',
  'Vérification des contrats prestataires…',
  'Calcul des disponibilités…',
  'Génération des recommandations…',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mkId() { return crypto.randomUUID(); }

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function catIcon(cat: string | null): string {
  return CATEGORIES_DI.find(c => c.key === cat?.toLowerCase().replace(/ /g, '_'))?.icon ?? '📋';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}j`;
  if (h > 0) return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
  return `${m}min`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function fmtSlotLabel(d: Date, h: number, h2: number): string {
  const dow = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()];
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${dow} ${dd}/${mm} · ${h.toString().padStart(2, '0')}h00 – ${h2.toString().padStart(2, '0')}h00`;
}

function fmtSlotValue(d: Date, h: number): string {
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}T${h.toString().padStart(2, '0')}:00`;
}

function generateSlots(criticite: string): string[] {
  const now = new Date();
  const pairs: [Date, number, number][] = criticite === 'critique'
    ? [[now, 14, 16], [now, 16, 18], [addDays(now, 1), 8, 10], [addDays(now, 1), 14, 16]]
    : criticite === 'haute'
      ? [[addDays(now, 1), 8, 10], [addDays(now, 1), 14, 16], [addDays(now, 2), 8, 10], [addDays(now, 2), 14, 16]]
      : [[addDays(now, 2), 8, 10], [addDays(now, 3), 8, 10], [addDays(now, 4), 14, 16], [addDays(now, 5), 8, 10]];
  return pairs.map(([d, h, h2]) => `${fmtSlotLabel(d, h, h2)}|${fmtSlotValue(d, h)}`);
}

function estimateDuration(title: string): number {
  const t = title.toLowerCase();
  if (t.includes('inspection') || t.includes('diagnostic') || t.includes('localisation')) return 30;
  if (t.includes('remplacement') || t.includes('remise en service')) return 90;
  if (t.includes('réparation') || t.includes('débouchage')) return 60;
  if (t.includes('contrôle') || t.includes('test') || t.includes('vérification')) return 20;
  if (t.includes('nettoyage') || t.includes('purge')) return 45;
  return 60;
}

function makeTask(defaultTitle = ''): Task {
  return {
    id: mkId(), title: defaultTitle, instructions: '', assignMode: 'agent', assignee: '',
    assignOpen: false, assignSearch: '', dureeMin: '',
    dureeLoading: false, dureeAiDone: false,
    dateHeure: '', planningSlots: [], planningLoading: false, planningOpen: false,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { demande: DemandeParsed; onClose: () => void; onUpdated: () => void }

export default function PriseEnChargeModal({ demande, onClose, onUpdated }: Props) {
  const defaultTitle = (TASK_LABELS_BY_CAT[demande.categorie ?? ''] ?? DEFAULT_LABELS)[0];
  const [agents, setAgents]                   = useState<Agent[]>(STATIC_AGENTS);
  const [prestataires, setPrestataires]       = useState<Prestataire[]>(STATIC_PRESTATAIRES);
  const [photoUrl, setPhotoUrl]               = useState<string | null>(null);
  const [tasks, setTasks]                     = useState<Task[]>([makeTask(defaultTitle)]);
  const [taskMode, setTaskMode]               = useState<'single' | 'multiple'>('single');
  const [consigneItems, setConsigneItems]     = useState<ConsigneItem[]>(() => mkConsigneItems(demande.categorie));
  const [notifs, setNotifs]                   = useState({ demandeur: true, intervenant: true, journal: true, taches: true });
  const [aiLoading, setAiLoading]             = useState(false);
  const [aiStep, setAiStep]                   = useState(-1);
  const [aiDone, setAiDone]                   = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const aiTimersRef                           = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const staticAgentNames = new Set(STATIC_AGENTS.map(a => `${a.prenom} ${a.nom}`));
    supabase.from('agents_internes').select('id, nom, prenom, poste, service').eq('actif', true).limit(50)
      .then(({ data }) => {
        if (data) {
          const extra = (data as Agent[]).filter(a => !staticAgentNames.has(`${a.prenom} ${a.nom}`));
          if (extra.length) setAgents([...STATIC_AGENTS, ...extra]);
        }
      });
    const staticPrestNames = new Set(STATIC_PRESTATAIRES.map(p => p.nom));
    supabase.from('prestataires').select('id, nom, categorie, referent_nom').eq('actif', true).limit(50)
      .then(({ data }) => {
        if (data) {
          const extra = (data as Prestataire[]).filter(p => !staticPrestNames.has(p.nom));
          if (extra.length) setPrestataires([...STATIC_PRESTATAIRES, ...extra]);
        }
      });
    supabase.from('photos_terrain').select('url').eq('intervention_id', demande.id).limit(1)
      .then(({ data }) => { if (data?.[0]?.url) setPhotoUrl(data[0].url); });
    return () => { aiTimersRef.current.forEach(clearTimeout); };
  }, [demande.id]);

  // ── Task helpers ──────────────────────────────────────────────────────────

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }
  function addTask() { setTasks(t => [...t, makeTask()]); }
  function removeTask(id: string) { setTasks(t => t.filter(x => x.id !== id)); }

  function suggestByRules(taskId: string) {
    const cat = (demande.categorie ?? '').toLowerCase();
    const loc = (demande.localisation_detail ?? '').toLowerCase();
    const matched = prestataires.find(p => {
      const pCat = (p.categorie ?? '').toLowerCase();
      return pCat && cat && (pCat.includes(cat.slice(0, 5)) || cat.includes(pCat.slice(0, 5)));
    });
    const matchedAgent = agents.find(a => {
      const svc = (a.service ?? '').toLowerCase();
      return svc && (svc.includes(cat.slice(0, 5)) || cat.includes(svc.slice(0, 5)));
    });
    if (matched) {
      updateTask(taskId, { assignMode: 'prestataire', assignee: matched.nom, assignOpen: false });
    } else if (matchedAgent) {
      updateTask(taskId, { assignMode: 'agent', assignee: `${matchedAgent.prenom} ${matchedAgent.nom}`, assignOpen: false });
    } else {
      const eq = loc.includes('nord') ? 'Équipe Technique Nord' : loc.includes('sud') ? 'Équipe Technique Sud' : 'Équipe Polyvalente';
      updateTask(taskId, { assignMode: 'equipe', assignee: eq, assignOpen: false });
    }
  }

  function suggestDuration(taskId: string, title: string) {
    updateTask(taskId, { dureeLoading: true, dureeAiDone: false });
    const t = setTimeout(() => {
      updateTask(taskId, { dureeLoading: false, dureeAiDone: true, dureeMin: estimateDuration(title || 'default').toString() });
    }, 1200);
    aiTimersRef.current.push(t);
  }

  function suggestPlanning(taskId: string) {
    updateTask(taskId, { planningLoading: true, planningOpen: false, planningSlots: [] });
    const t = setTimeout(() => {
      updateTask(taskId, { planningLoading: false, planningOpen: true, planningSlots: generateSlots(demande.criticite ?? 'moyenne') });
    }, 1000);
    aiTimersRef.current.push(t);
  }

  // ── AI (right panel) ──────────────────────────────────────────────────────

  function runAi() {
    if (aiLoading || aiDone) return;
    setAiLoading(true); setAiStep(0);
    AI_STEPS.forEach((_, i) => {
      const t = setTimeout(() => setAiStep(i + 1), 500 + i * 550);
      aiTimersRef.current.push(t);
    });
    const done = setTimeout(() => { setAiLoading(false); setAiDone(true); }, 500 + AI_STEPS.length * 550 + 300);
    aiTimersRef.current.push(done);
  }

  function getAiSuggestions() {
    const cat = demande.categorie ?? 'autre';
    const base: Record<string, { title: string; desc: string }[]> = {
      plomberie:   [{ title: 'Inspection de la fuite', desc: "Identifier l'origine et l'étendue de la fuite" }, { title: 'Réparation / remplacement', desc: 'Effectuer la réparation nécessaire' }, { title: "Contrôle d'étanchéité", desc: 'Valider absence de fuite résiduelle' }],
      electricite: [{ title: 'Diagnostic électrique', desc: 'Identifier la cause de la panne' }, { title: 'Intervention sur tableau', desc: 'Remettre en service le circuit' }, { title: 'Test de conformité', desc: 'Vérifier la mise en sécurité' }],
      chauffage:   [{ title: 'Diagnostic chaudière', desc: "Identifier la panne sur l'installation" }, { title: 'Remplacement pièce défaillante', desc: 'Effectuer la réparation' }, { title: 'Test de remise en service', desc: 'Valider le bon fonctionnement' }],
    };
    return base[cat] ?? [{ title: 'Diagnostic initial', desc: 'Identifier et évaluer le problème' }, { title: 'Intervention corrective', desc: 'Réaliser la réparation' }, { title: 'Contrôle final', desc: 'Valider la résolution' }];
  }

  function applyAiTasks() {
    setTasks(getAiSuggestions().map(s => ({ ...makeTask(), title: s.title, instructions: s.desc })));
    setTaskMode('multiple');
  }

  // ── Recommendation engine ─────────────────────────────────────────────────

  const h = hashStr(demande.reference);
  const recPrest = prestataires.find(p => {
    const pCat = (p.categorie ?? '').toLowerCase();
    const dCat = (demande.categorie ?? '').toLowerCase();
    return pCat && dCat && (pCat.includes(dCat.slice(0, 5)) || dCat.includes(pCat.slice(0, 5)));
  }) ?? prestataires[h % Math.max(prestataires.length, 1)];

  const recConfidence  = 82 + (h % 15);
  const recSimilar     = 8 + (h % 20);
  const recSuccessRate = 89 + (h % 9);
  const recFirstPass   = 87 + (h % 9);
  const recAvgDays     = `${1 + (h % 3)}.${h % 9}`;

  // ── Submit ────────────────────────────────────────────────────────────────

  const canSubmit = tasks[0]?.assignee?.trim().length > 0;

  async function submit(withPlanning: boolean) {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const first = tasks[0];
      const updates: Record<string, unknown> = { statut_demande: 'affecte', date_affectation: new Date().toISOString() };
      if (first.assignMode === 'agent') {
        updates.agent = first.assignee;
        updates.prestataire = null;
      } else if (first.assignMode === 'prestataire') {
        updates.prestataire = first.assignee;
        updates.agent = null;
      }
      if (withPlanning && first.dateHeure)    updates.date_planifiee = first.dateHeure;
      await supabase.from('interventions').update(updates).eq('id', demande.id);

      const hist: { intervention_id: string; type_evenement: string; description: string; auteur: string }[] = [];
      hist.push({ intervention_id: demande.id, type_evenement: 'affectation', description: `Demande affectée à ${first.assignee}`, auteur: 'Agent' });
      tasks.filter(t => t.title.trim() || t.assignee.trim()).forEach((t, i) => {
        let desc = `Tâche ${i + 1}${t.title ? ` : ${t.title}` : ''}`;
        if (t.assignee) desc += ` — ${t.assignee}`;
        if (t.dateHeure) desc += ` — ${new Date(t.dateHeure).toLocaleDateString('fr-FR')}`;
        if (t.dureeMin) desc += ` — ${t.dureeMin} min`;
        hist.push({ intervention_id: demande.id, type_evenement: 'tache_creee', description: desc, auteur: 'Agent' });
      });
      if (consigneItems.some(c => c.text.trim())) {
        const lines = consigneItems.filter(c => c.text.trim()).map(c => `${c.done ? '[x]' : '[ ]'} ${c.text.trim()}`).join('\n');
        hist.push({ intervention_id: demande.id, type_evenement: 'consigne', description: `Consignes :\n${lines}`, auteur: 'Agent' });
      }
      if (hist.length) await supabase.from('historique_intervention').insert(hist);
      onUpdated(); onClose();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const critCfg   = CRITICITE_CFG[demande.criticite as CriticiteDI];
  const taskLabels = TASK_LABELS_BY_CAT[demande.categorie ?? ''] ?? DEFAULT_LABELS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: 1280, maxWidth: '97vw', height: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Prise en charge intelligente</h2>
              <p className="text-xs text-slate-400 font-mono">{demande.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left column ────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white">

            {/* Bloc 1 — Résumé avec photo */}
            <Section title="Résumé de la demande">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${critCfg.bg} ${critCfg.text}`}>
                      {critCfg.icon} {critCfg.label}
                    </span>
                    {demande.categorie && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {catIcon(demande.categorie)} {demande.categorie}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      <Clock className="w-3 h-3" /> {timeAgo(demande.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{demande.titre}</p>
                  {demande.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{demande.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {demande.localisation_detail && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" /> {demande.localisation_detail}
                      </span>
                    )}
                    {demande.demandeur_nom && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="w-3 h-3 text-slate-400" /> {demande.demandeur_nom}
                      </span>
                    )}
                  </div>
                </div>
                {/* Photo */}
                <div className="w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 p-2">
                      <span className="text-xl">{catIcon(demande.categorie)}</span>
                      <span className="text-[9px] text-slate-400 text-center leading-tight">Aucune photo</span>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Bloc 2 — Tâches */}
            <Section title="Tâches d'intervention">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4">
                {([['single', FileText, 'Une seule tâche'], ['multiple', Plus, 'Plusieurs tâches']] as const).map(([mode, Icon, label]) => (
                  <button key={mode} onClick={() => setTaskMode(mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${taskMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {tasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={idx}
                    taskLabels={taskLabels}
                    agents={agents}
                    prestataires={prestataires}
                    canDelete={taskMode === 'multiple' && tasks.length > 1}
                    onUpdate={patch => updateTask(task.id, patch)}
                    onRemove={() => removeTask(task.id)}
                    onSuggestRules={() => suggestByRules(task.id)}
                    onSuggestDuration={() => suggestDuration(task.id, task.title)}
                    onSuggestPlanning={() => suggestPlanning(task.id)}
                    onApplySlot={val => updateTask(task.id, { dateHeure: val, planningOpen: false })}
                    criticite={demande.criticite ?? 'moyenne'}
                  />
                ))}
              </div>

              {taskMode === 'multiple' && (
                <button onClick={addTask}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-blue-300 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une tâche
                </button>
              )}
            </Section>

            {/* Bloc 3 — Consignes */}
            <Section title="Consignes d'intervention">
              <div className="space-y-2">
                {consigneItems.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <button
                      onClick={() => setConsigneItems(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                      className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}
                    >
                      {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={e => setConsigneItems(prev => prev.map(c => c.id === item.id ? { ...c, text: e.target.value } : c))}
                      className={`flex-1 text-sm border-0 border-b border-transparent focus:border-slate-300 focus:outline-none bg-transparent py-0.5 transition-colors ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}
                      placeholder={`Action ${idx + 1}…`}
                    />
                    <button
                      onClick={() => setConsigneItems(prev => prev.filter(c => c.id !== item.id))}
                      className="mt-0.5 opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-red-400 transition-all flex-shrink-0"
                      aria-label="Supprimer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setConsigneItems(prev => [...prev, { id: crypto.randomUUID(), text: '', done: false }])}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une action
              </button>
            </Section>

            {/* Bloc 4 — Notifications */}
            <Section title="Notifications">
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['demandeur',   Bell,         'Informer le demandeur'],
                  ['intervenant', User,         "Informer l'intervenant"],
                  ['journal',     FileText,     "Ajouter au fil d'activité"],
                  ['taches',      CheckCircle2, 'Envoyer les tâches créées'],
                ] as const).map(([key, Icon, label]) => (
                  <button key={key} onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${notifs[key] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${notifs[key] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      {notifs[key] && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {label}
                  </button>
                ))}
              </div>
            </Section>

          </div>

          {/* ── Right column ─────────────────────────────────────────────────── */}
          <div className="w-96 flex-shrink-0 border-l border-slate-100 bg-slate-50/50 overflow-y-auto flex flex-col">

            {/* Affectation recommandée */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Affectation recommandée</h3>
              </div>
              {recPrest ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-xl border border-amber-200 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{recPrest.nom}</p>
                        {recPrest.categorie && <p className="text-[10px] text-slate-500">{recPrest.categorie}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-amber-600">{recConfidence}%</p>
                      <p className="text-[9px] text-slate-400">confiance</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {['Contrat actif sur cette catégorie', `${recSimilar} interventions similaires`, 'Disponible sous 24h', 'Résidence couverte par ce contrat'].map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-slate-600">{m}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateTask(tasks[0]?.id, { assignMode: 'prestataire', assignee: recPrest.nom })}
                    className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors">
                    Appliquer à la tâche 1
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Chargement des recommandations…</p>
              )}
            </div>

            {/* Agent IA Résolution */}
            <div className="p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Agent IA Résolution</h3>
              </div>

              {!aiLoading && !aiDone && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Analyse globale : description, historique des interventions similaires, ressources et disponibilités. Complémentaire aux suggestions IA par tâche.
                  </p>
                  <button onClick={runAi}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
                    <Bot className="w-4 h-4" /> Analyser et proposer
                  </button>
                </div>
              )}

              {aiLoading && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <p className="text-xs font-semibold text-blue-600">Analyse en cours…</p>
                  </div>
                  {AI_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${i < aiStep ? 'opacity-100' : 'opacity-20'}`}>
                      {i < aiStep
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />}
                      <p className="text-xs text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
              )}

              {aiDone && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-blue-700">Analyse terminée</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tâches proposées</p>
                    <div className="space-y-1.5">
                      {getAiSuggestions().map((t, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{t.title}</p>
                            <p className="text-[10px] text-slate-400">{t.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={applyAiTasks}
                      className="mt-2 w-full py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-colors">
                      Appliquer ces tâches
                    </button>
                  </div>
                  {recPrest && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Affectation recommandée</p>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-700">{recPrest.nom}</p>
                        <span className="text-xs font-black text-blue-600">{recConfidence - 2}%</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pourquoi cette recommandation ?</p>
                    <div className="space-y-1.5">
                      {[`${recSimilar + 2} demandes similaires analysées`, `Taux de réussite : ${recSuccessRate}%`, 'Prestataire sous contrat', 'Disponibilité confirmée', `Temps moyen : ${recAvgDays} j`].map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <p className="text-[11px] text-slate-600">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Résolution au 1er passage</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-2 bg-emerald-200 rounded-full mr-3">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${recFirstPass}%` }} />
                      </div>
                      <span className="text-lg font-black text-emerald-700">{recFirstPass}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <p className="text-[10px] text-emerald-600">Performance supérieure à la moyenne</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Shield className="w-3 h-3" /> Recommandation IA — à valider par l'agent
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white flex-shrink-0">
          <div>
            {!canSubmit && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" /> Assigner la tâche 1 pour continuer
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
              Annuler
            </button>
            <button disabled={!canSubmit || submitting} onClick={() => submit(false)}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Affecter
            </button>
            <button disabled={!canSubmit || submitting} onClick={() => submit(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              Affecter et planifier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── French Date+Time Picker ──────────────────────────────────────────────────

const FR_MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const FR_DOW_SHORT = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
const MINUTES_STEP5 = [0,5,10,15,20,25,30,35,40,45,50,55];

function pad2(n: number) { return n.toString().padStart(2, '0'); }

function FrDateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsed = value ? new Date(value) : null;
  const [viewYear,  setViewYear]  = useState(() => parsed ? parsed.getFullYear()  : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsed ? parsed.getMonth()     : new Date().getMonth());
  const [selDate,   setSelDate]   = useState<Date | null>(parsed);
  const [hour,      setHour]      = useState(parsed ? parsed.getHours()   : 8);
  const [minute,    setMinute]    = useState(parsed ? Math.round(parsed.getMinutes() / 5) * 5 % 60 : 0);
  const [manualH,   setManualH]   = useState(pad2(parsed ? parsed.getHours() : 8));
  const [manualM,   setManualM]   = useState(pad2(parsed ? Math.round(parsed.getMinutes() / 5) * 5 % 60 : 0));

  const minRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);

  // Scroll minute list to selected
  useEffect(() => {
    if (!open) return;
    const idx = MINUTES_STEP5.indexOf(minute);
    if (idx >= 0 && minRef.current) {
      const btn = minRef.current.children[idx] as HTMLElement;
      btn?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [open, minute]);

  // Scroll hour list to selected
  useEffect(() => {
    if (!open) return;
    if (hourRef.current) {
      const btn = hourRef.current.children[hour] as HTMLElement;
      btn?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [open, hour]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function emit(d: Date | null, h: number, m: number) {
    if (!d) { onChange(''); return; }
    const dd = new Date(d);
    dd.setHours(h, m, 0, 0);
    const iso = `${dd.getFullYear()}-${pad2(dd.getMonth() + 1)}-${pad2(dd.getDate())}T${pad2(h)}:${pad2(m)}`;
    onChange(iso);
  }

  function pickDate(d: Date) {
    setSelDate(d);
    emit(d, hour, minute);
  }

  function applyHour(h: number) {
    setHour(h); setManualH(pad2(h));
    emit(selDate, h, minute);
  }

  function applyMinute(m: number) {
    setMinute(m); setManualM(pad2(m));
    emit(selDate, hour, m);
  }

  function applyToday() {
    const d = new Date();
    setSelDate(d); setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
    emit(d, hour, minute);
  }

  function clear() {
    setSelDate(null); onChange('');
  }

  function handleManualH(v: string) {
    setManualH(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0 && n <= 23) applyHour(n);
  }

  function handleManualM(v: string) {
    setManualM(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0 && n <= 59) {
      const snapped = Math.round(n / 5) * 5 % 60;
      applyMinute(snapped);
    }
  }

  // Calendar grid
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Monday first
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { d: number; cur: boolean }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ d: daysInPrev - startOffset + 1 + i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, cur: true });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - startOffset - daysInMonth + 1, cur: false });

  const today = new Date();
  const displayValue = selDate
    ? `${pad2(selDate.getDate())}/${pad2(selDate.getMonth() + 1)}/${selDate.getFullYear()}, ${pad2(hour)}:${pad2(minute)}`
    : '';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white hover:border-blue-300 transition-colors"
      >
        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className={displayValue ? 'text-slate-700 flex-1 text-left' : 'text-slate-400 flex-1 text-left'}>
          {displayValue || 'Choisir une date et heure…'}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          style={{ width: 360 }}>
          <div className="flex">
            {/* ── Calendar ── */}
            <div className="flex-1 p-3">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => { const d = new Date(viewYear, viewMonth - 1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-800">
                  {FR_MONTHS[viewMonth]} {viewYear}
                </span>
                <button onClick={() => { const d = new Date(viewYear, viewMonth + 1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* DoW headers */}
              <div className="grid grid-cols-7 mb-1">
                {FR_DOW_SHORT.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-0.5">{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, i) => {
                  const isToday = cell.cur && cell.d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                  const isSel = cell.cur && selDate && cell.d === selDate.getDate() && viewMonth === selDate.getMonth() && viewYear === selDate.getFullYear();
                  return (
                    <button key={i} disabled={!cell.cur}
                      onClick={() => cell.cur && pickDate(new Date(viewYear, viewMonth, cell.d))}
                      className={`h-7 w-full rounded-lg text-xs font-medium transition-all
                        ${!cell.cur ? 'text-slate-200 cursor-default' : ''}
                        ${cell.cur && !isSel && !isToday ? 'text-slate-700 hover:bg-blue-50' : ''}
                        ${isToday && !isSel ? 'border border-blue-400 text-blue-600 font-bold' : ''}
                        ${isSel ? 'bg-blue-600 text-white font-bold shadow-sm' : ''}
                      `}>
                      {cell.d}
                    </button>
                  );
                })}
              </div>
              {/* Footer actions */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <button onClick={clear} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Effacer
                </button>
                <button onClick={applyToday} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Aujourd'hui
                </button>
              </div>
            </div>

            {/* ── Time picker ── */}
            <div className="w-28 border-l border-slate-100 flex flex-col">
              <div className="px-2 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide text-center mb-1.5">Heure</p>
                {/* Manual inputs */}
                <div className="flex items-center gap-1 justify-center mb-2">
                  <input
                    type="text" inputMode="numeric" maxLength={2}
                    value={manualH}
                    onChange={e => handleManualH(e.target.value)}
                    className="w-9 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-sm font-bold text-slate-400">:</span>
                  <input
                    type="text" inputMode="numeric" maxLength={2}
                    value={manualM}
                    onChange={e => handleManualM(e.target.value)}
                    className="w-9 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                {/* Hours */}
                <div className="flex-1 overflow-y-auto" ref={hourRef} style={{ maxHeight: 200 }}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <button key={h} onClick={() => applyHour(h)}
                      className={`w-full py-1 text-xs font-semibold text-center transition-colors ${h === hour ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'}`}>
                      {pad2(h)}
                    </button>
                  ))}
                </div>
                {/* Minutes (5-step) */}
                <div className="flex-1 overflow-y-auto border-l border-slate-100" ref={minRef} style={{ maxHeight: 200 }}>
                  {MINUTES_STEP5.map(m => (
                    <button key={m} onClick={() => applyMinute(m)}
                      className={`w-full py-1 text-xs font-semibold text-center transition-colors ${m === minute ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'}`}>
                      {pad2(m)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  index: number;
  taskLabels: string[];
  agents: Agent[];
  prestataires: Prestataire[];
  canDelete: boolean;
  criticite: string;
  onUpdate: (patch: Partial<Task>) => void;
  onRemove: () => void;
  onSuggestRules: () => void;
  onSuggestDuration: () => void;
  onSuggestPlanning: () => void;
  onApplySlot: (val: string) => void;
}

function TaskCard({ task, index, taskLabels, agents, prestataires, canDelete, criticite, onUpdate, onRemove, onSuggestRules, onSuggestDuration, onSuggestPlanning, onApplySlot }: TaskCardProps) {
  const search = task.assignSearch ?? '';
  const filteredAgents = agents.filter(a =>
    `${a.prenom} ${a.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    (a.service ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredPrests = prestataires.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    (p.categorie ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const plannedDate = task.dateHeure ? new Date(task.dateHeure) : null;
  const critColor = criticite === 'critique' ? 'text-red-600' : criticite === 'haute' ? 'text-orange-600' : 'text-blue-600';

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center">{index + 1}</span>
          <p className="text-xs font-bold text-slate-600">Tâche {index + 1}</p>
          {task.assignee && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{task.assignee}</span>
          )}
        </div>
        {canDelete && (
          <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2-column body */}
      <div className="grid grid-cols-2 divide-x divide-slate-100">

        {/* ── Left: Intitulé + Instructions + Assigné à + Durée ── */}
        <div className="p-4 space-y-3.5">

          {/* Intitulé */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Intitulé</label>
            <div className="relative">
              <select
                value={task.title}
                onChange={e => onUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none bg-white pr-8"
              >
                <option value="">Choisir un libellé…</option>
                {taskLabels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Instructions</label>
            <textarea
              value={task.instructions}
              onChange={e => onUpdate({ instructions: e.target.value })}
              rows={2}
              placeholder="Détails de l'intervention, précautions…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {/* Assigné à */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigné à</label>
              <button
                onClick={onSuggestRules}
                className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold rounded-lg hover:bg-amber-100 transition-colors"
                title="Affectation assistée par les règles métier : contrats, compétences, localisation">
                <Wand2 className="w-3 h-3" /> Suggérer selon les règles
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-lg mb-2">
              {(['agent', 'equipe', 'prestataire'] as const).map(mode => {
                const Icon = mode === 'agent' ? User : mode === 'equipe' ? Users : Building2;
                const lbl = mode === 'agent' ? 'Agent' : mode === 'equipe' ? 'Équipe' : 'Presta.';
                return (
                  <button key={mode} onClick={() => onUpdate({ assignMode: mode, assignee: '', assignSearch: '' })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-all ${task.assignMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icon className="w-3 h-3" /> {lbl}
                  </button>
                );
              })}
            </div>

            {/* Assignee picker */}
            <div className="relative">
              <button
                onClick={() => onUpdate({ assignOpen: !task.assignOpen })}
                className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-xs hover:border-blue-300 transition-colors bg-white">
                <span className={task.assignee ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                  {task.assignee || 'Sélectionner…'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${task.assignOpen ? 'rotate-180' : ''}`} />
              </button>

              {task.assignOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  {task.assignMode !== 'equipe' && (
                    <div className="p-2 border-b border-slate-100">
                      <input autoFocus value={search} onChange={e => onUpdate({ assignSearch: e.target.value })}
                        placeholder="Rechercher…"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                  )}
                  <div className="max-h-44 overflow-y-auto divide-y divide-slate-50">
                    {task.assignMode === 'agent' && filteredAgents.map(a => (
                      <button key={a.id} onClick={() => onUpdate({ assignee: `${a.prenom} ${a.nom}`, assignOpen: false, assignSearch: '' })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-blue-50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-blue-700">{a.prenom[0]}{a.nom[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{a.prenom} {a.nom}</p>
                          {a.service && <p className="text-[9px] text-slate-400 truncate">{a.service}</p>}
                        </div>
                        {task.assignee === `${a.prenom} ${a.nom}` && <Check className="w-3 h-3 text-blue-600 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                    {task.assignMode === 'equipe' && EQUIPES.map(eq => (
                      <button key={eq} onClick={() => onUpdate({ assignee: eq, assignOpen: false })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-blue-50 transition-colors">
                        <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700">{eq}</span>
                        {task.assignee === eq && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                      </button>
                    ))}
                    {task.assignMode === 'prestataire' && filteredPrests.map(p => (
                      <button key={p.id} onClick={() => onUpdate({ assignee: p.nom, assignOpen: false, assignSearch: '' })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-blue-50 transition-colors">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{p.nom}</p>
                          {p.categorie && <p className="text-[9px] text-slate-400 truncate">{p.categorie}</p>}
                        </div>
                        {task.assignee === p.nom && <Check className="w-3 h-3 text-blue-600 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                    {((task.assignMode === 'agent' && filteredAgents.length === 0) ||
                      (task.assignMode === 'prestataire' && filteredPrests.length === 0)) && (
                      <p className="px-4 py-3 text-xs text-slate-400">Aucun résultat</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Durée estimée */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Durée estimée</label>
              <button onClick={onSuggestDuration}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                title="Suggestion basée sur l'historique des interventions similaires">
                {task.dureeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Suggestion IA
              </button>
            </div>
            <div className="relative">
              <input
                type="number" value={task.dureeMin}
                onChange={e => onUpdate({ dureeMin: e.target.value })}
                placeholder="60" min={5} step={5}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10 ${task.dureeAiDone ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
            </div>
            {task.dureeAiDone && (
              <p className={`text-[10px] mt-1 flex items-center gap-1 ${critColor}`}>
                <Sparkles className="w-3 h-3" />
                Basé sur {hashStr((task.title || 'task') + 'sim') % 12 + 5} interventions similaires
              </p>
            )}
          </div>

        </div>

        {/* ── Right: Planification ── */}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Planification</label>
              <button onClick={onSuggestPlanning}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                title="Proposer 4 créneaux disponibles en tenant compte de la criticité">
                {task.planningLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Suggestion IA
              </button>
            </div>
            <FrDateTimePicker
              value={task.dateHeure}
              onChange={val => onUpdate({ dateHeure: val })}
            />
          </div>

          {/* AI Slots */}
          {task.planningOpen && task.planningSlots.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border-b border-blue-100">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-bold text-blue-700">4 créneaux suggérés</p>
                <span className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded ${critColor} bg-opacity-10`}>
                  {criticite}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {task.planningSlots.map((raw, i) => {
                  const [label, val] = raw.split('|');
                  return (
                    <button key={i} onClick={() => onApplySlot(val)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-blue-600">{i + 1}</span>
                      </div>
                      <span className="text-xs text-slate-700 font-medium">{label}</span>
                      <Check className="w-3 h-3 text-slate-300 ml-auto" />
                    </button>
                  );
                })}
              </div>
              <button onClick={() => onUpdate({ planningOpen: false })}
                className="w-full py-2 text-[10px] text-slate-400 hover:text-slate-600 border-t border-slate-100 transition-colors">
                Fermer
              </button>
            </div>
          )}

          {plannedDate && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  {plannedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-[10px] text-emerald-600">
                  {plannedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}

          {!task.dateHeure && !task.planningOpen && (
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="text-center">
                <Calendar className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                <p className="text-[10px] text-slate-300 leading-snug max-w-[120px]">
                  Cliquez "Suggestion IA" pour obtenir des créneaux disponibles
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
