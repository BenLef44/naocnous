import { useMemo } from 'react';
import {
  Sparkles, AlertTriangle, CheckCircle2, Info, ArrowRight,
  TrendingUp, Lightbulb, ShieldCheck,
} from 'lucide-react';

export interface AIRecommendation {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  section: string;
  title: string;
  description: string;
  action: string;
}

export interface AIAnalysis {
  score: number;
  level: 'critical' | 'warning' | 'good' | 'excellent';
  recommendations: AIRecommendation[];
  sectionScores: { section: string; score: number; max: number; label: string }[];
}

interface AnalysisInput {
  reference: string;
  responsable_registre: string;
  responsable_legal: string;
  date_ouverture: string;
  consignes_incendie: string;
  plan_evac_url: string;
  point_rassemp: string;
  consignes_pmr: string;
  organismes: string[];
  points: unknown[];
  equipements: unknown[];
  exercices: unknown[];
  commissions: unknown[];
  signatures: unknown[];
  documents: unknown[];
  derniere_verif_ssi: string;
  derniere_verif_extincteurs: string;
  derniere_verif_eclairage: string;
  derniere_verif_desenfumage: string;
  nb_incidents: string;
  observations: string;
}

function monthsSince(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

function analyze(input: AnalysisInput): AIAnalysis {
  const recs: AIRecommendation[] = [];
  const sections: { section: string; score: number; max: number; label: string }[] = [];

  // --- Section 1: Identification ---
  let s1 = 0; const s1Max = 5;
  if (input.reference) { s1++; } else {
    recs.push({ id: 'ref', severity: 'critical', section: 'identification', title: 'Référence manquante', description: 'La référence du registre est obligatoire pour l\'identification.', action: 'Saisir une référence (ex: REG-2026-001)' });
  }
  if (input.responsable_registre) { s1++; } else {
    recs.push({ id: 'resp', severity: 'warning', section: 'identification', title: 'Responsable du registre non désigné', description: 'Un responsable doit être nommé pour la tenue du registre.', action: 'Sélectionner un agent dans l\'annuaire' });
  }
  if (input.responsable_legal) { s1++; } else {
    recs.push({ id: 'legal', severity: 'warning', section: 'identification', title: 'Responsable légal non défini', description: 'Le responsable légal du bâtiment doit être identifié.', action: 'Sélectionner un agent dans l\'annuaire' });
  }
  if (input.date_ouverture) { s1++; } else {
    recs.push({ id: 'date', severity: 'info', section: 'identification', title: 'Date d\'ouverture manquante', description: 'La date d\'ouverture du registre est recommandée.', action: 'Saisir la date d\'ouverture' });
  }
  if (input.organismes.length > 0) { s1++; } else {
    recs.push({ id: 'org', severity: 'warning', section: 'identification', title: 'Aucun organisme de contrôle', description: 'Au moins un organisme de contrôle technique doit être désigné.', action: 'Ajouter un organisme (bouton Importer disponible)' });
  }
  sections.push({ section: 'identification', score: s1, max: s1Max, label: 'Identification' });

  // --- Section 2: Consignes & Plans ---
  let s2 = 0; const s2Max = 5;
  if (input.consignes_incendie && input.consignes_incendie.length > 20) { s2++; } else {
    recs.push({ id: 'consignes', severity: 'critical', section: 'consignes', title: 'Consignes incendie incomplètes', description: 'Les consignes de sécurité incendie doivent être détaillées.', action: 'Compléter les consignes (min. 20 caractères)' });
  }
  if (input.plan_evac_url) { s2++; } else {
    recs.push({ id: 'plan', severity: 'warning', section: 'consignes', title: 'Plan d\'évacuation manquant', description: 'Le plan d\'évacuation est obligatoire en ERP.', action: 'Ajouter une URL ou importer un fichier' });
  }
  if (input.point_rassemp) { s2++; } else {
    recs.push({ id: 'pt', severity: 'warning', section: 'consignes', title: 'Point de rassemblement non défini', description: 'Le point de rassemblement doit être précisé.', action: 'Saisir le lieu de rassemblement' });
  }
  if (input.points.length > 0) { s2++; } else {
    recs.push({ id: 'pts_plan', severity: 'info', section: 'consignes', title: 'Aucun point sur le plan interactif', description: 'Placer les points de rassemblement sur le plan améliore la clarté.', action: 'Utiliser le plan interactif pour positionner les points' });
  }
  if (input.consignes_pmr) { s2++; } else {
    recs.push({ id: 'pmr', severity: 'info', section: 'consignes', title: 'Consignes PMR non renseignées', description: 'Les consignes spécifiques aux personnes à mobilité réduite sont recommandées.', action: 'Décrire les consignes PMR' });
  }
  sections.push({ section: 'consignes', score: s2, max: s2Max, label: 'Consignes & Plans' });

  // --- Section 3: Équipements ---
  let s3 = 0; const s3Max = 4;
  if (input.equipements.length > 0) { s3++; } else {
    recs.push({ id: 'eq', severity: 'warning', section: 'equipements', title: 'Aucun équipement de sécurité listé', description: 'Les équipements de sécurité (extincteurs, SSI, BAES...) doivent être inventoriés.', action: 'Vérifier que des équipements sont rattachés à l\'ERP dans le patrimoine' });
  }

  const verifChecks = [
    { key: 'ssi', val: input.derniere_verif_ssi, label: 'SSI' },
    { key: 'ext', val: input.derniere_verif_extincteurs, label: 'Extincteurs' },
    { key: 'ecl', val: input.derniere_verif_eclairage, label: 'Éclairage/BAES' },
    { key: 'des', val: input.derniere_verif_desenfumage, label: 'Désenfumage' },
  ];
  const verifOk = verifChecks.filter(v => v.val).length;
  s3 += Math.floor(verifOk / 2);
  const missingVerif = verifChecks.filter(v => !v.val);
  if (missingVerif.length > 0) {
    recs.push({ id: 'verif', severity: 'warning', section: 'equipements', title: `${missingVerif.length} vérification(s) manquante(s)`, description: `Contrôles à jour: ${verifOk}/${verifChecks.length}. Manquants: ${missingVerif.map(v => v.label).join(', ')}.`, action: 'Mettre à jour les dates de dernière vérification' });
  }

  // Check for overdue verifications (>12 months)
  verifChecks.forEach(v => {
    const ms = monthsSince(v.val);
    if (ms !== null && ms > 12) {
      recs.push({ id: `verif_${v.key}`, severity: 'critical', section: 'equipements', title: `${v.label}: contrôle en retard`, description: `Dernière vérification il y a ${ms} mois (seuil: 12 mois).`, action: 'Planifier un nouveau contrôle urgent' });
    }
  });

  if (s3 >= 2 && verifOk === 4) s3++;
  if (s3 >= 3 && input.equipements.length >= 3) s3++;
  sections.push({ section: 'equipements', score: Math.min(s3, s3Max), max: s3Max, label: 'Équipements' });

  // --- Section 4: Incidents & Exercices ---
  let s4 = 0; const s4Max = 3;
  if (input.exercices.length > 0) { s4++; } else {
    recs.push({ id: 'ex', severity: 'warning', section: 'incidents', title: 'Aucun exercice d\'évacuation enregistré', description: 'Au moins un exercice annuel est obligatoire en ERP.', action: 'Ajouter un exercice d\'évacuation' });
  }
  const nbInc = parseInt(input.nb_incidents) || 0;
  if (nbInc > 0 && !input.observations) {
    recs.push({ id: 'inc_obs', severity: 'info', section: 'incidents', title: 'Incidents déclarés sans observations', description: `${nbInc} incident(s) déclaré(s) mais aucune observation renseignée.`, action: 'Ajouter des observations sur les incidents' });
  }
  if (input.exercices.length >= 2) s4++;
  if (input.observations) s4++;
  sections.push({ section: 'incidents', score: s4, max: s4Max, label: 'Incidents & Exercices' });

  // --- Section 5: Commissions ---
  let s5 = 0; const s5Max = 2;
  if (input.commissions.length > 0) { s5++; } else {
    recs.push({ id: 'comm', severity: 'info', section: 'commissions', title: 'Aucune commission de sécurité enregistrée', description: 'Les visites de commissions et leurs réserves sont importantes pour le suivi.', action: 'Ajouter une visite de commission' });
  }
  const pendingReserves = (input.commissions as Array<{ reserves: string; levee_reserves: string }>).filter(c => c.reserves && !c.levee_reserves).length;
  if (pendingReserves > 0) {
    recs.push({ id: 'reserves', severity: 'warning', section: 'commissions', title: `${pendingReserves} réserve(s) non levée(s)`, description: 'Des réserves de commission n\'ont pas encore été levées.', action: 'Mettre à jour les levées de réserves' });
  }
  if (pendingReserves === 0 && input.commissions.length > 0) s5++;
  sections.push({ section: 'commissions', score: s5, max: s5Max, label: 'Commissions' });

  // --- Section 6: Documents & Signatures ---
  let s6 = 0; const s6Max = 3;
  if (input.documents.length > 0) { s6++; } else {
    recs.push({ id: 'docs', severity: 'info', section: 'documents', title: 'Aucun document annexé', description: 'Les rapports de contrôle, PV et plans renforcent le registre.', action: 'Ajouter des documents ou les lier depuis la GED' });
  }
  if (input.signatures.length > 0) { s6++; } else {
    recs.push({ id: 'sig', severity: 'warning', section: 'signatures', title: 'Aucun signataire', description: 'Le registre doit être signé par au moins un acteur.', action: 'Ajouter un signataire' });
  }
  const signed = (input.signatures as Array<{ valide: boolean }>).filter(s => s.valide).length;
  if (signed > 0) { s6++; } else if (input.signatures.length > 0) {
    recs.push({ id: 'sig_pending', severity: 'info', section: 'signatures', title: 'Signatures en attente de validation', description: `${input.signatures.length} signataire(s) ajouté(s) mais aucun n'a validé.`, action: 'Valider au moins une signature' });
  }
  sections.push({ section: 'signatures', score: s6, max: s6Max, label: 'Documents & Signatures' });

  // --- Overall score ---
  const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
  const totalMax = sections.reduce((sum, s) => sum + s.max, 0);
  const score = Math.round((totalScore / totalMax) * 100);

  const level: AIAnalysis['level'] =
    score < 40 ? 'critical' : score < 65 ? 'warning' : score < 85 ? 'good' : 'excellent';

  // Add positive feedback
  if (score >= 65 && recs.filter(r => r.severity === 'critical').length === 0) {
    recs.unshift({ id: 'positive', severity: 'positive', section: '', title: 'Registre globalement conforme', description: `Score de ${score}% — les éléments essentiels sont présents.`, action: 'Continuer les améliorations pour atteindre 100%' });
  }

  return { score, level, recommendations: recs, sectionScores: sections };
}

// ─── UI Component ──────────────────────────────────────────────────────────────

interface Props {
  input: AnalysisInput;
  onJumpToSection?: (section: string) => void;
}

export default function AIAssistant({ input, onJumpToSection }: Props) {
  const analysis = useMemo(() => analyze(input), [input]);

  const levelCfg = {
    critical:   { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     icon: AlertTriangle, label: 'Conformité insuffisante', ring: 'text-red-500' },
    warning:    { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  icon: AlertTriangle, label: 'Conformité partielle',    ring: 'text-orange-500' },
    good:       { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2,  label: 'Bonne conformité',         ring: 'text-emerald-500' },
    excellent:  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: ShieldCheck,   label: 'Excellente conformité',    ring: 'text-emerald-500' },
  };
  const cfg = levelCfg[analysis.level];
  const Icon = cfg.icon;

  const sevCfg = {
    critical:  { bg: 'bg-red-50',     text: 'text-red-700',     icon: AlertTriangle, label: 'Critique' },
    warning:   { bg: 'bg-orange-50',  text: 'text-orange-700',  icon: AlertTriangle, label: 'Attention' },
    info:      { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: Info,          label: 'Info' },
    positive:  { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2,  label: 'Positif' },
  };

  return (
    <div className="space-y-3">
      {/* Score header */}
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                className={cfg.ring}
                strokeDasharray={`${(analysis.score / 100) * 150.8} 150.8`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-black ${cfg.text}`}>{analysis.score}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className={`w-4 h-4 ${cfg.text}`} />
              <p className={`text-xs font-bold ${cfg.text}`}>Assistant IA — {cfg.label}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {analysis.recommendations.filter(r => r.severity === 'critical').length} critique(s) · {' '}
              {analysis.recommendations.filter(r => r.severity === 'warning').length} avertissement(s)
            </p>
          </div>
        </div>
      </div>

      {/* Section scores */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Score par section
        </p>
        {analysis.sectionScores.map(s => {
          const pct = Math.round((s.score / s.max) * 100);
          const color = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
          return (
            <div key={s.section} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-28 truncate">{s.label}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 w-8 text-right tabular-nums">{s.score}/{s.max}</span>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
          <Lightbulb className="w-3 h-3" /> Recommandations ({analysis.recommendations.length})
        </p>
        {analysis.recommendations.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-emerald-700">Aucune recommandation — registre complet!</p>
          </div>
        ) : (
          analysis.recommendations.map(rec => {
            const sc = sevCfg[rec.severity];
            const SevIcon = sc.icon;
            return (
              <div key={rec.id} className={`rounded-lg border ${rec.severity === 'critical' ? 'border-red-100' : rec.severity === 'warning' ? 'border-orange-100' : rec.severity === 'positive' ? 'border-emerald-100' : 'border-slate-100'} ${sc.bg} p-3`}>
                <div className="flex items-start gap-2">
                  <SevIcon className={`w-3.5 h-3.5 ${sc.text} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-bold ${sc.text}`}>{rec.title}</p>
                      <span className={`text-[9px] font-semibold ${sc.text} opacity-60 uppercase`}>{sc.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{rec.description}</p>
                    {onJumpToSection && rec.section && (
                      <button
                        onClick={() => onJumpToSection(rec.section)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-emerald-600 mt-1.5 transition-colors"
                      >
                        {rec.action} <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                    {!onJumpToSection && (
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
  );
}
