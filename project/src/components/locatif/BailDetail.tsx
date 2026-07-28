import { useState, useRef } from 'react';
import {
  X, User, Calendar, Euro, FileText, Send, Home, Pencil, RefreshCw,
  FileDown, Phone, Mail, Ban, CheckCircle2, Circle, Clock, AlertCircle,
  Printer, ChevronLeft, PenLine,
} from 'lucide-react';
import type { Bail } from './locatifTypes';
import { STATUT_BAIL_CFG, TYPE_BAIL_CFG } from './locatifTypes';
import { format, parseISO, differenceInDays, addYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

// ─── Logo ─────────────────────────────────────────────────────────────────────
const LOGO_SRC = '/images/site/Ecole-Angele-Vannier/Logo-Ville-Saint-Malo.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => d ? format(parseISO(d), 'dd MMMM yyyy', { locale: fr }) : '—';
const fmtDateShort = (d?: string) => d ? format(parseISO(d), 'dd/MM/yyyy') : '—';
const fmtCurrency = (n?: number) => n !== undefined ? n.toLocaleString('fr-FR') + ' €' : '—';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  bail: Bail | null;
  mode: 'view' | 'create' | 'edit';
  onClose: () => void;
  onSaved?: (bail: Bail) => void;
  onNavigateToLogement?: (logementId: string) => void;
  onNavigateToEDL?: (bailId: string) => void;
}

