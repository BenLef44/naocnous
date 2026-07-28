import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, BookOpen, Camera, X as XIcon, Crop, Building2, Network, Users, User, Handshake, Contact, UserCheck, Group } from 'lucide-react';
import ActionsSidebar from './ActionsSidebar';
import PointsLibrary, { REPERAGE_ITEMS } from './PointsLibrary';
import CropModal from './CropModal';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DtaControleData {
  periodicite: string;
  site: string;
  residence: string;
  organisme: string;
  date_controle: string;
  date_prochain_controle: string;
  statut: string;
}

export interface DtaPointControle {
  id: string;
  libelle: string;
  conforme: boolean;
  criticite: 'Critique' | 'Majeure' | 'Mineure';
  localisation?: string;
  photo_data?: string; // base64 dataURL
}

export interface DtaAction {
  id: string;
  libelle_type: string;
  assigne_categorie: AssigneeCategory | '';
  assigne_nom: string;
  date_prevue: string;
}

export interface DtaFormData {
  controle: DtaControleData;
  points: DtaPointControle[];
  actions: DtaAction[];
}

interface AccordeonDtaFormProps {
  typeLabel: string;
  data: DtaFormData;
  onChange: (data: DtaFormData) => void;
  batiments: { id: string; nom: string }[];
  residences: { id: string; nom: string }[];
  onCaptureRequest?: () => string | null; // returns dataURL from PdfViewer
}

// ── Assignation categories ────────────────────────────────────────────────────

export type AssigneeCategory = 'entite' | 'service' | 'equipe' | 'agent' | 'partenaire' | 'contact' | 'utilisateur' | 'groupe';

const ASSIGNEE_CATEGORIES: { value: AssigneeCategory; label: string; Icon: React.ElementType }[] = [
  { value: 'entite',       label: 'Entités',       Icon: Building2 },
  { value: 'service',      label: 'Services',      Icon: Network },
  { value: 'equipe',       label: 'Équipes',       Icon: Users },
  { value: 'agent',        label: 'Agents',        Icon: User },
  { value: 'partenaire',   label: 'Partenaires',   Icon: Handshake },
  { value: 'contact',      label: 'Contacts',      Icon: Contact },
  { value: 'utilisateur',  label: 'Utilisateurs',  Icon: UserCheck },
  { value: 'groupe',       label: 'Groupes',       Icon: Group },
];

const ASSIGNEE_OPTIONS: Record<AssigneeCategory, string[]> = {
  entite:       ['CROUS Lyon', 'CROUS Grenoble', 'CROUS Clermont'],
  service:      ['Service Patrimoine', 'Service Technique', 'Service Sécurité', 'Direction'],
  equipe:       ['Équipe Nord', 'Équipe Sud', 'Équipe Maintenance'],
  agent:        ['Martin D.', 'Leroy P.', 'Dupont A.', 'Bernard C.', 'Moreau F.', 'Simon B.', 'Laurent E.', 'Michel G.'],
  partenaire:   ['APAVE', 'SOCOTEC', 'DEKRA', 'Bureau Veritas', 'Qualiconsult'],
  contact:      ['Référent amiante', 'Coordinateur SST', 'Responsable bâtiment'],
  utilisateur:  ['admin@crous-lyon.fr', 'tech@crous-lyon.fr', 'patrimoine@crous-lyon.fr'],
  groupe:       ['Responsables techniques', 'Chefs de site', 'Auditeurs'],
};

