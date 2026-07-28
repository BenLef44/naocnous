import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X, ChevronRight, Building2, Map, Wrench, AlertTriangle,
  Paperclip, PenLine, Check, Plus, Trash2, Upload, FileText,
  User, ChevronDown, Search, Save, Clock, ShieldCheck,
  Users, Sparkles, ClipboardList,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ERP, SignatureRegistre, PointRassemblement, EquipementSecurite, CommissionERP, ExerciceEvacuation, DocumentLiaison, RegistreSecuriteRecord } from './registreTypes';
import { CATEGORIE_ERP_LABELS, TYPE_ERP_LABELS } from './registreTypes';
import PlanViewer from './PlanViewer';
import SectionEquipements from './SectionEquipements';
import AIAssistant from './AIAssistant';
import ConformitySidebar from './ConformitySidebar';
import SectionCommissions from './SectionCommissions';
import SectionIncidents from './SectionIncidents';
import SectionDocuments from './SectionDocuments';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Section = 'identification' | 'consignes' | 'equipements' | 'commissions' | 'incidents' | 'documents' | 'signatures';

const SECTIONS: { id: Section; label: string; icon: React.ElementType; short: string }[] = [
  { id: 'identification', label: 'Identification ERP',         icon: Building2,     short: '1' },
  { id: 'consignes',      label: 'Consignes et plans',         icon: Map,           short: '2' },
  { id: 'equipements',    label: 'Équipements et contrôles',   icon: Wrench,        short: '3' },
  { id: 'commissions',    label: 'Commissions de sécurité',    icon: Users,         short: '4' },
  { id: 'incidents',      label: 'Incidents et exercices',     icon: AlertTriangle, short: '5' },
  { id: 'documents',      label: 'Documents annexes',          icon: Paperclip,     short: '6' },
  { id: 'signatures',     label: 'Signature électronique',     icon: PenLine,       short: '7' },
];

interface FormState {
  reference: string;
  annee: number;
  responsable_registre: string;
  responsable_legal: string;
  responsable_securite_incendie: string;
  exploitant: string;
  contacts_urgence: string;
  date_ouverture: string;
  consignes_incendie: string;
  plan_evac_url: string;
  point_rassemblement: string;
  consignes_pmr: string;
  nb_extincteurs: string;
  derniere_verif_ssi: string;
  derniere_verif_extincteurs: string;
  derniere_verif_eclairage: string;
  derniere_verif_desenfumage: string;
  organisme_controle: string;
  nb_exercices_annee: string;
  date_dernier_exercice: string;
  nb_incidents_annee: string;
  observations: string;
}

const DEFAULT_FORM: FormState = {
  reference: '',
  annee: new Date().getFullYear(),
  responsable_registre: '',
  responsable_legal: '',
  responsable_securite_incendie: '',
  exploitant: '',
  contacts_urgence: '',
  date_ouverture: new Date().toISOString().split('T')[0],
  consignes_incendie: '',
  plan_evac_url: '',
  point_rassemblement: '',
  consignes_pmr: '',
  nb_extincteurs: '',
  derniere_verif_ssi: '',
  derniere_verif_extincteurs: '',
  derniere_verif_eclairage: '',
  derniere_verif_desenfumage: '',
  organisme_controle: '',
  nb_exercices_annee: '0',
  date_dernier_exercice: '',
  nb_incidents_annee: '0',
  observations: '',
};

// ─── Helper : données Supabase ─────────────────────────────────────────────────

interface Agent { id: string; nom: string; prenom: string; poste: string; service: string; email?: string }
interface Prestataire { id: string; nom: string; categorie: string }

function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  useEffect(() => {
    supabase.from('agents_internes').select('id, nom, prenom, poste, service, email').eq('actif', true).order('nom')
      .then(({ data }) => setAgents((data ?? []) as Agent[]));
  }, []);
  return agents;
}

function usePrestataires() {
  const [presta, setPresta] = useState<Prestataire[]>([]);
  useEffect(() => {
    supabase.from('prestataires').select('id, nom, categorie').eq('actif', true).order('nom')
      .then(({ data }) => setPresta((data ?? []) as Prestataire[]));
  }, []);
  return presta;
}