// ─── Composants document ──────────────────────────────────────────────────────
function DocSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-4 pb-2 border-b-2 border-[#00538C]">
        <span className="text-[#00538C] font-bold text-sm tracking-widest">{number}.</span>
        <h2 className="text-[#00538C] font-bold text-sm uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function DocSubSection({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-[#00538C] font-semibold text-xs mb-2">{letter}. {title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DocField({ label, value, editing, name, type = 'text', options, readOnly }: {
  label: string; value?: string | number; editing: boolean; name?: string;
  type?: string; options?: { value: string; label: string }[]; readOnly?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100">
      <span className="text-slate-500 text-xs min-w-0 flex-shrink-0 w-64 pt-1.5">— {label} :</span>
      {editing && !readOnly ? (
        options ? (
          <select name={name} defaultValue={String(value ?? '')}
            className="flex-1 text-sm text-slate-800 bg-blue-50/50 border border-blue-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input name={name} type={type} defaultValue={String(value ?? '')}
            className="flex-1 text-sm text-slate-800 bg-blue-50/50 border border-blue-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400" />
        )
      ) : (
        <span className="flex-1 text-sm font-medium text-slate-800 pt-0.5">{value !== undefined && value !== '' ? String(value) : <span className="text-slate-300 italic text-xs">—</span>}</span>
      )}
    </div>
  );
}

function DocCheckbox({ label, checked, editing }: { label: string; checked?: boolean; editing: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 mr-6 cursor-pointer">
      <input type="checkbox" defaultChecked={checked} disabled={!editing}
        className="w-3.5 h-3.5 rounded border-slate-300 text-[#00538C] focus:ring-[#00538C]/30 disabled:opacity-70" />
      <span className="text-xs text-slate-600 italic">{label}</span>
    </label>
  );
}

// ─── Modal réutilisable ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Sidebar actions ──────────────────────────────────────────────────────────
function SidebarActions({ bail, editing, onEdit, onPrint, onRenew, onSendSignature, onOpenLogement, onCreateEDL, onEmail, onCall, onResilier }: {
  bail: Bail; editing: boolean; onEdit: () => void; onPrint: () => void;
  onRenew: () => void; onSendSignature: () => void; onOpenLogement: () => void;
  onCreateEDL: () => void; onEmail: () => void; onCall: () => void; onResilier: () => void;
}) {
  const sc = STATUT_BAIL_CFG[bail.statut];
  const tc = TYPE_BAIL_CFG[bail.type_bail];
  const today = new Date();
  const dateFin = bail.date_fin ? parseISO(bail.date_fin) : null;
  const daysLeft = dateFin ? differenceInDays(dateFin, today) : null;

  return (
    <div className="w-64 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">
      {/* Header sidebar */}
      <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <p className="text-[10px] font-mono text-slate-400 mb-1">{bail.reference}</p>
        <p className="text-sm font-bold text-slate-800 mb-2">{bail.locataire_nom ?? 'Sans locataire'}</p>
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${tc.bg} ${tc.color}`}>
            {tc.label}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* KPIs */}
        <div className="px-4 py-3 border-b border-slate-50 space-y-2">
          {[
            { label: 'Loyer mensuel', value: fmtCurrency(bail.loyer_mensuel) },
            { label: 'Charges', value: fmtCurrency(bail.charges) },
            { label: 'Quittance totale', value: fmtCurrency(bail.loyer_mensuel + bail.charges), bold: true },
            { label: 'APL estimé', value: fmtCurrency(bail.apl) },
            { label: 'Dépôt garantie', value: fmtCurrency(bail.depot_garantie) },
          ].map(({ label, value, bold }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{label}</span>
              <span className={`text-xs ${bold ? 'font-bold text-[#00538C]' : 'font-semibold text-slate-800'}`}>{value}</span>
            </div>
          ))}
          {daysLeft !== null && daysLeft >= 0 && (
            <div className={`mt-2 p-2 rounded-lg text-center text-[11px] font-semibold ${
              daysLeft <= 30 ? 'bg-red-50 text-red-700 border border-red-100' :
              daysLeft <= 90 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
              'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              {daysLeft <= 0 ? 'Bail expiré' : `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="px-4 py-3 border-b border-slate-50 space-y-2">
          {[
            { label: 'Début', value: fmtDateShort(bail.date_debut) },
            { label: 'Fin', value: fmtDateShort(bail.date_fin) },
            { label: 'Gestionnaire', value: bail.gestionnaire ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{label}</span>
              <span className="text-xs font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Actions</p>
          <div className="space-y-0.5">
            {[
              { icon: Pencil,    label: 'Modifier le bail',         action: onEdit,          primary: true  },
              { icon: RefreshCw, label: 'Renouveler',               action: onRenew                         },
              { icon: Printer,   label: 'Imprimer / Générer PDF',   action: onPrint                         },
              { icon: Send,      label: 'Envoyer pour signature',   action: onSendSignature                  },
              { icon: Home,      label: 'Fiche logement',           action: onOpenLogement                   },
              { icon: PenLine,   label: 'Créer un état des lieux',  action: onCreateEDL                      },
              { icon: Mail,      label: 'Contacter par email',      action: onEmail                          },
              { icon: Phone,     label: 'Appeler le locataire',     action: onCall                           },
              { icon: Ban,       label: 'Résilier le bail',         action: onResilier,      danger: true    },
            ].map(({ icon: Icon, label, action, primary, danger }) => (
              <button
                key={label}
                onClick={action}
                disabled={editing && label !== 'Modifier le bail'}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                  primary ? 'bg-[#00538C] text-white hover:bg-[#004070]' :
                  danger  ? 'text-red-600 hover:bg-red-50' :
                            'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal renouvellement ──────────────────────────────────────────────────────
function RenewModal({ bail, onClose, onConfirm }: { bail: Bail; onClose: () => void; onConfirm: (newDateFin: string, newLoyer: number) => void }) {
  const defaultDateFin = bail.date_fin ? format(addYears(parseISO(bail.date_fin), 1), 'yyyy-MM-dd') : '';
  const [dateFin, setDateFin] = useState(defaultDateFin);
  const [loyer, setLoyer] = useState(bail.loyer_mensuel);

  return (
    <Modal title="Renouveler le bail" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">Le bail sera renouvelé avec une nouvelle date de fin et un loyer révisé.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nouvelle date de fin</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nouveau loyer mensuel (€)</label>
            <input type="number" value={loyer} onChange={e => setLoyer(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <strong>Révision IRL estimée :</strong> +1,8% · Loyer suggéré : {Math.round(bail.loyer_mensuel * 1.018).toLocaleString('fr-FR')} €
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Annuler</button>
          <button onClick={() => onConfirm(dateFin, loyer)}
            className="px-4 py-2 text-sm bg-[#00538C] hover:bg-[#004070] text-white rounded-lg font-medium">
            Confirmer le renouvellement
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal résiliation ─────────────────────────────────────────────────────────
function ResilierModal({ bail, onClose, onConfirm }: { bail: Bail; onClose: () => void; onConfirm: (motif: string, date: string) => void }) {
  const [motif, setMotif] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <Modal title="Résilier le bail" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">Cette action est irréversible. Le bail passera au statut <strong>Résilié</strong>.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Date de résiliation</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Motif de résiliation</label>
          <select value={motif} onChange={e => setMotif(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400">
            <option value="">Sélectionner un motif...</option>
            <option value="fin_contrat">Fin de contrat</option>
            <option value="conge_locataire">Congé donné par le locataire</option>
            <option value="conge_bailleur">Congé donné par le bailleur</option>
            <option value="impayés">Impayés</option>
            <option value="accord_mutuel">Accord mutuel</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Annuler</button>
          <button
            onClick={() => motif && onConfirm(motif, date)}
            disabled={!motif}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium">
            Confirmer la résiliation
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal signature ───────────────────────────────────────────────────────────
function SignatureModal({ bail, onClose }: { bail: Bail; onClose: () => void }) {
  const [sent, setSent] = useState(false);

  return (
    <Modal title="Envoyer pour signature électronique" onClose={onClose}>
      {sent ? (
        <div className="text-center py-6 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">Invitation envoyée avec succès</p>
          <p className="text-xs text-slate-500">Le locataire recevra un email avec le lien de signature.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 text-sm bg-[#00538C] text-white rounded-lg font-medium">Fermer</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Les signataires suivants recevront un email d'invitation à signer ce bail électroniquement.</p>
          <div className="space-y-2">
            {[
              { role: 'Bailleur', nom: bail.gestionnaire ?? 'Gestionnaire', email: 'gestionnaire@ville-saintmalo.fr', status: 'signe' },
              { role: 'Locataire', nom: bail.locataire_nom ?? 'Locataire', email: 'locataire@email.fr', status: 'en_attente' },
            ].map(({ role, nom, email, status }) => (
              <div key={role} className="flex items-center gap-3 p-2.5 border border-slate-100 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{nom}</p>
                  <p className="text-[10px] text-slate-400">{role} · {email}</p>
                </div>
                {status === 'signe' ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><CheckCircle2 className="w-3 h-3" />Signé</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600"><Clock className="w-3 h-3" />En attente</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Annuler</button>
            <button onClick={() => setSent(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#00538C] hover:bg-[#004070] text-white rounded-lg font-medium">
              <Send className="w-3.5 h-3.5" />Envoyer les invitations
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Document principal (vue + édition) ───────────────────────────────────────
export default function BailDetail({ bail, mode, onClose, onSaved, onNavigateToLogement, onNavigateToEDL }: Props) {
  const [editing, setEditing]         = useState(mode !== 'view');
  const [saving, setSaving]           = useState(false);
  const [modal, setModal]             = useState<'renew' | 'resilier' | 'signature' | null>(null);
  const formRef                       = useRef<HTMLFormElement>(null);
  const printRef                      = useRef<HTMLDivElement>(null);

  const isCreate = mode === 'create';

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const updates: Partial<Bail> = {
      statut:             fd.get('statut') as Bail['statut'],
      type_bail:          fd.get('type_bail') as Bail['type_bail'],
      gestionnaire:       fd.get('gestionnaire') as string,
      locataire_nom:      fd.get('locataire_nom') as string,
      loyer_mensuel:      Number(fd.get('loyer_mensuel')),
      charges:            Number(fd.get('charges')),
      apl:                Number(fd.get('apl')),
      depot_garantie:     Number(fd.get('depot_garantie')),
      date_debut:         fd.get('date_debut') as string || undefined,
      date_fin:           fd.get('date_fin') as string || undefined,
      preavis_mois:       Number(fd.get('preavis_mois')),
      commentaires:       fd.get('commentaires') as string,
      conditions_particulieres: fd.get('conditions_particulieres') as string,
    };

    setSaving(true);
    if (isCreate) {
      const ref = 'BAIL-' + format(new Date(), 'yyyy') + '-' + String(Date.now()).slice(-4);
      const { data, error } = await supabase.from('baux').insert([{ ...updates, reference: ref }]).select().maybeSingle();
      if (!error && data && onSaved) onSaved(data as Bail);
    } else if (bail) {
      const { data, error } = await supabase.from('baux').update(updates).eq('id', bail.id).select().maybeSingle();
      if (!error && data) { setEditing(false); if (onSaved) onSaved(data as Bail); }
    }
    setSaving(false);
  }

  async function handleRenew(newDateFin: string, newLoyer: number) {
    if (!bail) return;
    await supabase.from('baux').update({ date_fin: newDateFin, loyer_mensuel: newLoyer, statut: 'actif' }).eq('id', bail.id);
    setModal(null);
    if (onSaved) onSaved({ ...bail, date_fin: newDateFin, loyer_mensuel: newLoyer, statut: 'actif' });
  }

  async function handleResilier(motif: string, date: string) {
    if (!bail) return;
    await supabase.from('baux').update({ statut: 'resilie', date_fin: date, notes_internes: `Résiliation : ${motif}` }).eq('id', bail.id);
    setModal(null);
    if (onSaved) onSaved({ ...bail, statut: 'resilie' });
    onClose();
  }

  function handlePrint() {
    window.print();
  }

  function handleEmail() {
    const email = 'locataire@email.fr';
    const subject = encodeURIComponent(`Bail ${bail?.reference ?? ''} - Ville de Saint-Malo`);
    const body = encodeURIComponent(`Bonjour ${bail?.locataire_nom ?? ''},\n\nConcernant votre bail ${bail?.reference ?? ''}.\n\nCordialement,\nVille de Saint-Malo`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  }

  function handleCall() {
    window.open(`tel:`);
  }

  function handleOpenLogement() {
    if (bail?.logement_id && onNavigateToLogement) onNavigateToLogement(bail.logement_id);
  }

  function handleCreateEDL() {
    if (bail?.id && onNavigateToEDL) onNavigateToEDL(bail.id);
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #bail-print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex h-full overflow-hidden bg-slate-100">
        {/* Zone document */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Barre navigation */}
          <div className="no-print flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-100 sticky top-0 z-20">
            <button onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Retour aux baux
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs text-slate-400">
              {isCreate ? 'Nouveau bail' : editing ? 'Modification' : 'Consultation'} · {bail?.reference ?? 'Brouillon'}
            </span>
            <div className="flex-1" />
            {!isCreate && !editing && (
              <>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  <Printer className="w-3.5 h-3.5" />Imprimer
                </button>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00538C] hover:bg-[#004070] text-white text-xs font-medium rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" />Modifier
                </button>
              </>
            )}
            {editing && (
              <>
                <button onClick={() => isCreate ? onClose() : setEditing(false)}
                  className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00538C] hover:bg-[#004070] disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors">
                  {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {isCreate ? 'Créer le bail' : 'Enregistrer'}
                </button>
              </>
            )}
          </div>

          {/* Document */}
          <div id="bail-print-area" className="max-w-3xl mx-auto my-6 px-4" ref={printRef}>
            <form ref={formRef}>
              <div className="bg-white shadow-md rounded-2xl overflow-hidden">
                {/* En-tête document */}
                <div className="bg-gradient-to-r from-[#00538C] to-[#0072bc] px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-[10px] font-medium uppercase tracking-widest mb-1">Loi n°89-462 du 6 juillet 1989</p>
                      <h1 className="text-white text-xl font-bold tracking-wide">CONTRAT DE LOCATION</h1>
                      <p className="text-white/90 text-sm font-medium mt-0.5">Logement non meublé</p>
                    </div>
                    <img src={LOGO_SRC} alt="Ville de Saint-Malo" className="h-14 object-contain brightness-0 invert" />
                  </div>
                  {bail && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="bg-white/15 text-white text-xs font-mono px-3 py-1 rounded-full">{bail.reference}</span>
                      {(() => {
                        const sc = STATUT_BAIL_CFG[bail.statut];
                        return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white ${sc.text}`}>{sc.label}</span>;
                      })()}
                    </div>
                  )}
                </div>

                {/* Corps du document */}
                <div className="px-8 py-7">

                  {/* I. DÉSIGNATION DES PARTIES */}
                  <DocSection number="I" title="Désignation des parties">
                    <p className="text-xs text-slate-500 italic mb-3">Le présent contrat est conclu entre les soussignés :</p>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 bg-slate-50 px-3 py-1.5 rounded-lg">Le Bailleur</p>
                      <DocField label="Nom et dénomination du bailleur" value="Ville de Saint-Malo" editing={false} />
                      <DocField label="Domicile ou siège social" value="Hôtel de Ville, 35400 Saint-Malo" editing={false} />
                      <DocField label="Qualité" value="Personne morale (Collectivité territoriale)" editing={false} />
                      <DocField label="Gestionnaire responsable" value={bail?.gestionnaire} editing={editing} name="gestionnaire"
                        options={[
                          { value: '', label: 'Sélectionner...' },
                          { value: 'Martin D.', label: 'Martin D.' },
                          { value: 'Leroy P.', label: 'Leroy P.' },
                          { value: 'Moreau F.', label: 'Moreau F.' },
                          { value: 'Simon B.', label: 'Simon B.' },
                        ]} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 bg-slate-50 px-3 py-1.5 rounded-lg">Le Locataire</p>
                      <DocField label="Nom et prénom" value={bail?.locataire_nom} editing={editing} name="locataire_nom" />
                      <DocField label="Adresse email" value="" editing={editing} name="locataire_email" type="email" />
                      <DocField label="Téléphone" value="" editing={editing} name="locataire_tel" type="tel" />
                    </div>
                  </DocSection>

                  {/* II. OBJET DU CONTRAT */}
                  <DocSection number="II" title="Objet du contrat">
                    <p className="text-xs text-slate-500 italic mb-3">Le présent contrat a pour objet la location d'un logement ainsi déterminé :</p>

                    <DocSubSection letter="A" title="Consistance du logement">
                      <DocField label="Adresse du logement" value="" editing={editing} name="adresse_logement" />
                      <DocField label="Bâtiment / escalier / étage / porte" value="" editing={editing} name="batiment_etage" />
                      <DocField label="Surface habitable (m²)" value="" editing={editing} name="surface" type="number" />
                      <DocField label="Nombre de pièces principales" value="" editing={editing} name="nb_pieces" type="number" />
                      <div className="py-2">
                        <span className="text-xs text-slate-500">— Période de construction : </span>
                        <div className="inline-flex flex-wrap gap-x-4 gap-y-1 mt-1 ml-4">
                          {['Avant 1949', 'De 1949 à 1974', 'De 1975 à 1989', 'De 1989 à 2005', 'Depuis 2005'].map(p => (
                            <DocCheckbox key={p} label={p} editing={editing} />
                          ))}
                        </div>
                      </div>
                    </DocSubSection>

                    <DocSubSection letter="B" title="Destination des locaux">
                      <div className="flex gap-6">
                        <DocCheckbox label="Usage d'habitation" checked editing={editing} />
                        <DocCheckbox label="Usage mixte professionnel et d'habitation" editing={editing} />
                      </div>
                    </DocSubSection>

                    <DocSubSection letter="C" title="Type de bail">
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 min-w-[200px]">— Catégorie :</span>
                          <select name="type_bail" defaultValue={bail?.type_bail ?? 'location'}
                            className="text-sm text-slate-800 bg-blue-50/50 border border-blue-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30">
                            <option value="location">Location (non meublé)</option>
                            <option value="convention">Convention d'occupation précaire</option>
                            <option value="temporaire">Bail mobilité / temporaire</option>
                            <option value="commercial">Commercial</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                      ) : (
                        <DocField label="Catégorie" value={bail ? TYPE_BAIL_CFG[bail.type_bail].label : ''} editing={false} />
                      )}
                      {editing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 min-w-[200px]">— Statut :</span>
                          <select name="statut" defaultValue={bail?.statut ?? 'en_preparation'}
                            className="text-sm text-slate-800 bg-blue-50/50 border border-blue-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30">
                            <option value="en_preparation">En préparation</option>
                            <option value="en_signature">En signature</option>
                            <option value="actif">Actif</option>
                            <option value="expire_bientot">Expire bientôt</option>
                            <option value="expire">Expiré</option>
                            <option value="resilie">Résilié</option>
                          </select>
                        </div>
                      ) : (
                        <DocField label="Statut" value={bail ? STATUT_BAIL_CFG[bail.statut].label : ''} editing={false} />
                      )}
                    </DocSubSection>
                  </DocSection>

                  {/* III. DATE DE PRISE D'EFFET ET DURÉE */}
                  <DocSection number="III" title="Date de prise d'effet et durée du contrat">
                    <DocSubSection letter="A" title="Prise d'effet du contrat">
                      <DocField label="Date de prise d'effet" value={bail?.date_debut} editing={editing} name="date_debut" type="date" />
                    </DocSubSection>

                    <DocSubSection letter="B" title="Durée du contrat">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3">
                        <DocCheckbox label="3 ans (personne physique)" editing={editing} />
                        <DocCheckbox label="6 ans (personne morale)" checked editing={editing} />
                      </div>
                      <DocField label="Date de fin" value={bail?.date_fin} editing={editing} name="date_fin" type="date" />
                      <DocField label="Préavis (mois)" value={bail?.preavis_mois ?? 1} editing={editing} name="preavis_mois" type="number" />
                    </DocSubSection>

                    <DocSubSection letter="C" title="Reconduction">
                      <div className="flex gap-6">
                        <DocCheckbox label="Tacite reconduction" checked={bail?.tacite_reconduction} editing={editing} />
                      </div>
                      <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                        En l'absence de proposition de renouvellement, le contrat est reconduit tacitement aux mêmes conditions.
                        Le locataire peut y mettre fin à tout moment après avoir donné congé.
                      </p>
                    </DocSubSection>
                  </DocSection>

                  {/* IV. CONDITIONS FINANCIÈRES */}
                  <DocSection number="IV" title="Conditions financières">
                    <DocSubSection letter="A" title="Loyer">
                      <DocField label="Montant du loyer mensuel (€)" value={bail?.loyer_mensuel} editing={editing} name="loyer_mensuel" type="number" />
                      <DocField label="Périodicité" value={bail?.periodicite ?? 'Mensuel'} editing={editing} name="periodicite"
                        options={[
                          { value: 'mensuel', label: 'Mensuel' },
                          { value: 'trimestriel', label: 'Trimestriel' },
                          { value: 'annuel', label: 'Annuel' },
                        ]} />
                      <DocField label="Indexation" value={bail?.indexation ?? 'IRL'} editing={editing} name="indexation"
                        options={[
                          { value: 'irl', label: 'IRL (Indice de Référence des Loyers)' },
                          { value: 'ilc', label: 'ILC' },
                          { value: 'aucune', label: 'Aucune indexation' },
                        ]} />
                    </DocSubSection>

                    <DocSubSection letter="B" title="Charges récupérables">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2">
                        <DocCheckbox label="Provisions sur charges avec régularisation annuelle" checked editing={editing} />
                        <DocCheckbox label="Forfait de charges" editing={editing} />
                      </div>
                      <DocField label="Montant des charges (€)" value={bail?.charges} editing={editing} name="charges" type="number" />
                    </DocSubSection>

                    <DocSubSection letter="C" title="Aide au logement">
                      <DocField label="APL estimé (€/mois)" value={bail?.apl} editing={editing} name="apl" type="number" />
                    </DocSubSection>

                    <DocSubSection letter="D" title="Récapitulatif mensuel">
                      <div className="mt-2 grid grid-cols-2 gap-3 p-4 bg-[#f0f6fb] rounded-xl border border-[#c8dff0]">
                        {[
                          { label: 'Loyer mensuel', value: fmtCurrency(bail?.loyer_mensuel), sm: true },
                          { label: 'Charges', value: fmtCurrency(bail?.charges), sm: true },
                          { label: 'APL estimé', value: `- ${fmtCurrency(bail?.apl)}`, sm: true },
                        ].map(({ label, value, sm }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-xs text-[#00538C]">{label}</span>
                            <span className={`text-xs font-semibold text-[#00538C] ${sm ? '' : 'text-base'}`}>{value}</span>
                          </div>
                        ))}
                        <div className="col-span-2 border-t border-[#c8dff0] pt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#00538C]">Quittance mensuelle totale</span>
                          <span className="text-base font-bold text-[#00538C]">{bail ? fmtCurrency(bail.loyer_mensuel + bail.charges) : '—'}</span>
                        </div>
                        {bail && bail.apl > 0 && (
                          <div className="col-span-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Reste à charge (après APL)</span>
                            <span className="text-sm font-bold text-emerald-700">{fmtCurrency(bail.loyer_mensuel + bail.charges - bail.apl)}</span>
                          </div>
                        )}
                      </div>
                    </DocSubSection>
                  </DocSection>

                  {/* V. GARANTIES */}
                  <DocSection number="V" title="Garanties">
                    <DocField label="Dépôt de garantie (€)" value={bail?.depot_garantie} editing={editing} name="depot_garantie" type="number" />
                    <p className="text-xs text-slate-400 italic mt-2">
                      * Ce montant doit être inférieur ou égal à un mois de loyer hors charges.
                    </p>
                  </DocSection>

                  {/* VI. CLAUSES */}
                  <DocSection number="VI" title="Clauses légales">
                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="font-semibold text-slate-700 mb-1">Clause de solidarité</p>
                        <p>Pour l'exécution de toutes les obligations du présent contrat en cas de pluralité de locataires, il y aura solidarité et indivisibilité entre eux.</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="font-semibold text-slate-700 mb-1">Clause résolutoire</p>
                        <p className="mb-2">Le présent contrat sera résilié de plein droit :</p>
                        <ul className="space-y-1 ml-3">
                          {[
                            'En cas de défaut de paiement du loyer, des provisions de charge, ou de la régularisation annuelle',
                            'En cas de défaut de versement du dépôt de garantie',
                            "En cas de défaut d'assurance des risques locatifs par le locataire",
                            'En cas de trouble de voisinage constaté par une décision de justice',
                          ].map(item => (
                            <li key={item} className="flex items-start gap-1.5">
                              <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </DocSection>

                  {/* VII. CONDITIONS PARTICULIÈRES */}
                  <DocSection number="VII" title="Conditions particulières et observations">
                    <div className="space-y-3">
                      {editing ? (
                        <>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">— Conditions particulières :</p>
                            <textarea name="conditions_particulieres" defaultValue={bail?.conditions_particulieres ?? ''} rows={3}
                              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">— Commentaires :</p>
                            <textarea name="commentaires" defaultValue={bail?.commentaires ?? ''} rows={3}
                              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="min-h-16 border-b border-slate-100 py-2">
                            {bail?.conditions_particulieres ? (
                              <p className="text-sm text-slate-700 leading-relaxed">{bail.conditions_particulieres}</p>
                            ) : (
                              <p className="text-xs text-slate-300 italic">Aucune condition particulière</p>
                            )}
                          </div>
                          {bail?.commentaires && (
                            <p className="text-sm text-slate-600 italic">{bail.commentaires}</p>
                          )}
                        </>
                      )}
                    </div>
                  </DocSection>

                  {/* VIII. ANNEXES */}
                  <DocSection number="VIII" title="Annexes">
                    <p className="text-xs text-slate-500 italic mb-3">Sont annexées et jointes au contrat de location les pièces suivantes :</p>
                    <div className="space-y-2">
                      {[
                        "Un dossier de diagnostic technique (DPE, plomb, amiante, électricité, gaz)",
                        "Une notice d'information relative aux droits et obligations des locataires et des bailleurs",
                        "Un état des lieux établi lors de la remise des clés",
                        "Le cas échéant, une autorisation préalable de mise en location",
                      ].map(item => (
                        <div key={item} className="flex items-start gap-2">
                          <DocCheckbox label={item} editing={editing} />
                        </div>
                      ))}
                    </div>
                  </DocSection>

                  {/* IX. SIGNATURES */}
                  {!isCreate && (
                    <DocSection number="IX" title="Signatures">
                      <p className="text-xs text-slate-500 italic mb-4">
                        Fait à Saint-Malo, le {bail?.created_at ? fmtDate(bail.created_at) : '________'}
                      </p>
                      <div className="grid grid-cols-2 gap-8 mt-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-1">Signature du bailleur</p>
                          <p className="text-[10px] text-slate-400 italic mb-4">(ou de son mandataire)<br/>Précédée de la mention « Lu et approuvé »</p>
                          <div className="h-16 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                            {bail?.statut === 'actif' ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                <CheckCircle2 className="w-4 h-4" />Signé le {fmtDateShort(bail.date_debut)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                                <Circle className="w-4 h-4" />En attente
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-1">Signature du locataire</p>
                          <p className="text-[10px] text-slate-400 italic mb-4">Précédée de la mention « Lu et approuvé »</p>
                          <div className="h-16 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                            {bail?.statut === 'actif' ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                <CheckCircle2 className="w-4 h-4" />Signé le {fmtDateShort(bail.date_debut)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                                <Circle className="w-4 h-4" />En attente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 mt-6 italic">
                        Exemplaires originaux dont un remis à chaque signataire.
                      </p>
                    </DocSection>
                  )}

                  {/* Pied de page document */}
                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={LOGO_SRC} alt="Ville de Saint-Malo" className="h-8 object-contain opacity-40" />
                    </div>
                    <p className="text-[10px] text-slate-300 text-right">
                      {bail?.reference ?? 'BROUILLON'} · Généré le {format(new Date(), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar (masquée en création) */}
        {bail && !isCreate && (
          <SidebarActions
            bail={bail}
            editing={editing}
            onEdit={() => setEditing(true)}
            onPrint={handlePrint}
            onRenew={() => setModal('renew')}
            onSendSignature={() => setModal('signature')}
            onOpenLogement={handleOpenLogement}
            onCreateEDL={handleCreateEDL}
            onEmail={handleEmail}
            onCall={handleCall}
            onResilier={() => setModal('resilier')}
          />
        )}
      </div>

      {/* Modals */}
      {modal === 'renew' && bail && (
        <RenewModal bail={bail} onClose={() => setModal(null)} onConfirm={handleRenew} />
      )}
      {modal === 'resilier' && bail && (
        <ResilierModal bail={bail} onClose={() => setModal(null)} onConfirm={handleResilier} />
      )}
      {modal === 'signature' && bail && (
        <SignatureModal bail={bail} onClose={() => setModal(null)} />
      )}
    </>
  );
}
