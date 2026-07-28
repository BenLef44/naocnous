import { useState, useMemo } from 'react';
import { Search, ExternalLink, BookOpen } from 'lucide-react';
import type { Annexe4Regle } from './financeTypes';

interface Props { regles: Annexe4Regle[] }

export default function FinanceAnnexe4({ regles }: Props) {
  const [search,       setSearch]       = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterResp,   setFilterResp]   = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['01-A','02-A','05']));

  const sections = useMemo(
    () => [...new Set(regles.map(r => r.ref_section))].sort(),
    [regles]
  );

  const filtered = useMemo(() => {
    let list = regles;
    if (search) list = list.filter(r =>
      r.nature_ouvrage.toLowerCase().includes(search.toLowerCase()) ||
      r.type_intervention.toLowerCase().includes(search.toLowerCase()) ||
      r.ref_section.toLowerCase().includes(search.toLowerCase())
    );
    if (filterSection) list = list.filter(r => r.ref_section === filterSection);
    if (filterResp)    list = list.filter(r => r.responsable === filterResp);
    return list;
  }, [regles, search, filterSection, filterResp]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, { section_label: string; sous_section: string | null; regles: Annexe4Regle[] }>();
    filtered.forEach(r => {
      if (!map.has(r.ref_section)) map.set(r.ref_section, { section_label: r.section_label, sous_section: r.sous_section, regles: [] });
      map.get(r.ref_section)!.regles.push(r);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  function toggleSection(ref: string) {
    setOpenSections(prev => { const n = new Set(prev); n.has(ref) ? n.delete(ref) : n.add(ref); return n; });
  }

  const RESP_CFG = {
    'Propriétaire': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Gestionnaire': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Partagé':      { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
  };

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header + actions */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs font-black text-slate-700">Annexe 4 — Tableau standard de répartition des charges</p>
            <p className="text-[10px] text-slate-400">{regles.length} règles extraites · RSIF 27/05/2026</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a href="/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors font-semibold">
            <ExternalLink className="w-3 h-3" /> Voir PDF
          </a>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher nature, intervention…"
            className="w-full text-xs border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300" />
        </div>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
          <option value="">Toutes sections</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterResp} onChange={e => setFilterResp(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none">
          <option value="">Tous responsables</option>
          <option value="Propriétaire">Propriétaire</option>
          <option value="Gestionnaire">Gestionnaire</option>
        </select>
        <span className="text-[11px] text-slate-400">{filtered.length} règle{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 py-2 px-1 border-b border-slate-50 flex-shrink-0">
        {Object.entries(RESP_CFG).map(([label, c]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            <span className="text-[11px] text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Accordéon sections */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {grouped.map(([ref, { section_label, regles: sRegles }]) => {
          const isOpen = openSections.has(ref);
          const nbProp = sRegles.filter(r => r.responsable === 'Propriétaire').length;
          const nbGest = sRegles.filter(r => r.responsable === 'Gestionnaire').length;
          return (
            <div key={ref} className="border border-slate-100 rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(ref)}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                <span className="text-xs font-black text-slate-700 font-mono">{ref}</span>
                <span className="text-xs font-semibold text-slate-600 flex-1">{section_label}</span>
                {sRegles[0]?.sous_section && (
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:block">{sRegles[0].sous_section}</span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{nbProp} P</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{nbGest} G</span>
                </span>
                <span className={`w-4 h-4 flex items-center justify-center text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Règles */}
              {isOpen && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white">
                      <th className="text-left py-1.5 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] w-8">Réf.</th>
                      <th className="text-left py-1.5 px-2 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Nature des ouvrages</th>
                      <th className="text-left py-1.5 px-2 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Type d'intervention</th>
                      <th className="text-left py-1.5 px-2 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sRegles.map(r => {
                      const c = RESP_CFG[r.responsable as keyof typeof RESP_CFG];
                      return (
                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-1.5 px-4 text-slate-400 font-mono text-[10px]">{r.sous_ref ?? '—'}</td>
                          <td className="py-1.5 px-2 font-medium text-slate-700 leading-tight">{r.nature_ouvrage}</td>
                          <td className="py-1.5 px-2 text-slate-600">{r.type_intervention}</td>
                          <td className="py-1.5 px-2">
                            {c && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
                                {r.responsable}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
        {grouped.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Aucune règle ne correspond aux filtres
          </div>
        )}
      </div>
    </div>
  );
}
