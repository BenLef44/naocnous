import React, { useState, useMemo } from 'react';
import { Search, Wifi, WifiOff, Battery, BatteryLow, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import {
  CompteurFluide, FLUIDE_CFG, COMM_CFG, TypeFluide, StatutCommunication, fmtDate,
} from './fluideTypes';

interface Props {
  compteurs: CompteurFluide[];
}

function QualityBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
        {score}%
      </span>
    </div>
  );
}

function BatteryIcon({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-slate-300">—</span>;
  const color = pct > 30 ? 'text-emerald-600' : pct > 15 ? 'text-amber-500' : 'text-red-500';
  const Icon = pct <= 15 ? BatteryLow : Battery;
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${color}`}>
      <Icon className="w-3.5 h-3.5" />{pct}%
    </span>
  );
}

export default function FluidsCompteurs({ compteurs }: Props) {
  const [search, setSearch]             = useState('');
  const [filterFluide, setFilterFluide] = useState<TypeFluide | 'tous'>('tous');
  const [filterComm, setFilterComm]     = useState<StatutCommunication | 'tous'>('tous');
  const [viewMode, setViewMode]         = useState<'cards' | 'liste'>('cards');

  const filtered = useMemo(() => compteurs.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.reference.toLowerCase().includes(q) || (c.residences as any)?.nom?.toLowerCase().includes(q) || c.localisation?.toLowerCase().includes(q);
    const matchFluide = filterFluide === 'tous' || c.type_fluide === filterFluide;
    const matchComm   = filterComm === 'tous' || c.statut_communication === filterComm;
    return matchSearch && matchFluide && matchComm;
  }), [compteurs, search, filterFluide, filterComm]);

  const stats = useMemo(() => ({
    connectes: compteurs.filter(c => c.statut_communication === 'connecte').length,
    problemes: compteurs.filter(c => c.statut_communication !== 'connecte').length,
    scoreQualite: compteurs.length > 0
      ? Math.round(compteurs.reduce((s, c) => s + c.score_qualite_donnee, 0) / compteurs.length) : 100,
    batterieFaible: compteurs.filter(c => c.niveau_batterie_pct != null && c.niveau_batterie_pct <= 20).length,
  }), [compteurs]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Stats banner */}
      <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center gap-6 flex-shrink-0">
        <StatChip icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />} label="Connectés" value={stats.connectes} color="text-emerald-700" />
        <StatChip icon={<WifiOff className="w-3.5 h-3.5 text-red-500" />} label="Problèmes" value={stats.problemes} color={stats.problemes > 0 ? 'text-red-600' : 'text-slate-400'} />
        <StatChip icon={<Activity className="w-3.5 h-3.5 text-blue-600" />} label="Qualité moy." value={`${stats.scoreQualite}%`} color={stats.scoreQualite >= 90 ? 'text-emerald-700' : 'text-amber-600'} />
        <StatChip icon={<BatteryLow className="w-3.5 h-3.5 text-amber-500" />} label="Batterie faible" value={stats.batterieFaible} color={stats.batterieFaible > 0 ? 'text-amber-600' : 'text-slate-400'} />
        <span className="ml-auto text-xs text-slate-400">{compteurs.length} compteur{compteurs.length > 1 ? 's' : ''}</span>
      </div>

      {/* Toolbar */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap gap-3 items-center flex-shrink-0">
        <div className="relative min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Référence, résidence, localisation…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <FilterBtn active={filterFluide === 'tous'} onClick={() => setFilterFluide('tous')} label="Tous fluides" />
          {(['electricite', 'gaz', 'eau', 'chaleur'] as TypeFluide[]).map(f => {
            const cfg = FLUIDE_CFG[f];
            const Icon = cfg.icon;
            return <FilterBtn key={f} active={filterFluide === f} onClick={() => setFilterFluide(f)} label={cfg.label} icon={<Icon className="w-3 h-3" style={{ color: cfg.colorHex }} />} />;
          })}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <FilterBtn active={filterComm === 'tous'} onClick={() => setFilterComm('tous')} label="Tous états" />
          {(['connecte', 'hors_ligne', 'batterie_faible', 'anomalie', 'non_communicant'] as StatutCommunication[]).map(s => {
            const cfg = COMM_CFG[s];
            return <FilterBtn key={s} active={filterComm === s} onClick={() => setFilterComm(s)} label={cfg.label} dot={<span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />} />;
          })}
        </div>

        <div className="ml-auto flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          <FilterBtn active={viewMode === 'cards'} onClick={() => setViewMode('cards')} label="Cartes" />
          <FilterBtn active={viewMode === 'liste'} onClick={() => setViewMode('liste')} label="Liste" />
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(c => {
              const fluideCfg = FLUIDE_CFG[c.type_fluide as TypeFluide];
              const FlIcon = fluideCfg.icon;
              const commCfg = COMM_CFG[c.statut_communication];
              const isProbleme = c.statut_communication !== 'connecte';
              return (
                <div key={c.id} className={`bg-white rounded-xl border p-4 space-y-3 ${isProbleme ? 'border-orange-200' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: fluideCfg.colorHex + '15' }}>
                      <FlIcon className="w-4 h-4" style={{ color: fluideCfg.colorHex }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-700 font-mono">{c.reference}</p>
                      <p className="text-xs text-slate-400 truncate">{(c.residences as any)?.nom ?? '—'}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${commCfg.bg} ${commCfg.text} flex-shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${commCfg.dot}`} />
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Localisation</span>
                      <span className="font-medium text-slate-700 truncate ml-2 max-w-32">{c.localisation ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protocole</span>
                      <span className="font-medium text-slate-700">{c.protocole ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dernier relevé</span>
                      <span className="font-medium text-slate-700">{fmtDate(c.date_derniere_releve)}</span>
                    </div>
                    {c.donnees_manquantes_j > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Données manquantes</span>
                        <span className="font-bold">{c.donnees_manquantes_j}j</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Qualité données</span>
                      {c.niveau_batterie_pct !== null && <BatteryIcon pct={c.niveau_batterie_pct} />}
                    </div>
                    <QualityBar score={c.score_qualite_donnee} />
                  </div>

                  <div className={`text-[10px] font-semibold px-2 py-1 rounded ${commCfg.bg} ${commCfg.text} text-center`}>
                    {commCfg.label}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-2">
                <Wifi className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-slate-400">Aucun compteur trouvé</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Référence</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Résidence</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Fluide</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Localisation</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Protocole</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">État commu.</th>
                <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Batterie</th>
                <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide w-32">Qualité données</th>
                <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Dernier relevé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => {
                const fluideCfg = FLUIDE_CFG[c.type_fluide as TypeFluide];
                const FlIcon = fluideCfg.icon;
                const commCfg = COMM_CFG[c.statut_communication];
                return (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${c.statut_communication !== 'connecte' ? 'bg-orange-50/20' : ''}`}>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{c.reference}</td>
                    <td className="px-4 py-2.5 text-slate-600">{(c.residences as any)?.nom ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <FlIcon className="w-3.5 h-3.5" style={{ color: fluideCfg.colorHex }} />
                        <span>{fluideCfg.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 capitalize">{c.type_compteur.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-slate-500">{c.localisation ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{c.protocole ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${commCfg.bg} ${commCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${commCfg.dot}`} />{commCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right"><BatteryIcon pct={c.niveau_batterie_pct} /></td>
                    <td className="px-4 py-2.5 w-32"><QualityBar score={c.score_qualite_donnee} /></td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{fmtDate(c.date_derniere_releve)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-xs text-slate-400">{label} :</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}

function FilterBtn({ active, onClick, label, icon, dot }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode; dot?: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      {dot}{icon}{label}
    </button>
  );
}
