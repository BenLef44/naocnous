import { STATUT_CHARGE_CFG, STATUT_FACTURE_CFG, RESPONSABLE_CFG } from './financeTypes';

export function StatutChargeChip({ statut }: { statut: string }) {
  const c = STATUT_CHARGE_CFG[statut] ?? STATUT_CHARGE_CFG.en_attente;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
      {c.label}
    </span>
  );
}

export function StatutFactureChip({ statut }: { statut: string }) {
  const c = STATUT_FACTURE_CFG[statut] ?? STATUT_FACTURE_CFG.non_facture;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export function ResponsableChip({ responsable }: { responsable: string }) {
  const c = RESPONSABLE_CFG[responsable];
  if (!c) return <span className="text-xs text-slate-500">{responsable}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${c.bg}`}
      style={{ color: c.color }}>
      {c.label}
    </span>
  );
}

export function SourceBadge({ source }: { source: string | null }) {
  if (!source) return null;
  const colors: Record<string, string> = {
    'BNS': '#2563eb', 'SI Logement': '#7c3aed', 'Epona': '#059669',
    'OPERAT/OSFI': '#0891b2', 'Manuel': '#64748b',
  };
  const color = colors[source] ?? '#64748b';
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border"
      style={{ color, borderColor: color, background: color + '15' }}>
      {source}
    </span>
  );
}

export function BudgetBar({ consomme, initial, engage }: { consomme: number; initial: number; engage?: number }) {
  const pctC = Math.min(100, initial > 0 ? (consomme / initial) * 100 : 0);
  const pctE = engage ? Math.min(100 - pctC, initial > 0 ? (engage / initial) * 100 : 0) : 0;
  const colorC = pctC >= 100 ? '#ef4444' : pctC >= 90 ? '#f59e0b' : '#10b981';
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-slate-500">Consommé</span>
        <span className="text-[10px] font-bold text-slate-600">{Math.round(pctC)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div className="h-full rounded-l-full transition-all" style={{ width: `${pctC}%`, background: colorC }} />
        {pctE > 0 && <div className="h-full transition-all" style={{ width: `${pctE}%`, background: '#f59e0b66' }} />}
      </div>
    </div>
  );
}
