import { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange, LayoutGrid,
  Users, SlidersHorizontal, X, Check, ShieldCheck, Wrench, Handshake,
  MapPin, Clock, RefreshCw, CheckCircle2, Circle, Building2,
  Paperclip, Camera, FileText, Trash2, ChevronDown, Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import apaveLogo        from '../assets/logo-Apave.jpg';
import socotecLogo      from '../assets/logo-SOCOTEC.png';
import bureauVeritasLogo from '../assets/logo-Bureau-Veritas.jpg';
import type { PlanRow, Origine } from './MaintenancePrevTableau';

// ─── Constants ─────────────────────────────────────────────────────────────────

type CalMode = 'month' | 'week' | 'year' | 'scheduler';

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTH_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const DAY_LABELS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const CAL_MODES: { key: CalMode; label: string; Icon: React.ElementType }[] = [
  { key: 'month',     label: 'Mois',         Icon: Calendar      },
  { key: 'week',      label: 'Semaine',       Icon: CalendarDays  },
  { key: 'year',      label: 'Année',         Icon: CalendarRange },
  { key: 'scheduler', label: 'Planificateur', Icon: LayoutGrid    },
];

const STATUT_CFG: Record<string, { label: string; border: string; bg: string; dot: string; text: string; cssColor: string }> = {
  'planifiée': { label: 'Planifiée',  border: 'border-blue-400',    bg: 'bg-blue-50',    dot: 'bg-blue-400',    text: 'text-blue-700',    cssColor: '#60a5fa' },
  'à venir':   { label: 'À venir',    border: 'border-slate-300',   bg: 'bg-slate-100',  dot: 'bg-slate-400',   text: 'text-slate-600',   cssColor: '#94a3b8' },
  'réalisée':  { label: 'Réalisée',   border: 'border-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700', cssColor: '#10b981' },
  'en retard': { label: 'En retard',  border: 'border-red-500',     bg: 'bg-red-50',     dot: 'bg-red-500',     text: 'text-red-700',     cssColor: '#ef4444' },
};

const ORIGINE_COLORS: Record<Origine, { bg: string; dot: string; label: string }> = {
  interne:       { bg: 'bg-blue-50',    dot: 'bg-blue-500',   label: 'Interne'       },
  contrat:       { bg: 'bg-emerald-50', dot: 'bg-emerald-500',label: 'Contrat'       },
  reglementaire: { bg: 'bg-amber-50',   dot: 'bg-amber-500',  label: 'Réglementaire' },
};

const FREQ_MONTHS: Record<string, number> = {
  'Mensuelle':    1,
  'Trimestrielle':3,
  'Semestrielle': 6,
  'Annuelle':     12,
  'Quinquennale': 60,
};

const ORG_LOGOS: Record<string, { logo?: string; bg: string; abbr: string }> = {
  'APAVE':         { logo: apaveLogo,        bg: '#2e7d32', abbr: 'AP' },
  'SOCOTEC':       { logo: socotecLogo,      bg: '#1565c0', abbr: 'SC' },
  'Bureau Veritas':{ logo: bureauVeritasLogo,bg: '#c62828', abbr: 'BV' },
};

// ─── Checklist per plan (keyed by plan name prefix) ─────────────────────────

const PLAN_CHECKLISTS: { match: string; items: string[] }[] = [
  { match: 'Nettoyage condenseurs',  items: ['Nettoyage condenseur', 'Nettoyage évaporateur', 'Contrôle ventilateurs', 'Vérification pression réfrigérant', 'Test alarmes'] },
  { match: 'Contrôle F-Gas',        items: ['Test étanchéité circuit réfrigérant', 'Relevé des charges', 'Vérification vannes', 'Rapport réglementaire F-Gas'] },
  { match: 'Vérification joints',   items: ['Inspection visuelle joints de porte', 'Mesure écart thermique', 'Remplacement joints défectueux', 'Vérification fermeture magnétique'] },
  { match: 'Contrat entretien',     items: ['Contrôle général équipement', 'Vérification organes de sécurité', 'Nettoyage et entretien courant', 'Rapport intervention prestataire'] },
  { match: 'Contrôle ventilateurs', items: ['Contrôle bruits/vibrations', 'Mesure débit d\'air', 'Nettoyage hélices', 'Vérification courroies'] },
  { match: 'Audit température',     items: ['Relevé températures toutes zones', 'Vérification sondes', 'Étalonnage si nécessaire', 'Rapport audit HACCP'] },
  { match: 'Test alarmes',          items: ['Déclenchement alarme haute température', 'Déclenchement alarme basse température', 'Test transmission SMS/email', 'Vérification délais d\'alarme'] },
  { match: 'Vérification électrique', items: ['Contrôle tableau électrique', 'Test différentiels', 'Mesure isolement', 'Vérification câblage'] },
];

function getChecklist(planNom: string): string[] {
  const clean = planNom.replace(/^[\p{Emoji}\s]+/u, '');
  const match = PLAN_CHECKLISTS.find(c => clean.toLowerCase().includes(c.match.toLowerCase()));
  return match?.items ?? ['Contrôle visuel général', 'Vérification fonctionnement', 'Nettoyage', 'Rapport d\'intervention'];
}

// ─── Equipment / location / description per plan ─────────────────────────────

interface PlanMeta {
  equipement: string;
  localisation: string[];
  description: string;
}

const PLAN_META: Record<string, PlanMeta> = {
  P1: {
    equipement: 'Armoire positive 5°C ± 2°C 1361 L',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'],
    description: 'Entretien préventif trimestriel des condenseurs et évaporateurs de l\'armoire positive. Inclut le nettoyage des organes frigorifiques, la vérification des températures et le contrôle des alarmes.',
  },
  P6: {
    equipement: 'Armoire positive 5°C ± 2°C 1361 L',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'],
    description: 'Contrôle annuel d\'étanchéité du circuit frigorifique au R-290 conformément au Règlement UE 517/2014 sur les gaz fluorés. Génération du rapport réglementaire obligatoire.',
  },
  P2: {
    equipement: 'Joint de porte armoire froide',
    localisation: ['Campus Centre Lyon 6', 'Résidence Jacques Cavalier', 'RDC — Buanderie'],
    description: 'Vérification mensuelle de l\'état des joints de porte afin d\'assurer l\'étanchéité thermique et la conformité HACCP.',
  },
  P3: {
    equipement: 'Armoire réfrigérée positive 1430 L',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'],
    description: 'Contrôle semestriel des ventilateurs frigorifiques : vibrations, débits d\'air et nettoyage des hélices.',
  },
  P4: {
    equipement: 'Groupe frigorifique compact',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Local technique'],
    description: 'Entretien annuel sous contrat prestataire incluant la révision complète du groupe frigorifique.',
  },
  P5: {
    equipement: 'Armoire positive 5°C ± 2°C 1361 L',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'],
    description: 'Audit annuel des températures HACCP : relevé de toutes les zones, étalonnage des sondes et génération du rapport.',
  },
  P7: {
    equipement: 'Centrale d\'alarme température',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'],
    description: 'Test mensuel du système d\'alarmes température : déclenchement, transmission et délais de notification.',
  },
  P8: {
    equipement: 'Tableau électrique TD-cuisine',
    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Local électrique'],
    description: 'Vérification réglementaire annuelle de l\'installation électrique conformément à la norme NF C 15-100.',
  },
};

const DEFAULT_META: PlanMeta = {
  equipement: 'Équipement',
  localisation: ['Campus', 'Bâtiment', 'Local technique'],
  description: 'Plan de maintenance préventive.',
};

function getPlanMeta(planId: string): PlanMeta {
  return PLAN_META[planId] ?? DEFAULT_META;
}

const ETATS_EQUIPEMENT = [
  'Bon état général',
  'Usure normale',
  'Usure avancée',
  'Dégradation visible',
  'Dysfonctionnement partiel',
  'Hors service',
];

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'other';
  previewUrl?: string;
}

