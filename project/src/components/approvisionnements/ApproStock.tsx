import { useState, useMemo } from 'react';
import {
  Search, X, MapPin, Warehouse, Package,
  AlertTriangle, TrendingDown, CheckCircle2, ChevronDown, Filter,
  ShoppingCart,
} from 'lucide-react';
import {
  MOCK_STOCKS, MOCK_ENTREPOTS, CATEGORIES_ARTICLES,
  STATUT_STOCK_CFG,
  type Entrepot, type StockLine, type StatutStock,
} from './approTypes';

// ── Stock row inside an entrepot card ─────────────────────────────────────────

function StockRow({ s }: { s: StockLine }) {
  const cfg    = STATUT_STOCK_CFG[s.statut];
  const cat    = CATEGORIES_ARTICLES.find(c => c.key === s.article.categorie);
  const pct    = s.stock_maxi ? Math.min(100, Math.round((s.quantite_disponible / s.stock_maxi) * 100)) : null;
  const barClr = s.statut === 'rupture' ? 'bg-red-500' : s.statut === 'stock_faible' ? 'bg-amber-400' : s.statut === 'commande' ? 'bg-blue-400' : 'bg-emerald-400';

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors
      ${s.statut === 'rupture' ? 'bg-red-50/20' : s.statut === 'stock_faible' ? 'bg-amber-50/10' : ''}`}>
      <span className="text-base flex-shrink-0">{cat?.icon ?? '📦'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-800 truncate">{s.article.designation}</div>
        <div className="text-[10px] text-slate-400 font-mono">{s.article.reference}</div>
      </div>
      {s.emplacement && (
        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">{s.emplacement}</span>
      )}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0" style={{ minWidth: 88 }}>
        {pct !== null && (
          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className={`h-full rounded-full ${barClr}`} style={{ width: `${pct}%` }} />
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-bold leading-none ${s.statut === 'rupture' ? 'text-red-600' : s.statut === 'stock_faible' ? 'text-amber-600' : 'text-slate-800'}`}>
            {s.quantite_disponible}
          </span>
          <span className="text-[10px] text-slate-400">/ {s.stock_mini} mini</span>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
      </span>
    </div>
  );
}

// ── Entrepot card ─────────────────────────────────────────────────────────────

