import { useMemo } from 'react';
import {
  Send, Mail, Bell, Eye, AlertTriangle, TrendingUp, CheckCircle2,
  Clock, Zap, Users, MessageSquare, BarChart3, Bot,
} from 'lucide-react';
import { MOCK_NOTIFICATIONS, MOCK_MODELES, MOCK_HISTORIQUE } from './commData';
import type { ModuleSource } from './commTypes';
import { MODULE_LABELS, STATUT_COLORS } from './commTypes';

function KpiCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string; color: string; sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const MODULE_COLORS: Record<ModuleSource, string> = {
  interventions:    'bg-blue-500',
  maintenance:      'bg-teal-500',
  contrats:         'bg-amber-500',
  reglementaire:    'bg-red-500',
  approvisionnements: 'bg-violet-500',
  edl:              'bg-cyan-500',
  equipements:      'bg-slate-500',
  renouvellements:  'bg-emerald-500',
};

export default function CommDashboard() {
  const nonLues = useMemo(() => MOCK_NOTIFICATIONS.filter(n => !n.lu).length, []);
  const erreurs  = useMemo(() => MOCK_HISTORIQUE.filter(h => h.statut === 'erreur').length, []);

  const byModule = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_HISTORIQUE.forEach(h => { map[h.module] = (map[h.module] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const maxCount = byModule[0]?.[1] ?? 1;

  const recent = MOCK_HISTORIQUE.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard icon={Send}          label="Notifications envoyées" value="245 870"  color="bg-blue-500"    sub="+1 247 cette semaine" />
        <KpiCard icon={Mail}          label="Emails envoyés"          value="198 456"  color="bg-violet-500"  sub="+876 cette semaine" />
        <KpiCard icon={Eye}           label="Taux d'ouverture"        value="92 %"     color="bg-emerald-500" sub="Moyenne tous canaux" />
        <KpiCard icon={Bell}          label="Non lues"                value={String(nonLues)}     color="bg-amber-500"   sub="À traiter" />
        <KpiCard icon={AlertTriangle} label="Escalades auto."         value="36"       color="bg-orange-500"  sub="Ce mois" />
        <KpiCard icon={AlertTriangle} label="Erreurs d'envoi"         value={String(erreurs)}      color="bg-red-500"     sub="À corriger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activité récente */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Activité récente</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.map(h => {
              const sc = STATUT_COLORS[h.statut];
              return (
                <div key={h.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${MODULE_COLORS[h.module]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{h.objet}</p>
                    <p className="text-[10px] text-slate-400">{h.modele} · {h.destinataire}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} flex-shrink-0`}>{h.statut.charAt(0).toUpperCase() + h.statut.slice(1)}</span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{h.date.split(' ')[1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Par module */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Envois par module</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {byModule.map(([mod, count]) => (
              <div key={mod}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{MODULE_LABELS[mod as ModuleSource] ?? mod}</span>
                  <span className="text-xs font-bold text-slate-700">{count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${MODULE_COLORS[mod as ModuleSource] ?? 'bg-slate-400'}`}
                    style={{ width: `${Math.round((count / maxCount) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modèles actifs & Agent IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Modèles les plus actifs */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Modèles les plus actifs</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {MOCK_MODELES.filter(m => m.actif).slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{m.nom}</p>
                  <p className="text-[10px] text-slate-400">{MODULE_LABELS[m.module]}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-slate-700">{m.nbEnvois.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">{m.tauxOuverture}% ouverture</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent IA */}
        <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-violet-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-violet-800">Agent IA Communication</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { icon: Users,         color: 'text-amber-600',  bg: 'bg-amber-50',   title: 'Détection de surcharge', body: 'Martin reçoit 42 notifications / jour — risque de surcharge détecté.' },
              { icon: TrendingUp,    color: 'text-blue-600',   bg: 'bg-blue-50',    title: 'Optimisation escalades', body: 'Les notifications critiques sont lues après 72h. Proposer une escalade à 24h.' },
              { icon: Mail,          color: 'text-violet-600', bg: 'bg-violet-50',  title: 'Taux d\'ouverture faible', body: 'Emails contrats : 34% d\'ouverture. Renforcer le sujet et ajouter une relance.' },
            ].map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${a.bg}`}>
                <a.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.color}`} />
                <div>
                  <p className={`text-xs font-bold ${a.color}`}>{a.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{a.body}</p>
                </div>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors">
              <Zap className="w-3.5 h-3.5" /> Analyser les communications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
