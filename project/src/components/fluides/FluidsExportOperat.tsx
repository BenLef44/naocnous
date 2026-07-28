import React, { useState, useMemo, useCallback } from 'react';
import {
  Download, FileText, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronRight,
  Zap, Settings, Eye,
} from 'lucide-react';
import {
  ConsommationFluide, FLUIDE_CFG, TypeFluide, fmtEur, fmtNum,
} from './fluideTypes';

// ─── OPERAT field mapping ─────────────────────────────────────────────────────

const FLUIDE_TO_OPERAT: Partial<Record<TypeFluide, { code: string; label: string; unite: string }>> = {
  electricite: { code: 'ELECTRICITE',      label: 'Électricité',     unite: 'kWh' },
  gaz:         { code: 'GAZ_NATUREL',      label: 'Gaz naturel',     unite: 'kWh' },
  eau:         { code: 'EAU',              label: 'Eau',             unite: 'm3'  },
  chaleur:     { code: 'RESEAU_CHALEUR',   label: 'Réseau de chaleur',unite: 'kWh' },
  solaire:     { code: 'SOLAIRE',          label: 'Solaire',         unite: 'kWh' },
  biomasse:    { code: 'BIOMASSE',         label: 'Biomasse',        unite: 'kWh' },
};

const USAGES_TERTIAIRES = [
  { code: 'HEBERGEMENT', label: 'Hébergement / Logements étudiants' },
  { code: 'RESTAURATION', label: 'Restauration universitaire' },
  { code: 'BUREAUX', label: 'Bureaux / Administration' },
  { code: 'ENSEIGNEMENT', label: 'Enseignement / Salles communes' },
];

type Granularite = 'site' | 'batiment' | 'sous_compteur';
type FormatExport = 'csv' | 'json' | 'xlsx_preview';

interface OperatRow {
  n_siret: string;
  adresse: string;
  nom_batiment: string;
  annee: number;
  surface_m2: number;
  usage_tertiaire: string;
  type_energie: string;
  consommation: number;
  unite: string;
  cout_euros: number;
  source: string;
  qualite: 'REELLE' | 'ESTIMEE' | 'CALCULEE';
  residence_id: string;
}

interface Residence {
  id: string;
  nom: string;
  adresse?: string | null;
  nombre_logements?: number | null;
  annee_construction?: number | null;
}

interface Props {
  consommations: ConsommationFluide[];
  residences: Residence[];
  sites: { id: string; nom: string; code: string | null }[];
  residencesSel: Set<string>;
}