// ─── Combobox générique ────────────────────────────────────────────────────────

interface ComboboxItem { id: string; label: string; sub?: string }

interface ComboboxProps {
  value: string;
  onChange: (v: string) => void;
  items: ComboboxItem[];
  placeholder?: string;
  emptyLabel?: string;
}

function Combobox({ value, onChange, items, placeholder = 'Sélectionner…', emptyLabel = 'Aucun résultat' }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = items.filter(i =>
    i.label.toLowerCase().includes(search.toLowerCase()) ||
    (i.sub ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const selected = items.find(i => i.label === value || i.id === value);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-xs text-left transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          ${value ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className={`flex-1 truncate ${value ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
          {(selected?.label ?? value) || placeholder}
        </span>
        {value && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange(''); }}
            className="p-0.5 hover:bg-red-100 rounded flex-shrink-0">
            <X className="w-2.5 h-2.5 text-slate-400 hover:text-red-500" />
          </button>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: 260 }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="flex-1 text-xs focus:outline-none placeholder-slate-400 bg-transparent" />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-slate-400" /></button>}
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">{emptyLabel}</p>
            ) : filtered.map(item => (
              <button key={item.id} type="button"
                onClick={() => { onChange(item.label); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors
                  ${(item.label === value || item.id === value) ? 'bg-emerald-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{item.label}</p>
                  {item.sub && <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>}
                </div>
                {(item.label === value || item.id === value) && (
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers UI ────────────────────────────────────────────────────────────────

function FieldGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
        {label}
        {hint && <span className="ml-1 text-[10px] font-normal normal-case text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-slate-50 disabled:text-slate-400" />
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      placeholder="jj/mm/aaaa"
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
  );
}

// ─── Multi-select organismes ───────────────────────────────────────────────────

function MultiOrganismes({ selected, onChange, prestataires, onImportFromControls, erpId }: {
  selected: string[];
  onChange: (v: string[]) => void;
  prestataires: Prestataire[];
  onImportFromControls: () => void;
  erpId: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items: ComboboxItem[] = prestataires.map(p => ({ id: p.id, label: p.nom, sub: p.categorie }));
  const filtered = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));
  const available = filtered.filter(i => !selected.includes(i.label));

  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter(s => s !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap gap-1.5 items-center min-h-[38px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
        {selected.map(org => (
          <span key={org} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5">
            {org}
            <button type="button" onClick={() => toggle(org)} className="hover:bg-emerald-100 rounded p-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-xs text-slate-400 px-1">Aucun organisme sélectionné</span>}
        <button type="button" onClick={() => setOpen(o => !o)}
          className="ml-auto flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:bg-emerald-50 rounded-md px-2 py-1">
          <Plus className="w-3 h-3" /> Ajouter
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: 280 }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un organisme…"
              className="flex-1 text-xs focus:outline-none placeholder-slate-400 bg-transparent" />
          </div>
          {/* Smart import button */}
          <button type="button"
            onClick={() => { onImportFromControls(); setOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border-b border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Importer depuis les contrôles existants
          </button>
          <div className="overflow-y-auto flex-1">
            {available.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">Tous les organismes sont sélectionnés</p>
            ) : available.map(item => (
              <button key={item.id} type="button"
                onClick={() => { toggle(item.label); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors">
                <Plus className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{item.label}</p>
                  {item.sub && <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ERP identity card ─────────────────────────────────────────────────────────

function ERPCard({ erp }: { erp: ERP }) {
  const rows = [
    { label: 'Catégorie ERP', value: CATEGORIE_ERP_LABELS[erp.categorie_erp] ?? erp.categorie_erp },
    { label: 'Type', value: TYPE_ERP_LABELS[erp.type_erp] ?? `Type ${erp.type_erp}` },
    { label: 'Effectif', value: `${erp.capacite} personnes` },
    { label: 'Exploitant', value: erp.responsable_securite ?? 'À préciser' },
    { label: 'Responsable', value: erp.responsable_securite ?? 'À préciser' },
  ];
  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-100 p-4 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-sm font-bold text-slate-800">{erp.nom}</p>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {rows.map(r => (
          <div key={r.label}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{r.label}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 1 : Identification ────────────────────────────────────────────────

function SectionIdentification({ erp, form, setForm, agents, prestataires, organismes, setOrganismes, onImportOrganismes }: {
  erp: ERP;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  agents: Agent[];
  prestataires: Prestataire[];
  organismes: string[];
  setOrganismes: (v: string[]) => void;
  onImportOrganismes: () => void;
}) {
  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const agentItems: ComboboxItem[] = agents.map(a => ({
    id: a.id,
    label: `${a.prenom} ${a.nom}`,
    sub: `${a.poste} — ${a.service}`,
  }));

  return (
    <div className="space-y-4">
      <ERPCard erp={erp} />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Référence du registre *">
          <Input value={form.reference} onChange={set('reference')} placeholder="REG-2026-001" />
        </FieldGroup>
        <FieldGroup label="Année *">
          <Input type="number" value={String(form.annee)}
            onChange={v => setForm(f => ({ ...f, annee: parseInt(v) || new Date().getFullYear() }))} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Date d'ouverture">
          <DateInput value={form.date_ouverture} onChange={set('date_ouverture')} />
        </FieldGroup>
        <FieldGroup label="Responsable du registre" hint="(annuaire interne)">
          <Combobox
            value={form.responsable_registre}
            onChange={set('responsable_registre')}
            items={agentItems}
            placeholder="Choisir un agent…"
            emptyLabel="Aucun agent trouvé"
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Responsable légal du bâtiment" hint="(annuaire interne)">
          <Combobox
            value={form.responsable_legal}
            onChange={set('responsable_legal')}
            items={agentItems}
            placeholder="Choisir un agent…"
            emptyLabel="Aucun agent trouvé"
          />
        </FieldGroup>
        <FieldGroup label="Responsable sécurité incendie" hint="(facultatif)">
          <Combobox
            value={form.responsable_securite_incendie}
            onChange={set('responsable_securite_incendie')}
            items={agentItems}
            placeholder="Choisir un agent…"
            emptyLabel="Aucun agent trouvé"
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Exploitant">
          <Input value={form.exploitant} onChange={set('exploitant')} placeholder="Ville de Saint-Malo" />
        </FieldGroup>
        <FieldGroup label="Contacts d'urgence">
          <Input value={form.contacts_urgence} onChange={set('contacts_urgence')} placeholder="Pompiers : 18 | SAMU : 15" />
        </FieldGroup>
      </div>

      <FieldGroup label="Organisme(s) de contrôle" hint="(multi-sélection)">
        <MultiOrganismes
          selected={organismes}
          onChange={setOrganismes}
          prestataires={prestataires}
          onImportFromControls={onImportOrganismes}
          erpId={erp.id}
        />
      </FieldGroup>
    </div>
  );
}

// ─── Section 2 : Consignes et plans ───────────────────────────────────────────

interface PlanEvacFile { nom: string; dataUrl: string; taille: string }

function SectionConsignes({ erp, form, setForm, planFiles, setPlanFiles, points, setPoints }: {
  erp: ERP;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  planFiles: PlanEvacFile[];
  setPlanFiles: React.Dispatch<React.SetStateAction<PlanEvacFile[]>>;
  points: PointRassemblement[];
  setPoints: (pts: PointRassemblement[]) => void;
}) {
  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPlanFiles(prev => [...prev, {
          nom: file.name,
          dataUrl: ev.target?.result as string,
          taille: file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
            : `${(file.size / 1024).toFixed(0)} Ko`,
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const defaultConsignes = `En cas d'incendie — ${erp.nom}\n\n1. ALERTER\n   • Composer le 18 (pompiers)\n   • Déclencher l'alarme incendie\n\n2. ÉVACUER\n   • Suivre les flèches vertes\n   • NE PAS utiliser les ascenseurs\n\n3. POINT DE RASSEMBLEMENT\n   • ${form.point_rassemblement || 'À préciser'}\n\nCOORDONNÉES D'URGENCE\n${erp.coordonnees_secours ?? 'Pompiers : 18 | SAMU : 15 | Police : 17'}`;

  return (
    <div className="space-y-4">
      <FieldGroup label="Consignes de sécurité incendie">
        <Textarea
          value={form.consignes_incendie || defaultConsignes}
          onChange={set('consignes_incendie')}
          rows={7}
          placeholder="Consignes détaillées…"
        />
      </FieldGroup>

      <FieldGroup label="Point de rassemblement">
        <Input value={form.point_rassemblement} onChange={set('point_rassemblement')}
          placeholder="Parking nord, 50 m de l'entrée" />
      </FieldGroup>

      {/* Plan évacuation — URL + pièce jointe */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Plan d'évacuation</p>

        <FieldGroup label="URL / référence GED">
          <Input value={form.plan_evac_url} onChange={set('plan_evac_url')}
            placeholder="https://... ou référence GED" />
        </FieldGroup>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Pièces jointes
            <span className="ml-1 text-[10px] font-normal normal-case text-slate-400">PDF, PNG, JPG</span>
          </label>
          {planFiles.length > 0 && (
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 mb-2 bg-white">
              {planFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                  <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{f.nom}</p>
                    <p className="text-[10px] text-slate-400">{f.taille}</p>
                  </div>
                  <a href={f.dataUrl} download={f.nom} target="_blank" rel="noreferrer"
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </a>
                  <button type="button" onClick={() => setPlanFiles(prev => prev.filter((_, j) => j !== i))}
                    className="p-1 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors cursor-pointer px-4 py-3">
            <Upload className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500">Ajouter un plan</p>
              <p className="text-[10px] text-slate-400">Cliquer ou glisser-déposer un fichier</p>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple
              onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Interactive plan viewer with gathering points */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-emerald-600" />
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Points de rassemblement — plan interactif</p>
        </div>
        <p className="text-[10px] text-slate-400">
          Cliquez sur « Ajouter point » puis cliquez sur le plan pour placer un point de rassemblement. Glissez pour repositionner.
        </p>
        <PlanViewer
          planUrl={form.plan_evac_url || (planFiles[0]?.dataUrl ?? '')}
          points={points}
          onPointsChange={setPoints}
          height="h-64"
        />
      </div>

      <FieldGroup label="Consignes spécifiques PMR">
        <Textarea value={form.consignes_pmr} onChange={set('consignes_pmr')} rows={3}
          placeholder="Les personnes à mobilité réduite se dirigent vers la zone de mise en sûreté au RDC…" />
      </FieldGroup>
    </div>
  );
}

// ─── Section 6 : Signatures ────────────────────────────────────────────────────

function SectionSignatures({ sigs, setSigs, agents }: {
  sigs: SignatureRegistre[];
  setSigs: React.Dispatch<React.SetStateAction<SignatureRegistre[]>>;
  agents: Agent[];
}) {
  const [acteur, setActeur] = useState('');
  const [role, setRole]     = useState('');
  const [email, setEmail]   = useState('');

  const agentItems: ComboboxItem[] = agents.map(a => ({
    id: a.id,
    label: `${a.prenom} ${a.nom}`,
    sub: `${a.poste} — ${a.service}`,
  }));

  const handlePickAgent = (label: string) => {
    const found = agents.find(a => `${a.prenom} ${a.nom}` === label);
    setActeur(label);
    if (found) {
      setRole(found.poste);
      setEmail(found.email ?? '');
    }
  };

  const addSig = () => {
    if (!acteur) return;
    setSigs(s => [...s, { acteur, role, email, date: new Date().toISOString(), valide: false }]);
    setActeur(''); setRole(''); setEmail('');
  };

  const toggle = (i: number) => setSigs(s => s.map((sig, j) => j === i ? { ...sig, valide: !sig.valide, date: new Date().toISOString() } : sig));
  const remove  = (i: number) => setSigs(s => s.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Ajoutez les signataires du registre. Chaque acteur peut valider sa signature individuellement.
      </p>
      <div className="space-y-2">
        {sigs.map((sig, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${sig.valide ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <button type="button" onClick={() => toggle(i)}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${sig.valide ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white hover:border-emerald-400'}`}>
              {sig.valide && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate ${sig.valide ? 'text-emerald-800' : 'text-slate-700'}`}>{sig.acteur}</p>
              <p className={`text-[10px] ${sig.valide ? 'text-emerald-600' : 'text-slate-400'}`}>
                {sig.role}{sig.email ? ` · ${sig.email}` : ''}{sig.valide ? ` · Signé le ${new Date(sig.date).toLocaleDateString('fr-FR')}` : ''}
              </p>
            </div>
            <button type="button" onClick={() => remove(i)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        ))}
        {sigs.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
            Aucun signataire ajouté
          </div>
        )}
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
        <p className="text-[11px] font-bold text-slate-600">Ajouter un signataire</p>
        <Combobox
          value={acteur}
          onChange={handlePickAgent}
          items={agentItems}
          placeholder="Choisir un agent de l'annuaire…"
          emptyLabel="Aucun agent trouvé"
        />
        <div className="grid grid-cols-2 gap-2">
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="Rôle"
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 bg-white" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 bg-white" />
        </div>
        <button type="button" onClick={addSig} disabled={!acteur}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>
    </div>
  );
}

// ─── Completude ────────────────────────────────────────────────────────────────

function computeCompletude(form: FormState, sigs: SignatureRegistre[], planFiles: PlanEvacFile[], points: PointRassemblement[], organismes: string[], equipements: EquipementSecurite[], commissions: CommissionERP[], exercices: ExerciceEvacuation[], docsLies: DocumentLiaison[]): number {
  const checks = [
    !!form.reference,
    !!form.responsable_registre,
    !!form.responsable_legal,
    !!form.date_ouverture,
    !!form.consignes_incendie,
    !!form.point_rassemp,
    planFiles.length > 0 || !!form.plan_evac_url,
    points.length > 0,
    organismes.length > 0,
    equipements.length > 0,
    !!form.derniere_verif_ssi,
    !!form.derniere_verif_extincteurs,
    exercices.length > 0,
    commissions.length > 0,
    docsLies.length > 0 || !!form.observations,
    sigs.length > 0,
    sigs.some(s => s.valide),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─── Main modal ────────────────────────────────────────────────────────────────

interface Props {
  erp: ERP;
  onClose: () => void;
  onSaved: () => void;
  initial?: Partial<{ reference: string }>;
  existingRegistre?: RegistreSecuriteRecord | null;
}

export default function NouveauRegistreModal({ erp, onClose, onSaved, initial, existingRegistre }: Props) {
  const [section, setSection] = useState<Section>('identification');
  const [form, setForm] = useState<FormState>(() => {
    if (existingRegistre) {
      return {
        reference: existingRegistre.reference,
        responsable_registre: existingRegistre.responsable_registre ?? '',
        responsable_legal: existingRegistre.responsable_legal ?? '',
        date_ouverture: existingRegistre.date_ouverture ?? '',
        consignes_incendie: existingRegistre.consignes_incendie ?? '',
        plan_evac_url: existingRegistre.plan_evac_url ?? '',
        point_rassemblement: existingRegistre.point_rassemblement ?? '',
        consignes_pmr: existingRegistre.consignes_pmr ?? '',
        derniere_verif_ssi: existingRegistre.derniere_verif_ssi ?? '',
        derniere_verif_extincteurs: existingRegistre.derniere_verif_extincteurs ?? '',
        derniere_verif_eclairage: existingRegistre.derniere_verif_eclairage ?? '',
        derniere_verif_desenfumage: existingRegistre.derniere_verif_desenfumage ?? '',
        nb_exercices_annee: existingRegistre.nb_exercices_annee?.toString() ?? '',
        date_dernier_exercice: existingRegistre.date_dernier_exercice ?? '',
        nb_incidents_annee: existingRegistre.nb_incidents_annee?.toString() ?? '',
        observations: existingRegistre.observations ?? '',
      };
    }
    return {
      ...DEFAULT_FORM,
      reference: initial?.reference ?? `REG-${new Date().getFullYear()}-001`,
      responsable_registre: erp.responsable_securite ?? '',
      organisme_controle: erp.organisme_controle ?? '',
    };
  });
  const [organismes, setOrganismes] = useState<string[]>(
    existingRegistre?.organismes_controle ?? (erp.organisme_controle ? [erp.organisme_controle] : [])
  );
  const [points, setPoints] = useState<PointRassemblement[]>(existingRegistre?.points_rassemplement ?? []);
  const [equipements, setEquipements] = useState<EquipementSecurite[]>(existingRegistre?.equipements_securite ?? []);
  const [commissions, setCommissions] = useState<CommissionERP[]>(existingRegistre?.commissions ?? []);
  const [exercices, setExercices] = useState<ExerciceEvacuation[]>(existingRegistre?.exercices ?? []);
  const [docsLies, setDocsLies] = useState<DocumentLiaison[]>(existingRegistre?.documents_lies ?? []);
  const [docs, setDocs]         = useState<DocItem[]>([]);
  const [sigs, setSigs]         = useState<SignatureRegistre[]>(existingRegistre?.signatures ?? []);
  const [planFiles, setPlanFiles] = useState<PlanEvacFile[]>([]);
  const [saving, setSaving]     = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [registreId, setRegistreId] = useState<string | null>(existingRegistre?.id ?? null);
  const [showAI, setShowAI] = useState(false);

  const agents      = useAgents();
  const prestataires = usePrestataires();

  const completude = computeCompletude(form, sigs, planFiles, points, organismes, equipements, commissions, exercices, docsLies);
  const currentIdx = SECTIONS.findIndex(s => s.id === section);
  const isLast     = currentIdx === SECTIONS.length - 1;

  // Auto-save: collect all form state into a payload
  const buildPayload = useCallback((statut: 'brouillon' | 'en_cours' | 'valide') => {
    const allDocs = [
      ...docs,
      ...planFiles.map(f => ({ nom: f.nom, type: "Plan d'évacuation", url: '' })),
    ];
    return {
      erp_id: erp.id,
      reference: form.reference,
      annee: form.annee,
      responsable_registre: form.responsable_registre || null,
      responsable_legal: form.responsable_legal || null,
      date_ouverture: form.date_ouverture || null,
      consignes_incendie: form.consignes_incendie || null,
      plan_evac_url: form.plan_evac_url || null,
      point_rassemblement: form.point_rassemblement || null,
      consignes_pmr: form.consignes_pmr || null,
      nb_extincteurs: form.nb_extincteurs ? parseInt(form.nb_extincteurs) : null,
      derniere_verif_ssi: form.derniere_verif_ssi || null,
      derniere_verif_extincteurs: form.derniere_verif_extincteurs || null,
      derniere_verif_eclairage: form.derniere_verif_eclairage || null,
      derniere_verif_desenfumage: form.derniere_verif_desenfumage || null,
      organisme_controle: organismes[0] ?? (form.organisme_controle || null),
      organismes_controle: organismes,
      points_rassemblement: points,
      equipements_securite: equipements,
      commissions: commissions,
      exercices: exercices,
      documents_lies: docsLies,
      nb_exercices_annee: parseInt(form.nb_exercices_annee) || 0,
      date_dernier_exercice: form.date_dernier_exercice || null,
      nb_incidents_annee: parseInt(form.nb_incidents_annee) || 0,
      observations: form.observations || null,
      documents: allDocs,
      signatures: sigs,
      statut,
      completude_pct: completude,
    };
  }, [form, docs, planFiles, organismes, points, equipements, commissions, exercices, docsLies, sigs, completude, erp.id]);

  // Auto-save with debounce
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!form.reference) return; // don't auto-save until reference is set
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      const payload = buildPayload('brouillon');
      if (registreId) {
        await supabase.from('registres_securite').update(payload).eq('id', registreId);
      } else {
        const { data } = await supabase.from('registres_securite').insert([payload]).select('id').maybeSingle();
        if (data?.id) setRegistreId(data.id);
      }
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
    }, 2500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [form, organismes, points, equipements, commissions, exercices, docsLies, docs, sigs, planFiles, completude, buildPayload, registreId, form.reference]);

  // Import organismes from existing controls
  const handleImportOrganismes = async () => {
    const { data } = await supabase
      .from('controles_erp')
      .select('prestataire')
      .eq('erp_id', erp.id)
      .not('prestataire', 'is', null);
    const unique = [...new Set((data ?? []).map(d => d.prestataire).filter(Boolean))] as string[];
    const merged = [...new Set([...organismes, ...unique])];
    setOrganismes(merged);
  };

  const handleSave = async (statut: 'brouillon' | 'en_cours' | 'valide') => {
    if (!form.reference) return;
    setSaving(true);
    const payload = buildPayload(statut);
    if (registreId) {
      await supabase.from('registres_securite').update(payload).eq('id', registreId);
    } else {
      await supabase.from('registres_securite').insert([payload]);
    }
    setSaving(false);
    onSaved();
  };

  const autoSaveLabel = autoSaveStatus === 'saving' ? 'Enregistrement…'
    : autoSaveStatus === 'saved' && lastSavedAt ? `Enregistré il y a ${Math.max(1, Math.floor((Date.now() - lastSavedAt.getTime()) / 1000))}s`
    : 'En attente…';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{existingRegistre ? 'Modifier le registre' : 'Nouveau registre de sécurité'}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{erp.nom}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              {autoSaveStatus === 'saving' ? (
                <><div className="animate-spin w-3 h-3 border border-slate-300 border-t-emerald-500 rounded-full" /> {autoSaveLabel}</>
              ) : autoSaveStatus === 'saved' ? (
                <><Check className="w-3 h-3 text-emerald-500" /> {autoSaveLabel}</>
              ) : (
                <><Clock className="w-3 h-3 text-slate-300" /> Brouillon</>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completude}%` }} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 w-8">{completude}%</span>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Section stepper */}
        <div className="flex items-stretch border-b border-slate-100 flex-shrink-0 overflow-x-auto">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === section;
            const isDone   = i < currentIdx;
            return (
              <button key={s.id} type="button" onClick={() => setSection(s.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-1 justify-center
                  ${isActive
                    ? 'border-emerald-500 text-emerald-700 bg-emerald-50/60'
                    : isDone
                      ? 'border-transparent text-emerald-600 hover:bg-emerald-50/40'
                      : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                  ${isActive ? 'bg-emerald-500 text-white' : isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : s.short}
                </div>
                <Icon className="w-3.5 h-3.5 hidden sm:block" />
                <span className="hidden md:block">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* AI analysis input */}
        {(() => {
          const aiInput = {
            reference: form.reference,
            responsable_registre: form.responsable_registre,
            responsable_legal: form.responsable_legal,
            date_ouverture: form.date_ouverture,
            consignes_incendie: form.consignes_incendie,
            plan_evac_url: form.plan_evac_url,
            point_rassemp: form.point_rassemblement,
            consignes_pmr: form.consignes_pmr,
            organismes,
            points,
            equipements,
            exercices,
            commissions,
            signatures: sigs,
            documents: docsLies,
            derniere_verif_ssi: form.derniere_verif_ssi,
            derniere_verif_extincteurs: form.derniere_verif_extincteurs,
            derniere_verif_eclairage: form.derniere_verif_eclairage,
            derniere_verif_desenfumage: form.derniere_verif_desenfumage,
            nb_incidents: form.nb_incidents_annee,
            observations: form.observations,
          };

          const sectionScores = [
            { id: 'identification', label: 'Identification', score: [!!form.reference, !!form.responsable_registre, !!form.responsable_legal, !!form.date_ouverture, organismes.length > 0].filter(Boolean).length, max: 5 },
            { id: 'consignes', label: 'Consignes & Plans', score: [!!form.consignes_incendie, !!form.plan_evac_url, !!form.point_rassemblement, points.length > 0, !!form.consignes_pmr].filter(Boolean).length, max: 5 },
            { id: 'equipements', label: 'Équipements', score: [equipements.length > 0, !!form.derniere_verif_ssi, !!form.derniere_verif_extincteurs, !!form.derniere_verif_eclairage].filter(Boolean).length, max: 4 },
            { id: 'commissions', label: 'Commissions', score: [commissions.length > 0, commissions.filter(c => c.reserves && c.levee_reserves).length === commissions.filter(c => c.reserves).length && commissions.length > 0 ? 1 : 0].filter(Boolean).length, max: 2 },
            { id: 'incidents', label: 'Incidents & Exercices', score: [exercices.length > 0, exercices.length >= 2, !!form.observations].filter(Boolean).length, max: 3 },
            { id: 'documents', label: 'Documents & Signatures', score: [docsLies.length > 0, sigs.length > 0, sigs.some(s => s.valide)].filter(Boolean).length, max: 3 },
          ];

          return (
            <div className="flex-1 flex min-h-0">
              {/* Main content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {section === 'identification' && (
                  <SectionIdentification
                    erp={erp} form={form} setForm={setForm}
                    agents={agents} prestataires={prestataires}
                    organismes={organismes} setOrganismes={setOrganismes}
                    onImportOrganismes={handleImportOrganismes}
                  />
                )}
                {section === 'consignes' && (
                  <SectionConsignes
                    erp={erp} form={form} setForm={setForm}
                    planFiles={planFiles} setPlanFiles={setPlanFiles}
                    points={points} setPoints={setPoints}
                  />
                )}
                {section === 'equipements' && (
                  <SectionEquipements
                    erp={erp}
                    equipements={equipements}
                    onEquipementsChange={setEquipements}
                    planUrl={form.plan_evac_url || (planFiles[0]?.dataUrl ?? '')}
                  />
                )}
                {section === 'commissions'  && <SectionCommissions commissions={commissions} onChange={setCommissions} />}
                {section === 'incidents'    && (
                  <SectionIncidents
                    exercices={exercices}
                    onChange={setExercices}
                    nbIncidents={form.nb_incidents_annee}
                    onNbIncidentsChange={v => setForm(f => ({ ...f, nb_incidents_annee: v }))}
                    observations={form.observations}
                    onObservationsChange={v => setForm(f => ({ ...f, observations: v }))}
                  />
                )}
                {section === 'documents'    && <SectionDocuments documents={docsLies} onChange={setDocsLies} />}
                {section === 'signatures'   && (
                  <SectionSignatures sigs={sigs} setSigs={setSigs} agents={agents} />
                )}
              </div>

              {/* AI assistant sidebar */}
              <div className="w-72 border-l border-slate-100 flex flex-col flex-shrink-0 hidden lg:flex">
                <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-600">Assistant IA</span>
                  </div>
                  <button onClick={() => setShowAI(s => !s)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${showAI ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                    {showAI ? 'Masquer' : 'Voir'}
                  </button>
                </div>
                {showAI ? (
                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    <AIAssistant input={aiInput} onJumpToSection={s => setSection(s as Section)} />
                  </div>
                ) : (
                  <ConformitySidebar
                    sections={sectionScores}
                    activeSection={section}
                    onJump={s => setSection(s as Section)}
                    overallScore={completude}
                  />
                )}
              </div>
            </div>
          );
        })()}
        {/* End AI analysis block */}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button type="button" onClick={() => handleSave('brouillon')} disabled={saving || !form.reference}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40">
              <Save className="w-3 h-3" /> Enregistrer brouillon
            </button>
          </div>
          <div className="flex items-center gap-2">
            {currentIdx > 0 && (
              <button type="button" onClick={() => setSection(SECTIONS[currentIdx - 1].id)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-semibold">
                <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Précédent
              </button>
            )}
            {!isLast && (
              <button type="button" onClick={() => setSection(SECTIONS[currentIdx + 1].id)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-semibold">
                Section suivante <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {isLast && (
              <button type="button" onClick={() => handleSave('valide')} disabled={saving || !form.reference}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Enregistrement…' : 'Valider et créer le registre'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
