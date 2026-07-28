// ─── Types & configuration — Module Approvisionnements ───────────────────────

export type StatutDemande =
  | 'brouillon' | 'en_attente' | 'validee' | 'commandee'
  | 'reception_partielle' | 'recue' | 'bloquee';

export type PrioriteDemande = 'critique' | 'haute' | 'normale' | 'faible';
export type StatutStock     = 'disponible' | 'stock_faible' | 'rupture' | 'commande';
export type EponaSyncStatut = 'non_envoye' | 'en_cours' | 'envoye' | 'erreur';
export type TypeMouvement   = 'entree' | 'sortie' | 'transfert' | 'inventaire';

// ── Config statuts demandes ───────────────────────────────────────────────────

export const STATUT_DEMANDE_CFG: Record<StatutDemande, {
  label: string; bg: string; text: string; border: string; dot: string; order: number;
}> = {
  brouillon:           { label: 'Brouillon',       bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-300',  dot: 'bg-slate-400',   order: 0 },
  en_attente:          { label: 'En attente',       bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-300',  dot: 'bg-amber-500',   order: 1 },
  validee:             { label: 'Validée',          bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-300',   dot: 'bg-blue-500',    order: 2 },
  commandee:           { label: 'Commandée',        bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-300',   dot: 'bg-cyan-500',    order: 3 },
  reception_partielle: { label: 'Réc. partielle',   bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-300', dot: 'bg-orange-500',  order: 4 },
  recue:               { label: 'Reçue',            bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300',dot: 'bg-emerald-500', order: 5 },
  bloquee:             { label: 'Bloquée',          bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-300',    dot: 'bg-red-500',     order: 6 },
};

// ── Config priorités ──────────────────────────────────────────────────────────

export const PRIORITE_CFG: Record<PrioriteDemande, {
  label: string; bg: string; text: string; dot: string; badgeBg: string;
}> = {
  critique: { label: 'Critique', bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    badgeBg: 'bg-red-500'    },
  haute:    { label: 'Haute',    bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', badgeBg: 'bg-orange-500' },
  normale:  { label: 'Normale',  bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   badgeBg: 'bg-blue-500'   },
  faible:   { label: 'Faible',   bg: 'bg-slate-50',  text: 'text-slate-600',  dot: 'bg-slate-400',  badgeBg: 'bg-slate-400'  },
};

// ── Config statuts stock ──────────────────────────────────────────────────────

export const STATUT_STOCK_CFG: Record<StatutStock, {
  label: string; bg: string; text: string; dot: string;
}> = {
  disponible:   { label: 'Disponible',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  stock_faible: { label: 'Stock faible', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  rupture:      { label: 'Rupture',      bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
  commande:     { label: 'Commandé',     bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
};

// ── Config Epona sync ─────────────────────────────────────────────────────────

export const EPONA_SYNC_CFG: Record<EponaSyncStatut, {
  label: string; bg: string; text: string;
}> = {
  non_envoye: { label: 'Non envoyé', bg: 'bg-slate-100', text: 'text-slate-500' },
  en_cours:   { label: 'En cours',   bg: 'bg-amber-50',  text: 'text-amber-700' },
  envoye:     { label: 'Envoyé',     bg: 'bg-blue-50',   text: 'text-blue-700'  },
  erreur:     { label: 'Erreur',     bg: 'bg-red-50',    text: 'text-red-700'   },
};

// ── Catégories articles ───────────────────────────────────────────────────────

export const CATEGORIES_ARTICLES = [
  { key: 'plomberie',   label: 'Plomberie',          icon: '🔧', color: '#0ea5e9' },
  { key: 'electricite', label: 'Électricité',        icon: '⚡', color: '#f59e0b' },
  { key: 'chauffage',   label: 'Chauffage / CVC',    icon: '🌡', color: '#ef4444' },
  { key: 'serrurerie',  label: 'Serrurerie',         icon: '🔑', color: '#8b5cf6' },
  { key: 'menuiserie',  label: 'Menuiserie',         icon: '🪵', color: '#a16207' },
  { key: 'peinture',    label: 'Peinture',           icon: '🎨', color: '#ec4899' },
  { key: 'nettoyage',   label: 'Entretien',          icon: '🧹', color: '#14b8a6' },
  { key: 'securite',    label: 'Sécurité incendie',  icon: '🔥', color: '#f97316' },
  { key: 'eclairage',   label: 'Éclairage',          icon: '💡', color: '#eab308' },
  { key: 'divers',      label: 'Divers',             icon: '📦', color: '#64748b' },
];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Entrepot {
  id: string;
  nom: string;
  code: string;
  site_nom: string;
  adresse: string;
  responsable: string;
  surface_m2: number;
  actif: boolean;
  code_epona: string;
}

export interface Article {
  id: string;
  reference: string;
  designation: string;
  categorie: string;
  sous_categorie: string;
  unite: string;
  fournisseur_prefere: string;
  reference_fournisseur: string;
  prix_unitaire_ht: number;
  delai_livraison_jours: number;
}

export interface StockLine {
  id: string;
  article: Article;
  entrepot: Entrepot;
  quantite_disponible: number;
  quantite_reservee: number;
  stock_mini: number;
  stock_maxi: number | null;
  emplacement: string;
  derniere_maj: string;
  statut: StatutStock;
}

export interface DemandeAchat {
  id: string;
  reference: string;
  titre: string;
  description: string;
  statut: StatutDemande;
  priorite: PrioriteDemande;
  site_nom: string;
  demandeur_nom: string;
  demandeur_email: string;
  intervention_liee_ref: string;
  designation_libre: string;
  quantite_demandee: number;
  quantite_recue: number;
  unite: string;
  epona_sync_statut: EponaSyncStatut;
  epona_numero_commande: string;
  epona_sync_at: string | null;
  epona_sync_date_envoi: string | null;
  date_besoin: string | null;
  date_commande: string | null;
  date_livraison_prevue: string | null;
  date_reception: string | null;
  fournisseur: string;
  montant_estime_ht: number | null;
  commentaire: string;
  created_at: string;
  updated_at: string;
}

export interface Mouvement {
  id: string;
  article_designation: string;
  entrepot_nom: string;
  type_mvt: TypeMouvement;
  quantite: number;
  reference_doc: string;
  auteur: string;
  commentaire: string;
  created_at: string;
}

// ── Mock data — Entrepôts ─────────────────────────────────────────────────────

export const MOCK_ENTREPOTS: Entrepot[] = [
  { id: 'e1', nom: 'Atelier Central',          code: 'AT-CEN',  site_nom: 'Campus Lyon Manufacture',   adresse: '8 av. Rockefeller, Lyon 8',   responsable: 'Martin D.',  surface_m2: 120, actif: true, code_epona: 'LIEU-001' },
  { id: 'e2', nom: 'Local Technique Cavalier', code: 'LT-CAV',  site_nom: 'Résidence Cavalier',         adresse: '47 bd des Brotteaux, Lyon 6', responsable: 'Leroy P.',   surface_m2: 45,  actif: true, code_epona: 'LIEU-002' },
  { id: 'e3', nom: 'Réserve Berlioz',          code: 'RES-BER', site_nom: 'Résidence Berlioz',          adresse: 'Rue Berlioz, Villeurbanne',   responsable: 'Bernard C.', surface_m2: 30,  actif: true, code_epona: 'LIEU-003' },
  { id: 'e4', nom: 'Atelier Nord',             code: 'AT-NORD', site_nom: 'Résidence Albert Thomas',    adresse: 'Bd Albert Thomas, Lyon 8',    responsable: 'Dupont A.',  surface_m2: 60,  actif: true, code_epona: 'LIEU-004' },
  { id: 'e5', nom: 'Local Mermoz',             code: 'LT-MER',  site_nom: 'Résidence Mermoz',           adresse: 'Av. Jean Mermoz, Bron',       responsable: 'Laurent E.', surface_m2: 25,  actif: true, code_epona: 'LIEU-005' },
  { id: 'e6', nom: 'Réserve Bron',             code: 'RES-BRN', site_nom: 'Résidence Bron',             adresse: 'Rue de Bron, Bron',           responsable: 'Michel G.',  surface_m2: 20,  actif: true, code_epona: 'LIEU-006' },
];

// ── Mock data — Articles ──────────────────────────────────────────────────────

export const MOCK_ARTICLES: Article[] = [
  { id: 'a01', reference: 'PLO-VAN-001', designation: "Vanne d'arrêt 15/21",          categorie: 'plomberie',   sous_categorie: 'Robinetterie', unite: 'unité',   fournisseur_prefere: 'Rexel',        reference_fournisseur: 'VAN-1521-R',   prix_unitaire_ht: 12.50,  delai_livraison_jours: 3  },
  { id: 'a02', reference: 'PLO-JOI-002', designation: 'Joint torique EPDM Ø20',       categorie: 'plomberie',   sous_categorie: 'Joints',       unite: 'sachet',  fournisseur_prefere: 'Rexel',        reference_fournisseur: 'JT-EPDM-20',   prix_unitaire_ht: 2.80,   delai_livraison_jours: 2  },
  { id: 'a03', reference: 'ELE-DIS-001', designation: 'Disjoncteur 16A Ph+N',         categorie: 'electricite', sous_categorie: 'Protection',   unite: 'unité',   fournisseur_prefere: 'Schneider',    reference_fournisseur: 'DIS-16A-PH',   prix_unitaire_ht: 18.90,  delai_livraison_jours: 5  },
  { id: 'a04', reference: 'ELE-CAB-002', designation: 'Câble H07VU 2.5mm² 100m',      categorie: 'electricite', sous_categorie: 'Câblage',      unite: 'rouleau', fournisseur_prefere: 'Legrand',      reference_fournisseur: 'CAB-25-100M',  prix_unitaire_ht: 45.00,  delai_livraison_jours: 4  },
  { id: 'a05', reference: 'CVC-FIL-001', designation: 'Filtre G4 600×600',            categorie: 'chauffage',   sous_categorie: 'Filtration',   unite: 'unité',   fournisseur_prefere: 'Climalife',    reference_fournisseur: 'FIL-G4-6060',  prix_unitaire_ht: 8.40,   delai_livraison_jours: 3  },
  { id: 'a06', reference: 'CVC-FIL-002', designation: 'Filtre F7 500×500',            categorie: 'chauffage',   sous_categorie: 'Filtration',   unite: 'unité',   fournisseur_prefere: 'Climalife',    reference_fournisseur: 'FIL-F7-5050',  prix_unitaire_ht: 14.20,  delai_livraison_jours: 3  },
  { id: 'a07', reference: 'CVC-CUR-001', designation: 'Courroie trapézoïdale B42',    categorie: 'chauffage',   sous_categorie: 'Transmission', unite: 'unité',   fournisseur_prefere: 'Thermocom',    reference_fournisseur: 'CUR-B42',      prix_unitaire_ht: 9.80,   delai_livraison_jours: 7  },
  { id: 'a08', reference: 'ELC-LED-001', designation: 'Ampoule LED E27 9W 3000K',     categorie: 'eclairage',   sous_categorie: 'Lampes',       unite: 'unité',   fournisseur_prefere: 'Osram',        reference_fournisseur: 'LED-E27-9W',   prix_unitaire_ht: 3.50,   delai_livraison_jours: 2  },
  { id: 'a09', reference: 'ELC-TUB-002', designation: 'Tube néon T8 36W 1200mm',      categorie: 'eclairage',   sous_categorie: 'Lampes',       unite: 'unité',   fournisseur_prefere: 'Osram',        reference_fournisseur: 'TUB-T8-36',    prix_unitaire_ht: 5.20,   delai_livraison_jours: 3  },
  { id: 'a10', reference: 'SER-CYL-001', designation: 'Cylindre européen 30×30',      categorie: 'serrurerie',  sous_categorie: 'Cylindres',    unite: 'unité',   fournisseur_prefere: 'Mottura',      reference_fournisseur: 'CYL-3030-M',   prix_unitaire_ht: 22.00,  delai_livraison_jours: 5  },
  { id: 'a11', reference: 'SER-POI-002', designation: 'Poignée porte inox mat',       categorie: 'serrurerie',  sous_categorie: 'Poignées',     unite: 'unité',   fournisseur_prefere: 'Mottura',      reference_fournisseur: 'POI-INX-MT',   prix_unitaire_ht: 15.60,  delai_livraison_jours: 4  },
  { id: 'a12', reference: 'NET-DET-001', designation: 'Détergent multi-surfaces 5L',  categorie: 'nettoyage',   sous_categorie: 'Détergents',   unite: 'bidon',   fournisseur_prefere: 'Ecolab',       reference_fournisseur: 'DET-MS-5L',    prix_unitaire_ht: 11.90,  delai_livraison_jours: 2  },
  { id: 'a13', reference: 'SEC-DET-001', designation: 'Détecteur fumée NF EN 14604',  categorie: 'securite',    sous_categorie: 'Détection',    unite: 'unité',   fournisseur_prefere: 'Legrand',      reference_fournisseur: 'DET-FUM-NF',   prix_unitaire_ht: 28.50,  delai_livraison_jours: 5  },
  { id: 'a14', reference: 'SEC-EXT-002', designation: 'Extincteur CO2 2kg ABC',       categorie: 'securite',    sous_categorie: 'Extinction',   unite: 'unité',   fournisseur_prefere: 'Sicli',        reference_fournisseur: 'EXT-CO2-2K',   prix_unitaire_ht: 67.00,  delai_livraison_jours: 7  },
  { id: 'a15', reference: 'PEI-RUB-001', designation: 'Rouleau peinture laine 25cm',  categorie: 'peinture',    sous_categorie: 'Outillage',    unite: 'unité',   fournisseur_prefere: 'Leroy Merlin', reference_fournisseur: 'RUL-LAI-25',   prix_unitaire_ht: 4.90,   delai_livraison_jours: 1  },
  { id: 'a16', reference: 'PLO-POM-001', designation: 'Pompe de circulation DN25',    categorie: 'plomberie',   sous_categorie: 'Pompes',       unite: 'unité',   fournisseur_prefere: 'Grundfos',     reference_fournisseur: 'POM-DN25-GF',  prix_unitaire_ht: 185.00, delai_livraison_jours: 10 },
  { id: 'a17', reference: 'ELE-PRE-001', designation: 'Prise 2P+T 16A saillie',       categorie: 'electricite', sous_categorie: 'Appareillage', unite: 'unité',   fournisseur_prefere: 'Legrand',      reference_fournisseur: 'PRI-16A-SAI',  prix_unitaire_ht: 4.20,   delai_livraison_jours: 2  },
  { id: 'a18', reference: 'CVC-ANT-001', designation: 'Antigel concentré 20L',        categorie: 'chauffage',   sous_categorie: 'Fluides',      unite: 'bidon',   fournisseur_prefere: 'Total',        reference_fournisseur: 'ANT-CONC-20L', prix_unitaire_ht: 42.00,  delai_livraison_jours: 5  },
];

// ── Mock data — Stocks ────────────────────────────────────────────────────────

export const MOCK_STOCKS: StockLine[] = [
  // Atelier Central
  { id: 's01', article: MOCK_ARTICLES[0],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 12, quantite_reservee: 2, stock_mini: 5,  stock_maxi: 30,  emplacement: 'A1-R2', derniere_maj: '2026-05-27T08:30:00Z', statut: 'disponible'   },
  { id: 's02', article: MOCK_ARTICLES[1],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 3,  quantite_reservee: 0, stock_mini: 10, stock_maxi: 50,  emplacement: 'A1-R3', derniere_maj: '2026-05-26T14:00:00Z', statut: 'stock_faible' },
  { id: 's03', article: MOCK_ARTICLES[2],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 8,  quantite_reservee: 1, stock_mini: 5,  stock_maxi: 20,  emplacement: 'B2-R1', derniere_maj: '2026-05-25T11:00:00Z', statut: 'disponible'   },
  { id: 's04', article: MOCK_ARTICLES[3],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 0,  quantite_reservee: 0, stock_mini: 2,  stock_maxi: 5,   emplacement: 'B2-R2', derniere_maj: '2026-05-20T09:00:00Z', statut: 'rupture'      },
  { id: 's05', article: MOCK_ARTICLES[4],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 24, quantite_reservee: 4, stock_mini: 10, stock_maxi: 50,  emplacement: 'C1-R1', derniere_maj: '2026-05-28T07:00:00Z', statut: 'disponible'   },
  { id: 's06', article: MOCK_ARTICLES[5],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 6,  quantite_reservee: 0, stock_mini: 8,  stock_maxi: 30,  emplacement: 'C1-R2', derniere_maj: '2026-05-27T07:00:00Z', statut: 'stock_faible' },
  { id: 's07', article: MOCK_ARTICLES[7],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 0,  quantite_reservee: 0, stock_mini: 20, stock_maxi: 100, emplacement: 'D1-R1', derniere_maj: '2026-05-22T10:00:00Z', statut: 'rupture'      },
  { id: 's08', article: MOCK_ARTICLES[8],  entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 15, quantite_reservee: 2, stock_mini: 10, stock_maxi: 40,  emplacement: 'D1-R2', derniere_maj: '2026-05-26T10:00:00Z', statut: 'disponible'   },
  { id: 's09', article: MOCK_ARTICLES[12], entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 4,  quantite_reservee: 1, stock_mini: 5,  stock_maxi: 15,  emplacement: 'E1-R1', derniere_maj: '2026-05-24T09:00:00Z', statut: 'stock_faible' },
  { id: 's10', article: MOCK_ARTICLES[15], entrepot: MOCK_ENTREPOTS[0], quantite_disponible: 2,  quantite_reservee: 1, stock_mini: 2,  stock_maxi: 5,   emplacement: 'E2-R1', derniere_maj: '2026-05-27T14:00:00Z', statut: 'commande'     },
  // Résidence Cavalier
  { id: 's11', article: MOCK_ARTICLES[0],  entrepot: MOCK_ENTREPOTS[1], quantite_disponible: 4,  quantite_reservee: 0, stock_mini: 3,  stock_maxi: 15,  emplacement: 'A1-R1', derniere_maj: '2026-05-26T08:00:00Z', statut: 'disponible'   },
  { id: 's12', article: MOCK_ARTICLES[4],  entrepot: MOCK_ENTREPOTS[1], quantite_disponible: 2,  quantite_reservee: 2, stock_mini: 5,  stock_maxi: 20,  emplacement: 'A2-R1', derniere_maj: '2026-05-25T08:00:00Z', statut: 'stock_faible' },
  { id: 's13', article: MOCK_ARTICLES[7],  entrepot: MOCK_ENTREPOTS[1], quantite_disponible: 0,  quantite_reservee: 0, stock_mini: 10, stock_maxi: 50,  emplacement: 'A3-R1', derniere_maj: '2026-05-18T08:00:00Z', statut: 'rupture'      },
  { id: 's14', article: MOCK_ARTICLES[9],  entrepot: MOCK_ENTREPOTS[1], quantite_disponible: 5,  quantite_reservee: 0, stock_mini: 3,  stock_maxi: 15,  emplacement: 'B1-R1', derniere_maj: '2026-05-27T08:00:00Z', statut: 'disponible'   },
  { id: 's15', article: MOCK_ARTICLES[11], entrepot: MOCK_ENTREPOTS[1], quantite_disponible: 8,  quantite_reservee: 0, stock_mini: 5,  stock_maxi: 20,  emplacement: 'B2-R1', derniere_maj: '2026-05-26T09:00:00Z', statut: 'disponible'   },
  // Résidence Berlioz
  { id: 's16', article: MOCK_ARTICLES[1],  entrepot: MOCK_ENTREPOTS[2], quantite_disponible: 20, quantite_reservee: 0, stock_mini: 10, stock_maxi: 40,  emplacement: 'A1-R1', derniere_maj: '2026-05-26T10:00:00Z', statut: 'disponible'   },
  { id: 's17', article: MOCK_ARTICLES[6],  entrepot: MOCK_ENTREPOTS[2], quantite_disponible: 0,  quantite_reservee: 0, stock_mini: 3,  stock_maxi: 10,  emplacement: 'A1-R2', derniere_maj: '2026-05-19T10:00:00Z', statut: 'rupture'      },
  { id: 's18', article: MOCK_ARTICLES[13], entrepot: MOCK_ENTREPOTS[2], quantite_disponible: 2,  quantite_reservee: 0, stock_mini: 2,  stock_maxi: 8,   emplacement: 'B1-R1', derniere_maj: '2026-05-27T11:00:00Z', statut: 'disponible'   },
  // Atelier Nord
  { id: 's19', article: MOCK_ARTICLES[2],  entrepot: MOCK_ENTREPOTS[3], quantite_disponible: 5,  quantite_reservee: 1, stock_mini: 4,  stock_maxi: 15,  emplacement: 'A1-R1', derniere_maj: '2026-05-25T09:00:00Z', statut: 'disponible'   },
  { id: 's20', article: MOCK_ARTICLES[5],  entrepot: MOCK_ENTREPOTS[3], quantite_disponible: 3,  quantite_reservee: 0, stock_mini: 5,  stock_maxi: 20,  emplacement: 'A2-R1', derniere_maj: '2026-05-24T09:00:00Z', statut: 'stock_faible' },
  { id: 's21', article: MOCK_ARTICLES[16], entrepot: MOCK_ENTREPOTS[3], quantite_disponible: 10, quantite_reservee: 0, stock_mini: 5,  stock_maxi: 25,  emplacement: 'B1-R1', derniere_maj: '2026-05-27T08:00:00Z', statut: 'disponible'   },
  { id: 's22', article: MOCK_ARTICLES[17], entrepot: MOCK_ENTREPOTS[3], quantite_disponible: 1,  quantite_reservee: 0, stock_mini: 2,  stock_maxi: 6,   emplacement: 'B2-R1', derniere_maj: '2026-05-20T08:00:00Z', statut: 'stock_faible' },
  // Résidence Mermoz
  { id: 's23', article: MOCK_ARTICLES[0],  entrepot: MOCK_ENTREPOTS[4], quantite_disponible: 6,  quantite_reservee: 1, stock_mini: 3,  stock_maxi: 12,  emplacement: 'A1-R1', derniere_maj: '2026-05-26T12:00:00Z', statut: 'disponible'   },
  { id: 's24', article: MOCK_ARTICLES[7],  entrepot: MOCK_ENTREPOTS[4], quantite_disponible: 4,  quantite_reservee: 0, stock_mini: 8,  stock_maxi: 30,  emplacement: 'A2-R1', derniere_maj: '2026-05-22T12:00:00Z', statut: 'stock_faible' },
  // Résidence Bron
  { id: 's25', article: MOCK_ARTICLES[4],  entrepot: MOCK_ENTREPOTS[5], quantite_disponible: 0,  quantite_reservee: 0, stock_mini: 5,  stock_maxi: 20,  emplacement: 'A1-R1', derniere_maj: '2026-05-15T09:00:00Z', statut: 'rupture'      },
  { id: 's26', article: MOCK_ARTICLES[11], entrepot: MOCK_ENTREPOTS[5], quantite_disponible: 3,  quantite_reservee: 0, stock_mini: 4,  stock_maxi: 15,  emplacement: 'A2-R1', derniere_maj: '2026-05-27T09:00:00Z', statut: 'stock_faible' },
];

// ── Mock data — Demandes d'achat ──────────────────────────────────────────────

export const MOCK_DEMANDES: DemandeAchat[] = [
  {
    id: 'd01', reference: 'DA-2026-001', titre: 'Filtres G4/F7 CTA-B2 — lot mensuel',
    description: 'Renouvellement mensuel filtres CTA bâtiment B2. 12 G4 + 8 F7.',
    statut: 'commandee', priorite: 'haute', site_nom: 'Campus Lyon Manufacture',
    demandeur_nom: 'Martin D.', demandeur_email: 'martin.d@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-042', designation_libre: '',
    quantite_demandee: 20, quantite_recue: 0, unite: 'unité',
    epona_sync_statut: 'envoye', epona_numero_commande: 'CMD-EPONA-2026-0312',
    epona_sync_at: '2026-05-20T09:15:00Z', epona_sync_date_envoi: '2026-05-20T09:15:00Z',
    date_besoin: '2026-06-01', date_commande: '2026-05-20', date_livraison_prevue: '2026-05-30',
    date_reception: null, fournisseur: 'Climalife', montant_estime_ht: 260.00, commentaire: '',
    created_at: '2026-05-18T08:00:00Z', updated_at: '2026-05-20T09:15:00Z',
  },
  {
    id: 'd02', reference: 'DA-2026-002', titre: 'Ampoules LED E27 — Résidence Cavalier',
    description: 'Remplacement stock ampoules hors service. 50 unités nécessaires.',
    statut: 'recue', priorite: 'normale', site_nom: 'Résidence Cavalier',
    demandeur_nom: 'Leroy P.', demandeur_email: 'leroy.p@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-038', designation_libre: '',
    quantite_demandee: 50, quantite_recue: 50, unite: 'unité',
    epona_sync_statut: 'envoye', epona_numero_commande: 'CMD-EPONA-2026-0298',
    epona_sync_at: '2026-05-10T11:00:00Z', epona_sync_date_envoi: '2026-05-10T11:00:00Z',
    date_besoin: '2026-05-15', date_commande: '2026-05-10', date_livraison_prevue: '2026-05-14',
    date_reception: '2026-05-14', fournisseur: 'Osram Direct', montant_estime_ht: 175.00, commentaire: 'Livraison conforme.',
    created_at: '2026-05-08T14:00:00Z', updated_at: '2026-05-14T10:00:00Z',
  },
  {
    id: 'd03', reference: 'DA-2026-003', titre: 'Câble H07VU 2.5mm² — urgence TGBT-A1',
    description: 'Intervention urgente tableau TGBT-A1. Câble manquant en stock.',
    statut: 'en_attente', priorite: 'critique', site_nom: 'Campus Lyon Manufacture',
    demandeur_nom: 'Laurent E.', demandeur_email: 'laurent.e@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-055', designation_libre: '',
    quantite_demandee: 2, quantite_recue: 0, unite: 'rouleau',
    epona_sync_statut: 'non_envoye', epona_numero_commande: '',
    epona_sync_at: null, epona_sync_date_envoi: null,
    date_besoin: '2026-05-29', date_commande: null, date_livraison_prevue: null,
    date_reception: null, fournisseur: '', montant_estime_ht: 90.00, commentaire: 'URGENT — intervention bloquée.',
    created_at: '2026-05-27T16:30:00Z', updated_at: '2026-05-27T16:30:00Z',
  },
  {
    id: 'd04', reference: 'DA-2026-004', titre: 'Joints EPDM — maintenance préventive Q2',
    description: 'Approvisionnement joints pour plan de maintenance préventif Q2.',
    statut: 'brouillon', priorite: 'faible', site_nom: 'Résidence Berlioz',
    demandeur_nom: 'Bernard C.', demandeur_email: 'bernard.c@crous-lyon.fr',
    intervention_liee_ref: '', designation_libre: '',
    quantite_demandee: 100, quantite_recue: 0, unite: 'sachet',
    epona_sync_statut: 'non_envoye', epona_numero_commande: '',
    epona_sync_at: null, epona_sync_date_envoi: null,
    date_besoin: '2026-06-15', date_commande: null, date_livraison_prevue: null,
    date_reception: null, fournisseur: 'Rexel', montant_estime_ht: 280.00, commentaire: '',
    created_at: '2026-05-26T10:00:00Z', updated_at: '2026-05-26T10:00:00Z',
  },
  {
    id: 'd05', reference: 'DA-2026-005', titre: 'Courroies B42 — lot 4 pièces CTA Berlioz',
    description: 'Rupture courroies CTA résidence Berlioz. Besoin urgent avant panne totale.',
    statut: 'bloquee', priorite: 'critique', site_nom: 'Résidence Berlioz',
    demandeur_nom: 'Bernard C.', demandeur_email: 'bernard.c@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-049', designation_libre: '',
    quantite_demandee: 4, quantite_recue: 0, unite: 'unité',
    epona_sync_statut: 'erreur', epona_numero_commande: 'CMD-EPONA-2026-0305',
    epona_sync_at: '2026-05-23T14:00:00Z', epona_sync_date_envoi: '2026-05-23T14:00:00Z',
    date_besoin: '2026-05-25', date_commande: '2026-05-23', date_livraison_prevue: '2026-05-28',
    date_reception: null, fournisseur: 'Thermocom', montant_estime_ht: 39.20, commentaire: 'Fournisseur en rupture stock — attente alternative.',
    created_at: '2026-05-22T09:00:00Z', updated_at: '2026-05-23T14:30:00Z',
  },
  {
    id: 'd06', reference: 'DA-2026-006', titre: 'Détecteurs fumée NF — Résidence Cavalier',
    description: 'Remplacement 8 détecteurs hors délai réglementaire. Contrôle SSI prévu 05/06.',
    statut: 'validee', priorite: 'haute', site_nom: 'Résidence Cavalier',
    demandeur_nom: 'Dupont A.', demandeur_email: 'dupont.a@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-044', designation_libre: '',
    quantite_demandee: 8, quantite_recue: 0, unite: 'unité',
    epona_sync_statut: 'en_cours', epona_numero_commande: '',
    epona_sync_at: null, epona_sync_date_envoi: '2026-05-28T08:00:00Z',
    date_besoin: '2026-06-03', date_commande: null, date_livraison_prevue: null,
    date_reception: null, fournisseur: 'Legrand', montant_estime_ht: 228.00, commentaire: 'Validé par responsable patrimoine.',
    created_at: '2026-05-24T11:00:00Z', updated_at: '2026-05-28T08:00:00Z',
  },
  {
    id: 'd07', reference: 'DA-2026-007', titre: 'Pompe circulation DN25 — panne Bron aile B',
    description: 'Pompe défaillante. Chauffage coupé sur aile B. Résidents impactés.',
    statut: 'commandee', priorite: 'critique', site_nom: 'Résidence Bron',
    demandeur_nom: 'Michel G.', demandeur_email: 'michel.g@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-058', designation_libre: '',
    quantite_demandee: 1, quantite_recue: 0, unite: 'unité',
    epona_sync_statut: 'envoye', epona_numero_commande: 'CMD-EPONA-2026-0318',
    epona_sync_at: '2026-05-27T15:00:00Z', epona_sync_date_envoi: '2026-05-27T15:00:00Z',
    date_besoin: '2026-05-30', date_commande: '2026-05-27', date_livraison_prevue: '2026-05-29',
    date_reception: null, fournisseur: 'Grundfos France', montant_estime_ht: 185.00, commentaire: 'Livraison express demandée.',
    created_at: '2026-05-27T09:00:00Z', updated_at: '2026-05-27T15:00:00Z',
  },
  {
    id: 'd08', reference: 'DA-2026-008', titre: 'Extincteurs CO2 2kg — vérification annuelle',
    description: 'Remplacement 5 extincteurs hors date de vérification annuelle.',
    statut: 'reception_partielle', priorite: 'haute', site_nom: 'Campus Lyon Manufacture',
    demandeur_nom: 'Martin D.', demandeur_email: 'martin.d@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-033', designation_libre: '',
    quantite_demandee: 5, quantite_recue: 3, unite: 'unité',
    epona_sync_statut: 'envoye', epona_numero_commande: 'CMD-EPONA-2026-0289',
    epona_sync_at: '2026-05-05T10:00:00Z', epona_sync_date_envoi: '2026-05-05T10:00:00Z',
    date_besoin: '2026-05-20', date_commande: '2026-05-05', date_livraison_prevue: '2026-05-15',
    date_reception: '2026-05-14', fournisseur: 'Sicli', montant_estime_ht: 335.00, commentaire: '3 reçus le 14/05. 2 en attente — rupture fournisseur.',
    created_at: '2026-05-03T09:00:00Z', updated_at: '2026-05-14T11:00:00Z',
  },
  {
    id: 'd09', reference: 'DA-2026-009', titre: 'Antigel concentré — préparation hiver N+1',
    description: 'Approvisionnement antigel pour maintenance préventive circuits chauffage.',
    statut: 'brouillon', priorite: 'faible', site_nom: 'Résidence Albert Thomas',
    demandeur_nom: 'Dupont A.', demandeur_email: 'dupont.a@crous-lyon.fr',
    intervention_liee_ref: '', designation_libre: '',
    quantite_demandee: 3, quantite_recue: 0, unite: 'bidon',
    epona_sync_statut: 'non_envoye', epona_numero_commande: '',
    epona_sync_at: null, epona_sync_date_envoi: null,
    date_besoin: '2026-09-15', date_commande: null, date_livraison_prevue: null,
    date_reception: null, fournisseur: 'Total', montant_estime_ht: 126.00, commentaire: 'Préparation stock automne.',
    created_at: '2026-05-28T07:00:00Z', updated_at: '2026-05-28T07:00:00Z',
  },
  {
    id: 'd10', reference: 'DA-2026-010', titre: 'Disjoncteurs 16A — audit réglementaire juin',
    description: 'Disjoncteurs pour remplacement planifié Q2. Audit réglementaire fin juin.',
    statut: 'en_attente', priorite: 'normale', site_nom: 'Résidence Mermoz',
    demandeur_nom: 'Laurent E.', demandeur_email: 'laurent.e@crous-lyon.fr',
    intervention_liee_ref: 'DI-2026-041', designation_libre: '',
    quantite_demandee: 10, quantite_recue: 0, unite: 'unité',
    epona_sync_statut: 'non_envoye', epona_numero_commande: '',
    epona_sync_at: null, epona_sync_date_envoi: null,
    date_besoin: '2026-06-10', date_commande: null, date_livraison_prevue: null,
    date_reception: null, fournisseur: 'Schneider Electric', montant_estime_ht: 189.00, commentaire: '',
    created_at: '2026-05-27T13:00:00Z', updated_at: '2026-05-27T13:00:00Z',
  },
];

// ── Mock data — Mouvements ────────────────────────────────────────────────────

export const MOCK_MOUVEMENTS: Mouvement[] = [
  { id: 'm01', article_designation: 'Filtre G4 600×600',            entrepot_nom: 'Atelier Central',          type_mvt: 'sortie',     quantite: 6,  reference_doc: 'DI-2026-042', auteur: 'Martin D.',  commentaire: 'Maintenance CTA B2',            created_at: '2026-05-28T07:45:00Z' },
  { id: 'm02', article_designation: 'Ampoule LED E27 9W',           entrepot_nom: 'Local Technique Cavalier', type_mvt: 'entree',     quantite: 50, reference_doc: 'DA-2026-002', auteur: 'Leroy P.',   commentaire: 'Réception commande Osram',      created_at: '2026-05-28T06:30:00Z' },
  { id: 'm03', article_designation: 'Pompe de circulation DN25',    entrepot_nom: 'Atelier Central',          type_mvt: 'sortie',     quantite: 1,  reference_doc: 'DI-2026-058', auteur: 'Michel G.',  commentaire: 'Urgent panne Bron',             created_at: '2026-05-27T16:00:00Z' },
  { id: 'm04', article_designation: 'Joint torique EPDM Ø20',      entrepot_nom: 'Réserve Berlioz',          type_mvt: 'entree',     quantite: 20, reference_doc: 'DA-2026-004', auteur: 'Bernard C.', commentaire: 'Réassort préventif',            created_at: '2026-05-27T10:20:00Z' },
  { id: 'm05', article_designation: 'Détecteur fumée NF EN 14604', entrepot_nom: 'Local Technique Cavalier', type_mvt: 'sortie',     quantite: 3,  reference_doc: 'DI-2026-044', auteur: 'Dupont A.',  commentaire: 'Remplacement zone A',           created_at: '2026-05-26T14:30:00Z' },
  { id: 'm06', article_designation: 'Filtre F7 500×500',            entrepot_nom: 'Atelier Nord',             type_mvt: 'sortie',     quantite: 5,  reference_doc: 'DI-2026-039', auteur: 'Dupont A.',  commentaire: 'CTA Albert Thomas',             created_at: '2026-05-26T09:00:00Z' },
  { id: 'm07', article_designation: 'Extincteur CO2 2kg ABC',       entrepot_nom: 'Atelier Central',          type_mvt: 'entree',     quantite: 3,  reference_doc: 'DA-2026-008', auteur: 'Martin D.',  commentaire: 'Réc. partielle Sicli',          created_at: '2026-05-25T11:00:00Z' },
  { id: 'm08', article_designation: 'Tube néon T8 36W',             entrepot_nom: 'Atelier Central',          type_mvt: 'inventaire', quantite: 15, reference_doc: 'INV-2026-05', auteur: 'Simon B.',   commentaire: 'Inventaire mensuel mai',        created_at: '2026-05-24T08:00:00Z' },
  { id: 'm09', article_designation: "Vanne d'arrêt 15/21",         entrepot_nom: 'Local Mermoz',             type_mvt: 'sortie',     quantite: 2,  reference_doc: 'DI-2026-051', auteur: 'Laurent E.', commentaire: 'Remplacement résidence Mermoz', created_at: '2026-05-23T15:00:00Z' },
  { id: 'm10', article_designation: 'Prise 2P+T 16A saillie',      entrepot_nom: 'Atelier Nord',             type_mvt: 'entree',     quantite: 20, reference_doc: 'CMD-2026-081',auteur: 'Dupont A.',  commentaire: 'Réassort commande groupée',     created_at: '2026-05-22T10:30:00Z' },
];

// ── KPIs ──────────────────────────────────────────────────────────────────────

export interface ApproKpis {
  ruptures: number;
  stocks_faibles: number;
  demandes_en_attente: number;
  commandes_en_cours: number;
  receptions_du_jour: number;
  sites_critiques: number;
  interventions_bloquees: number;
  montant_commandes_en_cours: number;
}

export function computeApproKpis(): ApproKpis {
  const today = new Date().toDateString();
  return {
    ruptures:                   MOCK_STOCKS.filter(s => s.statut === 'rupture').length,
    stocks_faibles:             MOCK_STOCKS.filter(s => s.statut === 'stock_faible').length,
    demandes_en_attente:        MOCK_DEMANDES.filter(d => d.statut === 'en_attente' || d.statut === 'brouillon').length,
    commandes_en_cours:         MOCK_DEMANDES.filter(d => d.statut === 'commandee' || d.statut === 'validee').length,
    receptions_du_jour:         MOCK_MOUVEMENTS.filter(m => m.type_mvt === 'entree' && new Date(m.created_at).toDateString() === today).length,
    sites_critiques:            new Set(MOCK_STOCKS.filter(s => s.statut === 'rupture').map(s => s.entrepot.site_nom)).size,
    interventions_bloquees:     MOCK_DEMANDES.filter(d => (d.statut === 'bloquee' || d.statut === 'en_attente') && d.intervention_liee_ref !== '').length,
    montant_commandes_en_cours: MOCK_DEMANDES.filter(d => d.statut === 'commandee').reduce((s, d) => s + (d.montant_estime_ht ?? 0), 0),
  };
}