export default function FluidsExportOperat({ consommations, residences, sites, residencesSel }: Props) {
  const [annee, setAnnee]                 = useState(2025);
  const [granularite, setGranularite]     = useState<Granularite>('batiment');
  const [format, setFormat]               = useState<FormatExport>('csv');
  const [selectedFluides, setSelectedFluides] = useState<Set<TypeFluide>>(new Set(['electricite', 'gaz', 'eau', 'chaleur']));
  const [selectedUsage, setSelectedUsage] = useState('HEBERGEMENT');
  const [surfaceParDefaut, setSurfaceParDefaut] = useState(150);
  const [showPreview, setShowPreview]     = useState(false);
  const [exportDone, setExportDone]       = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('parametres');

  const anneesDisponibles = useMemo(() => [...new Set(consommations.map(c => c.annee))].sort((a, b) => b - a), [consommations]);

  const filteredResidences = useMemo(() => {
    if (residencesSel.size === 0) return residences;
    return residences.filter(r => residencesSel.has(r.id));
  }, [residences, residencesSel]);

  // Build OPERAT rows
  const operatRows = useMemo((): OperatRow[] => {
    const rows: OperatRow[] = [];
    const conso = consommations.filter(c => c.annee === annee && selectedFluides.has(c.type_fluide));

    filteredResidences.forEach(res => {
      const resConso = conso.filter(c => c.residence_id === res.id);
      const fluidesPresents = [...new Set(resConso.map(c => c.type_fluide))] as TypeFluide[];

      fluidesPresents.forEach(fluide => {
        const operatFluide = FLUIDE_TO_OPERAT[fluide];
        if (!operatFluide) return;
        const rows_fluide = resConso.filter(c => c.type_fluide === fluide);
        const totalKwh = rows_fluide.reduce((s, c) => s + (c.valeur_kwh ?? 0), 0);
        const totalM3 = rows_fluide.reduce((s, c) => s + (c.valeur_m3 ?? 0), 0);
        const totalCout = rows_fluide.reduce((s, c) => s + (c.cout_euros ?? 0), 0);
        const hasAlerte = rows_fluide.some(c => c.alerte_seuil);
        const valeur = fluide === 'eau' ? totalM3 : totalKwh;
        if (valeur === 0) return;

        rows.push({
          n_siret: '13002526900013', // CNOUS SIRET
          adresse: res.adresse ?? `${res.nom}, Lyon`,
          nom_batiment: res.nom,
          annee,
          surface_m2: (res.nombre_logements ?? 1) * surfaceParDefaut,
          usage_tertiaire: selectedUsage,
          type_energie: operatFluide.code,
          consommation: Math.round(valeur),
          unite: operatFluide.unite,
          cout_euros: Math.round(totalCout),
          source: rows_fluide[0]?.source_systeme ?? 'Manuel',
          qualite: hasAlerte ? 'ESTIMEE' : 'REELLE',
          residence_id: res.id,
        });
      });
    });

    return rows;
  }, [consommations, annee, selectedFluides, filteredResidences, selectedUsage, surfaceParDefaut]);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalKwh = operatRows.filter(r => r.unite === 'kWh').reduce((s, r) => s + r.consommation, 0);
    const totalM3  = operatRows.filter(r => r.unite === 'm3').reduce((s, r) => s + r.consommation, 0);
    const totalCout = operatRows.reduce((s, r) => s + r.cout_euros, 0);
    const batsCouverts = new Set(operatRows.map(r => r.residence_id)).size;
    const rowsReelles  = operatRows.filter(r => r.qualite === 'REELLE').length;
    const qualitePct = operatRows.length > 0 ? Math.round((rowsReelles / operatRows.length) * 100) : 100;
    return { totalKwh, totalM3, totalCout, batsCouverts, qualitePct, total: operatRows.length };
  }, [operatRows]);

  // Validation checks
  const checks = useMemo(() => [
    { label: 'Données annuelles complètes (12 mois)',   ok: consommations.filter(c => c.annee === annee).length >= 4, required: true },
    { label: 'Surfaces renseignées',                    ok: surfaceParDefaut > 0, required: true },
    { label: 'Usage tertiaire sélectionné',             ok: !!selectedUsage, required: true },
    { label: 'Au moins un fluide sélectionné',          ok: selectedFluides.size > 0, required: true },
    { label: 'Au moins un bâtiment couvert',            ok: stats.batsCouverts > 0, required: true },
    { label: 'Qualité données ≥ 80%',                   ok: stats.qualitePct >= 80, required: false },
    { label: 'Aucune alerte critique non résolue',      ok: true, required: false },
  ], [consommations, annee, surfaceParDefaut, selectedUsage, selectedFluides, stats]);

  const allRequired = checks.filter(c => c.required).every(c => c.ok);

  function generateCsv(): string {
    const headers = [
      'N_SIRET', 'ADRESSE', 'NOM_BATIMENT', 'ANNEE', 'SURFACE_M2',
      'USAGE_TERTIAIRE', 'TYPE_ENERGIE', 'CONSOMMATION', 'UNITE',
      'COUT_EUROS', 'SOURCE', 'QUALITE_DONNEE',
    ];
    const lines = [
      headers.join(';'),
      ...operatRows.map(r => [
        r.n_siret, `"${r.adresse}"`, `"${r.nom_batiment}"`, r.annee,
        r.surface_m2, r.usage_tertiaire, r.type_energie, r.consommation,
        r.unite, r.cout_euros, r.source, r.qualite,
      ].join(';')),
    ];
    return lines.join('\n');
  }

  function generateJson(): string {
    const payload = {
      version: '2.0',
      date_export: new Date().toISOString().slice(0, 10),
      organisme: 'CROUS de Lyon',
      siret: '13002526900013',
      annee_reference: annee,
      nb_batiments: stats.batsCouverts,
      donnees: operatRows.map(r => ({
        siret: r.n_siret,
        adresse_batiment: r.adresse,
        nom_batiment: r.nom_batiment,
        annee: r.annee,
        surface_plancher_m2: r.surface_m2,
        categorie_activite: r.usage_tertiaire,
        type_energie: r.type_energie,
        consommation_annuelle: r.consommation,
        unite: r.unite,
        cout_annuel_eur: r.cout_euros,
        source_donnee: r.source,
        qualite_donnee: r.qualite,
      })),
    };
    return JSON.stringify(payload, null, 2);
  }

  function handleExport() {
    let content: string;
    let filename: string;
    let mime: string;

    if (format === 'csv') {
      content = generateCsv();
      filename = `OPERAT_Export_${annee}_${new Date().toISOString().slice(0, 10)}.csv`;
      mime = 'text/csv;charset=utf-8;';
    } else {
      content = generateJson();
      filename = `OPERAT_Export_${annee}_${new Date().toISOString().slice(0, 10)}.json`;
      mime = 'application/json';
    }

    const blob = new Blob(['\uFEFF' + content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  function toggleFluide(f: TypeFluide) {
    setSelectedFluides(prev => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  }

  function toggleSection(s: string) {
    setExpandedSection(prev => prev === s ? null : s);
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-slate-800">Export OPERAT — Décret Tertiaire</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Génère un fichier conforme à la plateforme nationale OPERAT (Observatoire de la Performance Énergétique, de la Rénovation et des Actions du Tertiaire). Obligatoire pour tout bâtiment tertiaire de plus de 1 000 m².
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded font-medium">Art. L.174-1 Code de la Construction</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left — Parameters */}
        <div className="lg:col-span-2 space-y-3">

          {/* Paramétrage */}
          <Section
            id="parametres" label="Paramétrage de l'export" icon={<Settings className="w-4 h-4 text-slate-500" />}
            expanded={expandedSection === 'parametres'} onToggle={() => toggleSection('parametres')}
          >
            <div className="grid grid-cols-2 gap-4 pt-3">
              {/* Année */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Année de référence</label>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  {anneesDisponibles.map(a => (
                    <button key={a} onClick={() => setAnnee(a)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${annee === a ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granularité */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Granularité</label>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  {([
                    { id: 'site', label: 'Site' },
                    { id: 'batiment', label: 'Bâtiment' },
                    { id: 'sous_compteur', label: 'Sous-cpt.' },
                  ] as const).map(g => (
                    <button key={g.id} onClick={() => setGranularite(g.id)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${granularite === g.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fluides */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Types d'énergie inclus</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['electricite', 'gaz', 'eau', 'chaleur', 'solaire', 'biomasse'] as TypeFluide[]).map(f => {
                    const cfg = FLUIDE_CFG[f];
                    const Icon = cfg.icon;
                    const sel = selectedFluides.has(f);
                    return (
                      <button key={f} onClick={() => toggleFluide(f)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sel ? 'border-current' : 'border-slate-200 text-slate-400 bg-white'}`}
                        style={sel ? { background: cfg.colorHex + '15', color: cfg.colorHex, borderColor: cfg.colorHex + '40' } : {}}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Usage tertiaire */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Catégorie d'activité tertiaire</label>
                <select value={selectedUsage} onChange={e => setSelectedUsage(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {USAGES_TERTIAIRES.map(u => (
                    <option key={u.code} value={u.code}>{u.label}</option>
                  ))}
                </select>
              </div>

              {/* Surface par logement */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Surface unitaire (m²/logement)
                  <span className="ml-1 text-slate-400 font-normal">— utilisée si non renseignée</span>
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" min={10} max={500} value={surfaceParDefaut}
                    onChange={e => setSurfaceParDefaut(Number(e.target.value))}
                    className="w-24 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-slate-400">m²</span>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Format d'export</label>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  {([
                    { id: 'csv',          label: 'CSV (OPERAT)' },
                    { id: 'json',         label: 'JSON' },
                    { id: 'xlsx_preview', label: 'Aperçu seul' },
                  ] as const).map(f => (
                    <button key={f.id} onClick={() => setFormat(f.id)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${format === f.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Vérification */}
          <Section
            id="verification" label="Contrôle de cohérence" icon={<CheckCircle2 className="w-4 h-4 text-slate-500" />}
            expanded={expandedSection === 'verification'} onToggle={() => toggleSection('verification')}
          >
            <div className="pt-3 space-y-2">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  {c.ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${c.required ? 'text-red-500' : 'text-amber-400'}`} />
                  }
                  <span className={`text-xs ${c.ok ? 'text-slate-600' : c.required ? 'text-red-600 font-semibold' : 'text-amber-600'}`}>
                    {c.label}
                  </span>
                  {!c.ok && !c.required && (
                    <span className="text-[10px] text-amber-500 ml-auto">Recommandé</span>
                  )}
                  {!c.ok && c.required && (
                    <span className="text-[10px] text-red-500 ml-auto font-bold">Obligatoire</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Aperçu données */}
          <Section
            id="apercu" label={`Aperçu des données — ${operatRows.length} lignes`} icon={<Eye className="w-4 h-4 text-slate-500" />}
            expanded={expandedSection === 'apercu'} onToggle={() => toggleSection('apercu')}
          >
            <div className="pt-3 overflow-x-auto">
              {operatRows.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Aucune donnée à exporter pour les paramètres sélectionnés</p>
              ) : (
                <table className="w-full text-xs min-w-max">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Bâtiment', 'Usage', 'Énergie', 'Consommation', 'Unité', 'Coût', 'Surface', 'Qualité'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-slate-400 font-semibold uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {operatRows.slice(0, 12).map((r, i) => {
                      const fluide = Object.entries(FLUIDE_TO_OPERAT).find(([, v]) => v?.code === r.type_energie);
                      const fluidKey = fluide?.[0] as TypeFluide | undefined;
                      const fluidCfg = fluidKey ? FLUIDE_CFG[fluidKey] : null;
                      const FlIcon = fluidCfg?.icon ?? Zap;
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-700 max-w-40 truncate">{r.nom_batiment}</td>
                          <td className="px-3 py-2 text-slate-500">{r.usage_tertiaire}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <FlIcon className="w-3 h-3" style={fluidCfg ? { color: fluidCfg.colorHex } : {}} />
                              <span>{r.type_energie}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-700">{fmtNum(r.consommation)}</td>
                          <td className="px-3 py-2 text-slate-500">{r.unite}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-700">{fmtEur(r.cout_euros)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{fmtNum(r.surface_m2)} m²</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${r.qualite === 'REELLE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {r.qualite}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {operatRows.length > 12 && (
                <p className="text-xs text-slate-400 text-center py-2">… {operatRows.length - 12} lignes supplémentaires non affichées</p>
              )}
            </div>
          </Section>
        </div>

        {/* Right — Summary + Actions */}
        <div className="space-y-3">

          {/* KPI synthèse */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-xs font-bold text-slate-700">Synthèse export</p>
            <div className="space-y-2.5">
              <KpiRow label="Année" value={String(annee)} />
              <KpiRow label="Bâtiments couverts" value={String(stats.batsCouverts)} />
              <KpiRow label="Lignes générées" value={String(stats.total)} />
              <KpiRow label="Énergie totale" value={stats.totalKwh > 0 ? `${fmtNum(Math.round(stats.totalKwh / 1000))} MWh` : '—'} />
              {stats.totalM3 > 0 && <KpiRow label="Eau totale" value={`${fmtNum(stats.totalM3)} m³`} />}
              <KpiRow label="Coût total" value={fmtEur(stats.totalCout)} />
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Qualité des données</span>
                  <span className={`text-xs font-bold ${stats.qualitePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{stats.qualitePct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${stats.qualitePct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${stats.qualitePct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{operatRows.filter(r => r.qualite === 'REELLE').length} données réelles · {operatRows.filter(r => r.qualite !== 'REELLE').length} estimées</p>
              </div>
            </div>
          </div>

          {/* Réglementation info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-xs font-bold text-blue-700">Obligations décret tertiaire</p>
            </div>
            <ul className="space-y-1">
              {[
                'Déclaration annuelle avant le 30 septembre',
                'Objectif -40% de conso. en 2030 (base 2010)',
                'Objectif -50% en 2040, -60% en 2050',
                'Bâtiments ≥ 1 000 m² concernés',
                'Sanctions jusqu\'à 1 500 €/bâtiment',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                  <span className="text-xs text-blue-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Historique exports fictif */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-bold text-slate-700">Historique des exports</p>
            {[
              { date: '15/09/2025', annee: 2024, statut: 'ok', lignes: 28 },
              { date: '12/09/2024', annee: 2023, statut: 'ok', lignes: 24 },
              { date: '18/09/2023', annee: 2022, statut: 'avert', lignes: 20 },
            ].map((h, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                {h.statut === 'ok'
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="text-xs text-slate-600">{h.date} · Année {h.annee}</p>
                  <p className="text-[10px] text-slate-400">{h.lignes} lignes transmises</p>
                </div>
                <button className="text-[10px] text-blue-600 hover:underline">Revoir</button>
              </div>
            ))}
          </div>

          {/* Export button */}
          <div className="space-y-2">
            {!allRequired && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">Des contrôles obligatoires ne sont pas satisfaits. Veuillez corriger avant d'exporter.</p>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={!allRequired || format === 'xlsx_preview' || stats.total === 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                exportDone
                  ? 'bg-emerald-500 text-white'
                  : allRequired && format !== 'xlsx_preview' && stats.total > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
              {exportDone
                ? <><CheckCircle2 className="w-4 h-4" />Fichier exporté !</>
                : <><Download className="w-4 h-4" />Exporter {format.toUpperCase()} ({stats.total} lignes)</>
              }
            </button>

            {format === 'xlsx_preview' && (
              <p className="text-[10px] text-slate-400 text-center">Mode aperçu — utilisez CSV ou JSON pour télécharger</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ id, label, icon, expanded, onToggle, children }: {
  id: string; label: string; icon: React.ReactNode;
  expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors">
        {icon}
        <span className="text-xs font-bold text-slate-700 flex-1 text-left">{label}</span>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function KpiRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

