import { useState, useEffect, useRef } from 'react';
import {
  X, Search, ChevronRight, ChevronLeft, Check, AlertTriangle,
  Package, Calendar, User, MessageSquare, Layers, Zap,
  Building2, Hash, ShoppingCart, ArrowRight, Info,
} from 'lucide-react';
import {
  MOCK_ARTICLES, MOCK_ENTREPOTS, MOCK_STOCKS,
  CATEGORIES_ARTICLES, PRIORITE_CFG,
  type Article, type PrioriteDemande,
} from './approTypes';

// ── Pexels photos per category (hero banner backgrounds) ──────────────────────
const CATEGORY_PHOTOS: Record<string, string> = {
  plomberie:   'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  electricite: 'https://images.pexels.com/photos/5279317/pexels-photo-5279317.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  chauffage:   'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  serrurerie:  'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  menuiserie:  'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  peinture:    'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  nettoyage:   'https://images.pexels.com/photos/7447684/pexels-photo-7447684.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  securite:    'https://images.pexels.com/photos/12939477/pexels-photo-12939477.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  eclairage:   'https://images.pexels.com/photos/383838/pexels-photo-383838.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  divers:      'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
};

// ── Pexels photos per article — each photo matches the specific part ───────────
// PLO-VAN-001  : vanne d'arrêt / ball valve on pipe
// PLO-JOI-002  : joint / rubber seal fitting close-up
// ELE-DIS-001  : disjoncteur / circuit breaker panel
// ELE-CAB-002  : câble électrique / copper wires
// CVC-FIL-001/2: filtre CVC / HVAC air filter
// CVC-CUR-001  : courroie / v-belt drive belt
// ELC-LED-001  : ampoule LED / LED bulb
// ELC-TUB-002  : tube néon / fluorescent tube
// SER-CYL-001  : cylindre serrure / door lock cylinder
// SER-POI-002  : poignée porte / door handle stainless
// NET-DET-001  : détergent / cleaning product bottles
// SEC-DET-001  : détecteur fumée / smoke alarm
// SEC-EXT-002  : extincteur / fire extinguisher
// PEI-RUB-001  : rouleau peinture / paint roller
// PLO-POM-001  : pompe circulation / heat pump unit
// ELE-PRE-001  : prise électrique / wall socket
// CVC-ANT-001  : antigel / antifreeze fluid container
const ARTICLE_PHOTOS: Record<string, string> = {
  'PLO-VAN-001': 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'PLO-JOI-002': 'https://images.pexels.com/photos/4489734/pexels-photo-4489734.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'ELE-DIS-001': 'https://images.pexels.com/photos/8381832/pexels-photo-8381832.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'ELE-CAB-002': 'https://images.pexels.com/photos/5279317/pexels-photo-5279317.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'CVC-FIL-001': 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'CVC-FIL-002': 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'CVC-CUR-001': 'https://images.pexels.com/photos/5121549/pexels-photo-5121549.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'ELC-LED-001': 'https://images.pexels.com/photos/383838/pexels-photo-383838.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'ELC-TUB-002': 'https://images.pexels.com/photos/988888/pexels-photo-988888.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'SER-CYL-001': 'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'SER-POI-002': 'https://images.pexels.com/photos/16515/pexels-photo-16515.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'NET-DET-001': 'https://images.pexels.com/photos/7447684/pexels-photo-7447684.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'SEC-DET-001': 'https://images.pexels.com/photos/3958649/pexels-photo-3958649.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'SEC-EXT-002': 'https://images.pexels.com/photos/12939477/pexels-photo-12939477.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'PEI-RUB-001': 'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'PLO-POM-001': 'https://images.pexels.com/photos/20046689/pexels-photo-20046689.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'ELE-PRE-001': 'https://images.pexels.com/photos/3615719/pexels-photo-3615719.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
  'CVC-ANT-001': 'https://images.pexels.com/photos/7854088/pexels-photo-7854088.jpeg?auto=compress&cs=tinysrgb&w=400&h=280&dpr=1',
};

type Step = 1 | 2 | 3;

