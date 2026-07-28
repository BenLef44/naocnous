import { useState, useMemo } from 'react';
import {
  Search, X, ChevronDown, ChevronUp, ArrowUpDown, Filter,
  PackageOpen, FileText, ShoppingCart, Eye, History, Link,
} from 'lucide-react';
import {
  MOCK_STOCKS, MOCK_DEMANDES, MOCK_ENTREPOTS,
  STATUT_DEMANDE_CFG, PRIORITE_CFG, STATUT_STOCK_CFG, CATEGORIES_ARTICLES, EPONA_SYNC_CFG,
  type StatutDemande, type PrioriteDemande, type StatutStock,
} from './approTypes';

// ── Shared helpers ────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all
        ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
      {label}
    </button>
  );
}

function SortTh({ col, label, sortKey, sortAsc, onSort }: {
  col: string; label: string; sortKey: string; sortAsc: boolean; onSort: (k: string) => void;
}) {
  const active = sortKey === col;
  return (
    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-700 select-none"
      onClick={() => onSort(col)}>
      <div className="flex items-center gap-1">
        {label}
        {active ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </div>
    </th>
  );
}

// ── Onglet Stocks ─────────────────────────────────────────────────────────────

function OngletStocks() {
  const [search,       setSearch]       = useState('');
  const [filterCat,    setFilterCat]    = useState('');
  const [filterSite,   setFilterSite]   = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutStock | ''>('');
  const [sortKey,      setSortKey]      = useState('designation');
  const [sortAsc,      setSortAsc]      = useState(true);
  const [actionOpen,   setActionOpen]   = useState<string | null>(null);

  const sites = useMemo(() => [...new Set(MOCK_ENTREPOTS.map(e => e.site_nom))], []);

  const filtered = useMemo(() => {
    let rows = [...MOCK_STOCKS];
    if (search)       rows = rows.filter(s =>
      s.article.designation.toLowerCase().includes(search.toLowerCase()) ||
      s.article.reference.toLowerCase().includes(search.toLowerCase()) ||
      s.entrepot.nom.toLowerCase().includes(search.toLowerCase())
    );
    if (filterCat)    rows = rows.filter(s => s.article.categorie === filterCat);
    if (filterSite)   rows = rows.filter(s => s.entrepot.site_nom === filterSite);
    if (filterStatut) rows = rows.filter(s => s.statut === filterStatut);

    rows.sort((a, b) => {
      let va: string | number = '', vb: string | number = '';
      if (sortKey === 'designation') { va = a.article.designation; vb = b.article.designation; }
      if (sortKey === 'reference')   { va = a.article.reference;   vb = b.article.reference;   }
      if (sortKey === 'categorie')   { va = a.article.categorie;   vb = b.article.categorie;   }
      if (sortKey === 'site')        { va = a.entrepot.site_nom;   vb = b.entrepot.site_nom;   }
      if (sortKey === 'quantite')    { va = a.quantite_disponible; vb = b.quantite_disponible; }
      if (typeof va === 'number') return sortAsc ? va - (vb as number) : (vb as number) - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [search, filterCat, filterSite, filterStatut, sortKey, sortAsc]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Référence, désignation, entrepôt…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>}
          </div>
          <div className="relative">
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none cursor-pointer text-slate-600 bg-white">
              <option value="">Tous les sites</option>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none cursor-pointer text-slate-600 bg-white">
              <option value="">Toutes catégories</option>
              {CATEGORIES_ARTICLES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="ml-auto text-xs text-slate-400">{filtered.length} ligne{filtered.length > 1 ? 's' : ''}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {(['', 'disponible', 'stock_faible', 'rupture', 'commande'] as const).map(s => (
            <FilterChip key={s} label={s === '' ? 'Tous' : STATUT_STOCK_CFG[s as StatutStock].label}
              active={filterStatut === s} onClick={() => setFilterStatut(s)} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
            <tr>
              <SortTh col="designation" label="Désignation"      sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <SortTh col="reference"   label="Référence"        sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <SortTh col="categorie"   label="Catégorie"        sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <SortTh col="site"        label="Site / Entrepôt"  sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Emplacement</th>
              <SortTh col="quantite"    label="Qté dispo"        sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Mini</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Statut</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">MAJ</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="py-16 text-center">
                <PackageOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Aucun article trouvé</p>
              </td></tr>
            )}
            {filtered.map(s => {
              const cat   = CATEGORIES_ARTICLES.find(c => c.key === s.article.categorie);
              const sCfg  = STATUT_STOCK_CFG[s.statut];
              const isLow = s.statut === 'rupture' || s.statut === 'stock_faible';
              const open  = actionOpen === s.id;
              return (
                <tr key={s.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${isLow ? 'bg-red-50/10' : ''}`}>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-xs text-slate-800">{s.article.designation}</div>
                    <div className="text-[10px] text-slate-400">{s.article.fournisseur_prefere}</div>
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-slate-600">{s.article.reference}</td>
                  <td className="px-3 py-3">
                    <span className="text-sm">{cat?.icon}</span>
                    <span className="ml-1 text-xs text-slate-600">{cat?.label ?? s.article.categorie}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-slate-700">{s.entrepot.nom}</div>
                    <div className="text-[10px] text-slate-400">{s.entrepot.site_nom}</div>
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-slate-500">{s.emplacement || '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`text-sm font-bold ${s.statut === 'rupture' ? 'text-red-600' : s.statut === 'stock_faible' ? 'text-amber-600' : 'text-slate-800'}`}>
                      {s.quantite_disponible}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">{s.article.unite}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{s.stock_mini}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sCfg.bg} ${sCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(s.derniere_maj).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative flex justify-end">
                      <button onClick={() => setActionOpen(open ? null : s.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1">
                        Actions <ChevronDown className="w-3 h-3" />
                      </button>
                      {open && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-44">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"><Eye className="w-3.5 h-3.5 text-slate-400" /> Voir détail</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"><ShoppingCart className="w-3.5 h-3.5 text-blue-500" /> Créer demande</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"><History className="w-3.5 h-3.5 text-slate-400" /> Historique</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"><Link className="w-3.5 h-3.5 text-slate-400" /> DI liées</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Onglet Demandes ───────────────────────────────────────────────────────────

function EponaBadge({ statut, numero, dateEnvoi }: { statut: string; numero: string; dateEnvoi: string | null }) {
  const cfg = EPONA_SYNC_CFG[statut as keyof typeof EPONA_SYNC_CFG] ?? EPONA_SYNC_CFG.non_envoye;
  return (
    <div className={`inline-flex flex-col px-2 py-1 rounded-lg text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
      <span>{cfg.label}</span>
      {numero    && <span className="font-mono opacity-80">{numero}</span>}
      {dateEnvoi && <span className="opacity-60">{new Date(dateEnvoi).toLocaleDateString('fr-FR')}</span>}
    </div>
  );
}

const PIPELINE_STEPS: StatutDemande[] = ['brouillon', 'en_attente', 'validee', 'commandee', 'recue'];

function MiniPipeline({ statut }: { statut: StatutDemande }) {
  const currentIdx = PIPELINE_STEPS.indexOf(statut);
  return (
    <div className="flex items-center gap-0.5">
      {PIPELINE_STEPS.map((s, i) => {
        const cfg  = STATUT_DEMANDE_CFG[s];
        const past = i < currentIdx;
        const cur  = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-0.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0
              ${cur ? cfg.dot : past ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`h-px w-3 flex-shrink-0 ${past ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
      {statut === 'reception_partielle' && (
        <div className="ml-1 text-[9px] text-orange-600 font-bold">Partiel</div>
      )}
      {statut === 'bloquee' && (
        <div className="ml-1 text-[9px] text-red-600 font-bold">BLOQUÉ</div>
      )}
    </div>
  );
}

function OngletDemandes() {
  const [search,       setSearch]       = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutDemande | ''>('');
  const [filterPrio,   setFilterPrio]   = useState<PrioriteDemande | ''>('');
  const [filterSite,   setFilterSite]   = useState('');
  const [sortKey,      setSortKey]      = useState('created_at');
  const [sortAsc,      setSortAsc]      = useState(false);

  const sites = useMemo(() => [...new Set(MOCK_DEMANDES.map(d => d.site_nom))], []);

  const filtered = useMemo(() => {
    let rows = [...MOCK_DEMANDES];
    if (search)       rows = rows.filter(d =>
      d.titre.toLowerCase().includes(search.toLowerCase()) ||
      d.reference.toLowerCase().includes(search.toLowerCase()) ||
      d.demandeur_nom.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatut) rows = rows.filter(d => d.statut === filterStatut);
    if (filterPrio)   rows = rows.filter(d => d.priorite === filterPrio);
    if (filterSite)   rows = rows.filter(d => d.site_nom === filterSite);

    rows.sort((a, b) => {
      let va: string | number = '', vb: string | number = '';
      if (sortKey === 'created_at') { va = a.created_at;    vb = b.created_at;    }
      if (sortKey === 'reference')  { va = a.reference;     vb = b.reference;     }
      if (sortKey === 'statut')     { va = STATUT_DEMANDE_CFG[a.statut].order; vb = STATUT_DEMANDE_CFG[b.statut].order; }
      if (sortKey === 'montant')    { va = a.montant_estime_ht ?? 0; vb = b.montant_estime_ht ?? 0; }
      if (typeof va === 'number') return sortAsc ? va - (vb as number) : (vb as number) - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [search, filterStatut, filterPrio, filterSite, sortKey, sortAsc]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Référence, objet, demandeur…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>}
          </div>
          <div className="relative">
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none cursor-pointer text-slate-600 bg-white">
              <option value="">Tous les sites</option>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterPrio} onChange={e => setFilterPrio(e.target.value as PrioriteDemande | '')}
              className="appearance-none pl-3 pr-7 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none cursor-pointer text-slate-600 bg-white">
              <option value="">Toutes priorités</option>
              {(['critique','haute','normale','faible'] as PrioriteDemande[]).map(p => (
                <option key={p} value={p}>{PRIORITE_CFG[p].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="ml-auto text-xs text-slate-400">{filtered.length} demande{filtered.length > 1 ? 's' : ''}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {(['', ...Object.keys(STATUT_DEMANDE_CFG)] as (StatutDemande | '')[]).map(s => (
            <FilterChip key={s} label={s === '' ? 'Tous' : STATUT_DEMANDE_CFG[s as StatutDemande].label}
              active={filterStatut === s} onClick={() => setFilterStatut(s)} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
            <tr>
              <SortTh col="reference"  label="Référence"   sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Objet</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Site</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Demandeur</th>
              <SortTh col="created_at" label="Créée"       sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Priorité</th>
              <SortTh col="statut"     label="Statut"      sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Pipeline</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Epona</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">DI liée</th>
              <SortTh col="montant"    label="Montant HT"  sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="py-16 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Aucune demande</p>
              </td></tr>
            )}
            {filtered.map(d => {
              const pCfg = PRIORITE_CFG[d.priorite];
              const sCfg = STATUT_DEMANDE_CFG[d.statut];
              return (
                <tr key={d.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors
                  ${d.priorite === 'critique' ? 'bg-red-50/10' : d.priorite === 'haute' ? 'bg-amber-50/5' : ''}`}>
                  <td className="px-3 py-3 text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">{d.reference}</td>
                  <td className="px-3 py-3 max-w-[160px]">
                    <div className="text-xs font-semibold text-slate-800 truncate">{d.titre}</div>
                    {d.date_besoin && <div className="text-[10px] text-slate-400">Besoin : {new Date(d.date_besoin).toLocaleDateString('fr-FR')}</div>}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{d.site_nom}</td>
                  <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">{d.demandeur_nom}</td>
                  <td className="px-3 py-3 text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${pCfg.bg} ${pCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sCfg.bg} ${sCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-3"><MiniPipeline statut={d.statut} /></td>
                  <td className="px-3 py-3"><EponaBadge statut={d.epona_sync_statut} numero={d.epona_numero_commande} dateEnvoi={d.epona_sync_date_envoi} /></td>
                  <td className="px-3 py-3">
                    {d.intervention_liee_ref
                      ? <span className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline">{d.intervention_liee_ref}</span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">
                    {d.montant_estime_ht != null ? `${d.montant_estime_ht.toFixed(2)} €` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ApproTableau() {
  const [tab, setTab] = useState<'stocks' | 'demandes'>('stocks');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-100 flex-shrink-0">
        {([
          { id: 'stocks',   label: 'Stocks',            icon: <PackageOpen className="w-3.5 h-3.5" />, count: MOCK_STOCKS.length   },
          { id: 'demandes', label: "Demandes d'achat",  icon: <ShoppingCart className="w-3.5 h-3.5" />, count: MOCK_DEMANDES.length },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all
              ${tab === t.id ? 'border-blue-600 text-blue-700 bg-blue-50/40' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.icon} {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>
      {tab === 'stocks'   && <OngletStocks />}
      {tab === 'demandes' && <OngletDemandes />}
    </div>
  );
}
