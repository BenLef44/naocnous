import { useState } from 'react';
import { LayoutDashboard, Table2, Columns2 as Columns, Calendar, FileText, PlayCircle, Bell, BarChart2, Settings, Brain, Zap, TrendingUp, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import PredictifDashboard from './PredictifDashboard';
import PredictifTableau from './PredictifTableau';
import PredictifKanban from './PredictifKanban';
import PredictifPlanning from './PredictifPlanning';
import PredictifFiche from './PredictifFiche';
import { MOCK_PREDICTIONS, CRITICITE_PRED_CFG, computeKpis } from './predictifTypes';

// ─── Sub-navigation items ─────────────────────────────────────────────────────

type SubView =
  | 'dashboard' | 'tableau' | 'kanban' | 'planning' | 'fiche'
  | 'simulations' | 'alertes' | 'analyses' | 'parametres';

interface NavItem {
  id: SubView;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

function buildNav(kpis: ReturnType<typeof computeKpis>): NavItem[] {
  return [
    { id: 'dashboard',   label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tableau',     label: 'Tableau',          icon: <Table2 className="w-4 h-4" />,      badge: kpis.total },
    { id: 'kanban',      label: 'Kanban',            icon: <Columns className="w-4 h-4" /> },
    { id: 'planning',    label: 'Planning',          icon: <Calendar className="w-4 h-4" /> },
    { id: 'fiche',       label: 'Fiche prédiction',  icon: <FileText className="w-4 h-4" /> },
    { id: 'simulations', label: 'Simulations',       icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'alertes',     label: 'Alertes IA',        icon: <Bell className="w-4 h-4" />,        badge: kpis.critiques > 0 ? kpis.critiques : undefined },
    { id: 'analyses',    label: 'Analyses',          icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'parametres',  label: 'Paramètres IA',     icon: <Settings className="w-4 h-4" /> },
  ];
}

// ─── Placeholder for stub views ───────────────────────────────────────────────

function StubView({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white text-slate-400 gap-4 p-8">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-700 mb-1">{title}</p>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <Brain className="w-4 h-4" />
        Vue en cours de développement
      </div>
    </div>
  );
}

// ─── Alertes IA view (inline) ─────────────────────────────────────────────────

function AlertesView() {
  const actives = MOCK_PREDICTIONS.filter(p => p.statut !== 'resolu' && p.statut !== 'ignore' && p.statut !== 'faux_positif');
  const sorted = [...actives].sort((a, b) => b.score_ia - a.score_ia);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Alertes IA actives</h2>
            <p className="text-sm text-slate-500">{sorted.length} alertes nécessitent votre attention</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {sorted.map(pred => {
          const critCfg = CRITICITE_PRED_CFG[pred.criticite];
          const daysUntil = Math.ceil((new Date(pred.date_estimee).getTime() - Date.now()) / 86400000);
          return (
            <div key={pred.id} className={`bg-white rounded-xl border ${critCfg.border} p-4 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${critCfg.bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                  {critCfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-slate-400">{pred.reference}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${critCfg.badgeBg} ${critCfg.text}`}>{critCfg.label}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{pred.titre}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-medium ${daysUntil <= 14 ? 'text-red-600' : 'text-slate-500'}`}>
                        {daysUntil > 0 ? `J-${daysUntil}` : 'Dépassé'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{pred.responsable}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{pred.justification_ia}</p>
                  <div className="flex items-start gap-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                    <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">{pred.action_recommandee}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Brain className="w-3 h-3" /> Score {pred.score_ia}/100
                    </div>
                    <div className="text-xs text-slate-300">·</div>
                    <div className="text-xs text-slate-500">Probabilité {pred.probabilite}%</div>
                    {pred.cout_estime !== null && (
                      <>
                        <div className="text-xs text-slate-300">·</div>
                        <div className="text-xs text-slate-500">{pred.cout_estime.toLocaleString('fr-FR')} €</div>
                      </>
                    )}
                    <div className="ml-auto flex gap-2">
                      <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                        Créer intervention
                      </button>
                      <button className="text-xs px-2 py-1 bg-white text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                        Ignorer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Predictif container ─────────────────────────────────────────────────

export default function Predictif() {
  const [activeView, setActiveView] = useState<SubView>('dashboard');
  const kpis = computeKpis(MOCK_PREDICTIONS);
  const nav = buildNav(kpis);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':   return <PredictifDashboard />;
      case 'tableau':     return <PredictifTableau />;
      case 'kanban':      return <PredictifKanban />;
      case 'planning':    return <PredictifPlanning />;
      case 'fiche':       return <PredictifFiche predId="pred-001" />;
      case 'alertes':     return <AlertesView />;
      case 'simulations': return (
        <StubView
          title="Simulations de scénarios"
          description="Simulez l'impact de différents scénarios d'action sur l'évolution des risques et des coûts."
          icon={<PlayCircle className="w-8 h-8" />}
        />
      );
      case 'analyses': return (
        <StubView
          title="Analyses avancées"
          description="Tableaux de bord analytiques approfondis : corrélations, tendances, comparaisons multi-sites."
          icon={<BarChart2 className="w-8 h-8" />}
        />
      );
      case 'parametres': return (
        <StubView
          title="Paramètres IA"
          description="Configurez les seuils d'alerte, les sources de données et les modèles prédictifs utilisés."
          icon={<Settings className="w-8 h-8" />}
        />
      );
      default: return <PredictifDashboard />;
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Sub-navigation sidebar */}
      <aside className="w-48 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
        {/* Module header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 leading-tight">Prédictif</div>
              <div className="text-xs text-slate-500 leading-tight">Intelligence IA</div>
            </div>
          </div>
        </div>

        {/* KPI summary */}
        <div className="px-3 py-3 border-b border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Alertes actives</span>
            <span className="font-bold text-slate-800">{kpis.critiques + kpis.majeures + kpis.mineures}</span>
          </div>
          <div className="flex gap-1">
            {kpis.critiques > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                🚨 {kpis.critiques}
              </span>
            )}
            {kpis.majeures > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">
                ⚠️ {kpis.majeures}
              </span>
            )}
            {kpis.mineures > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                🔎 {kpis.mineures}
              </span>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors relative ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className={activeView === item.id ? 'text-blue-600' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="flex-1 text-xs">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeView === item.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>IA synchronisée</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Dernière analyse : 2 min</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}