function AssigneeDropdown({
  value,
  onChange,
}: {
  value: AssigneeCategory | '';
  onChange: (v: AssigneeCategory) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = ASSIGNEE_CATEGORIES.find(c => c.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected ? (
            <>
              <selected.Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-slate-700 truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-slate-400">Catégorie...</span>
          )}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
          {ASSIGNEE_CATEGORIES.map(({ value: v, label, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => { onChange(v); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50
                ${v === value ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0 text-slate-500" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ──────────────────────────────────────────────────────────────────────────

const PERIODICITES_AMIANTE = [
  'Surveillance 3 ans',
  'Repérage avant travaux',
  'Dégradation',
  'Démolition',
  'Après des travaux',
  'Demande des autorités',
];

const ORGANISMES = ['APAVE', 'SOCOTEC', 'DEKRA', 'Bureau Veritas', 'Qualiconsult', 'Autre'];
const AGENTS_INTERNES = ['Martin D.', 'Leroy P.', 'Dupont A.', 'Bernard C.', 'Moreau F.', 'Simon B.', 'Laurent E.', 'Michel G.'];

function newPoint(): DtaPointControle {
  return { id: crypto.randomUUID(), libelle: '', conforme: true, criticite: 'Mineure' };
}

function newAction(): DtaAction {
  return { id: crypto.randomUUID(), libelle_type: '', assigne_categorie: '', assigne_nom: '', date_prevue: '' };
}

const inputCls = 'w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white transition-shadow';
const labelCls = 'text-xs font-medium text-slate-500 mb-1 block';

// ── Accordion section wrapper ──────────────────────────────────────────────────

function Section({ title, count, open, onToggle, children, accent }: {
  title: string; count?: number; open: boolean; onToggle: () => void; children: React.ReactNode; accent?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${open ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'}`}
      >
        <div className="flex items-center gap-2">
          {accent && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${accent}`} />}
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          {count !== undefined && (
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 py-4 border-t border-slate-100 space-y-3">{children}</div>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AccordeonDtaForm({ typeLabel, data, onChange, batiments, residences, onCaptureRequest }: AccordeonDtaFormProps) {
  const [openSection, setOpenSection] = useState<'controle' | 'points' | 'actions'>('controle');
  const [actionSidebarOpen, setActionSidebarOpen] = useState(false);
  const [pointsLibraryOpen, setPointsLibraryOpen] = useState(false);
  // crop state: which point id + raw dataURL to crop
  const [cropState, setCropState] = useState<{ pointId: string; rawDataUrl: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = (s: 'controle' | 'points' | 'actions') =>
    setOpenSection(prev => prev === s ? prev : s);

  // ── Controle helpers ──────────────────────────────────────────────────────
  const setControle = (patch: Partial<DtaControleData>) =>
    onChange({ ...data, controle: { ...data.controle, ...patch } });

  // ── Points helpers ─────────────────────────────────────────────────────────
  const setPoints = (points: DtaPointControle[]) => onChange({ ...data, points });
  const addPoint = () => setPoints([...data.points, newPoint()]);
  const removePoint = (id: string) => setPoints(data.points.filter(p => p.id !== id));
  const patchPoint = (id: string, patch: Partial<DtaPointControle>) =>
    setPoints(data.points.map(p => p.id === id ? { ...p, ...patch } : p));

  const addPointsFromLibrary = (labels: string[]) => {
    const newPoints = labels.map(l => ({ ...newPoint(), libelle: l }));
    setPoints([...data.points, ...newPoints]);
  };

  // ── Actions helpers ────────────────────────────────────────────────────────
  const setActions = (actions: DtaAction[]) => onChange({ ...data, actions });
  const addAction = () => setActions([...data.actions, newAction()]);
  const removeAction = (id: string) => setActions(data.actions.filter(a => a.id !== id));
  const patchAction = (id: string, patch: Partial<DtaAction>) =>
    setActions(data.actions.map(a => a.id === id ? { ...a, ...patch } : a));

  const addActionsFromLibrary = (labels: string[]) => {
    const newActions = labels.map(l => ({ ...newAction(), libelle_type: l }));
    setActions([...data.actions, ...newActions]);
  };

  // ── Capture helpers ────────────────────────────────────────────────────────
  const handleCapture = (pointId: string) => {
    if (!onCaptureRequest) return;
    const raw = onCaptureRequest();
    if (!raw) return;
    setCropState({ pointId, rawDataUrl: raw });
  };

  const isEventDriven = (perio: string) => perio !== 'Surveillance 3 ans';

  return (
    <div ref={containerRef} className="relative flex flex-col gap-3 h-full">

      {/* ── 1. Contrôle ─────────────────────────────────────────────────────── */}
      <Section
        title="1 — Contrôle"
        open={openSection === 'controle'}
        onToggle={() => toggle('controle')}
        accent="bg-blue-500"
      >
        {/* Type (read-only) */}
        <div>
          <label className={labelCls}>Type de contrôle</label>
          <div className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed">
            {typeLabel}
          </div>
        </div>

        {/* Périodicité */}
        <div>
          <label className={labelCls}>Périodicité</label>
          <select
            value={data.controle.periodicite}
            onChange={e => setControle({ periodicite: e.target.value })}
            className={inputCls}
          >
            <option value="">Sélectionner...</option>
            {PERIODICITES_AMIANTE.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Site */}
        <div>
          <label className={labelCls}>Site</label>
          <select
            value={data.controle.site}
            onChange={e => setControle({ site: e.target.value })}
            className={inputCls}
          >
            <option value="">Sélectionner un site...</option>
            {batiments.map(b => <option key={b.id} value={b.nom}>{b.nom}</option>)}
          </select>
        </div>

        {/* Résidence */}
        <div>
          <label className={labelCls}>Résidence / Bâtiment</label>
          <select
            value={data.controle.residence}
            onChange={e => setControle({ residence: e.target.value })}
            className={inputCls}
          >
            <option value="">Sélectionner une résidence...</option>
            {residences.map(r => <option key={r.id} value={r.nom}>{r.nom}</option>)}
          </select>
        </div>

        {/* Organisme */}
        <div>
          <label className={labelCls}>Organisme</label>
          <select
            value={data.controle.organisme}
            onChange={e => setControle({ organisme: e.target.value })}
            className={inputCls}
          >
            <option value="">Sélectionner...</option>
            {ORGANISMES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Dates — conditionnelles selon périodicité */}
        {isEventDriven(data.controle.periodicite) ? (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Périodicité événementielle — pas de date planifiée.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Date contrôle</label>
              <input
                type="date"
                value={data.controle.date_controle}
                onChange={e => setControle({ date_controle: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Prochain contrôle</label>
              <input
                type="date"
                value={data.controle.date_prochain_controle}
                onChange={e => setControle({ date_prochain_controle: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Statut */}
        <div>
          <label className={labelCls}>Statut</label>
          <select
            value={data.controle.statut}
            onChange={e => setControle({ statut: e.target.value })}
            className={inputCls}
          >
            <option value="realise">Réalisé</option>
            <option value="a_venir">À venir</option>
            <option value="en_retard">En retard</option>
            <option value="manquant">Manquant</option>
          </select>
        </div>
      </Section>

      {/* ── 2. Points de contrôle ────────────────────────────────────────────── */}
      <Section
        title="2 — Points de contrôle"
        count={data.points.length}
        open={openSection === 'points'}
        onToggle={() => toggle('points')}
        accent="bg-emerald-500"
      >
        <div className="space-y-3">
          {data.points.map((pt, idx) => {
            const isReperage = REPERAGE_ITEMS.has(pt.libelle);
            return (
              <div key={pt.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400">Point #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePoint(pt.id)}
                    className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors text-slate-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Libellé */}
                <div>
                  <label className={labelCls}>Libellé</label>
                  <input
                    value={pt.libelle}
                    onChange={e => patchPoint(pt.id, { libelle: e.target.value })}
                    placeholder="Description du point de contrôle..."
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Conforme */}
                  <div>
                    <label className={labelCls}>Conforme</label>
                    <select
                      value={pt.conforme ? 'oui' : 'non'}
                      onChange={e => patchPoint(pt.id, { conforme: e.target.value === 'oui' })}
                      className={inputCls}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  {/* Criticité */}
                  <div>
                    <label className={labelCls}>Criticité</label>
                    <select
                      value={pt.criticite}
                      onChange={e => patchPoint(pt.id, { criticite: e.target.value as any })}
                      className={inputCls}
                    >
                      <option value="Critique">Critique</option>
                      <option value="Majeure">Majeure</option>
                      <option value="Mineure">Mineure</option>
                    </select>
                  </div>
                </div>

                {/* Localisation + Photo — uniquement pour les points Repérage */}
                {isReperage && (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    {/* Localisation */}
                    <div>
                      <label className={labelCls}>Localisation</label>
                      <input
                        value={pt.localisation ?? ''}
                        onChange={e => patchPoint(pt.id, { localisation: e.target.value })}
                        placeholder="Ex : Couloir RDC, Local technique..."
                        className={inputCls}
                      />
                    </div>

                    {/* Photo capture */}
                    <div>
                      <label className={labelCls}>Photo (extrait PDF)</label>
                      {pt.photo_data ? (
                        <div className="relative group">
                          <img
                            src={pt.photo_data}
                            alt="Extrait PDF"
                            className="w-full rounded-lg border border-slate-200 object-contain max-h-36"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleCapture(pt.id)}
                              title="Recapturer"
                              className="p-1.5 bg-white rounded-lg shadow text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => patchPoint(pt.id, { photo_data: undefined })}
                              title="Supprimer"
                              className="p-1.5 bg-white rounded-lg shadow text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCapture(pt.id)}
                          disabled={!onCaptureRequest}
                          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {onCaptureRequest ? 'Capturer la page PDF courante' : 'Charger un PDF d\'abord'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add buttons row */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addPoint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => { setPointsLibraryOpen(true); setActionSidebarOpen(false); }}
            title="Choisir dans la bibliothèque"
            className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Bibliothèque
          </button>
        </div>
      </Section>

      {/* ── 3. Actions correctives ───────────────────────────────────────────── */}
      <Section
        title="3 — Actions correctives"
        count={data.actions.length}
        open={openSection === 'actions'}
        onToggle={() => toggle('actions')}
        accent="bg-orange-500"
      >
        <div className="space-y-3">
          {data.actions.map((ac, idx) => (
            <div key={ac.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-400">Action #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAction(ac.id)}
                  className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors text-slate-300"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Libellé type */}
              <div>
                <label className={labelCls}>Libellé type</label>
                <input
                  value={ac.libelle_type}
                  onChange={e => patchAction(ac.id, { libelle_type: e.target.value })}
                  placeholder="Description de l'action..."
                  className={inputCls}
                />
              </div>

              {/* Assigner à */}
              <div className="space-y-2">
                <label className={labelCls}>Assigner à</label>
                <AssigneeDropdown
                  value={ac.assigne_categorie}
                  onChange={(cat) => patchAction(ac.id, { assigne_categorie: cat, assigne_nom: '' })}
                />
                {ac.assigne_categorie && (
                  <select
                    value={ac.assigne_nom}
                    onChange={e => patchAction(ac.id, { assigne_nom: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Sélectionner...</option>
                    {(ASSIGNEE_OPTIONS[ac.assigne_categorie] ?? []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date prévue */}
              <div>
                <label className={labelCls}>Date prévue</label>
                <input
                  type="date"
                  value={ac.date_prevue}
                  onChange={e => patchAction(ac.id, { date_prevue: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add buttons row */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addAction}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-orange-300 hover:text-orange-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => { setActionSidebarOpen(true); setPointsLibraryOpen(false); }}
            title="Choisir dans la bibliothèque"
            className="flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-orange-300 hover:text-orange-600 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Bibliothèque
          </button>
        </div>
      </Section>

      {/* ── Sidebars / overlays ──────────────────────────────────────────────── */}
      {pointsLibraryOpen && (
        <PointsLibrary
          onSelect={(labels) => { addPointsFromLibrary(labels); }}
          onClose={() => setPointsLibraryOpen(false)}
        />
      )}

      {actionSidebarOpen && (
        <ActionsSidebar
          onSelect={(labels) => { addActionsFromLibrary(labels); }}
          onClose={() => setActionSidebarOpen(false)}
        />
      )}

      {/* ── Crop modal (teleported outside, rendered here) ───────────────────── */}
      {cropState && (
        <CropModal
          imageDataUrl={cropState.rawDataUrl}
          onConfirm={(cropped) => {
            patchPoint(cropState.pointId, { photo_data: cropped });
            setCropState(null);
          }}
          onClose={() => setCropState(null)}
        />
      )}
    </div>
  );
}
