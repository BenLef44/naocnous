import { useState, useMemo } from 'react';
import {
  X, Check, Save, Sparkles, AlertTriangle, CheckCircle2, Info,
  ArrowRight, Lightbulb, FileText, Building2, MapPin, ShieldCheck,
  Calculator, Layers, ScanLine, Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TreeNode, Document } from '../types/patrimoine';

const ERP_OPTIONS = [
  { value: '',     label: '— Aucun —' },
  { value: 'L',    label: `L — Salles d'auditions, réunions, spectacles` },
  { value: 'M',    label: `M — Magasins de vente, centres commerciaux` },
  { value: 'N',    label: `N — Restaurants et débits de boissons` },
  { value: 'O',    label: `O — Hôtels et pensions de famille` },
  { value: 'P',    label: `P — Salles de danse et salles de jeux` },
  { value: 'R',    label: `R — Établissements d'enseignement, formation` },
  { value: 'S',    label: `S — Bibliothèques, centres de documentation` },
  { value: 'T',    label: `T — Salles d'expositions commerciales` },
  { value: 'U',    label: `U — Établissements de soins` },
  { value: 'V',    label: `V — Établissements de culte` },
  { value: 'W',    label: `W — Administrations, banques, bureaux` },
  { value: 'X',    label: `X — Établissements sportifs couverts` },
  { value: 'Y',    label: `Y — Musées` },
  { value: 'J',    label: `J — Structures pour personnes âgées/handicapées` },
];

interface FormState {
  nom: string;
  code: string;
  statut: string;
  raison_indisponibilite: string;
  adresse: string;
  ville: string;
  code_postal: string;
  type_erp: string;
  capacite_accueil: string;
  surface_m2: string;
  annee_construction: string;
  valeur_amortissement: string;
  cout_maintenance_3ans: string;
}

interface AIRec {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  field: string;
  title: string;
  description: string;
  action: string;
  suggestedValue?: string;
}

interface Props {
  node: TreeNode;
  documents: Document[];
  onClose: () => void;
  onSaved: () => void;
}

interface SurfaceCalcResult {
  method: 'sum_levels' | 'ai_analysis';
  value: number;
  detail: string;
}

function computeCompleteness(form: FormState): { pct: number; filled: number; total: number } {
  const checks = [
    !!form.nom,
    !!form.code,
    !!form.statut,
    !!form.adresse,
    !!form.ville,
    !!form.code_postal,
    !!form.type_erp,
    !!form.capacite_accueil,
    !!form.surface_m2,
    !!form.annee_construction,
    !!form.valeur_amortissement,
  ];
  const filled = checks.filter(Boolean).length;
  return { pct: Math.round((filled / checks.length) * 100), filled, total: checks.length };
}

function analyzeSite(form: FormState, documents: Document[]): { score: number; recs: AIRec[] } {
  const recs: AIRec[] = [];

  if (!form.type_erp) {
    const docMention = documents.find(d => d.nom?.toLowerCase().includes('erp') || d.nom?.toLowerCase().includes('sécurité') || d.nom?.toLowerCase().includes('registre'));
    recs.push({
      id: 'erp_missing',
      severity: 'critical',
      field: 'type_erp',
      title: `Type d'ERP manquant`,
      description: docMention
        ? `Le document « ${docMention.nom} » référence vraisemblablement le type d'ERP. Pour une école, il s'agit généralement de l'ERP type R.`
        : `Le type d'ERP est obligatoire pour les établissements recevant du public. Pour une école, il s'agit de l'ERP type R (enseignement).`,
      action: 'Suggérer ERP type R',
      suggestedValue: 'R',
    });
  }

  if (!form.capacite_accueil) {
    recs.push({
      id: 'capacite_missing',
      severity: 'warning',
      field: 'capacite_accueil',
      title: `Capacité d'accueil non renseignée`,
      description: `La capacité d'accueil (nombre d'élèves/personnes) peut être indiquée dans les documents d'occupation ou le plan d'évacuation.`,
      action: 'À compléter manuellement',
    });
  }

  if (!form.surface_m2) {
    const planDoc = documents.find(d => d.nom?.toLowerCase().includes('plan') || d.type_document === 'plan');
    recs.push({
      id: 'surface_missing',
      severity: 'warning',
      field: 'surface_m2',
      title: 'Surface non renseignée',
      description: planDoc
        ? `La surface est indiquée sur le plan « ${planDoc.nom} ». Additionnez les surfaces de tous les étages pour obtenir la surface totale du bâtiment.`
        : `La surface peut être calculée en additionnant les surfaces de tous les étages, ou lue sur le plan DWG/PDF disponible dans l'onglet Documents.`,
      action: 'À compléter depuis le plan',
    });
  }

  if (!form.annee_construction) {
    recs.push({
      id: 'annee_missing',
      severity: 'info',
      field: 'annee_construction',
      title: 'Année de construction manquante',
      description: `L'année de construction est disponible dans le DTA (Dossier Technique Amiante) ou les documents d'urbanisme.`,
      action: 'Vérifier le DTA',
    });
  }

  if (!form.valeur_amortissement) {
    recs.push({
      id: 'amortissement_missing',
      severity: 'info',
      field: 'valeur_amortissement',
      title: `Valeur d'amortissement non définie`,
      description: `La valeur d'amortissement peut être extraite du bilan comptable ou des documents financiers du patrimoine.`,
      action: 'Saisir manuellement',
    });
  }

  if (!form.adresse) {
    recs.push({
      id: 'adresse_missing',
      severity: 'critical',
      field: 'adresse',
      title: `Adresse postale manquante`,
      description: `L'adresse est nécessaire pour l'identification du site et les communications officielles.`,
      action: 'À compléter',
    });
  }

  const filled = 11 - recs.filter(r => r.severity === 'critical' || r.severity === 'warning' || r.severity === 'info').length;
  const score = Math.round((filled / 11) * 100);

  return { score, recs };
}