interface FormState {
  // Step 1 — article
  mode: 'catalogue' | 'libre';
  selectedArticle: Article | null;
  categorieFilter: string;
  search: string;
  designationLibre: string;
  categorieLibre: string;
  // Step 2 — détails
  quantite: number;
  priorite: PrioriteDemande;
  site: string;
  entrepotId: string;
  dateBesoin: string;
  interventionRef: string;
  fournisseur: string;
  // Step 3 — contexte
  titre: string;
  description: string;
  commentaire: string;
  demandeurNom: string;
  demandeurEmail: string;
}

interface Props {
  onClose: () => void;
  onSubmit: (data: FormState) => void;
}

const DEMANDEURS = [
  { nom: 'Martin D.',  email: 'martin.d@crous-lyon.fr',  site: 'Campus Lyon Manufacture' },
  { nom: 'Leroy P.',   email: 'leroy.p@crous-lyon.fr',   site: 'Résidence Cavalier' },
  { nom: 'Bernard C.', email: 'bernard.c@crous-lyon.fr', site: 'Résidence Berlioz' },
  { nom: 'Dupont A.',  email: 'dupont.a@crous-lyon.fr',  site: 'Résidence Albert Thomas' },
  { nom: 'Laurent E.', email: 'laurent.e@crous-lyon.fr', site: 'Résidence Mermoz' },
  { nom: 'Michel G.',  email: 'michel.g@crous-lyon.fr',  site: 'Résidence Bron' },
];

const SITES = [...new Set(MOCK_ENTREPOTS.map(e => e.site_nom))];

