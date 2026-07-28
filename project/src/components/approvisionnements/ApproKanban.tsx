import { useState, useMemo } from 'react';
import {
  Search, X, ChevronDown, MapPin, Calendar, Link,
  Clock, Truck, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, MessageSquare, User, ArrowRight,
} from 'lucide-react';
import {
  MOCK_DEMANDES, STATUT_DEMANDE_CFG, PRIORITE_CFG, EPONA_SYNC_CFG,
  type StatutDemande, type DemandeAchat,
} from './approTypes';

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: {
  id: StatutDemande; label: string; icon: React.ReactNode;
  headerBg: string; headerText: string; borderColor: string;
}[] = [
  { id: 'brouillon',           label: 'Brouillon',        icon: <Clock className="w-3.5 h-3.5" />,        headerBg: 'bg-slate-50',   headerText: 'text-slate-600',  borderColor: '#cbd5e1' },
  { id: 'en_attente',          label: 'En attente',       icon: <RefreshCw className="w-3.5 h-3.5" />,    headerBg: 'bg-amber-50',   headerText: 'text-amber-700',  borderColor: '#fcd34d' },
  { id: 'validee',             label: 'Validée',          icon: <CheckCircle2 className="w-3.5 h-3.5" />, headerBg: 'bg-blue-50',    headerText: 'text-blue-700',   borderColor: '#93c5fd' },
  { id: 'commandee',           label: 'Commandée',        icon: <Truck className="w-3.5 h-3.5" />,        headerBg: 'bg-cyan-50',    headerText: 'text-cyan-700',   borderColor: '#67e8f9' },
  { id: 'reception_partielle', label: 'Réc. partielle',   icon: <ArrowRight className="w-3.5 h-3.5" />,   headerBg: 'bg-orange-50',  headerText: 'text-orange-700', borderColor: '#fdba74' },
  { id: 'recue',               label: 'Reçue',            icon: <CheckCircle2 className="w-3.5 h-3.5" />, headerBg: 'bg-emerald-50', headerText: 'text-emerald-700',borderColor: '#6ee7b7' },
  { id: 'bloquee',             label: 'Bloquée',          icon: <XCircle className="w-3.5 h-3.5" />,      headerBg: 'bg-red-50',     headerText: 'text-red-700',    borderColor: '#fca5a5' },
];

// ── Kanban card ───────────────────────────────────────────────────────────────