function EntrepotCard({ entrepot, stocks, defaultOpen }: {
  entrepot: Entrepot; stocks: StockLine[]; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const ruptures    = stocks.filter(s => s.statut === 'rupture').length;
  const faibles     = stocks.filter(s => s.statut === 'stock_faible').length;
  const disponibles = stocks.filter(s => s.statut === 'disponible').length;
  const total       = stocks.length;
  const pct         = total > 0 ? Math.round((disponibles / total) * 100) : 100;
  const level       = ruptures > 0 ? 'critical' : faibles > 0 ? 'warning' : 'ok';
  const border      = level === 'critical' ? 'border-red-200'   : level === 'warning' ? 'border-amber-200'   : 'border-slate-200';
  const headBg      = level === 'critical' ? 'bg-red-50'        : level === 'warning' ? 'bg-amber-50/50'     : 'bg-white';
  const iconBg      = level === 'critical' ? 'bg-red-100'       : level === 'warning' ? 'bg-amber-100'       : 'bg-blue-100';
  const iconClr     = level === 'critical' ? 'text-red-600'     : level === 'warning' ? 'text-amber-600'     : 'text-blue-600';

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${border}`}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 p-4 text-left ${headBg} hover:brightness-[0.98] transition-all`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Warehouse className={`w-5 h-5 ${iconClr}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{entrepot.nom}</span>
            {entrepot.code_epona && (
              <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                Epona : {entrepot.code_epona}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />{entrepot.site_nom}
            <span className="text-slate-300 mx-1">·</span>{entrepot.responsable}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {ruptures > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />{ruptures} rupture{ruptures > 1 ? 's' : ''}
            </div>
          )}
          {faibles > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />{faibles} faible{faibles > 1 ? 's' : ''}
            </div>
          )}
          {ruptures === 0 && faibles === 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />OK
            </div>
          )}
          <div className="flex flex-col items-end gap-0.5">
            <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{pct}% · {total} art.</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-white">
          {stocks.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucun article dans cet entrepôt</p>
            </div>
          ) : (
            stocks.map(s => <StockRow key={s.id} s={s} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Search result row ─────────────────────────────────────────────────────────

function SearchResultRow({ s }: { s: StockLine }) {
  const cfg = STATUT_STOCK_CFG[s.statut];
  const cat = CATEGORIES_ARTICLES.find(c => c.key === s.article.categorie);
  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors
      ${s.statut === 'rupture' ? 'bg-red-50/20' : s.statut === 'stock_faible' ? 'bg-amber-50/10' : ''}`}>
      <span className="text-xl flex-shrink-0">{cat?.icon ?? '📦'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{s.article.designation}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
          <span className="font-mono">{s.article.reference}</span>
          <span className="text-slate-300">·</span>
          <Warehouse className="w-3 h-3" /><span>{s.entrepot.nom}</span>
          <span className="text-slate-300">·</span>
          <MapPin className="w-3 h-3" /><span>{s.entrepot.site_nom}</span>
          {s.emplacement && (
            <><span className="text-slate-300">·</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{s.emplacement}</span></>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-2xl font-bold leading-none ${s.statut === 'rupture' ? 'text-red-600' : s.statut === 'stock_faible' ? 'text-amber-600' : 'text-slate-800'}`}>
          {s.quantite_disponible}
        </div>
        <div className="text-xs text-slate-400">{s.article.unite}</div>
      </div>
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
      </span>
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0">
        <ShoppingCart className="w-3 h-3" /> Commander
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ApproStock() {
  const [search,       setSearch]       = useState('');
  const [filterSite,   setFilterSite]   = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutStock | ''>('');
  const [filterCat,    setFilterCat]    = useState('');

  const sites = useMemo(() => [...new Set(MOCK_ENTREPOTS.map(e => e.site_nom))], []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return MOCK_STOCKS.filter(s =>
      s.article.designation.toLowerCase().includes(q) ||
      s.article.reference.toLowerCase().includes(q) ||
      s.entrepot.nom.toLowerCase().includes(q) ||
      s.entrepot.site_nom.toLowerCase().includes(q) ||
      s.emplacement.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredEntrepots = useMemo(() =>
    filterSite ? MOCK_ENTREPOTS.filter(e => e.site_nom === filterSite) : MOCK_ENTREPOTS,
    [filterSite]
  );

  const stocksByEntrepot = useMemo(() => {
    const map = new Map<string, StockLine[]>();
    MOCK_ENTREPOTS.forEach(e => map.set(e.id, []));
    MOCK_STOCKS.forEach(s => {
      if (filterStatut && s.statut !== filterStatut) return;
      if (filterCat    && s.article.categorie !== filterCat) return;
      map.get(s.entrepot.id)?.push(s);
    });
    return map;
  }, [filterStatut, filterCat]);

  const totalRuptures = MOCK_STOCKS.filter(s => s.statut === 'rupture').length;
  const totalFaibles  = MOCK_STOCKS.filter(s => s.statut === 'stock_faible').length;

  // Site summary for the pill strip
  const siteSummaries = useMemo(() => {
    return sites.map(site => {
      const ss = MOCK_STOCKS.filter(s => s.entrepot.site_nom === site);
      const r  = ss.filter(s => s.statut === 'rupture').length;
      const f  = ss.filter(s => s.statut === 'stock_faible').length;
      const d  = ss.filter(s => s.statut === 'disponible').length;
      const t  = ss.length;
      return { site, ruptures: r, faibles: f, disponibles: d, total: t, pct: t > 0 ? Math.round((d / t) * 100) : 100 };
    });
  }, [sites]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Search hero */}
      <div className="bg-white border-b border-slate-100 px-6 py-5 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une pièce, référence, entrepôt, emplacement…"
              className="w-full pl-12 pr-10 py-3.5 text-sm border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              autoFocus />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
            <span>{MOCK_STOCKS.length} articles dans {MOCK_ENTREPOTS.length} entrepôts</span>
            {totalRuptures > 0 && <span className="text-red-600 font-semibold">{totalRuptures} en rupture</span>}
            {totalFaibles  > 0 && <span className="text-amber-600 font-semibold">{totalFaibles} sous seuil</span>}
          </div>
        </div>
      </div>

      {/* Filters (hidden when searching) */}
      {!search && (
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex-shrink-0 flex items-center gap-3 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <div className="relative">
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none cursor-pointer text-slate-600">
              <option value="">Tous les sites</option>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none cursor-pointer text-slate-600">
              <option value="">Toutes catégories</option>
              {CATEGORIES_ARTICLES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5">
            {(['', 'disponible', 'stock_faible', 'rupture', 'commande'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatut(s)}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                  ${filterStatut === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                {s === '' ? 'Tous' : STATUT_STOCK_CFG[s as StatutStock].label}
              </button>
            ))}
          </div>
          {(filterSite || filterCat || filterStatut) && (
            <button onClick={() => { setFilterSite(''); setFilterCat(''); setFilterStatut(''); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {/* Search results */}
        {searchResults !== null && (
          <div>
            <div className="mb-3 text-sm font-semibold text-slate-700">
              {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} pour "{search}"
            </div>
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">Aucun article trouvé</p>
                <p className="text-xs text-slate-400 mt-1">Essayez une autre référence ou désignation</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {searchResults.map(s => <SearchResultRow key={s.id} s={s} />)}
              </div>
            )}
          </div>
        )}

        {/* Entrepot cards */}
        {searchResults === null && (
          <div className="space-y-4 max-w-[1200px] mx-auto">
            {/* Site summary pills */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {siteSummaries.map(ss => (
                <button key={ss.site} onClick={() => setFilterSite(filterSite === ss.site ? '' : ss.site)}
                  className={`rounded-xl border p-2.5 text-left transition-all hover:shadow-sm
                    ${filterSite === ss.site ? 'border-blue-400 bg-blue-50 shadow-sm' :
                      ss.ruptures > 0 ? 'border-red-200 bg-red-50/30' :
                      ss.faibles  > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-white'}`}>
                  <div className="text-[10px] font-semibold text-slate-700 truncate mb-1.5">{ss.site}</div>
                  <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${ss.pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">{ss.total} art.</span>
                    <div className="flex gap-1">
                      {ss.ruptures > 0 && <span className="text-red-600 font-bold">{ss.ruptures}R</span>}
                      {ss.faibles  > 0 && <span className="text-amber-600">{ss.faibles}F</span>}
                      {ss.ruptures === 0 && ss.faibles === 0 && <span className="text-emerald-600">OK</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredEntrepots.map((e, i) => (
              <EntrepotCard
                key={e.id}
                entrepot={e}
                stocks={stocksByEntrepot.get(e.id) ?? []}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
