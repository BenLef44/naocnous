import { useState, useEffect, useMemo } from 'react';
import {
  Wrench, MapPin, Search, ChevronRight, Eye, Layers,
  CheckCircle2, Clock, AlertTriangle, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ERP, EquipementSecurite } from './registreTypes';
import PlanViewer from './PlanViewer';
import EquipementPanel from './EquipementPanel';

interface Props {
  erp: ERP;
  equipements: EquipementSecurite[];
  onEquipementsChange: (eq: EquipementSecurite[]) => void;
  planUrl: string;
}

const STATUT_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  conforme: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Conforme' },
  non_conforme: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Non conforme' },
  en_retard: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'En retard' },
  a_venir: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'À venir' },
};

function fmtDate(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

export default function SectionEquipements({ erp, equipements, onEquipementsChange, planUrl }: Props) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPlan, setShowPlan] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [panelEq, setPanelEq] = useState<EquipementSecurite | null>(null);

  // Load equipment from Supabase, linked to the ERP via site_id / residence_id
  useEffect(() => {
    (async () => {
      setLoading(true);
      const filters: string[] = [];
      if (erp.site_id) filters.push(`site_id.eq.${erp.site_id}`);
      if (erp.residence_id) filters.push(`residence_id.eq.${erp.residence_id}`);

      let query = supabase.from('equipements').select('*');
      if (erp.residence_id) {
        query = query.eq('residence_id', erp.residence_id);
      } else if (erp.site_id) {
        query = query.eq('site_id', erp.site_id);
      }

      const { data } = await query.order('designation');

      // Only keep security-related equipment
      const secKeywords = ['extinct', 'baes', 'eclairage sec', 'ssi', 'ria', 'issue', 'porte', 'declencheur', 'desenfum', 'dae', 'defibrill', 'coupure', 'energie', 'alarme', 'securite'];
      const filtered = (data ?? []).filter((eq: Record<string, unknown>) => {
        const desig = String(eq.designation ?? '').toLowerCase();
        const cat = String(eq.categorie ?? '').toLowerCase();
        return secKeywords.some(k => desig.includes(k) || cat.includes(k));
      });

      const mapped: EquipementSecurite[] = filtered.map((eq: Record<string, unknown>) => {
        const statut = computeEquipementStatut(eq.prochaine_echeance as string | null, eq.etat as string);
        return {
          id: eq.id as string,
          designation: eq.designation as string,
          categorie: eq.categorie as string,
          localisation: [eq.localisation_detail, eq.sous_categorie].filter(Boolean).join(' — ') || 'Non précisée',
          organisme: null,
          date_dernier_controle: null,
          date_prochain_controle: (eq.prochaine_echeance as string) ?? null,
          statut,
          x: null,
          y: null,
        };
      });

      // Don't overwrite if parent already has data (e.g. editing existing registre)
      if (equipements.length === 0) {
        onEquipementsChange(mapped);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erp.id]);

  const filtered = useMemo(() => {
    if (!search) return equipements;
    const s = search.toLowerCase();
    return equipements.filter(eq =>
      eq.designation.toLowerCase().includes(s) ||
      eq.localisation.toLowerCase().includes(s) ||
      eq.categorie.toLowerCase().includes(s)
    );
  }, [equipements, search]);

  const stats = useMemo(() => {
    const conforme = equipements.filter(e => e.statut === 'conforme').length;
    const retard = equipements.filter(e => e.statut === 'en_retard').length;
    const aVenir = equipements.filter(e => e.statut === 'a_venir').length;
    return { total: equipements.length, conforme, retard, aVenir };
  }, [equipements]);

  const selectedEq = equipements.find(e => e.id === selectedEqId) ?? null;

  const updateEqPosition = (id: string, x: number, y: number) => {
    onEquipementsChange(equipements.map(eq => eq.id === id ? { ...eq, x, y } : eq));
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Total" value={stats.total} color="bg-slate-100 text-slate-700" />
        <StatCard label="Conformes" value={stats.conforme} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="À venir" value={stats.aVenir} color="bg-blue-50 text-blue-700" />
        <StatCard label="En retard" value={stats.retard} color="bg-red-50 text-red-700" />
      </div>

      {/* Search + plan toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un équipement…"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPlan(s => !s)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            showPlan ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> {showPlan ? 'Vue tableau' : 'Vue plan'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400 text-xs gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
          Chargement des équipements depuis le patrimoine…
        </div>
      ) : showPlan ? (
        /* Plan view with layers */
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <PlanViewer
              planUrl={planUrl}
              points={[]}
              onPointsChange={() => {}}
              equipements={equipements}
              showEquipementLayers
              selectedEquipementId={selectedEqId}
              onSelectEquipement={(id) => {
                setSelectedEqId(id);
                const eq = equipements.find(e => e.id === id);
                if (eq) setPanelEq(eq);
              }}
              height="h-80"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Cliquez sur un marqueur pour voir le détail. Les équipements non positionnés n'apparaissent pas sur le plan.
            </p>
          </div>
          {panelEq && (
            <div className="col-span-1 rounded-xl border border-slate-200 bg-white overflow-hidden h-fit">
              <EquipementPanel equipement={panelEq} onClose={() => { setPanelEq(null); setSelectedEqId(null); }} />
            </div>
          )}
          {!panelEq && (
            <div className="col-span-1 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 h-80 text-slate-400 text-xs text-center px-4">
              Sélectionnez un équipement sur le plan pour voir ses caractéristiques, QR code et historique.
            </div>
          )}
        </div>
      ) : (
        /* Table view */
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left font-bold text-slate-500 px-3 py-2 uppercase tracking-wide text-[10px]">Équipement</th>
                <th className="text-left font-bold text-slate-500 px-3 py-2 uppercase tracking-wide text-[10px] hidden sm:table-cell">Localisation</th>
                <th className="text-left font-bold text-slate-500 px-3 py-2 uppercase tracking-wide text-[10px] hidden md:table-cell">Prochaine échéance</th>
                <th className="text-left font-bold text-slate-500 px-3 py-2 uppercase tracking-wide text-[10px]">Statut</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                    Aucun équipement de sécurité trouvé pour cet ERP
                  </td>
                </tr>
              ) : filtered.map(eq => {
                const cfg = STATUT_CFG[eq.statut] ?? STATUT_CFG.a_venir;
                return (
                  <tr
                    key={eq.id}
                    onClick={() => setPanelEq(eq)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 truncate">{eq.designation}</p>
                          <p className="text-[10px] text-slate-400 truncate">{eq.categorie}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <span className="truncate">{eq.localisation}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 hidden md:table-cell">{fmtDate(eq.date_prochain_controle)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Equipment detail panel (table view) */}
      {panelEq && !showPlan && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPanelEq(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <EquipementPanel equipement={panelEq} onClose={() => setPanelEq(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg ${color} px-3 py-2 text-center`}>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}

function computeEquipementStatut(prochaineEcheance: string | null, etat: string): string {
  if (etat === 'hs' || etat === 'arret') return 'non_conforme';
  if (!prochaineEcheance) return 'a_venir';
  const echeance = new Date(prochaineEcheance);
  const now = new Date();
  if (echeance < now) return 'en_retard';
  return 'conforme';
}
