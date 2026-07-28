import { BarChart3, TrendingUp, Mail, Bell, Smartphone } from 'lucide-react';
import type { ModuleSource } from './commTypes';
import { MODULE_LABELS } from './commTypes';

const STATS_MODULE: { module: ModuleSource; envois: number; ouverture: number; erreurs: number }[] = [
  { module: 'interventions',     envois: 87420, ouverture: 94, erreurs: 1 },
  { module: 'maintenance',       envois: 42180, ouverture: 89, erreurs: 0 },
  { module: 'contrats',          envois: 18640, ouverture: 91, erreurs: 1 },
  { module: 'reglementaire',     envois: 34210, ouverture: 88, erreurs: 0 },
  { module: 'approvisionnements', envois: 24830, ouverture: 97, erreurs: 2 },
  { module: 'edl',               envois: 19200, ouverture: 85, erreurs: 0 },
  { module: 'equipements',       envois: 9870,  ouverture: 82, erreurs: 0 },
  { module: 'renouvellements',   envois: 9520,  ouverture: 90, erreurs: 0 },
];

const STATS_CANAL = [
  { label: 'Email',         icon: Mail,       envois: 198456, pct: 45, color: 'bg-blue-500'   },
  { label: 'Notification',  icon: Bell,       envois: 212340, pct: 48, color: 'bg-amber-500'  },
  { label: 'Email + Notif', icon: Bell,       envois: 31074,  pct: 7,  color: 'bg-violet-500' },
  { label: 'SMS',           icon: Smartphone, envois: 0,      pct: 0,  color: 'bg-teal-500'   },
];

const maxEnvois = Math.max(...STATS_MODULE.map(s => s.envois));

function KpiMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-0.5">{label}</p>
    </div>
  );
}

export default function CommStats() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiMini label="Total envois"         value="441 870"  color="bg-blue-50 text-blue-800"    />
        <KpiMini label="Taux d'ouverture"     value="92 %"     color="bg-emerald-50 text-emerald-800" />
        <KpiMini label="Taux de lecture"      value="87 %"     color="bg-violet-50 text-violet-800" />
        <KpiMini label="Taux d'erreur"        value="0,09 %"   color="bg-red-50 text-red-800"      />
        <KpiMini label="Temps moyen lecture"  value="4 min"    color="bg-amber-50 text-amber-800"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par module */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Envois par module</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {STATS_MODULE.map(s => (
              <div key={s.module}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{MODULE_LABELS[s.module]}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold ${s.ouverture >= 90 ? 'text-emerald-600' : s.ouverture >= 80 ? 'text-amber-600' : 'text-red-500'}`}>{s.ouverture}% ouverture</span>
                    <span className="text-xs font-bold text-slate-700 w-14 text-right">{s.envois.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round((s.envois / maxEnvois) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Par canal */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Répartition par canal</h3>
          </div>
          <div className="px-5 py-4">
            {/* Stacked bar */}
            <div className="h-8 rounded-xl overflow-hidden flex mb-6">
              {STATS_CANAL.filter(c => c.pct > 0).map(c => (
                <div key={c.label} className={`h-full ${c.color} transition-all`} style={{ width: `${c.pct}%` }} title={`${c.label}: ${c.pct}%`} />
              ))}
            </div>
            <div className="space-y-3">
              {STATS_CANAL.map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${c.color} flex-shrink-0`} />
                  <c.icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 flex-1">{c.label}</span>
                  <span className="text-xs font-bold text-slate-700">{c.envois.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 w-8 text-right">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evolution (placeholder chart) */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">Évolution des envois — 30 derniers jours</h3>
        </div>
        <div className="px-5 py-8 flex items-end justify-between gap-1 h-40">
          {Array.from({ length: 30 }, (_, i) => {
            const h = 20 + Math.round(Math.sin(i / 3) * 10 + Math.random() * 30);
            return (
              <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-400 rounded-sm transition-colors cursor-pointer" style={{ height: `${h}%` }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
