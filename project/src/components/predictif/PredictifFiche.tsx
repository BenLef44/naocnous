import React, { useState } from 'react';
import {
  Brain, ArrowLeft, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  MapPin, Wrench, Calendar, User, Building2, BarChart2, Clock,
  ChevronDown, ChevronUp, Activity, FileText, History, Settings,
} from 'lucide-react';
import {
  Prediction, MOCK_PREDICTIONS,
  CRITICITE_PRED_CFG, STATUT_PRED_CFG, CATEGORIE_PRED_CFG,
} from './predictifTypes';

// ─── Confidence gauge (SVG arc) ───────────────────────────────────────────────

function ConfidenceArc({ value }: { value: number }) {
  const r = 36;
  const cx = 50, cy = 50;
  const startAngle = -200;
  const sweep = 220;
  const toRad = (a: number) => (a * Math.PI) / 180;
  const pt = (a: number) => [
    cx + r * Math.cos(toRad(a)),
    cy + r * Math.sin(toRad(a)),
  ];

  const [sx, sy] = pt(startAngle);
  const endAngle = startAngle + sweep;
  const [ex, ey] = pt(endAngle);

  const fillAngle = startAngle + (value / 100) * sweep;
  const [fx, fy] = pt(fillAngle);

  const trackD = `M${sx},${sy} A${r},${r} 0 1,1 ${ex},${ey}`;
  const fillD = `M${sx},${sy} A${r},${r} 0 ${value > 50 ? 1 : 0},1 ${fx},${fy}`;

  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f97316' : '#ef4444';

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
      <path d={trackD} fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
      <path d={fillD} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <text x="50" y="54" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" style={{ fontSize: 18, fontWeight: 700, fill: color }}>
        {value}%
      </text>
      <text x="50" y="68" textAnchor="middle" style={{ fontSize: 8, fill: '#94a3b8' }}>confiance</text>
    </svg>
  );
}

// ─── Mini probability bar ─────────────────────────────────────────────────────

function ProbBar({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? 'bg-red-500' : value >= 60 ? 'bg-orange-400' : 'bg-blue-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ─── Impact chip ──────────────────────────────────────────────────────────────

function ImpactChip({ active, label, color }: { active: boolean; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${active ? color : 'bg-slate-100 text-slate-400'}`}>
      {active ? '●' : '○'} {label}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="text-slate-600">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Simulation widget ────────────────────────────────────────────────────────

function SimulationWidget({ pred }: { pred: Prediction }) {
  const [scenario, setScenario] = useState<'baseline' | 'immediate' | 'delay'>('baseline');

  const scenarios = {
    baseline: { prob: pred.probabilite, cout: pred.cout_estime ?? 0, label: 'Aucune action', color: 'text-red-600' },
    immediate: { prob: Math.max(5, pred.probabilite - 55), cout: Math.round((pred.cout_estime ?? 0) * 0.4), label: 'Action immédiate', color: 'text-emerald-600' },
    delay: { prob: Math.min(99, pred.probabilite + 12), cout: Math.round((pred.cout_estime ?? 0) * 1.6), label: 'Action retardée (3 mois)', color: 'text-orange-600' },
  };

  const s = scenarios[scenario];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(Object.keys(scenarios) as (keyof typeof scenarios)[]).map(k => (
          <button
            key={k}
            onClick={() => setScenario(k)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${scenario === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
          >
            {scenarios[k].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg bg-slate-50 border border-slate-200 text-center`}>
          <div className={`text-2xl font-bold ${s.color}`}>{s.prob}%</div>
          <div className="text-xs text-slate-500 mt-0.5">Probabilité résiduelle</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-700">{s.cout.toLocaleString('fr-FR')} €</div>
          <div className="text-xs text-slate-500 mt-0.5">Coût estimé</div>
        </div>
      </div>
      {scenario === 'immediate' && (
        <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          Agir maintenant réduit le risque de 55% et le coût de 60%.
        </div>
      )}
      {scenario === 'delay' && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Reporter l'action augmente le coût de 60% et la probabilité de panne.
        </div>
      )}
    </div>
  );
}

// ─── Mock action history ──────────────────────────────────────────────────────

