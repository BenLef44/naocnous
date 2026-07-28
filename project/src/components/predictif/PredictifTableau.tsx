import React, { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronRight, ChevronUp, Search, Filter, X,
  Brain, Zap, AlertTriangle, TrendingUp, Eye, CheckCircle2,
  Clock, ArrowRight, MoreHorizontal, BarChart2,
} from 'lucide-react';
import {
  Prediction, MOCK_PREDICTIONS,
  CRITICITE_PRED_CFG, STATUT_PRED_CFG, CATEGORIE_PRED_CFG,
  CriticitePred, StatutPred, CategoriePred,
} from './predictifTypes';

// ─── helpers ──────────────────────────────────────────────────────────────────

function ProbBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-red-500' : value >= 60 ? 'bg-orange-400' : 'bg-blue-400';
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 tabular-nums w-8">{value}%</span>
    </div>
  );
}

function ScoreBadge({ value, label = 'IA' }: { value: number; label?: string }) {
  const bg = value >= 80 ? 'bg-emerald-100 text-emerald-700' : value >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold ${bg}`}>
      <Brain className="w-2.5 h-2.5" />
      {value}
    </span>
  );
}

function ImpactDot({ active, color }: { active: boolean; color: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${active ? color : 'bg-gray-200'}`} />;
}

type SortKey = 'reference' | 'criticite' | 'probabilite' | 'score_ia' | 'date_estimee' | 'cout_estime';
type SortDir = 'asc' | 'desc';

const CRITICITE_ORDER: Record<CriticitePred, number> = { critique: 0, majeure: 1, mineure: 2, surveillance: 3 };

// ─── Expanded row ─────────────────────────────────────────────────────────────

