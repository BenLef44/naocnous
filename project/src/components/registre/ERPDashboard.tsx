import { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import type { ERP, ControleERP, IncidentERP, ActionCorrectiveERP } from './registreTypes';
import { STATUT_CONTROLE_CFG, STATUT_INCIDENT_CFG, STATUT_ACTION_CFG, fmtDate, getControleAlerte, TYPE_INCIDENT_LABELS } from './registreTypes';

// ─── Mini donut SVG ────────────────────────────────────────────────────────────

function MiniDonut({ slices, size = 72 }: { slices: { value: number; color: string; label: string }[]; size?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return <div className="rounded-full bg-slate-100" style={{ width: size, height: size }} />;
  const R = (size - 16) / 2; const cx = size / 2; const cy = size / 2;
  let ang = -Math.PI / 2;
  const paths = slices.map(sl => {
    const a = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(ang); const y1 = cy + R * Math.sin(ang);
    ang += a;
    const x2 = cx + R * Math.cos(ang); const y2 = cy + R * Math.sin(ang);
    const large = a > Math.PI ? 1 : 0;
    return { d: `M${cx},${cy} L${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} Z`, color: sl.color, label: sl.label, value: sl.value };
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={R / 2.4} fill="white" />
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity={0.9} />)}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#334155">{total}</text>
    </svg>
  );
}

interface Props {
  erp: ERP;
  controles: ControleERP[];
  incidents: IncidentERP[];
  actions: ActionCorrectiveERP[];
}

export default function ERPDashboard({ erp, controles, incidents, actions }: Props) {
  const nbConforme    = controles.filter(c => c.statut === 'conforme').length;
  const nbRetard      = controles.filter(c => c.statut === 'en_retard').length;
  const nbNonRealise  = controles.filter(c => c.statut === 'non_realise').length;
  const nbNonConforme = controles.filter(c => c.statut === 'non_conforme').length;
  const nbAVenir      = controles.filter(c => getControleAlerte(c) === 'bientot').length;
  const tauxConformite = controles.length > 0
    ? Math.round((nbConforme / controles.length) * 100) : 100;

  const nbIncidentsOuverts = incidents.filter(i => i.statut !== 'cloture').length;
  const nbActionsOuvertes  = actions.filter(a => a.statut !== 'termine' && a.statut !== 'annule').length;
  const nbActionsCritiques = actions.filter(a => a.priorite >= 3 && a.statut !== 'termine').length;

  const controleSlices = useMemo(() => [
    { label: 'Conforme',      value: nbConforme,    color: '#10b981' },
    { label: 'À venir',       value: nbAVenir,      color: '#3b82f6' },
    { label: 'Non réalisé',   value: nbNonRealise,  color: '#94a3b8' },
    { label: 'En retard',     value: nbRetard,      color: '#ef4444' },
    { label: 'Non conforme',  value: nbNonConforme, color: '#f97316' },
  ].filter(s => s.value > 0), [nbConforme, nbAVenir, nbNonRealise, nbRetard, nbNonConforme]);

  const incidentTypes = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach(i => { map[i.type_incident] = (map[i.type_incident] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [incidents]);

  const prochainsControles = useMemo(
    () => [...controles]
      .filter(c => c.date_prochain_controle)
      .sort((a, b) => a.date_prochain_controle!.localeCompare(b.date_prochain_controle!))
      .slice(0, 5),
    [controles]
  );

  return (
    <div className="space-y-5 pb-8">

      {/* Header ERP */}
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ERP {erp.categorie_erp?.replace('eme','ème').replace('ere','ère')} catégorie — Type {erp.type_erp}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800">{erp.nom}</h2>
            {erp.adresse && <p className="text-xs text-slate-500 mt-1">{erp.adresse}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taux de conformité</p>
            <p className={`text-4xl font-black ${tauxConformite >= 90 ? 'text-emerald-600' : tauxConformite >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {tauxConformite}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Responsable sécurité</p>
            <p className="text-sm font-semibold text-slate-700">{erp.responsable_securite ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Capacité d'accueil</p>
            <p className="text-sm font-semibold text-slate-700">{erp.capacite.toLocaleString('fr-FR')} personnes</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organisme de contrôle</p>
            <p className="text-sm font-semibold text-slate-700">{erp.organisme_controle ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* 4 KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Contrôles à jour', value: `${nbConforme}/${controles.length}`, sub: `${tauxConformite}% conformité`, icon: ShieldCheck, iconCls: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Contrôles en retard', value: nbRetard + nbNonRealise, sub: `${nbNonConforme} non conforme${nbNonConforme > 1 ? 's' : ''}`, icon: AlertTriangle, iconCls: (nbRetard + nbNonRealise) > 0 ? 'text-red-500' : 'text-slate-400', bg: (nbRetard + nbNonRealise) > 0 ? 'bg-red-50' : 'bg-slate-50', border: (nbRetard + nbNonRealise) > 0 ? 'border-red-200' : 'border-slate-100' },
          { label: 'Incidents ouverts', value: nbIncidentsOuverts, sub: `${incidents.length} total`, icon: Activity, iconCls: nbIncidentsOuverts > 0 ? 'text-amber-500' : 'text-slate-400', bg: nbIncidentsOuverts > 0 ? 'bg-amber-50' : 'bg-slate-50', border: nbIncidentsOuverts > 0 ? 'border-amber-200' : 'border-slate-100' },
          { label: 'Actions correctives', value: nbActionsOuvertes, sub: `${nbActionsCritiques} priorité haute`, icon: TrendingUp, iconCls: nbActionsCritiques > 0 ? 'text-orange-500' : 'text-slate-400', bg: nbActionsCritiques > 0 ? 'bg-orange-50' : 'bg-slate-50', border: nbActionsCritiques > 0 ? 'border-orange-200' : 'border-slate-100' },
        ].map(({ label, value, sub, icon: Icon, iconCls, bg, border }, i) => (
          <div key={i} className={`rounded-2xl border ${border} ${bg} p-4 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon className={`w-4 h-4 ${iconCls}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{value}</p>
              <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Répartition contrôles */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">Répartition des contrôles</p>
          <div className="flex items-center gap-4">
            <MiniDonut slices={controleSlices} size={80} />
            <div className="flex flex-col gap-1.5 flex-1">
              {controleSlices.map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-600 flex-1 truncate">{s.label}</span>
                  <span className="text-xs font-bold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Types d'incidents */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">Incidents par type</p>
          {incidentTypes.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-slate-300 text-xs">Aucun incident</div>
          ) : (
            <div className="space-y-2">
              {incidentTypes.map(([type, count]) => {
                const cfg = TYPE_INCIDENT_LABELS[type];
                const max = incidentTypes[0][1];
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <span className="text-sm">{cfg?.icon ?? '📋'}</span>
                        <span className="truncate max-w-32">{cfg?.label ?? type}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-700 flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prochains contrôles */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">Prochains contrôles</p>
          <div className="space-y-2">
            {prochainsControles.map(c => {
              const alerte = getControleAlerte(c);
              const diff = c.date_prochain_controle
                ? Math.round((new Date(c.date_prochain_controle).getTime() - Date.now()) / 86400000) : null;
              return (
                <div key={c.id} className={`flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 ${alerte === 'retard' ? 'bg-red-50/50 -mx-1 px-1 rounded' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{c.type_controle}</p>
                    <p className="text-[10px] text-slate-400">{fmtDate(c.date_prochain_controle)}</p>
                  </div>
                  {diff !== null && (
                    <span className={`text-[10px] font-bold flex-shrink-0 ${diff < 0 ? 'text-red-600' : diff < 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {diff < 0 ? `${Math.abs(diff)}j retard` : `J-${diff}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Derniers incidents */}
      {incidents.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-black text-slate-600">Historique des incidents récents</p>
          </div>
          <div className="divide-y divide-slate-50">
            {[...incidents].sort((a, b) => b.date_incident.localeCompare(a.date_incident)).slice(0, 4).map(inc => {
              const cfg = STATUT_INCIDENT_CFG[inc.statut] ?? STATUT_INCIDENT_CFG.ouvert;
              const typeCfg = TYPE_INCIDENT_LABELS[inc.type_incident];
              return (
                <div key={inc.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <span className="text-xl flex-shrink-0 mt-0.5">{typeCfg?.icon ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700">{inc.reference} — {typeCfg?.label ?? inc.type_incident}</p>
                    <p className="text-[10px] text-slate-500 truncate">{inc.lieu}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                      {cfg.label}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(inc.date_incident)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertes */}
      {(nbRetard > 0 || nbNonConforme > 0 || nbActionsCritiques > 0) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-700 mb-1">Points d'attention</p>
              <ul className="space-y-0.5">
                {nbRetard > 0 && <li className="text-[11px] text-red-600">{nbRetard} contrôle{nbRetard > 1 ? 's' : ''} en retard</li>}
                {nbNonConforme > 0 && <li className="text-[11px] text-red-600">{nbNonConforme} contrôle{nbNonConforme > 1 ? 's' : ''} non conforme{nbNonConforme > 1 ? 's' : ''}</li>}
                {nbActionsCritiques > 0 && <li className="text-[11px] text-red-600">{nbActionsCritiques} action{nbActionsCritiques > 1 ? 's' : ''} corrective{nbActionsCritiques > 1 ? 's' : ''} de priorité haute</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
