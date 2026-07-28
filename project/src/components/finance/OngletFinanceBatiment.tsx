import { useEffect, useState } from 'react';
import { Euro, AlertTriangle, FileText, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Charge, Budget, Facture } from './financeTypes';
import { fmtEur, fmtDate, STATUT_CHARGE_CFG } from './financeTypes';
import { StatutChargeChip, ResponsableChip, BudgetBar } from './FinanceShared';

interface Props {
  batiment_id: string;
  residence_id?: string;
}

export default function OngletFinanceBatiment({ batiment_id, residence_id }: Props) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: ch } = await supabase
        .from('charges')
        .select('*')
        .eq('batiment_id', batiment_id)
        .order('date_declaration', { ascending: false });

      const chargeList = (ch ?? []) as Charge[];
      setCharges(chargeList);

      if (residence_id) {
        const { data: bg } = await supabase
          .from('budgets')
          .select('*')
          .eq('residence_id', residence_id)
          .eq('annee', 2026);
        setBudgets(bg ?? []);
      }

      if (chargeList.length > 0) {
        const chargeIds = chargeList.map(c => c.id);
        const { data: fac } = await supabase
          .from('factures')
          .select('*')
          .in('charge_id', chargeIds)
          .order('date_emission', { ascending: false });
        setFactures((fac ?? []) as Facture[]);
      }

      setLoading(false);
    }

    load();
  }, [batiment_id, residence_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
        <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full mr-2" />
        Chargement…
      </div>
    );
  }

  const totalEstime = charges.reduce((s, c) => s + c.cout_estime, 0);
  const totalReel   = charges.reduce((s, c) => s + (c.cout_reel ?? 0), 0);
  const nbLitiges   = charges.filter(c => c.statut === 'litige').length;
  const nbImpaye    = factures.filter(f => f.statut === 'impaye').length;
  const montantImpaye = factures.filter(f => f.statut === 'impaye').reduce((s, f) => s + f.montant_ttc, 0);

  const maintenanceBudget = budgets.find(b => b.type_budget === 'maintenance');

  return (
    <div className="p-4 space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Charges déclarées', value: charges.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Coût total estimé', value: fmtEur(totalEstime), icon: Euro, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Litiges en cours', value: nbLitiges, icon: AlertTriangle, color: nbLitiges > 0 ? 'text-red-500' : 'text-slate-400', bg: nbLitiges > 0 ? 'bg-red-50' : 'bg-slate-50' },
          { label: 'Factures impayées', value: nbImpaye > 0 ? `${nbImpaye} (${fmtEur(montantImpaye)})` : '0', icon: Clock, color: nbImpaye > 0 ? 'text-amber-500' : 'text-slate-400', bg: nbImpaye > 0 ? 'bg-amber-50' : 'bg-slate-50' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={i} className={`rounded-xl border border-slate-100 ${bg} p-3 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-lg font-black text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Budget maintenance */}
        {maintenanceBudget && (
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-black text-slate-600 mb-3">Budget maintenance 2026</p>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Initial</p>
                <p className="font-black text-slate-700">{fmtEur(maintenanceBudget.montant_initial)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Consommé</p>
                <p className={`font-black ${maintenanceBudget.montant_consomme > maintenanceBudget.montant_initial ? 'text-red-600' : 'text-slate-700'}`}>
                  {fmtEur(maintenanceBudget.montant_consomme)}
                </p>
              </div>
            </div>
            <BudgetBar
              consomme={maintenanceBudget.montant_consomme}
              initial={maintenanceBudget.montant_initial}
              engage={maintenanceBudget.montant_engage}
            />
          </div>
        )}

        {/* Répartition responsable */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">Répartition des responsabilités</p>
          {[
            { label: 'Propriétaire', color: '#2563eb' },
            { label: 'Gestionnaire', color: '#10b981' },
            { label: 'Partagé', color: '#f59e0b' },
          ].map(({ label, color }) => {
            const cnt = charges.filter(c => c.responsable === label).length;
            const pct = charges.length > 0 ? Math.round((cnt / charges.length) * 100) : 0;
            return (
              <div key={label} className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-slate-600">{label}</span>
                  <span className="text-xs font-bold text-slate-700">{cnt} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Statuts */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">État des charges</p>
          <div className="space-y-1.5">
            {Object.entries(STATUT_CHARGE_CFG).map(([k, c]) => {
              const cnt = charges.filter(ch => ch.statut === k).length;
              if (cnt === 0) return null;
              return (
                <div key={k} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  <span className="text-xs text-slate-600 flex-1">{c.label}</span>
                  <span className="text-xs font-bold text-slate-700">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charges table */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-black text-slate-600">Charges associées à ce bâtiment</p>
          {totalReel > 0 && (
            <span className="text-xs text-slate-500">Réel total : <span className="font-bold text-slate-700">{fmtEur(totalReel)}</span></span>
          )}
        </div>
        {charges.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-slate-400 text-xs">
            Aucune charge déclarée pour ce bâtiment
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-2 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Référence</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Nature</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsable</th>
                <th className="text-right py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Coût estimé</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Statut</th>
              </tr>
            </thead>
            <tbody>
              {charges.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-4 font-mono font-bold text-slate-600">{c.reference}</td>
                  <td className="py-2 px-3">
                    <p className="font-semibold text-slate-700 leading-tight">{c.type_charge}</p>
                    <p className="text-[10px] text-slate-400">{c.type_intervention}</p>
                  </td>
                  <td className="py-2 px-3"><ResponsableChip responsable={c.responsable} /></td>
                  <td className="py-2 px-3 text-right font-bold text-slate-700">{fmtEur(c.cout_estime)}</td>
                  <td className="py-2 px-3 text-slate-500">{fmtDate(c.date_declaration)}</td>
                  <td className="py-2 px-3"><StatutChargeChip statut={c.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
