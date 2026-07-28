import { useEffect, useState } from 'react';
import { Euro, AlertTriangle, FileText, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Charge, Facture, Annexe4Regle } from './financeTypes';
import { fmtEur, fmtDate, STATUT_CHARGE_CFG } from './financeTypes';
import { StatutChargeChip, ResponsableChip, StatutFactureChip } from './FinanceShared';

interface Props {
  equipement_id: string;
}

export default function OngletFinanceEquipement({ equipement_id }: Props) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [regles, setRegles] = useState<Annexe4Regle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: ch } = await supabase
        .from('charges')
        .select('*')
        .eq('equipement_id', equipement_id)
        .order('date_declaration', { ascending: false });

      const chargeList = (ch ?? []) as Charge[];
      setCharges(chargeList);

      if (chargeList.length > 0) {
        const chargeIds = chargeList.map(c => c.id);
        const { data: fac } = await supabase
          .from('factures')
          .select('*')
          .in('charge_id', chargeIds)
          .order('date_emission', { ascending: false });
        setFactures((fac ?? []) as Facture[]);

        // Load linked annexe4 rules
        const regleIds = chargeList.map(c => c.annexe4_regle_id).filter(Boolean) as string[];
        if (regleIds.length > 0) {
          const { data: reg } = await supabase
            .from('annexe4_regles')
            .select('*')
            .in('id', regleIds);
          setRegles(reg ?? []);
        }
      }

      setLoading(false);
    }
    load();
  }, [equipement_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
        <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full mr-2" />
        Chargement…
      </div>
    );
  }

  const totalEstime  = charges.reduce((s, c) => s + c.cout_estime, 0);
  const totalReel    = charges.reduce((s, c) => s + (c.cout_reel ?? 0), 0);
  const nbLitiges    = charges.filter(c => c.statut === 'litige').length;
  const nbImpaye     = factures.filter(f => f.statut === 'impaye').length;
  const montantTTC   = factures.reduce((s, f) => s + f.montant_ttc, 0);

  if (charges.length === 0 && regles.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-2 text-slate-400">
        <Euro className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">Aucune charge déclarée pour cet équipement</p>
        <p className="text-xs">Les charges seront affichées ici une fois saisies</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Charges', value: charges.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Coût estimé', value: fmtEur(totalEstime), icon: Euro, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Litiges', value: nbLitiges, icon: AlertTriangle, color: nbLitiges > 0 ? 'text-red-500' : 'text-slate-300', bg: nbLitiges > 0 ? 'bg-red-50' : 'bg-slate-50' },
          { label: 'Facturé TTC', value: fmtEur(montantTTC), icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={i} className={`rounded-xl border border-slate-100 ${bg} p-3 flex items-center gap-3`}>
            <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-black text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charges */}
      {charges.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-black text-slate-600">Charges déclarées</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-2 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Référence</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Nature</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsable</th>
                <th className="text-right py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estimé</th>
                {totalReel > 0 && <th className="text-right py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Réel</th>}
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
                  {totalReel > 0 && (
                    <td className="py-2 px-3 text-right text-slate-600">{c.cout_reel != null ? fmtEur(c.cout_reel) : '—'}</td>
                  )}
                  <td className="py-2 px-3 text-slate-500">{fmtDate(c.date_declaration)}</td>
                  <td className="py-2 px-3"><StatutChargeChip statut={c.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Factures */}
      {factures.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black text-slate-600">Factures liées</p>
            {nbImpaye > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                <AlertTriangle className="w-3 h-3" /> {nbImpaye} impayée{nbImpaye > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-2 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Référence</th>
                <th className="text-right py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Montant HT</th>
                <th className="text-right py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">TTC</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Émission</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Échéance</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Statut</th>
              </tr>
            </thead>
            <tbody>
              {factures.map(f => (
                <tr key={f.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${f.statut === 'impaye' ? 'bg-red-50/40' : ''}`}>
                  <td className="py-2 px-4 font-mono font-bold text-slate-600">{f.reference}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmtEur(f.montant_ht)}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-700">{fmtEur(f.montant_ttc)}</td>
                  <td className="py-2 px-3 text-slate-500">{fmtDate(f.date_emission)}</td>
                  <td className={`py-2 px-3 ${f.statut === 'impaye' ? 'font-bold text-red-600' : 'text-slate-500'}`}>{fmtDate(f.date_echeance)}</td>
                  <td className="py-2 px-3"><StatutFactureChip statut={f.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Annexe 4 rules */}
      {regles.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-xs font-black text-slate-600">Règles Annexe 4 associées</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-2 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Section</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Nature des ouvrages</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Type d'intervention</th>
                <th className="text-left py-2 px-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {regles.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-4 font-mono text-[10px] text-slate-400">{r.ref_section}{r.sous_ref ? ` · ${r.sous_ref}` : ''}</td>
                  <td className="py-2 px-3 font-medium text-slate-700">{r.nature_ouvrage}</td>
                  <td className="py-2 px-3 text-slate-600">{r.type_intervention}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold
                      ${r.responsable === 'Propriétaire' ? 'bg-blue-100 text-blue-700' : r.responsable === 'Gestionnaire' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.responsable}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
