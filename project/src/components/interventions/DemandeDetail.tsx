import { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft, Clock, MapPin, User, Mail, Building2, CheckCircle2,
  AlertTriangle, Timer, Wrench, FileText, Tag,
  Plus, X, Save, Loader2, ChevronRight, ChevronLeft, Play, Pause, Square,
  Camera, Mic, MicOff, Cpu, Package, PenLine, ThumbsUp, ThumbsDown,
  Volume2, ZoomIn, Trash2, RotateCcw, Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  CRITICITE_CFG, STATUT_DI_CFG, CANAL_CFG, CATEGORIES_DI,
  type DemandeParsed, type TicketIntervention, type HistoriqueItem, type StatutDI,
  type TempsSaisi, type ConsommableUtilise, type PhotoTerrain, type NoteVocale,
  type RapportIntervention, type PhotoCategorie, type ConclusionRapport,
  fmtDateFR, fmtDateTimeFR, fmtDateRelative, isSlaBreached, slaRemainingLabel,
  historiqueIcon, PHOTO_CAT_CFG, CONCLUSION_CFG,
  DEMO_TEMPS, DEMO_CONSOMMABLES, DEMO_PHOTOS, DEMO_NOTES_VOCALES, DEMO_RAPPORT,
} from './interventionsTypes';
import { calcCompleteness, completenessColors, type CriterionKey } from './completenessScore';
import PriseEnChargeModal from './PriseEnChargeModal';

interface Props {
  demande: DemandeParsed;
  onBack: () => void;
  onUpdated: () => void;
}

type DetailTab = 'resume' | 'historique' | 'tickets' | 'affectation' | 'terrain' | 'rapport';

const STATUT_FLOW: StatutDI[] = [
  'brouillon', 'nouveau', 'a_qualifier', 'qualifie', 'affecte', 'en_intervention',
  'en_attente_validation', 'resolu', 'cloture',
];

// ─── Terrain Tab ──────────────────────────────────────────────────────────────