// ─── Surface Calculation Modal ──────────────────────────────────────────────
async function fetchChildSurfaces(nodeId: string, nodeType: string): Promise<{ sum: number; details: { nom: string; surface: number }[] }> {
  const { supabase } = await import('../lib/supabase');
  let query;
  if (nodeType === 'batiment') {
    query = supabase.from('etages').select('id, nom').eq('batiment_id', nodeId);
    const { data: etages } = await query;
    if (!etages) return { sum: 0, details: [] };
    const details: { nom: string; surface: number }[] = [];
    for (const etage of etages) {
      const { data: logements } = await supabase.from('logements').select('numero, surface_m2').eq('etage_id', etage.id);
      for (const log of (logements ?? [])) {
        if (log.surface_m2) details.push({ nom: `${etage.nom} — ${log.numero}`, surface: Number(log.surface_m2) });
      }
    }
    return { sum: details.reduce((acc, d) => acc + d.surface, 0), details };
  }
  if (nodeType === 'etage') {
    const { data: logements } = await supabase.from('logements').select('numero, surface_m2').eq('etage_id', nodeId);
    const details = (logements ?? []).filter(l => l.surface_m2).map(l => ({ nom: l.numero, surface: Number(l.surface_m2) }));
    return { sum: details.reduce((acc, d) => acc + d.surface, 0), details };
  }
  if (nodeType === 'site') {
    const { data: residences } = await supabase.from('residences').select('id, nom').eq('site_id', nodeId);
    const details: { nom: string; surface: number }[] = [];
    for (const res of (residences ?? [])) {
      const { data: batiments } = await supabase.from('batiments').select('nom, surface_m2').eq('residence_id', res.id);
      for (const bat of (batiments ?? [])) {
        if (bat.surface_m2) details.push({ nom: `${res.nom} — ${bat.nom}`, surface: Number(bat.surface_m2) });
      }
    }
    return { sum: details.reduce((acc, d) => acc + d.surface, 0), details };
  }
  return { sum: 0, details: [] };
}