const MOCK_HISTORY = [
  { date: '28 mai 2026 – 08:00', actor: 'Moteur IA', text: 'Prédiction générée automatiquement', icon: <Brain className="w-3.5 h-3.5 text-blue-500" /> },
  { date: '28 mai 2026 – 10:45', actor: 'Martin D.', text: 'Statut changé → Confirmé', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
  { date: '29 mai 2026 – 09:00', actor: 'Simon B.', text: 'Responsable assigné : Martin D.', icon: <User className="w-3.5 h-3.5 text-slate-500" /> },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  predId?: string;
  onBack?: () => void;
}

export default function PredictifFiche({ predId, onBack }: Props) {
  const pred = MOCK_PREDICTIONS.find(p => p.id === predId) ?? MOCK_PREDICTIONS[0];
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  const statCfg = STATUT_PRED_CFG[pred.statut];
  const catCfg = CATEGORIE_PRED_CFG[pred.categorie];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className={`shrink-0 px-6 py-4 ${critCfg.bg} border-b ${critCfg.border}`}>
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono text-slate-500 bg-white/60 px-2 py-0.5 rounded border border-slate-200">{pred.reference}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${critCfg.badgeBg} ${critCfg.text}`}>
                {critCfg.icon} {critCfg.label}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statCfg.bg} ${statCfg.text} ${statCfg.border}`}>
                {statCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catCfg.bg} ${catCfg.color} border ${catCfg.border}`}>
                {catCfg.icon} {catCfg.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{pred.titre}</h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{pred.description}</p>
          </div>
          <div className="shrink-0">
            <ConfidenceArc value={pred.confiance_ia} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 grid grid-cols-3 gap-5">
        {/* Left column (2/3) */}
        <div className="col-span-2 space-y-4">
          {/* Justification IA */}
          <Section title="Justification IA" icon={<Brain className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">{pred.justification_ia}</p>
              <div className="grid grid-cols-3 gap-3">
                <ProbBar value={pred.probabilite} label="Probabilité" />
                <ProbBar value={pred.score_ia} label="Score IA" />
                <ProbBar value={pred.confiance_ia} label="Confiance" />
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-0.5">Action recommandée</p>
                  <p className="text-sm text-blue-800">{pred.action_recommandee}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Simulation */}
          <Section title="Simulation de scénarios" icon={<TrendingUp className="w-4 h-4" />}>
            <SimulationWidget pred={pred} />
          </Section>

          {/* Sources */}
          <Section title="Données sources" icon={<Activity className="w-4 h-4" />}>
            <div className="space-y-2 text-sm text-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sources utilisées par l'IA</p>
              {pred.source.split(' · ').map(s => (
                <div key={s} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="text-sm text-slate-700">{s}</span>
                  <span className="ml-auto text-xs text-emerald-600 font-medium">Actif</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Historique */}
          <Section title="Historique des actions" icon={<History className="w-4 h-4" />} defaultOpen={false}>
            <div className="space-y-3">
              {MOCK_HISTORY.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center">{h.icon}</div>
                    {i < MOCK_HISTORY.length - 1 && <div className="w-px h-4 bg-slate-200 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs text-slate-500">{h.date}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold">{h.actor}</span> — {h.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-4">
          {/* Localisation */}
          <Section title="Patrimoine" icon={<MapPin className="w-4 h-4" />}>
            <div className="space-y-2 text-xs">
              {[
                ['Site', pred.site],
                ['Résidence', pred.residence],
                ['Bâtiment', pred.batiment],
                ['Équipement', pred.equipement],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-slate-100 last:border-b-0">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-700 text-right max-w-[140px]">{v}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Responsable & dates */}
          <Section title="Affectation" icon={<User className="w-4 h-4" />}>
            <div className="space-y-2 text-xs">
              {[
                ['Responsable', pred.responsable],
                ['Échéance estimée', new Date(pred.date_estimee).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })],
                ['Créé le', new Date(pred.created_at).toLocaleDateString('fr-FR')],
                ['Coût estimé', pred.cout_estime !== null ? `${pred.cout_estime.toLocaleString('fr-FR')} €` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-slate-100 last:border-b-0">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-700 text-right max-w-[140px]">{v}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Impacts */}
          <Section title="Impacts" icon={<AlertTriangle className="w-4 h-4" />}>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Utilisateurs</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${
                  pred.impact_utilisateur === 'critique' ? 'bg-red-100 text-red-700' :
                  pred.impact_utilisateur === 'fort' ? 'bg-orange-100 text-orange-700' :
                  pred.impact_utilisateur === 'moyen' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{pred.impact_utilisateur}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <ImpactChip active={pred.impact_energetique} label="Énergie" color="bg-yellow-100 text-yellow-700" />
                <ImpactChip active={pred.impact_reglementaire} label="Réglementaire" color="bg-emerald-100 text-emerald-700" />
                <ImpactChip active={pred.impact_carbone} label="Carbone" color="bg-lime-100 text-lime-700" />
              </div>
            </div>
          </Section>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <Zap className="w-4 h-4" /> Créer une intervention
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-slate-700 text-sm font-semibold border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Marquer comme résolu
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-slate-500 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Ignorer cette prédiction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