function TerrainTab({ demande, onUpdated }: { demande: DemandeParsed; onUpdated: () => void }) {
  const [temps, setTemps] = useState<TempsSaisi[]>([]);
  const [consommables, setConsommables] = useState<ConsommableUtilise[]>([]);
  const [photos, setPhotos] = useState<PhotoTerrain[]>([]);
  const [notes, setNotes] = useState<NoteVocale[]>(DEMO_NOTES_VOCALES);
  const [loadingTerrain, setLoadingTerrain] = useState(true);
  const [savingTerrain, setSavingTerrain] = useState(false);

  // Chrono
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoStart, setChronoStart] = useState<Date | null>(null);
  const [chronoElapsed, setChronoElapsed] = useState(0); // seconds
  const [chronoType, setChronoType] = useState<TempsSaisi['type']>('intervention');
  const chronoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [photoTab, setPhotoTab] = useState<PhotoCategorie>('avant');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [recordingNote, setRecordingNote] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [consomSearch, setConsomSearch] = useState('');
  const [showAddConsomForm, setShowAddConsomForm] = useState(false);

  // Load terrain data from Supabase on mount
  useEffect(() => {
    async function loadTerrain() {
      setLoadingTerrain(true);
      const [{ data: tempsData }, { data: consoData }, { data: photosData }] = await Promise.all([
        supabase.from('intervention_temps').select('*').eq('intervention_id', demande.id).order('created_at'),
        supabase.from('intervention_consommables').select('*').eq('intervention_id', demande.id).order('created_at'),
        supabase.from('intervention_photos').select('*').eq('intervention_id', demande.id).order('created_at'),
      ]);
      setTemps((tempsData ?? []).map(r => ({
        id: r.id, type: r.type, debut: r.debut, fin: r.fin, duree_min: r.duree_min, note: r.note,
      })));
      setConsommables((consoData ?? []).map(r => ({
        id: r.id, reference: r.reference, designation: r.designation,
        quantite: r.quantite, unite: r.unite, stock_restant: r.stock_restant, prix_unitaire: r.prix_unitaire,
      })));
      setPhotos((photosData ?? []).map(r => ({
        id: r.id, categorie: r.categorie, url: r.url, caption: r.caption, created_at: r.created_at,
      })));
      setLoadingTerrain(false);
    }
    loadTerrain();
  }, [demande.id]);

  async function persistTemps(newEntry: TempsSaisi) {
    const { data, error } = await supabase.from('intervention_temps').insert([{
      intervention_id: demande.id,
      type: newEntry.type,
      debut: newEntry.debut,
      fin: newEntry.fin,
      duree_min: newEntry.duree_min,
      note: newEntry.note ?? null,
    }]).select().single();
    if (!error && data) {
      setTemps(prev => prev.map(t => t.id === newEntry.id ? { ...t, id: data.id } : t));
    }
  }

  async function deleteTemps(id: string) {
    setTemps(prev => prev.filter(t => t.id !== id));
    await supabase.from('intervention_temps').delete().eq('id', id);
  }

  async function persistConsommable(item: ConsommableUtilise) {
    const { data, error } = await supabase.from('intervention_consommables').insert([{
      intervention_id: demande.id,
      reference: item.reference, designation: item.designation,
      quantite: item.quantite, unite: item.unite,
      stock_restant: item.stock_restant, prix_unitaire: item.prix_unitaire,
    }]).select().single();
    if (!error && data) {
      setConsommables(prev => prev.map(c => c.id === item.id ? { ...c, id: data.id } : c));
    }
  }

  async function deleteConsommable(id: string) {
    setConsommables(prev => prev.filter(c => c.id !== id));
    await supabase.from('intervention_consommables').delete().eq('id', id);
  }

  async function persistPhoto(photo: PhotoTerrain) {
    const { data, error } = await supabase.from('intervention_photos').insert([{
      intervention_id: demande.id,
      categorie: photo.categorie, url: photo.url, caption: photo.caption,
    }]).select().single();
    if (!error && data) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, id: data.id } : p));
    }
  }

  async function deletePhoto(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id));
    await supabase.from('intervention_photos').delete().eq('id', id);
  }

  // Chrono tick
  useEffect(() => {
    if (chronoRunning) {
      chronoRef.current = setInterval(() => setChronoElapsed(e => e + 1), 1000);
    } else {
      if (chronoRef.current) clearInterval(chronoRef.current);
    }
    return () => { if (chronoRef.current) clearInterval(chronoRef.current); };
  }, [chronoRunning]);

  function startChrono() {
    setChronoStart(new Date());
    setChronoElapsed(0);
    setChronoRunning(true);
  }
  function pauseChrono() { setChronoRunning(false); }
  function resumeChrono() { setChronoRunning(true); }
  function stopChrono() {
    setChronoRunning(false);
    if (chronoElapsed > 0) {
      const now = new Date();
      const start = chronoStart ?? new Date(now.getTime() - chronoElapsed * 1000);
      const newEntry: TempsSaisi = {
        id: `t-${Date.now()}`,
        type: chronoType,
        debut: start.toISOString(),
        fin: now.toISOString(),
        duree_min: Math.round(chronoElapsed / 60),
      };
      setTemps(prev => [...prev, newEntry]);
      persistTemps(newEntry);
    }
    setChronoElapsed(0);
    setChronoStart(null);
  }

  function fmtChrono(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  const totalMinutes = temps.reduce((s, t) => s + t.duree_min, 0);

  function removeTemps(id: string) { deleteTemps(id); }
  function removeConsomm(id: string) { deleteConsommable(id); }
  function removePhoto(id: string) { deletePhoto(id); }

  const MOCK_STOCK = [
    { reference: 'PLB-0045', designation: 'Joint PVC 15mm', unite: 'pièce', prix_unitaire: 0.60 },
    { reference: 'ELC-0011', designation: 'Fusible 16A', unite: 'pièce', prix_unitaire: 1.20 },
    { reference: 'PLB-0102', designation: 'Raccord laiton 20/27', unite: 'pièce', prix_unitaire: 3.40 },
    { reference: 'NET-0005', designation: 'Produit déboucheur 500ml', unite: 'flacon', prix_unitaire: 5.80 },
  ].filter(s => !consomSearch || s.designation.toLowerCase().includes(consomSearch.toLowerCase()));

  function addConsommable(item: typeof MOCK_STOCK[0]) {
    const newItem: ConsommableUtilise = {
      id: `c-${Date.now()}`,
      ...item,
      quantite: 1,
      stock_restant: Math.floor(Math.random() * 50) + 10,
    };
    setConsommables(prev => [...prev, newItem]);
    persistConsommable(newItem);
    setConsomSearch('');
    setShowAddConsomForm(false);
  }

  function toggleRecording() {
    if (recordingNote) {
      const duree = Math.floor(Math.random() * 50) + 15;
      setNotes(prev => [...prev, {
        id: `nv-${Date.now()}`,
        duree_sec: duree,
        auteur: 'Administrateur',
        created_at: new Date().toISOString(),
        transcription: undefined,
        resume_ia: undefined,
      }]);
      setRecordingNote(false);
    } else {
      setRecordingNote(true);
    }
  }

  function generateTranscription(id: string) {
    setGeneratingAI(true);
    setTimeout(() => {
      setNotes(prev => prev.map(n => n.id === id ? {
        ...n,
        transcription: 'Intervention terminée. Remplacement des joints et vérification de la pression. Aucun dégât secondaire visible.',
        resume_ia: 'Joints remplacés. Pression OK. Aucun dégât secondaire.',
      } : n));
      setGeneratingAI(false);
    }, 1800);
  }

  const photosByTab = photos.filter(p => p.categorie === photoTab);
  const PHOTO_SAMPLES = [
    'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=400&h=300&fit=crop',
  ];
  function addMockPhoto() {
    const newPhoto: PhotoTerrain = {
      id: `p-${Date.now()}`,
      categorie: photoTab,
      url: PHOTO_SAMPLES[Math.floor(Math.random() * PHOTO_SAMPLES.length)],
      caption: `Photo ${photoTab} — ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      created_at: new Date().toISOString(),
    };
    setPhotos(prev => [...prev, newPhoto]);
    persistPhoto(newPhoto);
  }

  const TEMPS_TYPE_LABELS: Record<TempsSaisi['type'], string> = {
    deplacement: 'Déplacement', preparation: 'Préparation', intervention: 'Intervention',
    attente: 'Attente', administratif: 'Administratif',
  };
  const TEMPS_COLORS: Record<TempsSaisi['type'], string> = {
    deplacement: 'bg-blue-100 text-blue-700', preparation: 'bg-sky-100 text-sky-700',
    intervention: 'bg-emerald-100 text-emerald-700', attente: 'bg-amber-100 text-amber-700',
    administratif: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="p-5 space-y-5">

      {loadingTerrain && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
        </div>
      )}

      {!loadingTerrain && (
      <>

      {/* ── Chrono / Temps passés ── */}
      <section className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Timer className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Chrono & Temps passés</span>
          <span className="ml-auto text-xs font-semibold text-slate-400">
            Total : {Math.floor(totalMinutes / 60)}h{totalMinutes % 60 > 0 ? ` ${totalMinutes % 60}min` : ''}
          </span>
        </div>
        <div className="p-4 space-y-4">
          {/* Chrono display */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
            <div className={`text-3xl font-mono font-bold tabular-nums flex-shrink-0 ${chronoRunning ? 'text-emerald-600' : 'text-slate-700'}`}>
              {fmtChrono(chronoElapsed)}
            </div>
            <div className="flex-1 space-y-2">
              <select value={chronoType} onChange={e => setChronoType(e.target.value as TempsSaisi['type'])}
                disabled={chronoRunning}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50">
                {(Object.keys(TEMPS_TYPE_LABELS) as TempsSaisi['type'][]).map(k => (
                  <option key={k} value={k}>{TEMPS_TYPE_LABELS[k]}</option>
                ))}
              </select>
              <div className="flex gap-2">
                {!chronoRunning && chronoElapsed === 0 && (
                  <button onClick={startChrono} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                    <Play className="w-3.5 h-3.5" /> Démarrer
                  </button>
                )}
                {chronoRunning && (
                  <>
                    <button onClick={pauseChrono} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                    <button onClick={stopChrono} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      <Square className="w-3.5 h-3.5" /> Terminer
                    </button>
                  </>
                )}
                {!chronoRunning && chronoElapsed > 0 && (
                  <>
                    <button onClick={resumeChrono} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                      <Play className="w-3.5 h-3.5" /> Reprendre
                    </button>
                    <button onClick={stopChrono} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      <Square className="w-3.5 h-3.5" /> Terminer
                    </button>
                    <button onClick={() => { setChronoElapsed(0); setChronoStart(null); }} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Temps list */}
          {temps.length > 0 && (
            <div className="space-y-1.5">
              {temps.map(t => (
                <div key={t.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg px-3 py-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TEMPS_COLORS[t.type]}`}>{TEMPS_TYPE_LABELS[t.type]}</span>
                  <span className="text-xs text-slate-500 flex-1">
                    {new Date(t.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {t.fin && ` → ${new Date(t.fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                    {t.note && <span className="italic text-slate-400 ml-2">— {t.note}</span>}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{t.duree_min}min</span>
                  <button onClick={() => removeTemps(t.id)} className="p-1 text-slate-300 hover:text-red-400 rounded transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Photos par catégorie ── */}
      <section className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Photos terrain</span>
          <span className="ml-auto text-xs text-slate-400">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
        </div>
        {/* Category tabs */}
        <div className="flex border-b border-slate-100">
          {(['avant', 'pendant', 'apres', 'document'] as PhotoCategorie[]).map(cat => {
            const cfg = PHOTO_CAT_CFG[cat];
            const count = photos.filter(p => p.categorie === cat).length;
            return (
              <button key={cat} onClick={() => setPhotoTab(cat)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors border-b-2 ${
                  photoTab === cat ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                {cfg.label}
                {count > 0 && <span className="ml-1 text-[10px] font-bold opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photosByTab.map(p => (
              <div key={p.id} className="relative group rounded-lg overflow-hidden aspect-square bg-slate-100 cursor-pointer" onClick={() => setLightbox(p.url)}>
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button onClick={e => { e.stopPropagation(); removePhoto(p.id); }}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                  <X className="w-2.5 h-2.5 text-red-500" />
                </button>
                <p className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1.5 py-1 truncate">{p.caption}</p>
              </div>
            ))}
            <button onClick={addMockPhoto}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-colors">
              <Camera className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Ajouter</span>
            </button>
          </div>
          {photosByTab.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Aucune photo "{PHOTO_CAT_CFG[photoTab].label}"</p>
          )}
        </div>
      </section>

      {/* ── Notes vocales ── */}
      <section className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Mic className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Notes vocales</span>
          <button onClick={toggleRecording}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              recordingNote ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {recordingNote ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {recordingNote ? 'Arrêter' : 'Enregistrer'}
          </button>
        </div>
        <div className="p-4 space-y-3">
          {notes.map(n => (
            <div key={n.id} className="border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{n.auteur}</span>
                    <span className="text-[10px] text-slate-400">{fmtDateRelative(n.created_at)}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">{Math.floor(n.duree_sec / 60)}:{String(n.duree_sec % 60).padStart(2, '0')}</span>
                  </div>
                  {/* Fake waveform */}
                  <div className="flex items-center gap-px mt-1 h-4">
                    {Array.from({ length: 32 }, (_, i) => (
                      <div key={i} className="w-1 bg-blue-200 rounded-full flex-shrink-0"
                        style={{ height: `${20 + Math.sin(i * 0.8 + n.duree_sec) * 60}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {n.transcription ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Transcription</p>
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2">{n.transcription}</p>
                  {n.resume_ia && (
                    <>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Résumé IA
                      </p>
                      <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2 border border-blue-100">{n.resume_ia}</p>
                    </>
                  )}
                </div>
              ) : (
                <button onClick={() => generateTranscription(n.id)} disabled={generatingAI}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors">
                  {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                  Transcrire avec IA
                </button>
              )}
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Aucune note vocale</p>
          )}
        </div>
      </section>

      {/* ── Consommables ── */}
      <section className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Consommables utilisés</span>
          <span className="ml-auto text-xs font-semibold text-slate-400">
            {consommables.reduce((s, c) => s + c.quantite * c.prix_unitaire, 0).toFixed(2)} €
          </span>
        </div>
        <div className="p-4 space-y-2">
          {consommables.map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">{c.designation}</p>
                <p className="text-[10px] text-slate-400 font-mono">{c.reference} · stock restant : {c.stock_restant}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500">{c.quantite} {c.unite}</span>
                <span className="text-xs font-bold text-slate-700">{(c.quantite * c.prix_unitaire).toFixed(2)} €</span>
                <button onClick={() => removeConsomm(c.id)} className="p-1 text-slate-300 hover:text-red-400 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add consommable */}
          {showAddConsomForm ? (
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <input value={consomSearch} onChange={e => setConsomSearch(e.target.value)}
                placeholder="Rechercher un article du stock..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-300" />
              {consomSearch && (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {MOCK_STOCK.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Aucun résultat</p>
                  ) : MOCK_STOCK.map(item => (
                    <button key={item.reference} onClick={() => addConsommable(item)}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-700 flex-1">{item.designation}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.reference}</span>
                      <span className="text-[10px] font-bold text-slate-600">{item.prix_unitaire.toFixed(2)} €/{item.unite}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setShowAddConsomForm(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Annuler
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAddConsomForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-100 border border-dashed border-slate-200 transition-colors w-full justify-center">
              <Plus className="w-3.5 h-3.5" /> Ajouter un consommable
            </button>
          )}
        </div>
      </section>

      </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ─── Rapport Tab ──────────────────────────────────────────────────────────────

function RapportTab({ demande, onUpdated }: { demande: DemandeParsed; onUpdated: () => void }) {
  const [rapport, setRapport] = useState<RapportIntervention>({
    travaux_realises: '',
    conclusion: null,
    commentaire_conclusion: '',
    signature_technicien: false,
    signature_occupant: false,
    signature_demandeur: false,
    date_rapport: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatingCR, setGeneratingCR] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [refusMotif, setRefusMotif] = useState('');
  const [validating, setValidating] = useState(false);

  const isEnAttente = demande.statut_demande === 'en_attente_validation';
  const isResolu = demande.statut_demande === 'resolu' || demande.statut_demande === 'cloture';

  useEffect(() => {
    async function loadRapport() {
      setLoading(true);
      const { data } = await supabase
        .from('intervention_rapport')
        .select('*')
        .eq('intervention_id', demande.id)
        .maybeSingle();
      if (data) {
        setRapport({
          travaux_realises: data.travaux_realises ?? '',
          conclusion: data.conclusion ?? null,
          commentaire_conclusion: data.commentaire_conclusion ?? '',
          signature_technicien: data.signature_technicien ?? false,
          signature_occupant: data.signature_occupant ?? false,
          signature_demandeur: data.signature_demandeur ?? false,
          date_rapport: data.date_rapport ?? null,
        });
      }
      setLoading(false);
    }
    loadRapport();
  }, [demande.id]);

  function generateCR() {
    setGeneratingCR(true);
    setTimeout(() => {
      setRapport(prev => ({
        ...prev,
        travaux_realises: 'Remplacement des joints toriques (×3) et du tuyau PER flexible. Vérification de l\'étanchéité après remise en service. Test de pression effectué : résultat conforme. Aucun dégât structurel constaté. Intervention terminée en 90 minutes.',
      }));
      setGeneratingCR(false);
    }, 1600);
  }

  async function saveRapport() {
    setSaving(true);
    const payload = {
      intervention_id: demande.id,
      travaux_realises: rapport.travaux_realises,
      conclusion: rapport.conclusion,
      commentaire_conclusion: rapport.commentaire_conclusion,
      signature_technicien: rapport.signature_technicien,
      signature_occupant: rapport.signature_occupant,
      signature_demandeur: rapport.signature_demandeur,
      date_rapport: rapport.date_rapport ?? new Date().toISOString(),
    };
    const { error } = await supabase
      .from('intervention_rapport')
      .upsert(payload, { onConflict: 'intervention_id' });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function submitForValidation() {
    setSaving(true);
    const { error } = await supabase.from('interventions')
      .update({ statut_demande: 'en_attente_validation' })
      .eq('id', demande.id);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: demande.id,
        type_evenement: 'en_attente_validation',
        description: 'Rapport soumis pour validation',
        auteur: 'Technicien',
      }]);
      onUpdated();
    }
    setSaving(false);
  }

  async function validateIntervention() {
    setValidating(true);
    const { error } = await supabase.from('interventions')
      .update({ statut_demande: 'resolu' })
      .eq('id', demande.id);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: demande.id,
        type_evenement: 'validation',
        description: 'Intervention validée par le responsable',
        auteur: 'Responsable',
      }]);
      onUpdated();
      setShowValidation(false);
    }
    setValidating(false);
  }

  async function refuseIntervention() {
    if (!refusMotif.trim()) return;
    setValidating(true);
    const { error } = await supabase.from('interventions')
      .update({ statut_demande: 'en_intervention' })
      .eq('id', demande.id);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: demande.id,
        type_evenement: 'refus',
        description: `Rapport refusé : ${refusMotif}`,
        auteur: 'Responsable',
      }]);
      onUpdated();
      setShowValidation(false);
      setRefusMotif('');
    }
    setValidating(false);
  }

  return (
    <div className="p-5 space-y-5">

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
        </div>
      )}

      {!loading && (
      <>

      {/* Validation banner */}
      {isEnAttente && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-800">Rapport en attente de validation</p>
          </div>
          <p className="text-xs text-amber-700">Ce rapport est soumis pour validation. Un responsable doit valider ou refuser.</p>
          {!showValidation ? (
            <button onClick={() => setShowValidation(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Traiter la validation
            </button>
          ) : (
            <div className="space-y-3 border-t border-amber-200 pt-3">
              <button onClick={validateIntervention} disabled={validating}
                className="flex items-center gap-1.5 w-full px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                Valider l'intervention
              </button>
              <div className="space-y-2">
                <textarea value={refusMotif} onChange={e => setRefusMotif(e.target.value)}
                  rows={2} placeholder="Motif de refus (obligatoire)..."
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30 placeholder:text-slate-300" />
                <button onClick={refuseIntervention} disabled={validating || !refusMotif.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                  {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                  Refuser et renvoyer en intervention
                </button>
              </div>
              <button onClick={() => setShowValidation(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {/* Travaux réalisés */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700">Travaux réalisés</p>
          <button onClick={generateCR} disabled={generatingCR}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors">
            {generatingCR ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            Générer avec IA
          </button>
        </div>
        <textarea
          value={rapport.travaux_realises}
          onChange={e => setRapport(r => ({ ...r, travaux_realises: e.target.value }))}
          rows={5}
          placeholder="Décrire les travaux réalisés..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-300"
        />
      </div>

      {/* Conclusion */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700">Conclusion</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CONCLUSION_CFG) as ConclusionRapport[]).map(k => {
            const cfg = CONCLUSION_CFG[k];
            const isSelected = rapport.conclusion === k;
            return (
              <button key={k} onClick={() => setRapport(r => ({ ...r, conclusion: k }))}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-current/30` :
                  'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                {cfg.label}
              </button>
            );
          })}
        </div>
        <textarea
          value={rapport.commentaire_conclusion}
          onChange={e => setRapport(r => ({ ...r, commentaire_conclusion: e.target.value }))}
          rows={2}
          placeholder="Commentaire de conclusion (optionnel)..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-300"
        />
      </div>

      {/* Signatures */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-700">Signatures</p>
        <div className="space-y-2">
          {([
            { key: 'signature_technicien' as const, label: 'Technicien / Agent' },
            { key: 'signature_occupant' as const, label: 'Occupant' },
            { key: 'signature_demandeur' as const, label: 'Demandeur' },
          ]).map(sig => (
            <div key={sig.key} className="flex items-center gap-3">
              <button onClick={() => setRapport(r => ({ ...r, [sig.key]: !r[sig.key] }))}
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  rapport[sig.key] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent hover:border-slate-300'
                }`}>
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700">{sig.label}</p>
                {rapport[sig.key] && (
                  <div className="mt-1.5 h-12 border border-dashed border-emerald-200 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-emerald-600 italic font-semibold">Signature apposée</span>
                  </div>
                )}
                {!rapport[sig.key] && (
                  <div className="mt-1.5 h-12 border border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    onClick={() => setRapport(r => ({ ...r, [sig.key]: true }))}>
                    <span className="text-[10px] text-slate-300 flex items-center gap-1"><PenLine className="w-3 h-3" /> Signer ici</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={saveRapport} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>

        {demande.statut_demande === 'en_intervention' && rapport.conclusion && rapport.travaux_realises && (
          <button onClick={submitForValidation} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            Soumettre pour validation
          </button>
        )}

        {isResolu && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> Intervention validée
          </span>
        )}
      </div>

      </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DemandeDetail({ demande, onBack, onUpdated }: Props) {
  const [tab, setTab] = useState<DetailTab>('resume');
  const [tickets, setTickets] = useState<TicketIntervention[]>([]);
  const [historique, setHistorique] = useState<HistoriqueItem[]>([]);
  const [showPriseEnCharge, setShowPriseEnCharge] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingHistorique, setLoadingHistorique] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editAgent, setEditAgent] = useState(demande.agent ?? '');
  const [editPrestataire, setEditPrestataire] = useState(demande.prestataire ?? '');
  const [editDatePlanifiee, setEditDatePlanifiee] = useState(demande.date_planifiee ?? '');
  const [editCompteRendu, setEditCompteRendu] = useState(demande.compte_rendu ?? '');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // Ticket creation state
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketTitre, setNewTicketTitre] = useState('');
  const [newTicketPriorite, setNewTicketPriorite] = useState('normale');
  const [newTicketAssigne, setNewTicketAssigne] = useState('');
  const [newTicketDatePrevue, setNewTicketDatePrevue] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  const critCfg = CRITICITE_CFG[demande.criticite];
  const statutCfg = STATUT_DI_CFG[demande.statut_demande];
  const canalCfg = CANAL_CFG[demande.canal_source];
  const slaBreached = isSlaBreached(demande);

  useEffect(() => {
    if (tab === 'tickets') loadTickets();
    if (tab === 'historique') loadHistorique();
  }, [tab, demande.id]);

  useEffect(() => {
    loadHistorique();
    loadTickets();
  }, [demande.id]);

  async function loadTickets() {
    setLoadingTickets(true);
    const { data } = await supabase.from('tickets_intervention')
      .select('*').eq('intervention_id', demande.id).order('created_at');
    setTickets(data ?? []);
    setLoadingTickets(false);
  }

  async function loadHistorique() {
    setLoadingHistorique(true);
    const { data } = await supabase.from('historique_intervention')
      .select('*').eq('intervention_id', demande.id).order('created_at', { ascending: false });
    setHistorique(data ?? []);
    setLoadingHistorique(false);
  }

  async function changeStatut(newStatut: StatutDI) {
    const { error } = await supabase.from('interventions')
      .update({ statut_demande: newStatut })
      .eq('id', demande.id);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: demande.id,
        type_evenement: newStatut === 'resolu' ? 'resolution' : newStatut === 'en_intervention' ? 'intervention_demarree' : 'qualification',
        description: `Statut changé en "${STATUT_DI_CFG[newStatut].label}"`,
        auteur: 'Administrateur',
      }]);
      onUpdated();
      loadHistorique();
    }
  }

  async function saveAffectation() {
    setSaving(true);
    const { error } = await supabase.from('interventions')
      .update({
        agent: editAgent || null,
        prestataire: editPrestataire || null,
        date_planifiee: editDatePlanifiee || null,
        compte_rendu: editCompteRendu || null,
        statut_demande: (editAgent || editPrestataire) && demande.statut_demande === 'qualifie'
          ? 'affecte' : demande.statut_demande,
      })
      .eq('id', demande.id);
    if (!error) {
      if (editAgent || editPrestataire) {
        await supabase.from('historique_intervention').insert([{
          intervention_id: demande.id,
          type_evenement: 'affectation',
          description: `Affecté à ${editAgent || editPrestataire}`,
          auteur: 'Administrateur',
        }]);
      }
      onUpdated();
      loadHistorique();
    }
    setSaving(false);
  }

  async function addComment() {
    if (!newComment.trim()) return;
    setAddingComment(true);
    await supabase.from('historique_intervention').insert([{
      intervention_id: demande.id,
      type_evenement: 'commentaire',
      description: newComment.trim(),
      auteur: 'Administrateur',
    }]);
    setNewComment('');
    setShowCommentForm(false);
    loadHistorique();
    setAddingComment(false);
  }

  async function createTicket() {
    if (!newTicketTitre.trim()) return;
    setCreatingTicket(true);
    const ref = `TK-${demande.reference.slice(-6)}-${String(Date.now()).slice(-4)}`;
    const { error } = await supabase.from('tickets_intervention').insert([{
      intervention_id: demande.id,
      reference: ref,
      titre: newTicketTitre.trim(),
      statut: 'ouvert',
      priorite: newTicketPriorite,
      assigne_a: newTicketAssigne || null,
      date_prevue: newTicketDatePrevue || null,
    }]);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: demande.id,
        type_evenement: 'ticket_cree',
        description: `Ticket créé : ${newTicketTitre.trim()}`,
        auteur: 'Administrateur',
      }]);
      setNewTicketTitre('');
      setNewTicketPriorite('normale');
      setNewTicketAssigne('');
      setNewTicketDatePrevue('');
      setShowNewTicketForm(false);
      loadTickets();
      onUpdated();
    }
    setCreatingTicket(false);
  }

  async function updateTicketStatut(ticketId: string, statut: string) {
    await supabase.from('tickets_intervention').update({ statut }).eq('id', ticketId);
    loadTickets();
  }

  async function rejectDemande() {
    const { error } = await supabase.from('interventions')
      .update({ statut_demande: 'rejete' })
      .eq('id', demande.id);
    if (!error) {
      await supabase.from('historique_intervention').insert([{
        intervention_id: demande.id,
        type_evenement: 'refus',
        description: 'Demande rejetée',
        auteur: 'Administrateur',
      }]);
      onUpdated();
    }
  }

  const AGENTS = ['Martin D.', 'Leroy P.', 'Bernard C.', 'Laurent E.', 'Michel G.'];
  const PRESTATAIRES = ['Plomberie Martin', 'Électricité Dupont', 'SOCOTEC', 'Otis Ascenseurs', 'Thermidor CVC'];

  // ── Completeness score ──────────────────────────────────────────────────────
  function fakeAttachments(ref: string) {
    let h = 0;
    for (let i = 0; i < ref.length; i++) h = (Math.imul(31, h) + ref.charCodeAt(i)) | 0;
    const total = Math.abs(h) % 5;
    const photos = Math.abs(h >> 3) % (total + 1);
    const emails = Math.abs(h >> 6) % 4;
    return { total, photos, emails };
  }
  const attachments = fakeAttachments(demande.reference);
  const completeness = useMemo(
    () => calcCompleteness(demande, attachments.total),
    [demande, attachments.total],
  );
  const contentRef    = useRef<HTMLDivElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);

  function scrollChips(dir: 'left' | 'right') {
    chipsScrollRef.current?.scrollBy({ left: dir === 'left' ? -140 : 140, behavior: 'smooth' });
  }

  function scrollToSection(sectionId: string) {
    if (!contentRef.current) return;
    const el = contentRef.current.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTab('resume');
    } else {
      setTab('resume');
      // wait for tab to render then scroll
      setTimeout(() => {
        const el2 = contentRef.current?.querySelector(`#${sectionId}`);
        el2?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  const missingCriteria = completeness.criteria.filter(c => !c.filled);
  const colors = completenessColors(completeness.score);

  const CRITERION_ICONS: Record<CriterionKey, React.ElementType> = {
    localisation: MapPin,
    categorie:    Tag,
    description:  FileText,
    criticite:    AlertTriangle,
    piece_jointe: Camera,
    demandeur:    User,
    batiment:     Building2,
  };

  const TABS = [
    { id: 'resume' as const,      label: 'Résumé',          icon: FileText      },
    { id: 'terrain' as const,     label: 'Terrain',         icon: Wrench        },
    { id: 'rapport' as const,     label: 'Rapport',         icon: PenLine       },
    { id: 'historique' as const,  label: `Historique${historique.length > 0 ? ` (${historique.length})` : ''}`, icon: Clock },
    { id: 'tickets' as const,     label: `Tickets${tickets.length > 0 ? ` (${tickets.length})` : ''}`, icon: Tag },
    { id: 'affectation' as const, label: 'Affectation',     icon: User          },
  ] as const;

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-0 border-b border-slate-100">
        <div className="flex items-start gap-3 mb-3">
          <button onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400">{demande.reference}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statutCfg.bg} ${statutCfg.text} ${statutCfg.border}`}>
                {statutCfg.label}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${critCfg.bg} ${critCfg.text}`}>
                {critCfg.label}
              </span>
              {slaBreached && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {slaRemainingLabel(demande)}
                </span>
              )}
            </div>
            <h2 className="text-sm font-bold text-slate-800 mt-1 line-clamp-2">{demande.titre}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {fmtDateTimeFR(demande.created_at)} · {canalCfg.icon} {canalCfg.label}
            </p>
          </div>
          <button
            onClick={() => setShowPriseEnCharge(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5" />
            Prendre en charge
          </button>
          {!['rejete', 'resolu', 'cloture'].includes(demande.statut_demande) && (
            <button
              onClick={rejectDemande}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex-shrink-0 mt-0.5">
              <ThumbsDown className="w-3.5 h-3.5" />
              Rejeter
            </button>
          )}
        </div>

        {/* Statut flow */}
        <div className="flex items-center gap-1 pb-1 overflow-x-auto">
          {demande.statut_demande === 'rejete' ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                Rejeté
              </span>
              <span className="text-[10px] text-slate-400">— Demande rejetée et archivée</span>
            </div>
          ) : (
            STATUT_FLOW.map((s, i) => {
              const cfg = STATUT_DI_CFG[s];
              const isCurrent = demande.statut_demande === s;
              const isPast = STATUT_FLOW.indexOf(demande.statut_demande) > i;
              const isNext = STATUT_FLOW.indexOf(demande.statut_demande) === i - 1;
              return (
                <div key={s} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => isNext ? changeStatut(s) : undefined}
                    disabled={!isNext && !isCurrent}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border whitespace-nowrap ${
                      isCurrent ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` :
                      isPast ? 'bg-slate-100 text-slate-400 border-slate-100' :
                      isNext ? `${cfg.bg} ${cfg.text} border-dashed ${cfg.border} opacity-70 hover:opacity-100 cursor-pointer` :
                      'bg-white text-slate-300 border-slate-100 cursor-not-allowed'
                    }`}>
                    {cfg.label}
                  </button>
                  {i < STATUT_FLOW.length - 1 && (
                    <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isPast ? 'text-slate-400' : 'text-slate-200'}`} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Tabs */}
        <div className="flex mt-2 gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bandeau Qualité du dossier ────────────────────────────────────────── */}
      <div className={`flex-shrink-0 px-5 py-2.5 border-b ${colors.banner}`}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Circle-check icon + score */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
            <span className={`text-xs font-bold ${colors.text}`}>{completeness.score}%</span>
          </div>

          {/* Progress bar */}
          <div className={`w-20 h-1.5 rounded-full flex-shrink-0 overflow-hidden ${colors.track}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${completeness.score}%` }}
            />
          </div>

          {/* Status label */}
          <span className={`text-[11px] font-semibold flex-shrink-0 ${colors.text}`}>
            {completeness.status === 'complete' && 'Dossier complet'}
            {completeness.status === 'good'     && <>Qualification requise <span className="text-red-500 font-bold">*</span></>}
            {completeness.status === 'low'      && <>Qualification requise <span className="text-red-500 font-bold">*</span></>}
          </span>

          {/* Chips with scroll arrows */}
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => scrollChips('left')}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
            >
              <ChevronLeft className={`w-3.5 h-3.5 ${colors.text} opacity-60`} />
            </button>

            <div
              ref={chipsScrollRef}
              className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0"
              style={{ scrollbarWidth: 'none' }}
            >
              {completeness.criteria.map(c => {
                const Icon = CRITERION_ICONS[c.key];
                if (c.filled) {
                  return (
                    <span
                      key={c.key}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700 text-[10px] font-semibold whitespace-nowrap flex-shrink-0"
                    >
                      <Icon className="w-3 h-3" />
                      {c.label}
                    </span>
                  );
                }
                return (
                  <button
                    key={c.key}
                    onClick={() => scrollToSection(c.sectionId)}
                    title={`Compléter : ${c.label}`}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600 text-[10px] font-semibold whitespace-nowrap hover:bg-slate-50 transition-colors flex-shrink-0"
                  >
                    <Icon className="w-3 h-3" />
                    {c.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollChips('right')}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
            >
              <ChevronRight className={`w-3.5 h-3.5 ${colors.text} opacity-60`} />
            </button>
          </div>

          {/* Compléter button — only when incomplete */}
          {missingCriteria.length > 0 && (
            <button
              onClick={() => scrollToSection(missingCriteria[0].sectionId)}
              className={`flex-shrink-0 text-[11px] font-semibold hover:underline whitespace-nowrap ${colors.text}`}
            >
              Compléter →
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">

        {/* ── Résumé ── */}
        {tab === 'resume' && (
          <div className="p-5 space-y-4">
            <div id="section-localisation" className="bg-slate-50 rounded-xl p-4 space-y-2 scroll-mt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Localisation
              </p>
              <div className="space-y-1 text-xs text-slate-700">
                {demande.site_nom && <p className="font-semibold">{demande.site_nom}</p>}
                {demande.residence_nom && <p>{demande.residence_nom}</p>}
                {demande.batiment_nom && <p className="text-slate-500">{demande.batiment_nom}</p>}
                {demande.localisation_detail && <p className="italic text-slate-400">{demande.localisation_detail}</p>}
                {!demande.site_nom && !demande.residence_nom && <p className="text-slate-400">Non précisé</p>}
              </div>
            </div>

            <div id="section-description" className="scroll-mt-4">
              {demande.description ? (
                <>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{demande.description}</p>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center">
                <p className="text-xs text-amber-600 font-medium">Aucune description renseignée</p>
                </div>
              )}
            </div>

            <div id="section-criticite" className="grid grid-cols-2 gap-3 scroll-mt-4">
              <div className="bg-white border border-slate-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Criticité · SLA</p>
                <p className={`text-sm font-bold ${slaBreached ? 'text-red-600' : 'text-emerald-600'}`}>
                  {slaRemainingLabel(demande)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Délai cible : {critCfg.sla}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Canal</p>
                <p className="text-sm font-semibold text-slate-700">{canalCfg.icon} {canalCfg.label}</p>
              </div>
              {demande.date_planifiee && (
                <div className="bg-white border border-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Planifiée</p>
                  <p className="text-sm font-semibold text-slate-700">{fmtDateFR(demande.date_planifiee)}</p>
                </div>
              )}
              {demande.cout != null && (
                <div className="bg-white border border-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coût</p>
                  <p className="text-sm font-semibold text-slate-700">{demande.cout.toLocaleString('fr-FR')} €</p>
                </div>
              )}
            </div>

            <div id="section-demandeur" className="scroll-mt-4">
              {(demande.demandeur_nom || demande.demandeur_email) ? (
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Demandeur</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {(demande.demandeur_nom ?? 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      {demande.demandeur_nom && <p className="text-xs font-semibold text-slate-700">{demande.demandeur_nom}</p>}
                      {demande.demandeur_email && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {demande.demandeur_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-600 font-medium">Demandeur non renseigné</p>
                </div>
              )}
            </div>

            {/* Pièces jointes */}
            <div id="section-attachments" className="scroll-mt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pièces jointes</p>
              {attachments.total > 0 ? (
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3">
                  {attachments.photos > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      {attachments.photos} photo{attachments.photos > 1 ? 's' : ''}
                    </span>
                  )}
                  {attachments.emails > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {attachments.emails} e-mail{attachments.emails > 1 ? 's' : ''}
                    </span>
                  )}
                  {attachments.total - attachments.photos - attachments.emails > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {attachments.total - attachments.photos - attachments.emails} doc{attachments.total - attachments.photos - attachments.emails > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Aucune pièce jointe</p>
                  <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">Recommandé</span>
                </div>
              )}
            </div>

            {(demande.agent || demande.prestataire) && (
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Affecté à</p>
                <div className="space-y-1">
                  {demande.agent && <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{demande.agent}</p>}
                  {demande.prestataire && <p className="text-xs text-slate-600 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" />{demande.prestataire}</p>}
                </div>
              </div>
            )}

            {demande.compte_rendu && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compte rendu</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">{demande.compte_rendu}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Terrain ── */}
        {tab === 'terrain' && (
          <TerrainTab demande={demande} onUpdated={onUpdated} />
        )}

        {/* ── Rapport ── */}
        {tab === 'rapport' && (
          <RapportTab demande={demande} onUpdated={onUpdated} />
        )}

        {/* ── Historique ── */}
        {tab === 'historique' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chronologie</p>
              <button onClick={() => setShowCommentForm(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Commentaire
              </button>
            </div>

            {showCommentForm && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                  rows={2} placeholder="Ajouter un commentaire..."
                  className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-300" />
                <div className="flex gap-2 mt-2">
                  <button onClick={addComment} disabled={addingComment || !newComment.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {addingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Enregistrer
                  </button>
                  <button onClick={() => setShowCommentForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg hover:bg-white transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {loadingHistorique ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              </div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-100" />
                <div className="space-y-4">
                  {historique.map(h => {
                    const { icon, color } = historiqueIcon(h.type_evenement);
                    return (
                      <div key={h.id} className="relative">
                        <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center text-[9px] ${color} border-current`}>
                          {icon}
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">{h.auteur}</span>
                            <span className="text-[10px] text-slate-400">{fmtDateRelative(h.created_at)}</span>
                          </div>
                          <p className="text-xs text-slate-600">{h.description}</p>
                        </div>
                      </div>
                    );
                  })}
                  {historique.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">Aucun événement enregistré</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tickets ── */}
        {tab === 'tickets' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tickets d'intervention liés</p>
              {!showNewTicketForm && (
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Nouveau ticket
                </button>
              )}
            </div>

            {/* Creation form */}
            {showNewTicketForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Nouveau ticket</p>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={newTicketTitre}
                    onChange={e => setNewTicketTitre(e.target.value)}
                    placeholder="Ex: Remplacement vanne secteur B"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priorité</label>
                    <select
                      value={newTicketPriorite}
                      onChange={e => setNewTicketPriorite(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                    >
                      <option value="basse">Basse</option>
                      <option value="normale">Normale</option>
                      <option value="haute">Haute</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date prévue</label>
                    <input
                      type="date"
                      value={newTicketDatePrevue}
                      onChange={e => setNewTicketDatePrevue(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Agent assigné</label>
                  <select
                    value={newTicketAssigne}
                    onChange={e => setNewTicketAssigne(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                  >
                    <option value="">Non assigné</option>
                    {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={createTicket}
                    disabled={!newTicketTitre.trim() || creatingTicket}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {creatingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Créer le ticket
                  </button>
                  <button
                    onClick={() => { setShowNewTicketForm(false); setNewTicketTitre(''); setNewTicketPriorite('normale'); setNewTicketAssigne(''); setNewTicketDatePrevue(''); }}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {loadingTickets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <Wrench className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Aucun ticket d'intervention</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map(t => {
                  const priorityCfg: Record<string, { bg: string; text: string; label: string }> = {
                    urgente: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente' },
                    haute:   { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Haute' },
                    normale: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Normale' },
                    basse:   { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Basse' },
                  };
                  const statutCfg: Record<string, { bg: string; text: string; label: string }> = {
                    ouvert:   { bg: 'bg-sky-100',     text: 'text-sky-700',     label: 'Ouvert' },
                    en_cours: { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'En cours' },
                    en_attente: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'En attente' },
                    termine:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Terminé' },
                    annule:   { bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'Annulé' },
                  };
                  const pc = priorityCfg[t.priorite] ?? priorityCfg.normale;
                  const sc = statutCfg[t.statut]     ?? statutCfg.ouvert;
                  return (
                    <div key={t.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">{t.reference}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>{pc.label}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mt-1.5">{t.titre}</p>
                          {t.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.description}</p>}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            {t.assigne_a && <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" />{t.assigne_a}</span>}
                            {t.date_prevue && <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{fmtDateFR(t.date_prevue)}</span>}
                            {t.cout != null && <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{t.cout.toLocaleString('fr-FR')} €</span>}
                          </div>
                        </div>
                        {/* Status change actions */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {t.statut === 'ouvert' && (
                            <button
                              onClick={() => updateTicketStatut(t.id, 'en_cours')}
                              className="text-[10px] font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors whitespace-nowrap"
                            >
                              Démarrer
                            </button>
                          )}
                          {t.statut === 'en_cours' && (
                            <>
                              <button
                                onClick={() => updateTicketStatut(t.id, 'en_attente')}
                                className="text-[10px] font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors whitespace-nowrap"
                              >
                                Mettre en attente
                              </button>
                              <button
                                onClick={() => updateTicketStatut(t.id, 'termine')}
                                className="text-[10px] font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors whitespace-nowrap"
                              >
                                Terminer
                              </button>
                            </>
                          )}
                          {t.statut === 'en_attente' && (
                            <button
                              onClick={() => updateTicketStatut(t.id, 'en_cours')}
                              className="text-[10px] font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors whitespace-nowrap"
                            >
                              Reprendre
                            </button>
                          )}
                          {(t.statut === 'ouvert' || t.statut === 'en_attente') && (
                            <button
                              onClick={() => updateTicketStatut(t.id, 'annule')}
                              className="text-[10px] font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Affectation ── */}
        {tab === 'affectation' && (
          <div className="p-5 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Affectation & Planification</p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Agent interne</label>
              <select value={editAgent} onChange={e => setEditAgent(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                <option value="">Non affecté</option>
                {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prestataire</label>
              <select value={editPrestataire} onChange={e => setEditPrestataire(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
                <option value="">Aucun prestataire</option>
                {PRESTATAIRES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date planifiée</label>
              <input type="date" value={editDatePlanifiee} onChange={e => setEditDatePlanifiee(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Compte rendu / Notes</label>
              <textarea value={editCompteRendu} onChange={e => setEditCompteRendu(e.target.value)}
                rows={4} placeholder="Observations, actions menées, pièces remplacées..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-300" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={saveAffectation} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>

              {demande.statut_demande === 'affecte' && (
                <button onClick={() => changeStatut('en_intervention')}
                  className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold rounded-lg hover:bg-yellow-100 transition-colors">
                  Démarrer l'intervention
                </button>
              )}
              {demande.statut_demande === 'en_intervention' && (
                <button onClick={() => changeStatut('resolu')}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors">
                  Marquer comme résolu
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {showPriseEnCharge && (
      <PriseEnChargeModal
        demande={demande}
        onClose={() => setShowPriseEnCharge(false)}
        onUpdated={() => { setShowPriseEnCharge(false); onUpdated(); }}
      />
    )}
    </>
  );
}