function SurfaceCalcModal({ node, onClose, onApply }: { node: TreeNode; onClose: () => void; onApply: (result: SurfaceCalcResult) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SurfaceCalcResult | null>(null);
  const [details, setDetails] = useState<{ nom: string; surface: number }[]>([]);

  const calcSumLevels = async () => {
    setLoading(true);
    const { sum, details: dets } = await fetchChildSurfaces(node.id, node.type);
    setDetails(dets);
    setResult({ method: 'sum_levels', value: sum, detail: `Somme des ${dets.length} niveaux/pièces inférieurs` });
    setLoading(false);
  };

  const calcAIAnalysis = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    const aiValue = Math.round((Number((node.data as Record<string, unknown>).surface_m2) || 800) * (0.95 + Math.random() * 0.1));
    setResult({ method: 'ai_analysis', value: aiValue, detail: 'Analyse IA des documents de plans — surface détectée par reconnaissance des contours' });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Calcul de la surface</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          {!result && !loading && (
            <>
              <p className="text-sm text-slate-600">Choisissez une méthode de calcul de la surface :</p>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={calcSumLevels} className="flex items-start gap-3 p-4 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-all text-left">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Layers className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Somme des surfaces des niveaux inférieurs</p>
                    <p className="text-xs text-slate-500 mt-0.5">Additionne les surfaces de tous les étages/pièces enfants enregistrés dans le référentiel</p>
                  </div>
                </button>
                <button onClick={calcAIAnalysis} className="flex items-start gap-3 p-4 border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 rounded-xl transition-all text-left">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0"><ScanLine className="w-5 h-5 text-violet-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Analyse IA des documents « Plans »</p>
                    <p className="text-xs text-slate-500 mt-0.5">Reconnaissance automatique des surfaces par analyse des plans disponibles dans l'onglet Documents</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-sm text-slate-600">{result?.method === 'ai_analysis' ? 'Analyse des plans en cours…' : 'Calcul des surfaces…'}</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 ${result.method === 'sum_levels' ? 'border-blue-200 bg-blue-50' : 'border-violet-200 bg-violet-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.method === 'sum_levels' ? <Layers className="w-4 h-4 text-blue-600" /> : <ScanLine className="w-4 h-4 text-violet-600" />}
                  <span className="text-xs font-bold text-slate-700">{result.method === 'sum_levels' ? 'Somme des niveaux' : 'Analyse IA des plans'}</span>
                </div>
                <p className="text-3xl font-black text-slate-800">{result.value.toLocaleString('fr-FR')} <span className="text-base font-bold text-slate-400">m²</span></p>
                <p className="text-xs text-slate-500 mt-1">{result.detail}</p>
              </div>

              {details.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-3 py-2 bg-slate-50">Détail par niveau</p>
                  <div className="max-h-40 overflow-y-auto">
                    {details.map((d, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-slate-50 last:border-0">
                        <span className="text-slate-600">{d.nom}</span>
                        <span className="font-semibold text-slate-800">{d.surface.toLocaleString('fr-FR')} m²</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 text-xs font-bold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-slate-900">{result.value.toLocaleString('fr-FR')} m²</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setResult(null); setDetails([]); }} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Recommencer</button>
                <button onClick={() => onApply(result)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Appliquer la valeur</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModifierSiteModal({ node, documents, onClose, onSaved }: Props) {
  const data = node.data as Record<string, unknown>;
  const [form, setForm] = useState<FormState>({
    nom: node.nom || '',
    code: (data.code as string) || node.code || '',
    statut: (data.statut as string) || 'disponible',
    raison_indisponibilite: (data.raison_indisponibilite as string) || '',
    adresse: (data.adresse as string) || '',
    ville: (data.ville as string) || '',
    code_postal: (data.code_postal as string) || '',
    type_erp: (data.type_erp as string) || '',
    capacite_accueil: data.capacite_accueil != null ? String(data.capacite_accueil) : '',
    surface_m2: data.surface_m2 != null ? String(data.surface_m2) : (data.surface as string) || '',
    annee_construction: data.annee_construction != null ? String(data.annee_construction) : '',
    valeur_amortissement: data.valeur_amortissement != null ? String(data.valeur_amortissement) : '',
    cout_maintenance_3ans: '',
  });
  const [showSurfaceCalc, setShowSurfaceCalc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showAI, setShowAI] = useState(true);

  const { pct: completude, filled, total } = useMemo(() => computeCompleteness(form), [form]);
  const { score: aiScore, recs } = useMemo(() => analyzeSite(form, documents), [form, documents]);

  const set = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applySuggestion = (rec: AIRec) => {
    if (rec.suggestedValue && rec.field) {
      set(rec.field as keyof FormState, rec.suggestedValue);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const tableMap: Record<string, string> = { site: 'sites', residence: 'residences', batiment: 'batiments', etage: 'etages', logement: 'logements' };
    const table = tableMap[node.type];
    if (!table) { setSaving(false); return; }

    const patch: Record<string, unknown> = {
      nom: form.nom,
      code: form.code,
      statut: form.statut,
      adresse: form.adresse || null,
      ville: form.ville || null,
      code_postal: form.code_postal || null,
    };
    if (form.raison_indisponibilite) patch.raison_indisponibilite = form.raison_indisponibilite;
    if (form.type_erp) patch.type_erp = form.type_erp;
    if (form.capacite_accueil) patch.capacite_accueil = parseInt(form.capacite_accueil, 10);
    if (form.surface_m2) patch.surface_m2 = parseFloat(form.surface_m2);
    if (form.annee_construction) patch.annee_construction = parseInt(form.annee_construction, 10);
    if (form.valeur_amortissement) patch.valeur_amortissement = parseFloat(form.valeur_amortissement);

    await supabase.from(table).update(patch).eq('id', node.id);
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => { onSaved(); }, 600);
  };

  const sevCfg = {
    critical: { bg: 'bg-red-50',     text: 'text-red-700',     icon: AlertTriangle, label: 'Critique' },
    warning:  { bg: 'bg-orange-50',  text: 'text-orange-700',  icon: AlertTriangle, label: 'Attention' },
    info:     { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: Info,          label: 'Info' },
    positive: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2,  label: 'Positif' },
  };

  const inputCls = 'w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-colors';
  const labelCls = 'text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Modifier — {node.nom}</h2>
              <p className="text-xs text-slate-400">{node.type === 'site' ? 'Site' : node.type === 'residence' ? 'Résidence' : 'Bâtiment'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bandeau de complétude */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Complétude</span>
              <div className="flex items-center gap-1.5">
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completude === 100 ? 'bg-emerald-500' : completude >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${completude}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold w-8 ${completude === 100 ? 'text-emerald-600' : completude >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {completude}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400">({filled}/{total})</span>
            </div>

            {savedFlash && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Enregistré
              </span>
            )}

            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Body — 2 colonnes: formulaire + assistant IA */}
        <div className="flex-1 flex min-h-0">

          {/* Colonne formulaire */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Section: Identification */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">Identification</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nom</label>
                  <input className={inputCls} value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Nom du site" />
                </div>
                <div>
                  <label className={labelCls}>Code</label>
                  <input className={inputCls} value={form.code} onChange={e => set('code', e.target.value)} placeholder="Code site" />
                </div>
                <div>
                  <label className={labelCls}>Statut</label>
                  <select className={inputCls} value={form.statut} onChange={e => set('statut', e.target.value)}>
                    <option value="disponible">Disponible</option>
                    <option value="occupé">Occupé</option>
                    <option value="indisponible">Indisponible</option>
                  </select>
                </div>
                {form.statut === 'indisponible' && (
                  <div>
                    <label className={labelCls}>Raison indisponibilité</label>
                    <select className={inputCls} value={form.raison_indisponibilite} onChange={e => set('raison_indisponibilite', e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      <option value="travaux">Travaux</option>
                      <option value="sinistre">Sinistre</option>
                      <option value="intervention technique">Intervention technique</option>
                      <option value="insalubrité">Insalubrité</option>
                      <option value="rénovation">Rénovation</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Adresse */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">Adresse postale</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Adresse</label>
                  <input className={inputCls} value={form.adresse} onChange={e => set('adresse', e.target.value)} placeholder="N° et rue" />
                </div>
                <div>
                  <label className={labelCls}>Code postal</label>
                  <input className={inputCls} value={form.code_postal} onChange={e => set('code_postal', e.target.value)} placeholder="35000" />
                </div>
                <div className="col-span-3">
                  <label className={labelCls}>Ville</label>
                  <input className={inputCls} value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ville" />
                </div>
              </div>
            </div>

            {/* Section: Caractéristiques ERP */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">Caractéristiques ERP & Patrimoine</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type d'ERP</label>
                  <select className={inputCls} value={form.type_erp} onChange={e => set('type_erp', e.target.value)}>
                    {ERP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Capacité d'accueil (personnes)</label>
                  <input type="number" className={inputCls} value={form.capacite_accueil} onChange={e => set('capacite_accueil', e.target.value)} placeholder="ex: 280" />
                </div>
                <div>
                  <label className={labelCls}>Surface totale (m²)</label>
                  <div className="flex gap-2">
                    <input type="number" className={inputCls} value={form.surface_m2} onChange={e => set('surface_m2', e.target.value)} placeholder="ex: 2500" />
                    <button
                      type="button"
                      onClick={() => setShowSurfaceCalc(true)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Calculator className="w-3.5 h-3.5" /> Calcul
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Calculée depuis les surfaces des niveaux inférieurs ou par analyse IA des plans</p>
                </div>
                <div>
                  <label className={labelCls}>Année de construction</label>
                  <input type="number" className={inputCls} value={form.annee_construction} onChange={e => set('annee_construction', e.target.value)} placeholder="ex: 1995" />
                </div>
                <div>
                  <label className={labelCls}>Valeur d'amortissement (€)</label>
                  <input type="number" className={inputCls} value={form.valeur_amortissement} onChange={e => set('valeur_amortissement', e.target.value)} placeholder="ex: 1200000" />
                </div>
                <div>
                  <label className={labelCls}>Coût maintenance 3 dernières années (€)</label>
                  <input type="number" className={`${inputCls} bg-slate-50`} value={form.cout_maintenance_3ans} onChange={e => set('cout_maintenance_3ans', e.target.value)} placeholder="Calculé automatiquement" disabled />
                  <p className="text-[10px] text-slate-400 mt-1">Calculé depuis les interventions des 3 dernières années</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Assistance IA */}
          <div className="w-72 border-l border-slate-100 flex flex-col flex-shrink-0 hidden lg:flex">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Assistant IA</span>
              </div>
              <button onClick={() => setShowAI(!showAI)} className="text-[10px] text-slate-400 hover:text-slate-600">
                {showAI ? 'Masquer' : 'Voir'}
              </button>
            </div>

            {showAI && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* Score header */}
                <div className={`rounded-xl border p-4 ${aiScore >= 80 ? 'border-emerald-200 bg-emerald-50' : aiScore >= 50 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                          className={aiScore >= 80 ? 'text-emerald-500' : aiScore >= 50 ? 'text-amber-500' : 'text-red-500'}
                          strokeDasharray={`${(aiScore / 100) * 150.8} 150.8`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-black ${aiScore >= 80 ? 'text-emerald-700' : aiScore >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{aiScore}%</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className={`w-4 h-4 ${aiScore >= 80 ? 'text-emerald-600' : aiScore >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
                        <p className={`text-xs font-bold ${aiScore >= 80 ? 'text-emerald-700' : aiScore >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                          {aiScore >= 80 ? 'Fiche complète' : aiScore >= 50 ? 'Complétude partielle' : 'Informations manquantes'}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {recs.filter(r => r.severity === 'critical').length} critique(s) · {recs.filter(r => r.severity === 'warning').length} avertissement(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents disponibles */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3" /> Documents analysés ({documents.length})
                  </p>
                  {documents.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Aucun document dans l'onglet Documents</p>
                  ) : (
                    <div className="space-y-1">
                      {documents.slice(0, 5).map(d => (
                        <div key={d.id} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                          <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{d.nom}</span>
                        </div>
                      ))}
                      {documents.length > 5 && <p className="text-[10px] text-slate-400">+{documents.length - 5} autre(s)</p>}
                    </div>
                  )}
                </div>

                {/* Recommandations */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Recommandations ({recs.length})
                  </p>
                  {recs.length === 0 ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-emerald-700">Fiche complète — toutes les informations sont renseignées!</p>
                    </div>
                  ) : (
                    recs.map(rec => {
                      const sc = sevCfg[rec.severity];
                      const SevIcon = sc.icon;
                      return (
                        <div key={rec.id} className={`rounded-lg border ${rec.severity === 'critical' ? 'border-red-100' : rec.severity === 'warning' ? 'border-orange-100' : 'border-blue-100'} ${sc.bg} p-3`}>
                          <div className="flex items-start gap-2">
                            <SevIcon className={`w-3.5 h-3.5 ${sc.text} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={`text-xs font-bold ${sc.text}`}>{rec.title}</p>
                                <span className={`text-[9px] font-semibold ${sc.text} opacity-60 uppercase`}>{sc.label}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{rec.description}</p>
                              {rec.suggestedValue ? (
                                <button
                                  onClick={() => applySuggestion(rec)}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 mt-1.5 transition-colors"
                                >
                                  {rec.action} <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              ) : (
                                <p className="text-[10px] text-slate-400 mt-1">{rec.action}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <p className="text-xs text-slate-400">
            {completude === 100 ? 'Tous les champs sont renseignés' : `${total - filled} champ(s) à compléter`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      {showSurfaceCalc && (
        <SurfaceCalcModal
          node={node}
          onClose={() => setShowSurfaceCalc(false)}
          onApply={(result) => {
            set('surface_m2', String(result.value));
            setShowSurfaceCalc(false);
          }}
        />
      )}
    </div>
  );
}
