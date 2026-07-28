import { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, Zap,
  BookOpen, Clock, RefreshCw, Bell, Mail, MessageSquare, Send,
  Layers, AlertTriangle, FileText, CalendarDays, Package,
  Home, ShieldCheck, Building2, ClipboardList,
} from 'lucide-react';
import type { ModuleSource, Canal, RegleDeclenchement } from './commTypes';
import { MODULE_LABELS, CANAL_LABELS } from './commTypes';
import { MOCK_MODELES } from './commData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RuleFormData {
  module: ModuleSource | '';
  evenement: string;
  modeleId: string;
  canal: Canal;
  delaiType: 'immediat' | 'avant' | 'apres';
  delaiVal: string;
  delaiUnite: 'min' | 'h' | 'j';
  frequence: 'once' | 'quotidien' | 'hebdo';
  actif: boolean;
}

interface Props {
  onClose: () => void;
  onSave: (rule: Omit<RegleDeclenchement, 'id'>) => void;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const MODULE_EVENEMENTS: Record<ModuleSource, { label: string; icon: React.ElementType }[]> = {
  interventions: [
    { label: 'Demande créée',               icon: FileText },
    { label: 'Demande affectée',            icon: Send },
    { label: 'Demande clôturée',            icon: Check },
    { label: 'Intervention en retard',      icon: AlertTriangle },
    { label: 'Demande escaladée',           icon: Bell },
  ],
  maintenance: [
    { label: 'Plan créé',                   icon: CalendarDays },
    { label: 'Tâche planifiée',             icon: CalendarDays },
    { label: 'Synthèse hebdomadaire',       icon: RefreshCw },
    { label: 'Tâche en retard',             icon: AlertTriangle },
  ],
  contrats: [
    { label: 'Contrat expirant',            icon: AlertTriangle },
    { label: 'Contrat renouvelé',           icon: RefreshCw },
    { label: 'Contrat créé',               icon: FileText },
  ],
  reglementaire: [
    { label: 'Contrôle à échéance',         icon: CalendarDays },
    { label: 'Contrôle non conforme',       icon: AlertTriangle },
    { label: 'Action corrective créée',     icon: ShieldCheck },
  ],
  approvisionnements: [
    { label: 'Rupture de stock',            icon: Package },
    { label: 'Devis validé',               icon: Check },
    { label: 'Commande livrée',            icon: Package },
  ],
  edl: [
    { label: 'EDL créé',                   icon: ClipboardList },
    { label: 'EDL clôturé',               icon: Check },
  ],
  equipements: [
    { label: 'Équipement à renouveler',    icon: AlertTriangle },
    { label: 'Équipement créé',           icon: Building2 },
  ],
  renouvellements: [
    { label: 'Budget PPI atteint',         icon: AlertTriangle },
    { label: 'Score vétusté > 80%',       icon: AlertTriangle },
  ],
};

const MODULE_ICONS: Record<ModuleSource, React.ElementType> = {
  interventions:     Zap,
  maintenance:       RefreshCw,
  contrats:          FileText,
  reglementaire:     ShieldCheck,
  approvisionnements:Package,
  edl:               ClipboardList,
  equipements:       Building2,
  renouvellements:   CalendarDays,
};

const CANAL_ICONS: Record<Canal, React.ElementType> = {
  email:       Mail,
  notif:       Bell,
  email_notif: Mail,
  sms:         MessageSquare,
};

const DEFAULT_FORM: RuleFormData = {
  module:      '',
  evenement:   '',
  modeleId:    '',
  canal:       'email_notif',
  delaiType:   'immediat',
  delaiVal:    '30',
  delaiUnite:  'j',
  frequence:   'once',
  actif:       true,
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{children}</p>;
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Module & Événement', 'Canal & Délai', 'Modèle', 'Récapitulatif'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NouvelleRegleModal({ onClose, onSave }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RuleFormData>(DEFAULT_FORM);

  const set = <K extends keyof RuleFormData>(k: K, v: RuleFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.module && !!form.evenement;
    if (step === 1) return true;
    if (step === 2) return !!form.modeleId;
    return true;
  };

  const selectedModele = MOCK_MODELES.find(m => m.id === form.modeleId);

  const buildDelaiLabel = () => {
    if (form.delaiType === 'immediat') return 'Immédiat';
    const units = { min: 'min', h: 'h', j: 'j' }[form.delaiUnite];
    const dir = form.delaiType === 'avant' ? 'avant' : 'après';
    return `${form.delaiVal} ${units} ${dir}`;
  };

  const buildFreqLabel = () => ({ once: 'Une seule fois', quotidien: 'Rappel quotidien', hebdo: 'Rappel hebdomadaire' }[form.frequence]);

  const handleSave = () => {
    if (!form.module || !form.evenement || !form.modeleId) return;
    onSave({
      module:     form.module,
      evenement:  form.evenement,
      modeleId:   form.modeleId,
      modeleNom:  selectedModele?.nom ?? '',
      delai:      buildDelaiLabel(),
      frequence:  buildFreqLabel(),
      actif:      form.actif,
    });
    onClose();
  };

  // ─── Step 0: Module + Event ─────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-5 px-6 py-5">
      <div>
        <Label>Module source</Label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MODULE_LABELS) as ModuleSource[]).map(mod => {
            const Icon = MODULE_ICONS[mod];
            const selected = form.module === mod;
            return (
              <button
                key={mod}
                type="button"
                onClick={() => { set('module', mod); set('evenement', ''); }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <Icon className={`w-4 h-4 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <span className={`text-xs font-semibold leading-tight ${selected ? 'text-blue-700' : 'text-slate-700'}`}>{MODULE_LABELS[mod]}</span>
                {selected && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {form.module && (
        <div>
          <Label>Événement déclencheur</Label>
          <div className="space-y-1.5">
            {MODULE_EVENEMENTS[form.module as ModuleSource].map(ev => {
              const Icon = ev.icon;
              const selected = form.evenement === ev.label;
              return (
                <button
                  key={ev.label}
                  type="button"
                  onClick={() => set('evenement', ev.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${selected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className={`text-xs font-medium ${selected ? 'text-amber-800' : 'text-slate-700'}`}>{ev.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-amber-500 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Step 1: Canal + Délai + Fréquence ────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5 px-6 py-5">
      {/* Canal */}
      <div>
        <Label>Canal de communication</Label>
        <div className="grid grid-cols-2 gap-2">
          {(['email', 'notif', 'email_notif', 'sms'] as Canal[]).map(c => {
            const Icon = CANAL_ICONS[c];
            const selected = form.canal === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => set('canal', c)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${selected ? 'text-blue-700' : 'text-slate-700'}`}>{CANAL_LABELS[c]}</span>
                {selected && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Délai */}
      <div>
        <Label>Délai d'envoi</Label>
        <div className="flex gap-2 mb-3">
          {([
            ['immediat', 'Immédiat', Clock],
            ['avant',    'X avant',  CalendarDays],
            ['apres',    'X après',  CalendarDays],
          ] as [RuleFormData['delaiType'], string, React.ElementType][]).map(([v, l, Icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => set('delaiType', v)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${form.delaiType === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {l}
            </button>
          ))}
        </div>
        {form.delaiType !== 'immediat' && (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={1}
              value={form.delaiVal}
              onChange={e => set('delaiVal', e.target.value)}
              className="w-20 text-sm border border-slate-200 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
            <div className="flex gap-1">
              {(['min', 'h', 'j'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => set('delaiUnite', u)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${form.delaiUnite === u ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {u === 'min' ? 'min' : u === 'h' ? 'heures' : 'jours'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fréquence */}
      <div>
        <Label>Fréquence d'envoi</Label>
        <div className="space-y-1.5">
          {([
            ['once',       'Une seule fois',     RefreshCw,   'Envoi unique à l\'occurrence de l\'événement'],
            ['quotidien',  'Rappel quotidien',   Clock,       'Répété chaque jour jusqu\'à résolution'],
            ['hebdo',      'Rappel hebdomadaire', CalendarDays,'Répété chaque semaine jusqu\'à résolution'],
          ] as [RuleFormData['frequence'], string, React.ElementType, string][]).map(([v, l, Icon, hint]) => (
            <button
              key={v}
              type="button"
              onClick={() => set('frequence', v)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${form.frequence === v ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${form.frequence === v ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <Icon className={`w-4 h-4 ${form.frequence === v ? 'text-blue-600' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold leading-tight ${form.frequence === v ? 'text-blue-700' : 'text-slate-700'}`}>{l}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{hint}</p>
              </div>
              {form.frequence === v && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Step 2: Modèle ────────────────────────────────────────────────────────

  const renderStep2 = () => {
    const filtered = MOCK_MODELES.filter(m => !form.module || m.module === form.module);
    return (
      <div className="space-y-4 px-6 py-5">
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">Sélectionnez un modèle existant ou créez-en un nouveau dans la bibliothèque.</p>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-8">Aucun modèle disponible pour ce module.</p>
          )}
          {filtered.map(m => {
            const selected = form.modeleId === m.id;
            const CanalIcon = CANAL_ICONS[m.type];
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { set('modeleId', m.id); set('canal', m.type); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <CanalIcon className={`w-4 h-4 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${selected ? 'text-blue-800' : 'text-slate-800'}`}>{m.nom}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{m.evenement}</span>
                    {m.nbEnvois > 0 && (
                      <span className="text-[10px] text-slate-400">{m.nbEnvois} envois · {m.tauxOuverture}% ouverture</span>
                    )}
                  </div>
                </div>
                {selected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                {!m.actif && <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Inactif</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Step 3: Summary ──────────────────────────────────────────────────────

  const renderStep3 = () => {
    const ModIcon = form.module ? MODULE_ICONS[form.module as ModuleSource] : Layers;
    const CanalIcon = CANAL_ICONS[form.canal];
    return (
      <div className="space-y-4 px-6 py-5">
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-2xl p-5 space-y-4">
          {/* Module + Event */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ModIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Déclencheur</p>
              <p className="text-sm font-bold text-slate-800">{form.evenement}</p>
              <p className="text-xs text-slate-500">{form.module ? MODULE_LABELS[form.module as ModuleSource] : ''}</p>
            </div>
          </div>

          <div className="border-t border-blue-100/60" />

          {/* Modèle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <CanalIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Modèle</p>
              <p className="text-sm font-bold text-slate-800">{selectedModele?.nom ?? '—'}</p>
              <p className="text-xs text-slate-500">{CANAL_LABELS[form.canal]}</p>
            </div>
          </div>

          <div className="border-t border-blue-100/60" />

          {/* Timing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Délai</p>
              <p className="text-sm font-bold text-slate-700">{buildDelaiLabel()}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Fréquence</p>
              <p className="text-sm font-bold text-slate-700">{buildFreqLabel()}</p>
            </div>
          </div>
        </div>

        {/* Activate toggle */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="text-xs font-bold text-slate-700">Activer la règle immédiatement</p>
            <p className="text-[11px] text-slate-400">La règle sera opérationnelle dès l'enregistrement</p>
          </div>
          <button
            type="button"
            onClick={() => set('actif', !form.actif)}
            className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.actif ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.actif ? 'left-4' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    );
  };

  const STEP_CONTENT = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-[540px]"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800">Nouvelle règle de déclenchement</h2>
            <p className="text-xs text-slate-400">Associez un événement à un modèle de communication</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Step bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
                <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0 transition-colors ${i < step ? 'bg-blue-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-[10px] font-semibold truncate ${i === step ? 'text-blue-600' : i < step ? 'text-slate-600' : 'text-slate-400'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-blue-300' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {STEP_CONTENT[step]()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {step === 0 ? 'Annuler' : 'Précédent'}
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all ${i === step ? 'w-4 h-1.5 bg-blue-500' : 'w-1.5 h-1.5 bg-slate-200'}`} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${canNext() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Suivant <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.modeleId}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${form.modeleId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <Check className="w-3.5 h-3.5" /> Créer la règle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
