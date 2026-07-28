import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import PdfViewer, { PdfViewerHandle } from './PdfViewer';
import AccordeonDtaForm, { DtaFormData } from './AccordeonDtaForm';
import { supabase } from '../../lib/supabase';

interface NouveauControleStep2Props {
  typeLabel: string;
  typeIcon: string;
  onClose: () => void;
  onSaved: () => void;
}

function makeDefaultData(): DtaFormData {
  const id1 = crypto.randomUUID();
  const id2 = crypto.randomUUID();
  const a1  = crypto.randomUUID();
  const a2  = crypto.randomUUID();
  return {
    controle: {
      periodicite: '',
      site: '',
      residence: '',
      organisme: '',
      date_controle: '',
      date_prochain_controle: '',
      statut: 'realise',
    },
    points: [
      { id: id1, libelle: '', conforme: true, criticite: 'Mineure' },
      { id: id2, libelle: '', conforme: true, criticite: 'Mineure' },
    ],
    actions: [
      { id: a1, libelle_type: '', assigne_categorie: '', assigne_nom: '', date_prevue: '' },
      { id: a2, libelle_type: '', assigne_categorie: '', assigne_nom: '', date_prevue: '' },
    ],
  };
}

export default function NouveauControleStep2({ typeLabel, typeIcon, onClose, onSaved }: NouveauControleStep2Props) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<DtaFormData>(makeDefaultData());
  const pdfViewerRef = useRef<PdfViewerHandle>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [batiments, setBatiments] = useState<{ id: string; nom: string }[]>([]);
  const [residences, setResidences] = useState<{ id: string; nom: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('batiments').select('id, nom').order('nom'),
      supabase.from('residences').select('id, nom').order('nom'),
    ]).then(([{ data: bats }, { data: res }]) => {
      setBatiments(bats || []);
      setResidences(res || []);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let pdf_path: string | null = null;
      let pdf_nom: string | null = null;

      // Upload PDF to Supabase Storage if provided
      if (pdfFile) {
        const ext = pdfFile.name.split('.').pop();
        const path = `dta/${Date.now()}_${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('dta-documents')
          .upload(path, pdfFile, { contentType: 'application/pdf' });
        if (uploadErr) throw uploadErr;
        pdf_path = path;
        pdf_nom = pdfFile.name;
      }

      // Insert controle
      const { data: created, error: ctrlErr } = await supabase
        .from('controles_dta')
        .insert([{
          periodicite:             formData.controle.periodicite,
          site:                    formData.controle.site,
          residence:               formData.controle.residence,
          organisme:               formData.controle.organisme,
          date_controle:           formData.controle.date_controle || null,
          date_prochain_controle:  formData.controle.date_prochain_controle || null,
          statut:                  formData.controle.statut,
          pdf_path,
          pdf_nom,
        }])
        .select('id')
        .single();

      if (ctrlErr) throw ctrlErr;
      const controleId = created.id;

      // Insert points (non-empty only)
      const pointsToInsert = formData.points
        .filter(p => p.libelle.trim())
        .map(p => ({
          controle_dta_id: controleId,
          libelle:      p.libelle,
          conforme:     p.conforme,
          criticite:    p.criticite,
          localisation: p.localisation ?? null,
          photo_data:   p.photo_data ?? null,
        }));
      if (pointsToInsert.length > 0) {
        const { error: ptErr } = await supabase.from('points_controle_dta').insert(pointsToInsert);
        if (ptErr) throw ptErr;
      }

      // Insert actions (non-empty only)
      const actionsToInsert = formData.actions
        .filter(a => a.libelle_type.trim())
        .map(a => ({
          controle_dta_id:    controleId,
          libelle_type:       a.libelle_type,
          assigne_categorie:  a.assigne_categorie || null,
          assigne_nom:        a.assigne_nom,
          date_prevue:        a.date_prevue || null,
        }));
      if (actionsToInsert.length > 0) {
        const { error: acErr } = await supabase.from('actions_correctives_dta').insert(actionsToInsert);
        if (acErr) throw acErr;
      }

      onSaved();
    } catch (err: any) {
      setSaveError(err?.message ?? 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ width: 'min(96vw, 1500px)', height: 'min(92vh, 820px)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Nouveau contrôle — Étape 2/2</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
            <span className="text-lg leading-none">{typeIcon}</span>
            <span className="text-sm font-semibold text-emerald-800">{typeLabel}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* ── Body: 2 columns ────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* Left column — PDF viewer (takes remaining space) */}
        <div className="flex flex-col flex-1 border-r border-slate-100 p-4 min-h-0 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex-shrink-0">
            Document DTA — Rapport PDF
          </p>
          <div className="flex-1 min-h-0">
            <PdfViewer ref={pdfViewerRef} file={pdfFile} onFileChange={setPdfFile} />
          </div>
        </div>

        {/* Right column — Accordion form (fixed width) */}
        <div className="flex flex-col min-h-0 flex-shrink-0" style={{ width: '520px' }}>
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saisie</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 relative">
            <AccordeonDtaForm
              typeLabel={typeLabel}
              data={formData}
              onChange={setFormData}
              batiments={batiments}
              residences={residences}
              onCaptureRequest={pdfFile ? () => pdfViewerRef.current?.captureCurrentPage() ?? null : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          {saveError && (
            <p className="text-xs text-red-600">{saveError}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
            : <><Save className="w-4 h-4" /> Enregistrer</>
          }
        </button>
      </div>
    </div>
  );
}
