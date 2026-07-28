import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X, Wrench, MapPin, Calendar, FileText, History, ShieldCheck,
  AlertTriangle, Download, QrCode, ExternalLink,
} from 'lucide-react';
import type { EquipementSecurite } from './registreTypes';

interface Props {
  equipement: EquipementSecurite;
  onClose: () => void;
}

export default function EquipementPanel({ equipement: eq, onClose }: Props) {
  const [tab, setTab] = useState<'caracteristiques' | 'controles' | 'historique' | 'documents'>('caracteristiques');

  const qrValue = `EQUIP:${eq.id}|${eq.designation}|${eq.localisation}`;
  const isConforme = eq.statut === 'conforme' || eq.statut === 'Conforme';

  const statutCfg: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    conforme: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Conforme' },
    non_conforme: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Non conforme' },
    en_retard: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'En retard' },
    a_venir: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'À venir' },
  };
  const cfg = statutCfg[eq.statut] ?? statutCfg.a_venir;

  const TABS = [
    { id: 'caracteristiques' as const, label: 'Caractéristiques', icon: Wrench },
    { id: 'controles' as const, label: 'Contrôles', icon: ShieldCheck },
    { id: 'historique' as const, label: 'Historique', icon: History },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{eq.designation}</h3>
            <p className="text-[11px] text-slate-400 truncate">{eq.categorie} · {eq.localisation}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Status + QR */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-lg p-1.5">
            <QRCodeSVG value={qrValue} size={48} level="M" />
          </div>
          <button
            onClick={() => {
              const svg = document.getElementById('eq-qr-svg');
              if (svg) {
                const data = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([data], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `qr-${eq.designation}.svg`; a.click();
                URL.revokeObjectURL(url);
              }
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Télécharger le QR code"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
      <div id="eq-qr-svg" className="hidden">
        <QRCodeSVG value={qrValue} size={200} level="M" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-100 flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
              tab === id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'caracteristiques' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-100 divide-y divide-slate-50">
              <Row label="Désignation" value={eq.designation} />
              <Row label="Catégorie" value={eq.categorie} />
              <Row label="Localisation" value={eq.localisation} icon={MapPin} />
              <Row label="Organisme de contrôle" value={eq.organisme ?? '—'} />
              <Row label="N° de série" value="SN-à-compléter" />
              <Row label="Mise en service" value="—" icon={Calendar} />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
                <Wrench className="w-3.5 h-3.5" /> Créer une intervention
              </button>
              <button className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                <QrCode className="w-3.5 h-3.5" /> Imprimer QR
              </button>
            </div>
          </div>
        )}

        {tab === 'controles' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-100 divide-y divide-slate-50">
              <Row label="Dernier contrôle" value={eq.date_dernier_controle ? new Date(eq.date_dernier_controle).toLocaleDateString('fr-FR') : '—'} icon={Calendar} />
              <Row label="Prochain contrôle" value={eq.date_prochain_controle ? new Date(eq.date_prochain_controle).toLocaleDateString('fr-FR') : '—'} icon={Calendar} />
              <Row label="Statut" value={cfg.label} />
              <Row label="Organisme" value={eq.organisme ?? '—'} />
            </div>
            {eq.date_prochain_controle && new Date(eq.date_prochain_controle) < new Date() && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">Échéance de contrôle dépassée</p>
              </div>
            )}
          </div>
        )}

        {tab === 'historique' && (
          <div className="space-y-2">
            {[
              { date: eq.date_dernier_controle, label: 'Dernier contrôle', desc: eq.organisme ?? 'Organisme non précisé', type: 'controle' },
            ].filter(h => h.date).map((h, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{h.label}</p>
                  <p className="text-[10px] text-slate-400">{h.desc} · {h.date ? new Date(h.date).toLocaleDateString('fr-FR') : ''}</p>
                </div>
              </div>
            ))}
            {(!eq.date_dernier_controle) && (
              <p className="text-xs text-slate-400 italic text-center py-6">Aucun historique disponible</p>
            )}
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 italic text-center py-6">
              Les documents liés (rapports de contrôle, PV, notices) apparaîtront ici quand ils seront disponibles dans la GED.
            </p>
            <button className="w-full flex items-center justify-center gap-1.5 text-xs px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Voir dans la GED
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-slate-300 flex-shrink-0" />}
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xs text-slate-700 font-medium text-right">{value}</p>
    </div>
  );
}
