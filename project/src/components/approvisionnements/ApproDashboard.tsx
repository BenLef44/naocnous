import { useMemo } from 'react';
import {
  AlertTriangle, TrendingDown, ShoppingCart, Truck, PackageCheck,
  MapPin, Zap, ArrowRight, Clock, CheckCircle2, XCircle, RotateCcw,
} from 'lucide-react';
import {
  MOCK_STOCKS, MOCK_DEMANDES, MOCK_MOUVEMENTS, MOCK_ENTREPOTS,
  computeApproKpis, STATUT_DEMANDE_CFG, PRIORITE_CFG, STATUT_STOCK_CFG, CATEGORIES_ARTICLES,
  type DemandeAchat, type TypeMouvement,
} from './approTypes';

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, value, label, sub, colorBg, onClick }: {
  icon: React.ReactNode; value: number | string; label: string;
  sub?: string; colorBg: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:shadow-md transition-all group hover:-translate-y-0.5 w-full">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorBg}`}>
          {icon}
        </div>
        {onClick && <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />}
      </div>
      <div className="text-3xl font-bold text-slate-800 leading-none mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </button>
  );
}

// ── Alert card ────────────────────────────────────────────────────────────────

function AlertCard({ level, title, detail, cta, onCta }: {
  level: 'critical' | 'warning' | 'info';
  title: string; detail: string; cta?: string; onCta?: () => void;
}) {
  const cfg = {
    critical: { bg: 'bg-red-50',   border: 'border-red-200',   icon: <XCircle className="w-4 h-4 text-red-500" />,         text: 'text-red-800',   sub: 'text-red-600',   btn: 'bg-red-100 text-red-700 hover:bg-red-200'   },
    warning:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, text: 'text-amber-800', sub: 'text-amber-600', btn: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    info:     { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: <Clock className="w-4 h-4 text-blue-500" />,          text: 'text-blue-800',  sub: 'text-blue-600',  btn: 'bg-blue-100 text-blue-700 hover:bg-blue-200'   },
  }[level];

  return (
    <div className={`rounded-xl border p-3.5 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold ${cfg.text}`}>{title}</div>
          <div className={`text-xs mt-0.5 ${cfg.sub}`}>{detail}</div>
        </div>
        {cta && (
          <button onClick={onCta}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors ${cfg.btn}`}>
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Mouvement icon config ─────────────────────────────────────────────────────

const MVT_CFG: Record<TypeMouvement, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  entree:     { icon: <PackageCheck className="w-3.5 h-3.5" />, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Réception'  },
  sortie:     { icon: <ArrowRight className="w-3.5 h-3.5" />,   bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Sortie'     },
  transfert:  { icon: <RotateCcw className="w-3.5 h-3.5" />,    bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Transfert'  },
  inventaire: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, bg: 'bg-slate-100',   text: 'text-slate-700',   label: 'Inventaire' },
};

// ── Site heatmap mini card ────────────────────────────────────────────────────

function SiteCard({ siteName, onViewStock }: { siteName: string; onViewStock: () => void }) {
  const siteStocks = MOCK_STOCKS.filter(s => s.entrepot.site_nom === siteName);
  const ruptures   = siteStocks.filter(s => s.statut === 'rupture').length;
  const faibles    = siteStocks.filter(s => s.statut === 'stock_faible').length;
  const disponibles= siteStocks.filter(s => s.statut === 'disponible').length;
  const total      = siteStocks.length;
  const pct        = total > 0 ? Math.round((disponibles / total) * 100) : 100;
  const level      = ruptures > 0 ? 'critical' : faibles > 0 ? 'warning' : 'ok';
  const border     = level === 'critical' ? 'border-red-200'   : level === 'warning' ? 'border-amber-200'   : 'border-slate-200';
  const bg         = level === 'critical' ? 'bg-red-50/50'     : level === 'warning' ? 'bg-amber-50/30'     : 'bg-white';
  const dot        = level === 'critical' ? 'bg-red-500'       : level === 'warning' ? 'bg-amber-500'       : 'bg-emerald-500';

  return (
    <button onClick={onViewStock}
      className={`rounded-xl border p-3.5 text-left hover:shadow-sm transition-all group w-full ${bg} ${border}`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
          <span className="text-xs font-semibold text-slate-700 leading-tight truncate">{siteName}</span>
        </div>
        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{pct}% dispo</span>
        <div className="flex items-center gap-2">
          {ruptures > 0 && <span className="text-red-600 font-semibold">{ruptures} rupture{ruptures > 1 ? 's' : ''}</span>}
          {faibles  > 0 && <span className="text-amber-600">{faibles} faible{faibles > 1 ? 's' : ''}</span>}
          {ruptures === 0 && faibles === 0 && <span className="text-emerald-600 font-medium">OK</span>}
        </div>
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ApproDashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const kpis = useMemo(() => computeApproKpis(), []);

  const impactedInterventions = useMemo(() =>
    MOCK_DEMANDES.filter(d => d.intervention_liee_ref && (d.statut === 'bloquee' || d.statut === 'en_attente' || d.statut === 'commandee')),
    []
  );

  const recentMovts = useMemo(() =>
    [...MOCK_MOUVEMENTS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8),
    []
  );

  const siteNames = useMemo(() => [...new Set(MOCK_ENTREPOTS.map(e => e.site_nom))], []);

  const stockByCat = useMemo(() => {
    const map: Record<string, { dispo: number; rupture: number; faible: number }> = {};
    CATEGORIES_ARTICLES.forEach(c => { map[c.key] = { dispo: 0, rupture: 0, faible: 0 }; });
    MOCK_STOCKS.forEach(s => {
      const cat = s.article.categorie;
      if (!map[cat]) map[cat] = { dispo: 0, rupture: 0, faible: 0 };
      if (s.statut === 'disponible')   map[cat].dispo++;
      else if (s.statut === 'rupture') map[cat].rupture++;
      else if (s.statut === 'stock_faible') map[cat].faible++;
    });
    return map;
  }, []);

  function fmtDate(iso: string) {
    const d    = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    const t    = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diff === 0) return `Auj. ${t}`;
    if (diff === 1) return `Hier ${t}`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-slate-50">
      <div className="max-w-[1400px] mx-auto w-full p-6 space-y-6">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard icon={<XCircle className="w-5 h-5 text-white" />}         value={kpis.ruptures}                label="Ruptures de stock"      sub="Articles à 0"              colorBg="bg-red-500"     onClick={() => onNavigate('stock')}    />
          <KpiCard icon={<TrendingDown className="w-5 h-5 text-white" />}    value={kpis.stocks_faibles}          label="Stocks faibles"         sub="Sous seuil mini"           colorBg="bg-amber-500"   onClick={() => onNavigate('tableau')}  />
          <KpiCard icon={<ShoppingCart className="w-5 h-5 text-white" />}    value={kpis.demandes_en_attente}     label="Demandes en attente"    sub="À traiter"                 colorBg="bg-blue-500"    onClick={() => onNavigate('kanban')}   />
          <KpiCard icon={<Truck className="w-5 h-5 text-white" />}           value={kpis.commandes_en_cours}      label="Commandes en cours"     sub={`${kpis.montant_commandes_en_cours.toFixed(0)} € HT`} colorBg="bg-cyan-600" onClick={() => onNavigate('planning')} />
          <KpiCard icon={<PackageCheck className="w-5 h-5 text-white" />}    value={kpis.receptions_du_jour}      label="Réceptions aujourd'hui" sub="Mouvements entrée"         colorBg="bg-emerald-500" onClick={() => onNavigate('tableau')}  />
          <KpiCard icon={<MapPin className="w-5 h-5 text-white" />}          value={kpis.sites_critiques}         label="Sites en rupture"       sub="Avec au moins 1 rupture"   colorBg="bg-rose-700"    onClick={() => onNavigate('stock')}    />
        </div>

        {/* Row 2 : Alertes + Sites */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-800">Alertes prioritaires</h2>
              </div>
              <button onClick={() => onNavigate('kanban')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Tout voir <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {kpis.ruptures > 0 && (
                <AlertCard level="critical"
                  title={`${kpis.ruptures} article${kpis.ruptures > 1 ? 's' : ''} en rupture de stock`}
                  detail="Des interventions risquent d'être bloquées. Commande urgente requise."
                  cta="Voir stocks" onCta={() => onNavigate('stock')} />
              )}
              {kpis.interventions_bloquees > 0 && (
                <AlertCard level="critical"
                  title={`${kpis.interventions_bloquees} intervention${kpis.interventions_bloquees > 1 ? 's' : ''} à risque`}
                  detail="Demandes d'achat bloquées ou en attente liées à des interventions."
                  cta="Voir demandes" onCta={() => onNavigate('kanban')} />
              )}
              {kpis.stocks_faibles > 0 && (
                <AlertCard level="warning"
                  title={`${kpis.stocks_faibles} article${kpis.stocks_faibles > 1 ? 's' : ''} sous le seuil minimal`}
                  detail="Approvisionnement à anticiper avant rupture."
                  cta="Réapprovisionner" onCta={() => onNavigate('tableau')} />
              )}
              {MOCK_DEMANDES.filter(d => d.epona_sync_statut === 'erreur').length > 0 && (
                <AlertCard level="warning"
                  title={`${MOCK_DEMANDES.filter(d => d.epona_sync_statut === 'erreur').length} erreur${MOCK_DEMANDES.filter(d => d.epona_sync_statut === 'erreur').length > 1 ? 's' : ''} de synchronisation Epona`}
                  detail="La transmission vers Epona a échoué. Vérifier la connexion API."
                  cta="Voir" onCta={() => onNavigate('kanban')} />
              )}
              {MOCK_DEMANDES.filter(d => d.statut === 'en_attente').length > 0 && (
                <AlertCard level="info"
                  title={`${MOCK_DEMANDES.filter(d => d.statut === 'en_attente').length} demandes en attente de validation`}
                  detail="En cours de traitement achat, transmission Epona en attente."
                  cta="Suivre" onCta={() => onNavigate('kanban')} />
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-slate-800">État par site</h2>
              </div>
              <button onClick={() => onNavigate('stock')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Vue stock <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {siteNames.map(site => (
                <SiteCard key={site} siteName={site} onViewStock={() => onNavigate('stock')} />
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 : Interventions impactées + Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-800">Interventions impactées</h2>
              </div>
              <span className="text-xs text-slate-400">DI liées à une demande active</span>
            </div>
            {impactedInterventions.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">Aucune intervention bloquée</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Intervention</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Objet</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Site</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Priorité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impactedInterventions.map((d: DemandeAchat) => {
                      const pCfg = PRIORITE_CFG[d.priorite];
                      const sCfg = STATUT_DEMANDE_CFG[d.statut];
                      return (
                        <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-3 py-2.5">
                            <span className="font-semibold text-blue-600">{d.intervention_liee_ref}</span>
                          </td>
                          <td className="px-3 py-2.5 max-w-[180px]">
                            <span className="truncate block text-slate-700">{d.titre}</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-0.5 ${sCfg.bg} ${sCfg.text}`}>
                              <span className={`w-1 h-1 rounded-full ${sCfg.dot}`} />{sCfg.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{d.site_nom}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${pCfg.bg} ${pCfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800">Activité récente</h2>
            </div>
            <div className="space-y-2.5">
              {recentMovts.map(m => {
                const cfg = MVT_CFG[m.type_mvt];
                return (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate">{m.article_designation}</div>
                      <div className="text-[10px] text-slate-400 truncate">{m.entrepot_nom} · {cfg.label}{m.quantite > 1 ? ` ×${m.quantite}` : ''}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 flex-shrink-0">{fmtDate(m.created_at)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 4 : Répartition par catégorie */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-800">Stock par catégorie</h2>
            <button onClick={() => onNavigate('tableau')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Tableau détaillé <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CATEGORIES_ARTICLES.filter(c => {
              const d = stockByCat[c.key];
              return d && (d.dispo + d.rupture + d.faible) > 0;
            }).map(cat => {
              const data  = stockByCat[cat.key] ?? { dispo: 0, rupture: 0, faible: 0 };
              const total = data.dispo + data.rupture + data.faible;
              const pct   = total > 0 ? Math.round((data.dispo / total) * 100) : 0;
              const barColor = data.rupture > 0 ? '#ef4444' : data.faible > 0 ? '#f59e0b' : '#10b981';
              return (
                <div key={cat.key}
                  className={`rounded-xl border p-3 ${data.rupture > 0 ? 'border-red-200 bg-red-50/20' : data.faible > 0 ? 'border-amber-100 bg-amber-50/10' : 'border-slate-100 bg-slate-50/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-semibold text-slate-700 truncate">{cat.label}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{total} réf.</span>
                    <div className="flex items-center gap-1.5">
                      {data.rupture > 0 && <span className="text-red-600 font-bold">{data.rupture}R</span>}
                      {data.faible  > 0 && <span className="text-amber-600">{data.faible}F</span>}
                      {data.rupture === 0 && data.faible === 0 && <span className="text-emerald-600 font-medium">OK</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