const STEP_LABELS: Record<Step, string> = {
  1: 'Article',
  2: 'Détails',
  3: 'Finaliser',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0 flex-shrink-0">
      {([1, 2, 3] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all
            ${current === s ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
              current > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {current > s ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
          <span className={`ml-1.5 text-xs font-semibold hidden sm:block ${current === s ? 'text-blue-700' : current > s ? 'text-emerald-600' : 'text-slate-400'}`}>
            {STEP_LABELS[s]}
          </span>
          {i < 2 && <div className={`w-8 h-px mx-2 ${current > s ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function StockBadge({ articleId }: { articleId: string }) {
  const stock = MOCK_STOCKS.find(s => s.article.id === articleId);
  if (!stock) return null;
  const pct = stock.stock_maxi ? Math.round((stock.quantite_disponible / stock.stock_maxi) * 100) : 0;
  const color = stock.statut === 'rupture' ? 'text-red-600 bg-red-50 border-red-200'
    : stock.statut === 'stock_faible' ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-emerald-600 bg-emerald-50 border-emerald-200';
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${color}`}>
      <Package className="w-2.5 h-2.5" />
      {stock.statut === 'rupture' ? 'Rupture' : stock.statut === 'stock_faible' ? `Stock faible (${pct}%)` : `En stock (${pct}%)`}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function NouvelleDemandeModal({ onClose, onSubmit }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    mode: 'catalogue',
    selectedArticle: null,
    categorieFilter: '',
    search: '',
    designationLibre: '',
    categorieLibre: '',
    quantite: 1,
    priorite: 'normale',
    site: '',
    entrepotId: '',
    dateBesoin: '',
    interventionRef: '',
    fournisseur: '',
    titre: '',
    description: '',
    commentaire: '',
    demandeurNom: 'Martin D.',
    demandeurEmail: 'martin.d@crous-lyon.fr',
  });

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) searchRef.current?.focus();
  }, [step, form.mode]);

  // Derive filtered articles
  const filteredArticles = MOCK_ARTICLES.filter(a => {
    const matchCat = !form.categorieFilter || a.categorie === form.categorieFilter;
    const q = form.search.toLowerCase();
    const matchSearch = !q || a.designation.toLowerCase().includes(q) || a.reference.toLowerCase().includes(q) || a.sous_categorie.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const set = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  const canAdvance1 = form.mode === 'catalogue' ? !!form.selectedArticle : form.designationLibre.trim().length > 0;
  const canAdvance2 = form.quantite > 0 && form.site.trim().length > 0;
  const canSubmit   = form.demandeurNom.trim().length > 0;

  // Auto-fill titre when article selected
  useEffect(() => {
    if (form.selectedArticle && !form.titre) {
      set({ titre: form.selectedArticle.designation });
    }
    if (!form.selectedArticle && form.designationLibre && !form.titre) {
      set({ titre: form.designationLibre });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.selectedArticle, form.designationLibre]);

  // Auto-fill demandeur info from site
  const handleDemandeurChange = (nom: string) => {
    const d = DEMANDEURS.find(x => x.nom === nom);
    set({ demandeurNom: nom, demandeurEmail: d?.email ?? '', site: d?.site ?? form.site });
  };

  const selectedCatCfg = CATEGORIES_ARTICLES.find(c => c.key === (form.selectedArticle?.categorie ?? form.categorieLibre));
  const heroBg = selectedCatCfg ? CATEGORY_PHOTOS[selectedCatCfg.key] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        <div className="relative h-32 flex-shrink-0 overflow-hidden">
          {heroBg ? (
            <img src={heroBg} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
          <div className="absolute inset-0 flex items-end px-6 pb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-white/80" />
                <span className="text-white/70 text-xs font-medium tracking-wide uppercase">Nouvelle demande d'achat</span>
              </div>
              <h2 className="text-white text-lg font-bold leading-tight truncate">
                {form.selectedArticle?.designation || form.designationLibre || 'Sélectionner un article'}
              </h2>
            </div>
            {selectedCatCfg && (
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-semibold">
                <span>{selectedCatCfg.icon}</span>
                <span>{selectedCatCfg.label}</span>
              </div>
            )}
          </div>
          <button onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step indicator ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <StepIndicator current={step} />
          {form.selectedArticle && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{form.selectedArticle.reference}</span>
              <StockBadge articleId={form.selectedArticle.id} />
            </div>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ─── STEP 1: Article selection ───────────────────────────────── */}
          {step === 1 && (
            <div className="p-5 flex flex-col gap-4">
              {/* Mode toggle */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 self-start">
                {(['catalogue', 'libre'] as const).map(m => (
                  <button key={m} onClick={() => set({ mode: m })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.mode === m ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                    {m === 'catalogue' ? 'Depuis le catalogue' : 'Désignation libre'}
                  </button>
                ))}
              </div>

              {form.mode === 'catalogue' ? (
                <>
                  {/* Category pills */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => set({ categorieFilter: '' })}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                        ${!form.categorieFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                      Tous
                    </button>
                    {CATEGORIES_ARTICLES.map(cat => (
                      <button key={cat.key} onClick={() => set({ categorieFilter: cat.key === form.categorieFilter ? '' : cat.key })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${form.categorieFilter === cat.key ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        style={form.categorieFilter === cat.key ? { background: cat.color, borderColor: cat.color } : {}}>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input ref={searchRef} type="text" value={form.search}
                      onChange={e => set({ search: e.target.value })}
                      placeholder="Rechercher par désignation ou référence..."
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                  </div>

                  {/* Article grid */}
                  {filteredArticles.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-slate-400">
                      <Package className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">Aucun article trouvé</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredArticles.map(article => {
                        const isSelected = form.selectedArticle?.id === article.id;
                        const catCfg = CATEGORIES_ARTICLES.find(c => c.key === article.categorie);
                        const photo = ARTICLE_PHOTOS[article.reference] ?? CATEGORY_PHOTOS[article.categorie];
                        const stock = MOCK_STOCKS.find(s => s.article.id === article.id);
                        return (
                          <button key={article.id}
                            onClick={() => set({ selectedArticle: isSelected ? null : article, titre: '' })}
                            className={`relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all group
                              ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
                            {/* Photo */}
                            <div className="relative h-24 overflow-hidden bg-slate-100">
                              <img src={photo} alt={article.designation}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                              {/* Category badge */}
                              {catCfg && (
                                <span className="absolute top-2 left-2 text-xs bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 font-semibold text-slate-700">
                                  {catCfg.icon} {catCfg.label}
                                </span>
                              )}
                              {/* Selected checkmark */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow">
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                </div>
                              )}
                              {/* Stock indicator dot */}
                              {stock && (
                                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full
                                  ${stock.statut === 'rupture' ? 'bg-red-500' : stock.statut === 'stock_faible' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                              )}
                            </div>
                            {/* Info */}
                            <div className="p-2.5 flex-1">
                              <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">{article.designation}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">{article.reference}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs font-bold text-slate-700">{article.prix_unitaire_ht.toFixed(2)} €<span className="text-[10px] font-normal text-slate-400">/ht</span></span>
                                <span className="text-[10px] text-slate-400">{article.unite}</span>
                              </div>
                              {stock && (
                                <div className={`mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit
                                  ${stock.statut === 'rupture' ? 'bg-red-50 text-red-600' : stock.statut === 'stock_faible' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {stock.statut === 'rupture' ? 'Rupture de stock' : stock.statut === 'stock_faible' ? `Faible : ${stock.quantite_disponible} ${article.unite}` : `Dispo : ${stock.quantite_disponible} ${article.unite}`}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Free-text mode */
                <div className="flex flex-col gap-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-xs text-amber-700">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>La désignation libre est utilisée pour les articles absents du catalogue. La demande sera traitée manuellement avant transmission à Epona.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Désignation de l'article <span className="text-red-500">*</span></label>
                    <input type="text" value={form.designationLibre}
                      onChange={e => set({ designationLibre: e.target.value, titre: '' })}
                      placeholder="Ex : Vanne thermostatique DN20 — marque Caleffi"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {CATEGORIES_ARTICLES.map(cat => (
                        <button key={cat.key} type="button"
                          onClick={() => set({ categorieLibre: cat.key })}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all
                            ${form.categorieLibre === cat.key ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-[10px] font-semibold text-slate-600 leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: Détails de la demande ──────────────────────────── */}
          {step === 2 && (
            <div className="p-5 flex flex-col gap-5">
              {/* Selected article summary */}
              {form.selectedArticle && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <img
                    src={ARTICLE_PHOTOS[form.selectedArticle.reference] ?? CATEGORY_PHOTOS[form.selectedArticle.categorie]}
                    alt={form.selectedArticle.designation}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-blue-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900 truncate">{form.selectedArticle.designation}</p>
                    <p className="text-xs text-blue-600 font-mono">{form.selectedArticle.reference} · {form.selectedArticle.fournisseur_prefere}</p>
                    <p className="text-xs text-blue-700 mt-0.5">{form.selectedArticle.prix_unitaire_ht.toFixed(2)} € HT / {form.selectedArticle.unite} · Délai : {form.selectedArticle.delai_livraison_jours}j</p>
                  </div>
                  <StockBadge articleId={form.selectedArticle.id} />
                </div>
              )}

              {/* Quantity + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Layers className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Quantité <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => set({ quantite: Math.max(1, form.quantite - 1) })}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-lg flex items-center justify-center transition-colors">−</button>
                    <input type="number" min={1} value={form.quantite}
                      onChange={e => set({ quantite: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="flex-1 text-center py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                    <button onClick={() => set({ quantite: form.quantite + 1 })}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-lg flex items-center justify-center transition-colors">+</button>
                  </div>
                  {form.selectedArticle && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      ≈ <span className="font-semibold text-slate-600">{(form.quantite * form.selectedArticle.prix_unitaire_ht).toFixed(2)} € HT</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Zap className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Priorité
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['critique', 'haute', 'normale', 'faible'] as PrioriteDemande[]).map(p => {
                      const cfg = PRIORITE_CFG[p];
                      return (
                        <button key={p} onClick={() => set({ priorite: p })}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all
                            ${form.priorite === p ? `${cfg.bg} ${cfg.text} border-current` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${form.priorite === p ? cfg.dot : 'bg-slate-300'}`} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Site + Entrepôt */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Building2 className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Site <span className="text-red-500">*</span>
                  </label>
                  <select value={form.site} onChange={e => set({ site: e.target.value, entrepotId: '' })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white appearance-none cursor-pointer">
                    <option value="">Choisir un site...</option>
                    {SITES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Package className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Entrepôt de livraison
                  </label>
                  <select value={form.entrepotId} onChange={e => set({ entrepotId: e.target.value })}
                    disabled={!form.site}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Sélectionner...</option>
                    {MOCK_ENTREPOTS.filter(e => e.site_nom === form.site).map(e => (
                      <option key={e.id} value={e.id}>{e.nom} ({e.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date besoin + Intervention */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Calendar className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Date besoin
                  </label>
                  <input type="date" value={form.dateBesoin}
                    onChange={e => set({ dateBesoin: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Hash className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Intervention liée
                  </label>
                  <input type="text" value={form.interventionRef}
                    onChange={e => set({ interventionRef: e.target.value })}
                    placeholder="DI-2026-XXX"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 font-mono" />
                </div>
              </div>

              {/* Fournisseur */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  <ArrowRight className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Fournisseur souhaité
                </label>
                <input type="text" value={form.fournisseur}
                  onChange={e => set({ fournisseur: e.target.value })}
                  placeholder={form.selectedArticle?.fournisseur_prefere ?? 'Ex : Rexel, Schneider…'}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                {form.selectedArticle && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Fournisseur préféré du catalogue : <button className="text-blue-600 hover:underline font-medium" onClick={() => set({ fournisseur: form.selectedArticle!.fournisseur_prefere })}>{form.selectedArticle.fournisseur_prefere}</button>
                  </p>
                )}
              </div>

              {/* Urgency alert */}
              {(form.priorite === 'critique' || form.priorite === 'haute') && (
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Priorité <strong>{PRIORITE_CFG[form.priorite].label}</strong> — la demande sera remontée en tête de file et notifiée au responsable de site.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: Finaliser ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-5 flex flex-col gap-5">
              {/* Titre */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Titre de la demande <span className="text-red-500">*</span></label>
                <input type="text" value={form.titre}
                  onChange={e => set({ titre: e.target.value })}
                  placeholder="Ex : Filtres G4/F7 lot mensuel CTA-B2"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all font-semibold" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  <MessageSquare className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Description / contexte
                </label>
                <textarea value={form.description}
                  onChange={e => set({ description: e.target.value })}
                  placeholder="Décrivez le contexte de la demande, l'intervention concernée, les équipements impactés…"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none transition-all" />
              </div>

              {/* Demandeur */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  <User className="inline w-3.5 h-3.5 mr-1 text-slate-400" />Demandeur <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {DEMANDEURS.map(d => (
                    <button key={d.nom} type="button" onClick={() => handleDemandeurChange(d.nom)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all
                        ${form.demandeurNom === d.nom ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                        ${form.demandeurNom === d.nom ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {d.nom.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${form.demandeurNom === d.nom ? 'text-blue-800' : 'text-slate-700'}`}>{d.nom}</p>
                        <p className="text-[10px] text-slate-400 truncate">{d.site.split(' ').slice(-2).join(' ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Commentaire interne</label>
                <textarea value={form.commentaire}
                  onChange={e => set({ commentaire: e.target.value })}
                  placeholder="Note interne, précisions pour l'approbateur…"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none transition-all" />
              </div>

              {/* Summary recap */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Récapitulatif</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Article</span>
                    <span className="font-semibold text-slate-700 text-right">{form.selectedArticle?.designation ?? form.designationLibre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantité</span>
                    <span className="font-semibold text-slate-700">{form.quantite} {form.selectedArticle?.unite ?? 'u.'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Priorité</span>
                    <span className={`font-semibold ${PRIORITE_CFG[form.priorite].text}`}>{PRIORITE_CFG[form.priorite].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Site</span>
                    <span className="font-semibold text-slate-700 text-right truncate max-w-[140px]">{form.site || '—'}</span>
                  </div>
                  {form.dateBesoin && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date besoin</span>
                      <span className="font-semibold text-slate-700">{new Date(form.dateBesoin).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {form.selectedArticle && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Montant estimé</span>
                      <span className="font-bold text-slate-800">{(form.quantite * form.selectedArticle.prix_unitaire_ht).toFixed(2)} € HT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white flex-shrink-0 gap-3">
          <div>
            {step > 1 ? (
              <button onClick={() => setStep(s => (s - 1) as Step)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <ChevronLeft className="w-4 h-4" />Retour
              </button>
            ) : (
              <button onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                Annuler
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                disabled={step === 1 ? !canAdvance1 : !canAdvance2}
                onClick={() => setStep(s => (s + 1) as Step)}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                Suivant<ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  disabled={!canSubmit}
                  onClick={() => { onSubmit(form); onClose(); }}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Enregistrer en brouillon
                </button>
                <button
                  disabled={!canSubmit}
                  onClick={() => { onSubmit({ ...form, priorite: form.priorite }); onClose(); }}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                  <ShoppingCart className="w-4 h-4" />Soumettre la demande
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