// ─── PlanDetailModal ─────────────────────────────────────────────────────────

interface PlanDetailModalProps {
  event: PlannedEvent;
  onClose: () => void;
}

function PlanDetailModal({ event, onClose }: PlanDetailModalProps) {
  const { plan, date } = event;
  const meta = getPlanMeta(plan.id);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [etatEquipement, setEtatEquipement] = useState('');
  const [etatOpen, setEtatOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checklist = getChecklist(plan.nom);
  const statCfg  = STATUT_CFG[plan.statut] ?? STATUT_CFG['à venir'];
  const origCfg  = ORIGINE_COLORS[plan.origine];
  const OrigIcon = plan.origine === 'interne' ? Wrench : plan.origine === 'contrat' ? Handshake : ShieldCheck;

  const toggleItem = (i: number) => setCheckedItems(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: Attachment[] = Array.from(files).map(f => {
      const isImage = f.type.startsWith('image/');
      const isPdf   = f.type === 'application/pdf';
      return {
        id: `att-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} Mo` : `${Math.round(f.size / 1024)} Ko`,
        type: isImage ? 'image' : isPdf ? 'pdf' : 'other',
        previewUrl: isImage ? URL.createObjectURL(f) : undefined,
      };
    });
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      const checklistPayload = checklist.map((label, i) => ({ label, done: checkedItems.has(i) }));
      const datePlanifiee = date.toISOString().split('T')[0];

      // Upsert execution record
      const { data: exec, error: execErr } = await supabase
        .from('maintenance_task_executions')
        .upsert({
          plan_id:        plan.id,
          date_planifiee: datePlanifiee,
          checklist:      checklistPayload,
          etat_equipement: etatEquipement || null,
          statut:         'réalisée',
        }, { onConflict: 'plan_id,date_planifiee' })
        .select('id')
        .single();

      if (execErr) throw execErr;

      // Insert attachment metadata
      if (attachments.length > 0 && exec?.id) {
        const attRows = attachments.map(a => ({
          execution_id:   exec.id,
          plan_id:        plan.id,
          date_planifiee: datePlanifiee,
          file_name:      a.name,
          file_size:      a.size,
          file_type:      a.type,
        }));
        const { error: attErr } = await supabase.from('maintenance_attachments').insert(attRows);
        if (attErr) throw attErr;
      }

      setSaved(true);
      setTimeout(onClose, 900);
    } catch (err) {
      console.error('Save error:', err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{ maxHeight: '90vh', maxWidth: 860 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-lg">
            {event.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 leading-snug">{plan.nom.replace(/^[\p{Emoji}\s]+/u, '')}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statCfg.bg} ${statCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statCfg.dot}`} />
                {statCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${origCfg.bg}`}>
                <OrigIcon className="w-3 h-3" />
                {origCfg.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex-1 min-h-0 flex overflow-hidden">

          {/* Left — form */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 border-r border-slate-100" style={{ scrollbarWidth: 'thin' }}>

            {/* Equipment + Location */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Équipement concerné</p>
                  <p className="text-xs font-semibold text-slate-800">{meta.equipement}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Localisation</p>
                  <p className="text-xs text-slate-600">
                    {meta.localisation.map((seg, i) => (
                      <span key={i}>
                        {i > 0 && <span className="mx-1 text-slate-300">›</span>}
                        <span className={i === meta.localisation.length - 1 ? 'font-semibold text-slate-800' : ''}>{seg}</span>
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description du plan</p>
              <p className="text-xs text-slate-600 leading-relaxed">{meta.description}</p>
            </div>

            {/* Plan summary grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Responsable</p>
                <div className="flex items-center gap-2">
                  <RowAvatar plan={plan} size={20} />
                  <span className="text-xs font-semibold text-slate-700 truncate">{plan.responsable}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Fréquence</p>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">{plan.frequence}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Date planifiée</p>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">{date.toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Prochaine échéance</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">{plan.prochaine_echeance}</span>
                </div>
              </div>
            </div>

            {plan.source_label && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Référence réglementaire</p>
                  <p className="text-xs text-amber-800 mt-0.5">{plan.source_label}</p>
                </div>
              </div>
            )}

            {/* Equipment state */}
            <div className="relative">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">État de l'équipement</p>
              <button
                type="button"
                onClick={() => setEtatOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-xl text-xs hover:border-blue-300 transition-colors bg-white"
              >
                <span className={etatEquipement ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                  {etatEquipement || 'Sélectionner l\'état…'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${etatOpen ? 'rotate-180' : ''}`} />
              </button>
              {etatOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {ETATS_EQUIPEMENT.map(etat => {
                    const colors: Record<string, string> = {
                      'Bon état général':          'text-emerald-700 bg-emerald-50',
                      'Usure normale':             'text-slate-600   bg-slate-50',
                      'Usure avancée':             'text-amber-700   bg-amber-50',
                      'Dégradation visible':       'text-orange-700  bg-orange-50',
                      'Dysfonctionnement partiel': 'text-red-600     bg-red-50',
                      'Hors service':              'text-red-800     bg-red-100',
                    };
                    return (
                      <button
                        key={etat}
                        type="button"
                        onClick={() => { setEtatEquipement(etat); setEtatOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:brightness-95 transition-all text-left ${colors[etat] ?? 'text-slate-700 bg-white'}`}
                      >
                        {etatEquipement === etat && <Check className="w-3 h-3 flex-shrink-0" />}
                        {etat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700">Check-list des actions</p>
                <span className="text-[10px] text-slate-400 font-medium">{checkedItems.size}/{checklist.length} réalisé{checkedItems.size > 1 ? 's' : ''}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${checklist.length > 0 ? (checkedItems.size / checklist.length) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-2">
                {checklist.map((item, i) => {
                  const done = checkedItems.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleItem(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      {done
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      }
                      <span className={`text-xs flex-1 ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — photos sidebar */}
          <div className="w-64 flex-shrink-0 flex flex-col bg-slate-50/60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <p className="text-xs font-bold text-slate-700">Photos & Pièces jointes</p>
              {attachments.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-0.5">{attachments.length} fichier{attachments.length > 1 ? 's' : ''}</p>
              )}
            </div>

            <div className="flex-1 px-3 py-3 space-y-3">
              {/* Dropzone */}
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer bg-white"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xlsx"
                  multiple
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <Paperclip className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] font-medium text-slate-500">Déposer ou <span className="text-blue-600">parcourir</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Photos, PDF, documents</p>
              </div>

              {/* Image thumbnails grid */}
              {attachments.filter(a => a.type === 'image' && a.previewUrl).length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {attachments.filter(a => a.type === 'image' && a.previewUrl).map(att => (
                    <div key={att.id} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                      <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 text-[9px] text-white font-medium bg-black/40 px-1.5 py-0.5 truncate">{att.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Non-image files list */}
              {attachments.filter(a => a.type !== 'image').map(att => (
                <div key={att.id} className="flex items-center gap-2 px-2.5 py-2 bg-white rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {att.type === 'pdf'
                      ? <FileText className="w-4 h-4 text-red-400" />
                      : <Paperclip className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 truncate">{att.name}</p>
                    <p className="text-[10px] text-slate-400">{att.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              ))}

              {attachments.length === 0 && (
                <p className="text-center text-[11px] text-slate-400 py-4">Aucun fichier ajouté</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">Plan #{plan.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                saved ? 'bg-emerald-500 text-white' :
                saving ? 'bg-blue-400 text-white cursor-not-allowed' :
                'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saved && <CheckCircle2 className="w-3.5 h-3.5" />}
              {saved ? 'Enregistré !' : saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

function parseDate(dd_mm_yyyy: string): Date {
  const [d, m, y] = dd_mm_yyyy.split('/').map(Number);
  return new Date(y, m - 1, d);
}

interface PlannedEvent {
  planId: string;
  plan: PlanRow;
  date: Date;
  emoji: string;
}

function getEmoji(nom: string): string {
  return [...nom].find(c => /\p{Emoji}/u.test(c) && c !== ' ') ?? '📋';
}

function generateEvents(plans: PlanRow[], year: number, month?: number): PlannedEvent[] {
  const events: PlannedEvent[] = [];
  const rangeStart = month !== undefined ? new Date(year, month, 1)  : new Date(year, 0, 1);
  const rangeEnd   = month !== undefined ? new Date(year, month + 1, 0) : new Date(year, 11, 31);

  for (const plan of plans) {
    const base  = parseDate(plan.prochaine_echeance);
    const freq  = FREQ_MONTHS[plan.frequence] ?? 12;
    const emoji = getEmoji(plan.nom);

    // Walk forward from base
    let cur = new Date(base);
    while (cur <= rangeEnd) {
      if (cur >= rangeStart) {
        events.push({ planId: plan.id, plan, date: new Date(cur), emoji });
      }
      cur = addMonths(cur, freq);
    }
    // Walk backward from base
    cur = addMonths(base, -freq);
    while (cur >= rangeStart) {
      events.push({ planId: plan.id, plan, date: new Date(cur), emoji });
      cur = addMonths(cur, -freq);
    }
  }
  return events;
}

// ─── RowAvatar ────────────────────────────────────────────────────────────────

function RowAvatar({ plan, size = 24 }: { plan: PlanRow; size?: number }) {
  if (plan.origine === 'interne') {
    return (
      <div className="rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}>
        <Users style={{ width: size * 0.55, height: size * 0.55 }} className="text-blue-600" />
      </div>
    );
  }
  const cfg = ORG_LOGOS[plan.responsable];
  if (cfg?.logo) {
    return (
      <img src={cfg.logo} alt={plan.responsable}
        className="rounded object-contain border border-slate-200 bg-white flex-shrink-0"
        style={{ width: size, height: size, padding: 1 }} />
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded flex-shrink-0 font-bold text-white leading-none"
      style={{ width: size, height: size, background: cfg?.bg ?? '#64748b', fontSize: Math.max(7, size * 0.32) }}>
      {cfg?.abbr ?? plan.responsable.slice(0, 2).toUpperCase()}
    </span>
  );
}

// ─── EventChip ────────────────────────────────────────────────────────────────

function EventChip({ ev, onClick }: { ev: PlannedEvent; onClick?: (ev: PlannedEvent) => void }) {
  const cfg = STATUT_CFG[ev.plan.statut] ?? STATUT_CFG['à venir'];
  return (
    <div
      className={`w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform border ${cfg.bg}`}
      style={{ borderColor: cfg.cssColor }}
      onClick={e => { e.stopPropagation(); onClick?.(ev); }}
      title={`${ev.plan.nom}\n${ev.plan.responsable} — ${ev.plan.frequence}\n${ev.date.toLocaleDateString('fr-FR')}`}>
      {ev.emoji}
    </div>
  );
}

// ─── Month Grid ───────────────────────────────────────────────────────────────

function MonthGrid({ year, month, plans, activeStatuts, activeOrigines, onNavigate, onEventClick }: {
  year: number; month: number; plans: PlanRow[];
  activeStatuts: Set<string>; activeOrigines: Set<string>;
  onNavigate: (d: number) => void;
  onEventClick?: (ev: PlannedEvent) => void;
}) {
  const today = new Date();
  const firstDay  = new Date(year, month, 1);
  const startDow  = (firstDay.getDay() + 6) % 7;
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMon }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const filtered = plans.filter(p =>
    (activeStatuts.size === 0 || activeStatuts.has(p.statut)) &&
    (activeOrigines.size === 0 || activeOrigines.has(p.origine))
  );

  const events = useMemo(() => generateEvents(filtered, year, month), [filtered, year, month]);

  const byDay = useMemo(() => {
    const m = new Map<number, PlannedEvent[]>();
    events.forEach(ev => { const d = ev.date.getDate(); if (!m.has(d)) m.set(d, []); m.get(d)!.push(ev); });
    return m;
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <span className="text-sm font-semibold text-slate-700">{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => onNavigate(1)}  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
        {DAY_LABELS.map(d => <div key={d} className="px-2 py-1.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-auto" style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(100px, 1fr))` }}>
        {cells.map((day, idx) => {
          const isToday = day !== null && new Date(year, month, day).toDateString() === today.toDateString();
          const dayEvs = day ? (byDay.get(day) ?? []) : [];
          const MAX = 4; const overflow = dayEvs.length - MAX;
          return (
            <div key={idx} className={`border-r border-b border-slate-100 p-1 min-h-0 overflow-hidden ${!day ? 'bg-slate-50/40' : 'bg-white hover:bg-slate-50/40 transition-colors'}`}>
              {day && (
                <>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>{day}</div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayEvs.slice(0, MAX).map((ev, i) => <EventChip key={i} ev={ev} onClick={onEventClick} />)}
                    {overflow > 0 && <span className="text-[10px] text-slate-400 font-medium">+{overflow}</span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week Grid ────────────────────────────────────────────────────────────────

function WeekGrid({ year, month, week, plans, activeStatuts, activeOrigines, onNavigate, onEventClick }: {
  year: number; month: number; week: number; plans: PlanRow[];
  activeStatuts: Set<string>; activeOrigines: Set<string>;
  onNavigate: (d: number) => void;
  onEventClick?: (ev: PlannedEvent) => void;
}) {
  const firstDay = new Date(year, month, 1);
  const dow      = (firstDay.getDay() + 6) % 7;
  const firstMon = new Date(year, month, 1 - dow + week * 7);
  const days     = Array.from({ length: 7 }, (_, i) => { const d = new Date(firstMon); d.setDate(firstMon.getDate() + i); return d; });
  const today    = new Date();
  const weekLabel = `${days[0].getDate()} ${MONTH_SHORT[days[0].getMonth()]} – ${days[6].getDate()} ${MONTH_SHORT[days[6].getMonth()]} ${year}`;

  const filtered = plans.filter(p =>
    (activeStatuts.size === 0 || activeStatuts.has(p.statut)) &&
    (activeOrigines.size === 0 || activeOrigines.has(p.origine))
  );

  const weekEvents = useMemo(() => {
    const events: PlannedEvent[] = [];
    for (const d of days) {
      const m = d.getMonth(); const y = d.getFullYear();
      events.push(...generateEvents(filtered, y, m).filter(ev => ev.date.toDateString() === d.toDateString()));
    }
    return events;
  }, [filtered, days[0].toDateString()]);

  const byDay = useMemo(() => {
    const m = new Map<string, PlannedEvent[]>();
    weekEvents.forEach(ev => { const k = ev.date.toDateString(); if (!m.has(k)) m.set(k, []); m.get(k)!.push(ev); });
    return m;
  }, [weekEvents]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <span className="text-sm font-semibold text-slate-700">{weekLabel}</span>
        <button onClick={() => onNavigate(1)}  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
      </div>
      <div className="flex border-b border-slate-100 flex-shrink-0">
        <div className="w-36 flex-shrink-0 border-r border-slate-100" />
        {days.map(d => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={d.toISOString()} className="flex-1 text-center py-2 border-r border-slate-100 last:border-r-0">
              <div className="text-xs font-semibold uppercase tracking-wide mb-0.5 text-slate-400">{DAY_LABELS[(d.getDay() + 6) % 7]}</div>
              <div className={`text-base font-bold w-8 h-8 flex items-center justify-center rounded-full mx-auto ${isToday ? 'bg-blue-500 text-white' : 'text-slate-700'}`}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">Aucun plan pour ce filtre.</div>
        ) : filtered.map(plan => (
          <div key={plan.id} className="flex border-b border-slate-50 hover:bg-slate-50/40 transition-colors" style={{ minHeight: 44 }}>
            <div className="w-36 flex-shrink-0 border-r border-slate-100 px-3 py-2 flex items-center gap-1.5">
              <RowAvatar plan={plan} size={20} />
              <span className="text-xs text-slate-600 truncate leading-tight">{getEmoji(plan.nom)} {plan.nom.replace(/^[\p{Emoji}\s]+/u, '').slice(0, 22)}</span>
            </div>
            {days.map(d => {
              const dayEvs = (byDay.get(d.toDateString()) ?? []).filter(ev => ev.planId === plan.id);
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={d.toISOString()} className={`flex-1 border-r border-slate-100 last:border-r-0 px-0.5 py-1 flex flex-wrap gap-0.5 items-start justify-center ${isToday ? 'bg-blue-50/30' : ''}`}>
                  {dayEvs.map((ev, i) => <EventChip key={i} ev={ev} onClick={onEventClick} />)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Year Grid ────────────────────────────────────────────────────────────────

function YearGrid({ year, plans, activeStatuts, activeOrigines, onNavigate, onMonthClick }: {
  year: number; plans: PlanRow[];
  activeStatuts: Set<string>; activeOrigines: Set<string>;
  onNavigate: (d: number) => void; onMonthClick: (m: number) => void;
}) {
  const today = new Date();
  const filtered = plans.filter(p =>
    (activeStatuts.size === 0 || activeStatuts.has(p.statut)) &&
    (activeOrigines.size === 0 || activeOrigines.has(p.origine))
  );

  const countsByMonth = useMemo(() => {
    const map: Record<number, Record<string, number>> = {};
    for (let m = 0; m < 12; m++) {
      map[m] = {};
      const evs = generateEvents(filtered, year, m);
      evs.forEach(ev => { map[m][ev.plan.statut] = (map[m][ev.plan.statut] ?? 0) + 1; });
    }
    return map;
  }, [filtered, year]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <span className="text-sm font-semibold text-slate-700">{year}</span>
        <button onClick={() => onNavigate(1)}  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
          {MONTH_NAMES.map((name, mi) => {
            const data   = countsByMonth[mi] ?? {};
            const total  = Object.values(data).reduce((a, b) => a + b, 0);
            const isCurr = mi === today.getMonth() && year === today.getFullYear();
            return (
              <button key={mi} onClick={() => onMonthClick(mi)}
                className={`rounded-xl border p-3 text-left hover:border-blue-300 hover:shadow-sm transition-all ${isCurr ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className={`text-xs font-semibold mb-2 ${isCurr ? 'text-blue-700' : 'text-slate-600'}`}>{name}</div>
                {total === 0 ? <div className="text-xs text-slate-300">—</div> : (
                  <div className="space-y-1">
                    {Object.entries(data).map(([s, n]) => {
                      const cfg = STATUT_CFG[s]; if (!cfg) return null;
                      return (
                        <div key={s} className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="text-xs text-slate-500 truncate">{n} {cfg.label}</span>
                        </div>
                      );
                    })}
                    <div className="text-xs font-semibold text-slate-600 mt-1">{total} tâche{total > 1 ? 's' : ''}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Scheduler (annual scale) ─────────────────────────────────────────────────

function SchedulerAnnual({ year, plans, activeStatuts, activeOrigines, onNavigate, onEventClick }: {
  year: number; plans: PlanRow[];
  activeStatuts: Set<string>; activeOrigines: Set<string>;
  onNavigate: (d: number) => void;
  onEventClick?: (ev: PlannedEvent) => void;
}) {
  const today = new Date();

  const filtered = plans.filter(p =>
    (activeStatuts.size === 0 || activeStatuts.has(p.statut)) &&
    (activeOrigines.size === 0 || activeOrigines.has(p.origine))
  );

  // All events for the year, grouped by [planId][month]
  const evsByPlanMonth = useMemo(() => {
    const map = new Map<string, Map<number, PlannedEvent[]>>();
    filtered.forEach(p => map.set(p.id, new Map()));
    const allEvs = generateEvents(filtered, year);
    allEvs.forEach(ev => {
      if (!map.has(ev.planId)) return;
      const m = ev.date.getMonth();
      if (!map.get(ev.planId)!.has(m)) map.get(ev.planId)!.set(m, []);
      map.get(ev.planId)!.get(m)!.push(ev);
    });
    return map;
  }, [filtered, year]);

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <span className="text-sm font-semibold text-slate-700">Planificateur — {year}</span>
        <button onClick={() => onNavigate(1)}  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-2.5 text-left text-xs font-semibold text-slate-500 w-52">
                Plan
              </th>
              {months.map(m => {
                const isCurr = m === today.getMonth() && year === today.getFullYear();
                return (
                  <th key={m}
                    className={`border-b border-r border-slate-100 px-2 py-2.5 text-center text-xs font-semibold min-w-[72px] ${isCurr ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>
                    {MONTH_SHORT[m]}
                    {isCurr && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-0.5" />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="py-12 text-center text-sm text-slate-400">Aucun plan pour ce filtre.</td>
              </tr>
            )}
            {filtered.map(plan => {
              const planEvs = evsByPlanMonth.get(plan.id)!;
              const origCfg = ORIGINE_COLORS[plan.origine];
              return (
                <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <RowAvatar plan={plan} size={24} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 leading-tight truncate max-w-[160px]" title={plan.nom}>{plan.nom}</p>
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${origCfg.bg} ${origCfg.dot.replace('bg-', 'text-')}`}>
                          {origCfg.label}
                        </span>
                      </div>
                    </div>
                  </td>
                  {months.map(m => {
                    const isCurr = m === today.getMonth() && year === today.getFullYear();
                    const dayEvs = planEvs.get(m) ?? [];
                    return (
                      <td key={m}
                        className={`border-b border-r border-slate-100 px-1 py-1.5 text-center align-middle ${isCurr ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {dayEvs.map((ev, i) => {
                            const cfg = STATUT_CFG[ev.plan.statut] ?? STATUT_CFG['à venir'];
                            return (
                              <div key={i}
                                className={`w-7 h-7 rounded flex items-center justify-center text-sm cursor-pointer hover:scale-110 transition-transform border ${cfg.bg}`}
                                style={{ borderColor: cfg.cssColor }}
                                onClick={() => onEventClick?.(ev)}
                                title={`${ev.plan.nom}\n${ev.plan.responsable} — ${ev.plan.frequence}\nÉchéance : ${ev.date.toLocaleDateString('fr-FR')}\nStatut : ${cfg.label}`}>
                                {ev.emoji}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

function PlanFilterBar({ activeStatuts, onToggleStatut, activeOrigines, onToggleOrigine }: {
  activeStatuts: Set<string>; onToggleStatut: (s: string) => void;
  activeOrigines: Set<string>; onToggleOrigine: (o: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
        <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrer :
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {Object.entries(STATUT_CFG).map(([key, cfg]) => {
          const active = activeStatuts.has(key);
          return (
            <button key={key} type="button" onClick={() => onToggleStatut(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>
      <div className="w-px h-4 bg-slate-200 flex-shrink-0" />
      <div className="flex items-center gap-1 flex-wrap">
        {(Object.entries(ORIGINE_COLORS) as [Origine, typeof ORIGINE_COLORS[Origine]][]).map(([key, cfg]) => {
          const active = activeOrigines.has(key);
          return (
            <button key={key} type="button" onClick={() => onToggleOrigine(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} border-current` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props { plans: PlanRow[] }

export default function MaintenancePrevPlanning({ plans }: Props) {
  const today = new Date();
  const [calMode, setCalMode]   = useState<CalMode>('scheduler');
  const [year,    setYear]      = useState(today.getFullYear());
  const [month,   setMonth]     = useState(today.getMonth());
  const [week,    setWeek]      = useState(0);

  const allStatuts  = Object.keys(STATUT_CFG);
  const allOrigines = Object.keys(ORIGINE_COLORS) as Origine[];
  const [activeStatuts,  setActiveStatuts]  = useState<Set<string>>(new Set(allStatuts));
  const [activeOrigines, setActiveOrigines] = useState<Set<string>>(new Set(allOrigines));
  const [selectedEvent, setSelectedEvent] = useState<PlannedEvent | null>(null);

  const toggleStatut  = (s: string) => setActiveStatuts(prev  => { const n = new Set(prev);  n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleOrigine = (o: string) => setActiveOrigines(prev => { const n = new Set(prev); n.has(o) ? n.delete(o) : n.add(o); return n; });

  const navigateMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setMonth(m); setYear(y); setWeek(0);
  };

  const navigateWeek = (delta: number) => {
    const firstDay = new Date(year, month, 1);
    const dow      = (firstDay.getDay() + 6) % 7;
    const firstMon = new Date(year, month, 1 - dow + week * 7);
    firstMon.setDate(firstMon.getDate() + delta * 7);
    setYear(firstMon.getFullYear());
    setMonth(firstMon.getMonth());
    const newFirst = new Date(firstMon.getFullYear(), firstMon.getMonth(), 1);
    const newDow   = (newFirst.getDay() + 6) % 7;
    setWeek(Math.floor((firstMon.getDate() - 1 + newDow) / 7));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 space-y-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 ml-auto flex-shrink-0">
            {CAL_MODES.map(m => (
              <button key={m.key} onClick={() => setCalMode(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${calMode === m.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <m.Icon className="w-3.5 h-3.5" />{m.label}
              </button>
            ))}
          </div>
        </div>
        <PlanFilterBar
          activeStatuts={activeStatuts}   onToggleStatut={toggleStatut}
          activeOrigines={activeOrigines} onToggleOrigine={toggleOrigine}
        />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {calMode === 'month' && (
          <MonthGrid year={year} month={month} plans={plans}
            activeStatuts={activeStatuts} activeOrigines={activeOrigines}
            onNavigate={navigateMonth} onEventClick={setSelectedEvent} />
        )}
        {calMode === 'week' && (
          <WeekGrid year={year} month={month} week={week} plans={plans}
            activeStatuts={activeStatuts} activeOrigines={activeOrigines}
            onNavigate={navigateWeek} onEventClick={setSelectedEvent} />
        )}
        {calMode === 'year' && (
          <YearGrid year={year} plans={plans}
            activeStatuts={activeStatuts} activeOrigines={activeOrigines}
            onNavigate={d => setYear(y => y + d)}
            onMonthClick={m => { setMonth(m); setCalMode('month'); }} />
        )}
        {calMode === 'scheduler' && (
          <SchedulerAnnual year={year} plans={plans}
            activeStatuts={activeStatuts} activeOrigines={activeOrigines}
            onNavigate={d => setYear(y => y + d)} onEventClick={setSelectedEvent} />
        )}
      </div>

      {selectedEvent && (
        <PlanDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