function ExpandedRow({ pred }: { pred: Prediction }) {
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  return (
    <tr>
      <td colSpan={14} className="px-4 pb-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-3 gap-4 pt-3">
          {/* Justification IA */}
          <div className="col-span-2 space-y-2">
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <Brain className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Justification IA</p>
                <p className="text-sm text-slate-700 leading-relaxed">{pred.justification_ia}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Action recommandée</p>
                <p className="text-sm text-slate-700 leading-relaxed">{pred.action_recommandee}</p>
              </div>
            </div>
          </div>
          {/* Metadata */}
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Source</span><span className="text-slate-700 font-medium text-right max-w-[140px]">{pred.source}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Confiance IA</span><span className="font-semibold text-slate-700">{pred.confiance_ia}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Créé le</span><span className="text-slate-700">{new Date(pred.created_at).toLocaleDateString('fr-FR')}</span></div>
              {pred.cout_estime !== null && (
                <div className="flex justify-between"><span className="text-slate-500">Coût estimé</span><span className="font-semibold text-slate-700">{pred.cout_estime.toLocaleString('fr-FR')} €</span></div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 text-xs px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                Créer intervention
              </button>
              <button className="flex-1 text-xs px-2 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium">
                Voir fiche
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PredictifTableau() {
  const [search, setSearch] = useState('');
  const [filterCriticite, setFilterCriticite] = useState<CriticitePred | ''>('');
  const [filterStatut, setFilterStatut] = useState<StatutPred | ''>('');
  const [filterCategorie, setFilterCategorie] = useState<CategoriePred | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('criticite');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleExpand = (id: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleSelect = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filtered = useMemo(() => {
    let list = [...MOCK_PREDICTIONS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.titre.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.equipement.toLowerCase().includes(q) ||
        p.residence.toLowerCase().includes(q)
      );
    }
    if (filterCriticite) list = list.filter(p => p.criticite === filterCriticite);
    if (filterStatut) list = list.filter(p => p.statut === filterStatut);
    if (filterCategorie) list = list.filter(p => p.categorie === filterCategorie);

    list.sort((a, b) => {
      let va: number | string, vb: number | string;
      switch (sortKey) {
        case 'criticite': va = CRITICITE_ORDER[a.criticite]; vb = CRITICITE_ORDER[b.criticite]; break;
        case 'probabilite': va = a.probabilite; vb = b.probabilite; break;
        case 'score_ia': va = a.score_ia; vb = b.score_ia; break;
        case 'cout_estime': va = a.cout_estime ?? -1; vb = b.cout_estime ?? -1; break;
        case 'date_estimee': va = a.date_estimee; vb = b.date_estimee; break;
        default: va = a.reference; vb = b.reference;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [search, filterCriticite, filterStatut, filterCategorie, sortKey, sortDir]);

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5 text-blue-600" /> : <ChevronDown className="w-3 h-3 inline ml-0.5 text-blue-600" />
      : <ChevronDown className="w-3 h-3 inline ml-0.5 text-slate-300 opacity-50" />
  );

  const ThSort = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide whitespace-nowrap hover:text-blue-600 transition-colors ${sortKey === k ? 'text-blue-600' : 'text-slate-500'}`}
    >
      {label}
      <SortIcon k={k} />
    </button>
  );

  const activeFilters = [filterCriticite, filterStatut, filterCategorie].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une prédiction…"
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${showFilters || activeFilters > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {activeFilters > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeFilters}</span>
          )}
        </button>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-300">
            <span className="text-sm text-slate-600">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
            <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Créer interventions</button>
            <button className="text-xs px-2 py-1 bg-white text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50">Ignorer</button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">{filtered.length} prédiction{filtered.length > 1 ? 's' : ''}</span>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors">
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white">
          <span className="text-xs text-slate-500 font-medium shrink-0">Filtrer par</span>
          <select
            value={filterCriticite}
            onChange={e => setFilterCriticite(e.target.value as CriticitePred | '')}
            className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Toutes criticités</option>
            {(Object.keys(CRITICITE_PRED_CFG) as CriticitePred[]).map(k => (
              <option key={k} value={k}>{CRITICITE_PRED_CFG[k].icon} {CRITICITE_PRED_CFG[k].label}</option>
            ))}
          </select>
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value as StatutPred | '')}
            className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous statuts</option>
            {(Object.keys(STATUT_PRED_CFG) as StatutPred[]).map(k => (
              <option key={k} value={k}>{STATUT_PRED_CFG[k].label}</option>
            ))}
          </select>
          <select
            value={filterCategorie}
            onChange={e => setFilterCategorie(e.target.value as CategoriePred | '')}
            className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Toutes catégories</option>
            {(Object.keys(CATEGORIE_PRED_CFG) as CategoriePred[]).map(k => (
              <option key={k} value={k}>{CATEGORIE_PRED_CFG[k].icon} {CATEGORIE_PRED_CFG[k].label}</option>
            ))}
          </select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterCriticite(''); setFilterStatut(''); setFilterCategorie(''); }}
              className="text-xs text-blue-600 hover:underline ml-1"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={e => setSelected(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())}
                />
              </th>
              <th className="w-8 px-2 py-2.5" />
              <th className="px-3 py-2.5 text-left"><ThSort label="Référence" k="reference" /></th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Titre</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Catégorie</th>
              <th className="px-3 py-2.5 text-left"><ThSort label="Criticité" k="criticite" /></th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              <th className="px-3 py-2.5 text-left"><ThSort label="Proba." k="probabilite" /></th>
              <th className="px-3 py-2.5 text-left"><ThSort label="Score IA" k="score_ia" /></th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Site · Résidence</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsable</th>
              <th className="px-3 py-2.5 text-left"><ThSort label="Échéance" k="date_estimee" /></th>
              <th className="px-3 py-2.5 text-left"><ThSort label="Coût €" k="cout_estime" /></th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Impacts</th>
              <th className="w-8 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(pred => {
              const critCfg = CRITICITE_PRED_CFG[pred.criticite];
              const statCfg = STATUT_PRED_CFG[pred.statut];
              const catCfg = CATEGORIE_PRED_CFG[pred.categorie];
              const isExpanded = expanded.has(pred.id);
              const isSelected = selected.has(pred.id);
              const daysUntil = Math.ceil((new Date(pred.date_estimee).getTime() - Date.now()) / 86400000);
              const dateUrgent = daysUntil <= 14;

              return (
                <React.Fragment key={pred.id}>
                  <tr
                    className={`border-b border-slate-100 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                    onClick={() => toggleExpand(pred.id)}
                  >
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={isSelected}
                        onChange={() => toggleSelect(pred.id)}
                      />
                    </td>
                    <td className="px-2 py-2.5 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-mono text-slate-500">{pred.reference}</span>
                    </td>
                    <td className="px-3 py-2.5 max-w-[220px]">
                      <span className="text-sm font-medium text-slate-800 line-clamp-1">{pred.titre}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${catCfg.bg} ${catCfg.color} border ${catCfg.border}`}>
                        <span>{catCfg.icon}</span>
                        <span>{catCfg.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${critCfg.badgeBg} ${critCfg.text}`}>
                        {critCfg.icon} {critCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statCfg.bg} ${statCfg.text} ${statCfg.border}`}>
                        {statCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <ProbBar value={pred.probabilite} />
                    </td>
                    <td className="px-3 py-2.5">
                      <ScoreBadge value={pred.score_ia} />
                    </td>
                    <td className="px-3 py-2.5 max-w-[160px]">
                      <div className="text-xs text-slate-700 font-medium truncate">{pred.residence !== 'Multi-résidences' && pred.residence !== '—' ? pred.residence : pred.site}</div>
                      {pred.batiment !== '—' && pred.batiment !== 'Multi-bâtiments' && (
                        <div className="text-xs text-slate-400 truncate">{pred.batiment}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-slate-600">{pred.responsable}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className={`text-xs font-medium ${dateUrgent ? 'text-red-600' : 'text-slate-600'}`}>
                        {new Date(pred.date_estimee).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className={`text-xs ${dateUrgent ? 'text-red-400' : 'text-slate-400'}`}>
                        {daysUntil > 0 ? `J-${daysUntil}` : 'Dépassé'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {pred.cout_estime !== null
                        ? <span className="text-xs font-semibold text-slate-700">{pred.cout_estime.toLocaleString('fr-FR')} €</span>
                        : <span className="text-xs text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <ImpactDot active={pred.impact_energetique} color="bg-yellow-400" />
                        <ImpactDot active={pred.impact_reglementaire} color="bg-emerald-500" />
                        <ImpactDot active={pred.impact_carbone} color="bg-lime-500" />
                      </div>
                    </td>
                    <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && <ExpandedRow pred={pred} />}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Brain className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium">Aucune prédiction ne correspond aux filtres</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center gap-4 text-xs text-slate-500">
        <span className="font-medium">Impacts :</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Énergie</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Réglementaire</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-500 inline-block" /> Carbone</span>
        <span className="ml-auto">Cliquer sur une ligne pour voir les détails</span>
      </div>
    </div>
  );
}
