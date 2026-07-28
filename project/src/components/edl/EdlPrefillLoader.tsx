import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle, Database, Users, Wrench, Building2 } from 'lucide-react';

interface PrefillStep {
  id: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  duration: number;
  status: 'pending' | 'loading' | 'done' | 'error';
}

interface Props {
  logementNumero?: string;
  onComplete: (data: PrefillData) => void;
  onCancel: () => void;
  siLogementAvailable?: boolean;
}

export interface PrefillData {
  occupantNom: string;
  occupantPrenom: string;
  occupantEmail: string;
  occupantTel: string;
  logementNumero: string;
  residenceNom: string;
  dateEntree: string;
  dateSortie: string;
  nbEquipements: number;
  nbAnomaliesHistorique: number;
  dernierEdlDate: string;
  siLogementOk: boolean;
  patrimoineOk: boolean;
}

const DEMO_DATA: PrefillData = {
  occupantNom: 'Martin',
  occupantPrenom: 'Emma',
  occupantEmail: 'e.martin@univ-lyon1.fr',
  occupantTel: '06 12 34 56 78',
  logementNumero: 'A-204',
  residenceNom: 'Résidence Cavalier',
  dateEntree: '2025-09-01',
  dateSortie: '2026-06-30',
  nbEquipements: 12,
  nbAnomaliesHistorique: 0,
  dernierEdlDate: '2025-09-02',
  siLogementOk: true,
  patrimoineOk: true,
};

const DEMO_DATA_DEGRADED: PrefillData = {
  ...DEMO_DATA,
  occupantNom: '',
  occupantPrenom: '',
  occupantEmail: '',
  occupantTel: '',
  siLogementOk: false,
  patrimoineOk: true,
};

export default function EdlPrefillLoader({ logementNumero, onComplete, onCancel, siLogementAvailable = true }: Props) {
  const [steps, setSteps] = useState<PrefillStep[]>([
    {
      id: 'logement',
      label: 'Chargement des informations logement',
      detail: logementNumero ? `Logement ${logementNumero}` : 'Identification du logement',
      icon: <Building2 className="w-4 h-4" />,
      duration: 700,
      status: 'pending',
    },
    {
      id: 'si_logement',
      label: 'Interrogation SI Logement',
      detail: siLogementAvailable ? 'Récupération occupant, dates, contrat' : 'Service indisponible — mode dégradé',
      icon: <Users className="w-4 h-4" />,
      duration: 900,
      status: 'pending',
    },
    {
      id: 'gmao',
      label: 'Interrogation GMAO',
      detail: 'Historique EDL, interventions, anomalies',
      icon: <Wrench className="w-4 h-4" />,
      duration: 600,
      status: 'pending',
    },
    {
      id: 'patrimoine',
      label: 'Interrogation Patrimoine',
      detail: 'Équipements, surfaces, compteurs',
      icon: <Database className="w-4 h-4" />,
      duration: 500,
      status: 'pending',
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'loading' } : s));
        await new Promise(r => setTimeout(r, steps[i].duration));
        if (cancelled) return;
        const isError = i === 1 && !siLogementAvailable;
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: isError ? 'error' : 'done' } : s));
        setCurrentStep(i + 1);
      }
      setDone(true);
      setTimeout(() => {
        if (!cancelled) onComplete(siLogementAvailable ? DEMO_DATA : DEMO_DATA_DEGRADED);
      }, 600);
    }
    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allDone = steps.every(s => s.status === 'done' || s.status === 'error');
  const hasError = steps.some(s => s.status === 'error');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            {!done ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
            ) : hasError ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-bold">
                {!done ? 'Pré-remplissage automatique…' : hasError ? 'Pré-remplissage partiel' : 'Pré-remplissage terminé'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {!done ? 'Récupération des données depuis les systèmes connectés' : `${steps.filter(s => s.status === 'done').length}/${steps.length} sources synchronisées`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                step.status === 'done'    ? 'bg-emerald-100 text-emerald-600' :
                step.status === 'error'  ? 'bg-amber-100 text-amber-600' :
                step.status === 'loading'? 'bg-blue-100 text-blue-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {step.status === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : step.status === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : step.status === 'error' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className={`text-xs font-semibold leading-tight ${
                  step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                }`}>{step.label}</p>
                <p className={`text-[10px] mt-0.5 ${
                  step.status === 'error' ? 'text-amber-600 font-semibold' : 'text-slate-400'
                }`}>{step.status === 'done' ? '✓ ' : ''}{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Degraded mode banner */}
        {hasError && allDone && (
          <div className="mx-6 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">Impossible de récupérer les informations locatives.</p>
                <p className="text-xs text-amber-600 mt-0.5">Vous pouvez poursuivre en mode dégradé. La synchronisation pourra être relancée ultérieurement.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Annuler
          </button>
          {allDone && (
            <button
              onClick={() => onComplete(siLogementAvailable ? DEMO_DATA : DEMO_DATA_DEGRADED)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Ouvrir la fiche EDL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
