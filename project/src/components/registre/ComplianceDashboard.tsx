import { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, AlertTriangle, Clock, FileText, TrendingUp,
  Building2, CheckCircle2, XCircle, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { RegistreSecuriteRecord } from './registreTypes';
import { STATUT_REGISTRE_CFG, fmtDate } from './registreTypes';

interface Props {
  onOpenRegistre?: (r: RegistreSecuriteRecord) => void;
}

interface RegistreWithERP extends RegistreSecuriteRecord {
  erp?: { nom: string; categorie_erp: string; type_erp: string } | null;
}

function monthsSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

export default function ComplianceDashboard({ onOpenRegistre }: Props) {
  const [registres, setRegistres] = useState<RegistreWithERP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('registres_securite')
        .select('*, erp:erp(nom, categorie_erp, type_erp)')
        .order('annee', { ascending: false });
      setRegistres((data ?? []) as RegistreWithERP[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = registres.length;
    const byStatut = {
      brouillon: registres.filter(r => r.statut === 'brouillon').length,
      en_cours: registres.filter(r => r.statut === 'en_cours').length,
      valide: registres.filter(r => r.statut === 'valide').length,
      archive: registres.filter(r => r.statut === 'archive').length,
    };
    const avgCompletitude = total > 0
      ? Math.round(registres.reduce((sum, r) => sum + (r.completude_pct ?? 0), 0) / total)
      : 0;

    // Overdue controls
    let overdueControls = 0;
    let soonControls = 0;
    registres.forEach(r => {
      ['derniere_verif_ssi', 'derniere_verif_extincteurs', 'derniere_verif_eclairage', 'derniere_verif_desenfumage'].forEach(key => {
        const ms = monthsSince(r[key as keyof RegistreSecuriteRecord] as string);
        if (ms !== null) {
          if (ms > 12) overdueControls++;
          else if (ms > 10) soonControls++;
        }
      });
    });

    // Pending reserves across all commissions
    let pendingReserves = 0;
    registres.forEach(r => {
      (r.commissions ?? []).forEach(c => {
        if (c.reserves && !c.levee_reserves) pendingReserves++;
      });
    });

    // Exercises count
    let totalExercices = 0;
    registres.forEach(r => { totalExercices += (r.exercices ?? []).length; });

    // By ERP
    const erpMap = new Map<string, { nom: string; count: number; avgScore: number; worst: number }>();
    registres.forEach(r => {
      const nom = r.erp?.nom ?? 'Inconnu';
      const existing = erpMap.get(nom) ?? { nom, count: 0, avgScore: 0, worst: 100 };
      existing.count++;
      existing.avgScore += r.completude_pct ?? 0;
      existing.worst = Math.min(existing.worst, r.completude_pct ?? 0);
      erpMap.set(nom, existing);
    });
    const byERP = Array.from(erpMap.values()).map(e => ({
      ...e,
      avgScore: Math.round(e.avgScore / e.count),
    })).sort((a, b) => a.avgScore - b.avgScore);

    return {
      total, byStatut, avgCompletitude, overdueControls, soonControls,
      pendingReserves, totalExercices, byERP,
    };
  }, [registres]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (registres.length === 0) {
    return (
      <div className="text-center py-16">
        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-medium">Aucun registre de sécurité créé</p>
        <p className="text-xs text-slate-300 mt-1">Créez un registre pour voir le tableau de bord de conformité</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={ShieldCheck} color="emerald"
          label="Conformité moyenne" value={`${stats.avgCompletitude}%`}
          sub={`${stats.total} registre${stats.total !== 1 ? 's' : ''}`}
        />
        <KpiCard
          icon={AlertTriangle} color="red"
          label="Contrôles en retard" value={stats.overdueControls.toString()}
          sub={stats.soonControls > 0 ? `${stats.soonControls} bientôt (>10 mois)` : 'Aucun contrôle imminent'}
        />
        <KpiCard
          icon={FileText} color="amber"
          label="Réserves en cours" value={stats.pendingReserves.toString()}
          sub="Non levées"
        />
        <KpiCard
          icon={CheckCircle2} color="blue"
          label="Registres validés" value={stats.byStatut.valide.toString()}
          sub={`${stats.byStatut.brouillon} brouillon · ${stats.byStatut.en_cours} en cours`}
        />
      </div>

      {/* Conformity by ERP */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Conformité par établissement</h3>
        </div>
        <div className="space-y-2.5">
          {stats.byERP.map(erp => {
            const color = erp.avgScore >= 80 ? 'bg-emerald-500' : erp.avgScore >= 50 ? 'bg-amber-400' : 'bg-red-400';
            const textColor = erp.avgScore >= 80 ? 'text-emerald-600' : erp.avgScore >= 50 ? 'text-amber-600' : 'text-red-600';
            return (
              <div key={erp.nom} className="flex items-center gap-3">
                <div className="w-40 flex items-center gap-1.5 flex-shrink-0">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 truncate">{erp.nom}</span>
                </div>
                <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden relative">
                  <div className={`h-full ${color} rounded-lg transition-all duration-700 flex items-center justify-end pr-2`}
                    style={{ width: `${erp.avgScore}%` }}>
                    <span className="text-[10px] font-bold text-white">{erp.avgScore}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 w-20 text-right">{erp.count} registre{erp.count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Répartition par statut</h3>
          <div className="space-y-2">
            {(['brouillon', 'en_cours', 'valide', 'archive'] as const).map(s => {
              const count = stats.byStatut[s];
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const cfg = STATUT_REGISTRE_CFG[s];
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-medium text-slate-600 w-20">{cfg.label}</span>
                  <div className="flex-1 h-3 bg-slate-50 rounded-md overflow-hidden">
                    <div className={`h-full ${cfg.bg} rounded-md transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 w-12 text-right tabular-nums">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent registres needing attention */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Registres à risque</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {registres
              .filter(r => r.completude_pct < 60 || r.statut === 'brouillon')
              .sort((a, b) => (a.completude_pct ?? 0) - (b.completude_pct ?? 0))
              .slice(0, 5)
              .map(r => (
                <button
                  key={r.id}
                  onClick={() => onOpenRegistre?.(r)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    (r.completude_pct ?? 0) < 40 ? 'bg-red-500' : 'bg-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {r.erp?.nom ?? '—'} · {r.reference}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {r.annee} · {STATUT_REGISTRE_CFG[r.statut]?.label}
                    </p>
                  </div>
                  <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${
                    (r.completude_pct ?? 0) < 40 ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {r.completude_pct ?? 0}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                </button>
              ))}
            {registres.filter(r => (r.completude_pct ?? 0) < 60 || r.statut === 'brouillon').length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Tous les registres sont au-dessus de 60%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, color, label, value, sub }: {
  icon: React.ElementType;
  color: 'emerald' | 'red' | 'amber' | 'blue';
  label: string;
  value: string;
  sub: string;
}) {
  const cfg = {
    emerald: { bg: 'bg-emerald-50',  icon: 'text-emerald-600',  value: 'text-emerald-700' },
    red:     { bg: 'bg-red-50',      icon: 'text-red-600',      value: 'text-red-700' },
    amber:   { bg: 'bg-amber-50',    icon: 'text-amber-600',    value: 'text-amber-700' },
    blue:    { bg: 'bg-blue-50',     icon: 'text-blue-600',     value: 'text-blue-700' },
  };
  const c = cfg[color];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${c.icon}`} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-xl font-black ${c.value} tabular-nums`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}