function KanbanCard({ d, onClick }: { d: DemandeAchat; onClick: () => void }) {
  const pCfg  = PRIORITE_CFG[d.priorite];
  const eCfg  = EPONA_SYNC_CFG[d.epona_sync_statut];
  const daysUntilBesoin = d.date_besoin
    ? Math.ceil((new Date(d.date_besoin).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    : null;
  const isOverdue = daysUntilBesoin !== null && daysUntilBesoin < 0;
  const isUrgent  = daysUntilBesoin !== null && daysUntilBesoin >= 0 && daysUntilBesoin <= 3;

  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5
        ${d.statut === 'bloquee' ? 'border-red-200' : d.priorite === 'critique' ? 'border-orange-200' : 'border-slate-200'}`}>
      <div className={`h-1 rounded-t-xl ${pCfg.badgeBg}`} />
      <div className="p-3 space-y-2">
        {/* Ref + titre */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-slate-400">{d.reference}</div>
            <div className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">{d.titre}</div>
          </div>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${pCfg.bg} ${pCfg.text}`}>
            {pCfg.label}
          </span>
        </div>

        {/* Site */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{d.site_nom}</span>
        </div>

        {/* Demandeur */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <User className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{d.demandeur_nom}</span>
        </div>

        {/* Intervention liée */}
        {d.intervention_liee_ref && (
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
            <Link className="w-2.5 h-2.5 flex-shrink-0" />
            <span>{d.intervention_liee_ref}</span>
          </div>
        )}

        {/* Date de besoin */}
        {d.date_besoin && (
          <div className={`flex items-center gap-1 text-[10px] font-medium
            ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-slate-500'}`}>
            <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
            <span>{new Date(d.date_besoin).toLocaleDateString('fr-FR')}</span>
            {isUrgent  && <span className="ml-auto font-bold">J-{daysUntilBesoin}</span>}
            {isOverdue && <span className="ml-auto font-bold">En retard</span>}
          </div>
        )}

        {/* Montant */}
        {d.montant_estime_ht != null && (
          <div className="text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700">{d.montant_estime_ht.toFixed(2)} €</span> HT · {d.quantite_demandee} {d.unite}
          </div>
        )}

        {/* Epona */}
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium ${eCfg.bg} ${eCfg.text}`}>
          <span>{eCfg.label}</span>
          {d.epona_numero_commande && <span className="font-mono opacity-80">· {d.epona_numero_commande}</span>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-1.5">
            {d.commentaire && <MessageSquare className="w-3 h-3 text-slate-300" />}
          </div>
          <div className="text-[9px] text-slate-300">
            {new Date(d.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail side panel ─────────────────────────────────────────────────────────

function DetailPanel({ d, onClose }: { d: DemandeAchat; onClose: () => void }) {
  const pCfg = PRIORITE_CFG[d.priorite];
  const sCfg = STATUT_DEMANDE_CFG[d.statut];
  const eCfg = EPONA_SYNC_CFG[d.epona_sync_statut];

  const timeline = [
    { label: 'Demande créée',    date: d.created_at,            done: true                    },
    { label: 'Transmise Epona',  date: d.epona_sync_date_envoi, done: !!d.epona_sync_date_envoi },
    { label: 'Commandée',        date: d.date_commande,         done: !!d.date_commande         },
    { label: 'Livraison prévue', date: d.date_livraison_prevue, done: false                   },
    { label: 'Réceptionnée',     date: d.date_reception,        done: !!d.date_reception        },
  ];

  return (
    <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
      <div className={`px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-2 ${sCfg.bg}`}>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-slate-500">{d.reference}</div>
          <div className={`text-sm font-bold leading-snug ${sCfg.text}`}>{d.titre}</div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/10 flex-shrink-0">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sCfg.bg} ${sCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${pCfg.bg} ${pCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><div className="text-slate-400 mb-0.5">Site</div><div className="font-medium text-slate-700">{d.site_nom}</div></div>
          <div><div className="text-slate-400 mb-0.5">Demandeur</div><div className="font-medium text-slate-700">{d.demandeur_nom}</div></div>
          <div><div className="text-slate-400 mb-0.5">Quantité</div><div className="font-semibold text-slate-800">{d.quantite_demandee} {d.unite}</div></div>
          <div><div className="text-slate-400 mb-0.5">Montant HT</div><div className="font-semibold text-slate-800">{d.montant_estime_ht != null ? `${d.montant_estime_ht.toFixed(2)} €` : '—'}</div></div>
          {d.fournisseur && <div className="col-span-2"><div className="text-slate-400 mb-0.5">Fournisseur</div><div className="font-medium text-slate-700">{d.fournisseur}</div></div>}
        </div>
        {d.intervention_liee_ref && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <Link className="w-3.5 h-3.5" /> Intervention liée
            </div>
            <div className="text-sm font-bold text-blue-700">{d.intervention_liee_ref}</div>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
            <RefreshCw className="w-3.5 h-3.5" /> Synchronisation Epona
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${eCfg.bg} ${eCfg.text}`}>
            {eCfg.label}
          </div>
          {d.epona_numero_commande && (
            <div className="text-xs font-mono font-semibold text-blue-700 mt-1.5">{d.epona_numero_commande}</div>
          )}
          {d.epona_sync_date_envoi && (
            <div className="text-xs text-slate-400 mt-0.5">
              Envoyé le {new Date(d.epona_sync_date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Timeline</div>
          {timeline.map((t, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${t.done ? 'bg-emerald-500 border-emerald-500' : t.date ? 'bg-blue-400 border-blue-400' : 'bg-slate-200 border-slate-200'}`} />
                {i < timeline.length - 1 && <div className={`w-0.5 my-0.5 ${t.done ? 'bg-emerald-200' : 'bg-slate-100'}`} style={{ height: 16 }} />}
              </div>
              <div className="pb-2 flex-1">
                <div className={`text-xs font-medium ${t.done ? 'text-slate-800' : 'text-slate-400'}`}>{t.label}</div>
                {t.date && <div className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
              </div>
            </div>
          ))}
        </div>
        {d.commentaire && (
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Commentaire</div>
            <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{d.commentaire}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ApproKanban() {
  const [search,          setSearch]          = useState('');
  const [filterPrio,      setFilterPrio]      = useState('');
  const [filterSite,      setFilterSite]      = useState('');
  const [selectedDemande, setSelectedDemande] = useState<DemandeAchat | null>(null);

  const sites = useMemo(() => [...new Set(MOCK_DEMANDES.map(d => d.site_nom))], []);

  const filtered = useMemo(() => {
    let rows = [...MOCK_DEMANDES];
    if (search)     rows = rows.filter(d =>
      d.titre.toLowerCase().includes(search.toLowerCase()) ||
      d.reference.toLowerCase().includes(search.toLowerCase())
    );
    if (filterPrio) rows = rows.filter(d => d.priorite === filterPrio);
    if (filterSite) rows = rows.filter(d => d.site_nom === filterSite);
    return rows;
  }, [search, filterPrio, filterSite]);

  const byColumn = useMemo(() => {
    const map = new Map<StatutDemande, DemandeAchat[]>();
    COLUMNS.forEach(c => map.set(c.id, []));
    filtered.forEach(d => map.get(d.statut)?.push(d));
    return map;
  }, [filtered]);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300/40 bg-white" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>}
          </div>
          <div className="relative">
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none cursor-pointer text-slate-600 bg-white">
              <option value="">Tous les sites</option>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5">
            {(['','critique','haute','normale','faible'] as const).map(p => (
              <button key={p} onClick={() => setFilterPrio(p)}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                  ${filterPrio === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                {p === '' ? 'Toutes priorités' : PRIORITE_CFG[p as keyof typeof PRIORITE_CFG].label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-slate-400">{filtered.length} demande{filtered.length > 1 ? 's' : ''}</div>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-3 p-4" style={{ minWidth: `${COLUMNS.length * 220}px` }}>
            {COLUMNS.map(col => {
              const cards    = byColumn.get(col.id) ?? [];
              const sCfg     = STATUT_DEMANDE_CFG[col.id];
              const urgentCt = cards.filter(c => c.priorite === 'critique' || c.priorite === 'haute').length;
              const total    = cards.reduce((s, c) => s + (c.montant_estime_ht ?? 0), 0);

              return (
                <div key={col.id} className="flex flex-col flex-shrink-0 w-52">
                  <div className={`rounded-xl border px-3 py-2.5 mb-2 flex-shrink-0`}
                    style={{ borderColor: col.borderColor, backgroundColor: col.headerBg.replace('bg-', '') }}>
                    <div className={`rounded-xl ${col.headerBg} -m-3 px-3 py-2.5`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className={`flex items-center gap-1.5 ${col.headerText}`}>
                          {col.icon}
                          <span className="text-xs font-bold">{col.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {urgentCt > 0 && (
                            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                              {urgentCt}
                            </span>
                          )}
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.text}`}>{cards.length}</span>
                        </div>
                      </div>
                      {cards.length > 0 && (
                        <div className="text-[10px] text-slate-400">{total.toFixed(0)} € HT</div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pb-2">
                    {cards.length === 0 && (
                      <div className="rounded-xl border-2 border-dashed border-slate-200 py-6 text-center">
                        <p className="text-xs text-slate-300 font-medium">Aucune demande</p>
                      </div>
                    )}
                    {cards.map(d => (
                      <KanbanCard key={d.id} d={d}
                        onClick={() => setSelectedDemande(selectedDemande?.id === d.id ? null : d)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selectedDemande && <DetailPanel d={selectedDemande} onClose={() => setSelectedDemande(null)} />}
    </div>
  );
}
