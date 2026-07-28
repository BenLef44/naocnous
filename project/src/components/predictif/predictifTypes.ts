// ─── Types & mock data for the Prédictif module ──────────────────────────────

export type CriticitePred = 'critique' | 'majeure' | 'mineure' | 'surveillance';
export type StatutPred =
  | 'detecte' | 'confirme' | 'faux_positif' | 'surveiller'
  | 'en_traitement' | 'resolu' | 'ignore';
export type CategoriePred =
  | 'technique' | 'rh' | 'reglementaire' | 'energie' | 'budget'
  | 'carbone' | 'assurance' | 'utilisateurs' | 'stock' | 'logistique';

export interface Prediction {
  id: string;
  reference: string;
  titre: string;
  description: string;
  justification_ia: string;
  categorie: CategoriePred;
  criticite: CriticitePred;
  statut: StatutPred;
  probabilite: number;       // 0-100
  score_ia: number;          // 0-100
  confiance_ia: number;      // 0-100
  date_estimee: string;      // ISO date
  source: string;
  equipement: string;
  batiment: string;
  residence: string;
  site: string;
  responsable: string;
  cout_estime: number | null;
  impact_utilisateur: 'faible' | 'moyen' | 'fort' | 'critique';
  impact_energetique: boolean;
  impact_reglementaire: boolean;
  impact_carbone: boolean;
  action_recommandee: string;
  created_at: string;
}

// ─── Config criticité ─────────────────────────────────────────────────────────

export const CRITICITE_PRED_CFG: Record<CriticitePred, {
  label: string; icon: string; bg: string; text: string; border: string;
  dot: string; badgeBg: string; hex: string;
}> = {
  critique:    { label: 'Critique',    icon: '🚨', bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500',     badgeBg: 'bg-red-100',    hex: '#ef4444' },
  majeure:     { label: 'Majeure',     icon: '⚠️', bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500',  badgeBg: 'bg-orange-100', hex: '#f97316' },
  mineure:     { label: 'Mineure',     icon: '🔎', bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-300',   dot: 'bg-blue-500',    badgeBg: 'bg-blue-100',   hex: '#3b82f6' },
  surveillance:{ label: 'Surveillance',icon: '👁️', bg: 'bg-slate-50',   text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400',   badgeBg: 'bg-slate-100',  hex: '#94a3b8' },
};

// ─── Config statut ────────────────────────────────────────────────────────────

export const STATUT_PRED_CFG: Record<StatutPred, {
  label: string; bg: string; text: string; border: string; order: number;
}> = {
  detecte:       { label: 'Détecté',         bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    order: 0 },
  confirme:      { label: 'Confirmé',         bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   order: 1 },
  surveiller:    { label: 'À surveiller',     bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     order: 2 },
  en_traitement: { label: 'En traitement',    bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  order: 3 },
  resolu:        { label: 'Résolu',           bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', order: 4 },
  faux_positif:  { label: 'Faux positif',     bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   order: 5 },
  ignore:        { label: 'Ignoré',           bg: 'bg-slate-50',   text: 'text-slate-400',   border: 'border-slate-200',   order: 6 },
};

// ─── Config catégorie ─────────────────────────────────────────────────────────

export const CATEGORIE_PRED_CFG: Record<CategoriePred, {
  label: string; icon: string; color: string; bg: string; border: string;
}> = {
  technique:      { label: 'Technique',      icon: '⚙️',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  rh:             { label: 'RH',             icon: '👥',  color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
  reglementaire:  { label: 'Réglementaire',  icon: '📋',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  energie:        { label: 'Énergie',        icon: '⚡',  color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-200'  },
  budget:         { label: 'Budget',         icon: '💶',  color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200'    },
  carbone:        { label: 'Carbone',        icon: '🌿',  color: 'text-lime-700',    bg: 'bg-lime-50',    border: 'border-lime-200'    },
  assurance:      { label: 'Assurance',      icon: '🛡️',  color: 'text-slate-700',   bg: 'bg-slate-100',  border: 'border-slate-200'   },
  utilisateurs:   { label: 'Utilisateurs',   icon: '🏠',  color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-200'    },
  stock:          { label: 'Stock',          icon: '📦',  color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200'  },
  logistique:     { label: 'Logistique',     icon: '🚚',  color: 'text-cyan-700',    bg: 'bg-cyan-50',    border: 'border-cyan-200'    },
};

// ─── Mock predictions ─────────────────────────────────────────────────────────

export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: 'pred-001', reference: 'PRED-2026-001',
    titre: 'Risque panne chaudière — Cavalier B2',
    description: 'La chaudière principale du bâtiment B2 montre des signes de dégradation accélérée. Température de retour anormale depuis 18 jours.',
    justification_ia: 'Analyse MTBF : la chaudière a dépassé son seuil critique (8 400 h). Corrélation avec données météo (vague de froid prévue) et historique de 3 pannes similaires dans le parc.',
    categorie: 'technique', criticite: 'critique', statut: 'confirme',
    probabilite: 87, score_ia: 91, confiance_ia: 89,
    date_estimee: '2026-06-12',
    source: 'IoT · GTB · Historique',
    equipement: 'Chaudière gaz GAZ-003', batiment: 'Bâtiment B2',
    residence: 'Résidence Jacques Cavalier', site: 'Campus Centre / Lyon 6',
    responsable: 'Martin D.',
    cout_estime: 18500,
    impact_utilisateur: 'critique', impact_energetique: true, impact_reglementaire: true, impact_carbone: true,
    action_recommandee: 'Planifier remplacement préventif avant mi-juin. Commander pièces sous 5 jours.',
    created_at: '2026-05-15T08:22:00Z',
  },
  {
    id: 'pred-002', reference: 'PRED-2026-002',
    titre: 'Habilitation électrique HTA expirante — 3 techniciens',
    description: 'Les habilitations HTA de Martin D., Leroy P. et Bernard C. expirent dans 28 jours. Aucune session de renouvellement planifiée.',
    justification_ia: 'Croisement RH × planning interventions : 4 interventions HTA sont planifiées semaine 32, nécessitant obligatoirement ces habilitations.',
    categorie: 'rh', criticite: 'majeure', statut: 'detecte',
    probabilite: 100, score_ia: 97, confiance_ia: 99,
    date_estimee: '2026-06-25',
    source: 'RH · Planning · Réglementation',
    equipement: 'TGBT / Transformateur', batiment: 'Multi-bâtiments',
    residence: 'Multi-résidences', site: 'CROUS Lyon',
    responsable: 'Simon B.',
    cout_estime: 4200,
    impact_utilisateur: 'fort', impact_energetique: false, impact_reglementaire: true, impact_carbone: false,
    action_recommandee: 'Planifier session recyclage HTA d\'urgence. Contacter organisme formateur sous 48h.',
    created_at: '2026-05-18T10:05:00Z',
  },
  {
    id: 'pred-003', reference: 'PRED-2026-003',
    titre: 'Dérive énergétique anormale — Bâtiment A1 La Doua',
    description: 'Consommation électrique +34% vs N-1 sur les 21 derniers jours. Drift continu détecté sur le sous-compteur éclairage.',
    justification_ia: 'Analyse courbe de charge vs occupation bâtiment : surconsommation détectée hors plages d\'occupation. Probable défaut de pilotage éclairage ou fuite circuit.',
    categorie: 'energie', criticite: 'majeure', statut: 'surveiller',
    probabilite: 78, score_ia: 83, confiance_ia: 81,
    date_estimee: '2026-06-01',
    source: 'Télérelève · IoT · Comptage',
    equipement: 'Compteur électrique ELB-A1-03', batiment: 'Bâtiment A1',
    residence: 'Résidence Jussieu', site: 'Campus La Doua / Villeurbanne',
    responsable: 'Laurent E.',
    cout_estime: 2800,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Audit éclairage urgence. Vérifier programmation horaire GTB.',
    created_at: '2026-05-20T14:30:00Z',
  },
  {
    id: 'pred-004', reference: 'PRED-2026-004',
    titre: 'Contrôle incendie SSI à risque — Commission juillet',
    description: 'Le SSI du bâtiment principal présente 3 non-conformités non levées depuis le dernier passage. Commission sécurité prévue dans 47 jours.',
    justification_ia: 'Analyse registre sécurité × historique commissions : taux de levée des observations < 60% à J-45. Risque avis défavorable élevé.',
    categorie: 'reglementaire', criticite: 'critique', statut: 'confirme',
    probabilite: 82, score_ia: 88, confiance_ia: 85,
    date_estimee: '2026-07-08',
    source: 'Registre sécurité · Commission · DTA',
    equipement: 'Centrale SSI SSI-VOLT-01', batiment: 'Bâtiment principal',
    residence: 'Résidence Voltaire', site: 'Campus Centre / Lyon 6',
    responsable: 'Dupont A.',
    cout_estime: 9200,
    impact_utilisateur: 'critique', impact_energetique: false, impact_reglementaire: true, impact_carbone: false,
    action_recommandee: 'Lever les 3 observations sous 21 jours. Planifier visite pré-commission.',
    created_at: '2026-05-21T09:15:00Z',
  },
  {
    id: 'pred-005', reference: 'PRED-2026-005',
    titre: 'Rupture stock filtres CTA — Délai fournisseur 6 semaines',
    description: 'Stock filtres G4/F7 CTA insuffisant pour campagne maintenance été. Délai fournisseur habituel : 6 semaines. Campagne dans 5 semaines.',
    justification_ia: 'Croisement stocks × planning maintenance × délais fournisseurs : fenêtre critique identifiée. 12 CTA concernées sur 4 résidences.',
    categorie: 'stock', criticite: 'majeure', statut: 'detecte',
    probabilite: 95, score_ia: 93, confiance_ia: 94,
    date_estimee: '2026-07-01',
    source: 'Stocks · Planning · Fournisseurs',
    equipement: 'CTA / VMC (12 unités)', batiment: 'Multi-bâtiments',
    residence: 'Multi-résidences', site: 'CROUS Lyon',
    responsable: 'Bernard C.',
    cout_estime: 6400,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: false, impact_carbone: false,
    action_recommandee: 'Commander filtres en urgence (fournisseur alternatif). Délai réduit à 2 semaines.',
    created_at: '2026-05-22T11:45:00Z',
  },
  {
    id: 'pred-006', reference: 'PRED-2026-006',
    titre: 'Surcharge techniciens — Semaines 28-29',
    description: 'Capacité d\'intervention dépassée de 40% sur les semaines 28 et 29 suite à congés estivaux et 2 demandes urgentes entrantes.',
    justification_ia: 'Analyse planning RH : 3 techniciens en congé simultanément. Croisement avec backlog DI : 18 interventions planifiées vs capacité de 12.',
    categorie: 'rh', criticite: 'majeure', statut: 'surveiller',
    probabilite: 90, score_ia: 85, confiance_ia: 88,
    date_estimee: '2026-07-07',
    source: 'RH · Planning · DI',
    equipement: '—', batiment: '—',
    residence: 'Multi-résidences', site: 'CROUS Lyon',
    responsable: 'Simon B.',
    cout_estime: null,
    impact_utilisateur: 'fort', impact_energetique: false, impact_reglementaire: false, impact_carbone: false,
    action_recommandee: 'Replanifier 6 DI non-urgentes. Solliciter prestataire Sabeko en renfort.',
    created_at: '2026-05-23T08:00:00Z',
  },
  {
    id: 'pred-007', reference: 'PRED-2026-007',
    titre: 'Budget CAPEX 2027 — Dépassement estimé +18%',
    description: 'Projection CAPEX 2027 sur la base des tendances actuelles : dépassement estimé +18% vs enveloppe votée. Remplacement chaudières + ascenseurs concentrés.',
    justification_ia: 'Modèle financier : inflation pièces +7%/an, 4 équipements atteignant fin de vie simultanément en 2027, subventions CEE insuffisantes pour compenser.',
    categorie: 'budget', criticite: 'majeure', statut: 'detecte',
    probabilite: 74, score_ia: 79, confiance_ia: 76,
    date_estimee: '2027-01-01',
    source: 'Historique · PPI · Inflation · CEE',
    equipement: 'Multi-équipements', batiment: '—',
    residence: '—', site: 'CROUS Lyon',
    responsable: 'Martin D.',
    cout_estime: 142000,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: true, impact_carbone: true,
    action_recommandee: 'Arbitrage PPI urgent. Étudier financement CEE alternatif. Report 2 équipements non-critiques.',
    created_at: '2026-05-24T10:20:00Z',
  },
  {
    id: 'pred-008', reference: 'PRED-2026-008',
    titre: 'Ascenseur — Probabilité panne mécanisme porte',
    description: 'L\'ascenseur ASC-CES-01 présente un taux d\'erreur porte en hausse de 240% sur 60 jours. Risque immobilisation probable avant mi-juillet.',
    justification_ia: 'Analyse IoT capteurs portes : fréquence anomalies × vibrations × historique composant. Corrélation avec 2 pannes similaires sur parc en 2024-2025.',
    categorie: 'technique', criticite: 'majeure', statut: 'confirme',
    probabilite: 81, score_ia: 86, confiance_ia: 83,
    date_estimee: '2026-07-15',
    source: 'IoT · GTB · Historique pannes',
    equipement: 'Ascenseur ASC-CES-01', batiment: 'Bâtiment C',
    residence: 'Résidence Aimé Césaire', site: 'Campus Saint-Priest',
    responsable: 'Leroy P.',
    cout_estime: 3800,
    impact_utilisateur: 'fort', impact_energetique: false, impact_reglementaire: true, impact_carbone: false,
    action_recommandee: 'Maintenance préventive mécanisme porte + inspection APAVE anticipée.',
    created_at: '2026-05-25T07:55:00Z',
  },
  {
    id: 'pred-009', reference: 'PRED-2026-009',
    titre: 'Dépassement budget carbone Q3 2026',
    description: 'Projection CO₂ Q3 : +22% vs objectif Décret Tertiaire. Tendances chauffage et climatisation défavorables.',
    justification_ia: 'Modèle carbone × rendement équipements × consommations réelles × mix énergétique RTE : dépassement quasi-certain si aucune action sous 45 jours.',
    categorie: 'carbone', criticite: 'mineure', statut: 'surveiller',
    probabilite: 69, score_ia: 72, confiance_ia: 70,
    date_estimee: '2026-10-01',
    source: 'Télérelève · Décret Tertiaire · RTE',
    equipement: '—', batiment: '—',
    residence: '—', site: 'CROUS Lyon',
    responsable: 'Laurent E.',
    cout_estime: null,
    impact_utilisateur: 'faible', impact_energetique: true, impact_reglementaire: true, impact_carbone: true,
    action_recommandee: 'Plan de sobriété estivale. Ajustement consignes CVC sur 8 résidences.',
    created_at: '2026-05-26T13:10:00Z',
  },
  {
    id: 'pred-010', reference: 'PRED-2026-010',
    titre: 'Pic fréquentation — Examens juin : risque saturation',
    description: 'Période examens 2-20 juin : fréquentation bâtiments +65%. Risque saturation espaces communs + pannes équipements haute sollicitation.',
    justification_ia: 'Calendrier universitaire × historique incidents examens × IoT occupation : fenêtre à très haut risque. 3 incidents majeurs lors examens 2025.',
    categorie: 'utilisateurs', criticite: 'mineure', statut: 'detecte',
    probabilite: 88, score_ia: 84, confiance_ia: 87,
    date_estimee: '2026-06-02',
    source: 'Calendrier · IoT · Historique',
    equipement: '—', batiment: '—',
    residence: 'Multi-résidences', site: 'CROUS Lyon',
    responsable: 'Moreau F.',
    cout_estime: null,
    impact_utilisateur: 'fort', impact_energetique: true, impact_reglementaire: false, impact_carbone: false,
    action_recommandee: 'Renforcer équipe astreinte semaines 23-24. Vérifier ascenseurs + sanitaires J-7.',
    created_at: '2026-05-27T16:00:00Z',
  },
  {
    id: 'pred-011', reference: 'PRED-2026-011',
    titre: 'Refus assurance — Risque non-conformité incendie',
    description: 'Assureur a signalé 2 ERP avec non-conformités incendie non levées. Renouvellement contrat assurance prévu en septembre.',
    justification_ia: 'Analyse contrats assurance × registre sécurité × historique sinistres : clause d\'exclusion activable si observations non levées avant renouvellement.',
    categorie: 'assurance', criticite: 'critique', statut: 'confirme',
    probabilite: 73, score_ia: 78, confiance_ia: 75,
    date_estimee: '2026-09-01',
    source: 'Contrats · Registre · Sinistres',
    equipement: 'SSI + Colonnes sèches', batiment: 'Multi-bâtiments',
    residence: 'Multi-résidences', site: 'CROUS Lyon',
    responsable: 'Dupont A.',
    cout_estime: 85000,
    impact_utilisateur: 'critique', impact_energetique: false, impact_reglementaire: true, impact_carbone: false,
    action_recommandee: 'Lever toutes observations incendie avant fin juillet. Informer assureur.',
    created_at: '2026-05-27T09:30:00Z',
  },
  {
    id: 'pred-012', reference: 'PRED-2026-012',
    titre: 'Indisponibilité véhicule utilitaire — Semaine 26',
    description: 'Le VU principal (Lyon-01) est en révision programmée semaine 26. Or 3 interventions nécessitent transport matériel lourd cette semaine.',
    justification_ia: 'Croisement planning VU × interventions planifiées × masse matériel : conflit logistique détecté. Aucun VU de substitution disponible.',
    categorie: 'logistique', criticite: 'mineure', statut: 'surveiller',
    probabilite: 100, score_ia: 90, confiance_ia: 95,
    date_estimee: '2026-06-22',
    source: 'Parc véhicules · Planning · Matériel',
    equipement: '—', batiment: '—',
    residence: '—', site: 'CROUS Lyon',
    responsable: 'Bernard C.',
    cout_estime: 480,
    impact_utilisateur: 'faible', impact_energetique: false, impact_reglementaire: false, impact_carbone: false,
    action_recommandee: 'Louer VU de remplacement semaine 26 (budget ~480€). Valider avec responsable.',
    created_at: '2026-05-28T07:00:00Z',
  },

  // ─── Anomalies fluides ────────────────────────────────────────────────────────

  {
    id: 'pred-013', reference: 'PRED-2026-013',
    titre: 'Fuite réseau eau froide — Surconsommation +48% Cavalier',
    description: 'La consommation d\'eau froide de la Résidence Cavalier dépasse de 48% la référence mensuelle depuis 12 jours. Volume non facturé en hausse continue. Présence d\'humidité signalée en chaufferie.',
    justification_ia: 'Analyse télérelève eau × courbe de nuit (débit plancher non nul) : fuite active confirmée. Perte estimée à 4 m³/h hors plages d\'utilisation. Corrélation avec capteur humidité chaufferie B2.',
    categorie: 'energie', criticite: 'critique', statut: 'confirme',
    probabilite: 94, score_ia: 96, confiance_ia: 92,
    date_estimee: '2026-06-05',
    source: 'Télérelève eau · IoT · Capteur humidité',
    equipement: 'Réseau EF — Nourrice B2', batiment: 'Bâtiment B2',
    residence: 'Résidence Jacques Cavalier', site: 'Campus Centre / Lyon 6',
    responsable: 'Leroy P.',
    cout_estime: 7200,
    impact_utilisateur: 'fort', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Intervenir sous 48h pour diagnostic réseau EF en chaufferie B2. Couper vanne principale si fuite confirmée.',
    created_at: '2026-05-24T06:15:00Z',
  },
  {
    id: 'pred-014', reference: 'PRED-2026-014',
    titre: 'Dérive consommation gaz — Chaudière CH-JAC-02 inefficiente',
    description: 'La chaudière CH-JAC-02 présente un écart de rendement de -19% vs valeur nominale. Consommation gaz anormalement élevée pour les DJU observés, indicateur d\'un problème de combustion ou d\'encrassement échangeur.',
    justification_ia: 'Modèle de régression DJU × consommation gaz : résidus positifs croissants depuis 35 jours. Ratio kWh/DJU hors plage normale à 3σ. Historique similaire sur CH-VOL-01 ayant précédé un remplacement brûleur.',
    categorie: 'energie', criticite: 'majeure', statut: 'detecte',
    probabilite: 82, score_ia: 85, confiance_ia: 80,
    date_estimee: '2026-06-18',
    source: 'Télérelève gaz · GTB · Météo DJU',
    equipement: 'Chaudière gaz CH-JAC-02', batiment: 'Bâtiment A',
    residence: 'Résidence Jacques Cavalier', site: 'Campus Centre / Lyon 6',
    responsable: 'Martin D.',
    cout_estime: 3400,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Planifier maintenance préventive : nettoyage échangeur + analyse de combustion. Prévoir remplacement brûleur si rendement < 88%.',
    created_at: '2026-05-20T09:40:00Z',
  },
  {
    id: 'pred-015', reference: 'PRED-2026-015',
    titre: 'Anomalie électrique récurrente — Disjoncteur TGBT-A1-04',
    description: 'Le disjoncteur TGBT-A1-04 (circuit prises cuisine RU) a déclenché 7 fois en 30 jours. Les réarmements manuels répétés masquent un défaut électrique sous-jacent non traité.',
    justification_ia: 'Analyse registre déclenchements × courbes de charge : pattern de surcharge cohérent avec équipement défectueux en cuisine. Signature harmonique anormale détectée sur analyseur réseau. Risque d\'arc électrique progressif.',
    categorie: 'energie', criticite: 'critique', statut: 'confirme',
    probabilite: 88, score_ia: 92, confiance_ia: 87,
    date_estimee: '2026-06-08',
    source: 'GTB · Analyseur réseau · Registre sécurité',
    equipement: 'TGBT — Disjoncteur A1-04', batiment: 'Bâtiment A1',
    residence: 'Résidence Jussieu', site: 'Campus La Doua / Villeurbanne',
    responsable: 'Laurent E.',
    cout_estime: 5800,
    impact_utilisateur: 'critique', impact_energetique: true, impact_reglementaire: true, impact_carbone: false,
    action_recommandee: 'Diagnostic électrique urgence circuit A1-04. Identifier source surcharge (équipement cuisine). Remplacer disjoncteur si usé. Vérifier continuité mise à la terre.',
    created_at: '2026-05-22T14:20:00Z',
  },
  {
    id: 'pred-016', reference: 'PRED-2026-016',
    titre: 'Surconsommation eau chaude sanitaire — ECS Voltaire +62%',
    description: 'La production ECS de la résidence Voltaire dépasse les références historiques de 62% depuis 3 semaines. Aucune variation d\'occupation détectée. Suspect : perte thermique sur bouclage ou clapet anti-retour défaillant.',
    justification_ia: 'Analyse bilan énergie thermique × compteur ECS × température extérieure : déséquilibre constaté entre énergie injectée et besoins estimés. Bouclage ECS maintenu à 55°C mais retour à 38°C indique pertes anormales.',
    categorie: 'energie', criticite: 'majeure', statut: 'surveiller',
    probabilite: 76, score_ia: 80, confiance_ia: 77,
    date_estimee: '2026-06-25',
    source: 'Télérelève ECS · GTB · IoT température',
    equipement: 'Production ECS ECS-VOLT-01', batiment: 'Bâtiment principal',
    residence: 'Résidence Voltaire', site: 'Campus Centre / Lyon 6',
    responsable: 'Martin D.',
    cout_estime: 4100,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Audit bouclage ECS : vérifier clapets anti-retour, calorifugeage canalisations et réglage thermostat production. Envisager remplacement vanne mélangeuse.',
    created_at: '2026-05-23T11:05:00Z',
  },
  {
    id: 'pred-017', reference: 'PRED-2026-017',
    titre: 'Groupe froid RU Manu — COP dégradé, consommation +31%',
    description: 'Le groupe froid de la cuisine du Restaurant Universitaire affiche un COP de 1.8 au lieu de 3.2 nominal. La consommation électrique du groupe a progressé de 31% en 45 jours à charge identique.',
    justification_ia: 'Monitoring performance groupe froid × données process cuisine × températures ambiantes : baisse de COP inexpliquée par la météo seule. Hypothèse : fuite frigorigène ou encrassement condenseur. Analyse vibrations moteur compresseur anormale.',
    categorie: 'energie', criticite: 'majeure', statut: 'confirme',
    probabilite: 85, score_ia: 88, confiance_ia: 84,
    date_estimee: '2026-06-15',
    source: 'IoT process · Comptage électrique · Vibrations',
    equipement: 'Groupe froid GF-MANU-01', batiment: 'Restaurant Universitaire',
    residence: 'Campus Manufacture des Tabacs', site: 'Campus Manufacture / Lyon 3',
    responsable: 'Bernard C.',
    cout_estime: 8900,
    impact_utilisateur: 'fort', impact_energetique: true, impact_reglementaire: true, impact_carbone: true,
    action_recommandee: 'Contrôle niveau frigorigène + nettoyage condenseur en urgence. Si fuite confirmée, intervention technicien certifié F-Gaz sous 72h.',
    created_at: '2026-05-21T08:30:00Z',
  },
  {
    id: 'pred-018', reference: 'PRED-2026-018',
    titre: 'Anomalie comptage eau — Fuite nappe St-Priest bâtiment D',
    description: 'Lecture nocturne du compteur eau bâtiment D indique un débit résiduel de 0.8 m³/h entre 2h et 5h. Aucun usage prévu sur cette plage. Suspecte : fuite réseau enterré ou vanne défaillante.',
    justification_ia: 'Analyse courbe de débit nocturne (Minimum Night Flow) : seuil MNF dépassé 18 nuits consécutives. Méthode IWA de détection de fuite : volume perdu estimé à ~130 m³/semaine. Absence de signalement usager écarte une consommation légitime.',
    categorie: 'energie', criticite: 'majeure', statut: 'detecte',
    probabilite: 91, score_ia: 89, confiance_ia: 90,
    date_estimee: '2026-06-10',
    source: 'Télérelève eau · Analyse MNF · IoT',
    equipement: 'Réseau EP — Bâtiment D', batiment: 'Bâtiment D',
    residence: 'Résidence Aimé Césaire', site: 'Campus Saint-Priest',
    responsable: 'Leroy P.',
    cout_estime: 5500,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Recherche de fuite par corrélation acoustique sur réseau enterré bâtiment D. Isoler tronçons suspects. Intervention prestataire détection.',
    created_at: '2026-05-25T05:00:00Z',
  },
  {
    id: 'pred-019', reference: 'PRED-2026-019',
    titre: 'Pic consommation électrique nocturne — Résidence La Doua',
    description: 'Depuis 8 jours, un pic de consommation électrique anormal de 42 kW est enregistré chaque nuit entre 23h et 1h sur le sous-compteur résidence La Doua. Aucun équipement planifié sur cette plage.',
    justification_ia: 'Analyse courbe de charge nocturne × inventaire équipements × plannings : pic non imputable aux équipements déclarés. Pattern répétable suggère équipement non déclaré ou consommation parasite (résistance chauffage bloquée, pompe de circulation défaillante en marche forcée).',
    categorie: 'energie', criticite: 'mineure', statut: 'surveiller',
    probabilite: 72, score_ia: 74, confiance_ia: 71,
    date_estimee: '2026-07-01',
    source: 'Télérelève électricité · Analyse charge · GTB',
    equipement: 'Compteur Résidence EL-DOUA-01', batiment: 'Multi-bâtiments',
    residence: 'Résidence Jussieu', site: 'Campus La Doua / Villeurbanne',
    responsable: 'Laurent E.',
    cout_estime: 1800,
    impact_utilisateur: 'faible', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Audit nocturne pour identification équipement source. Vérifier programmation GTB et pompes de circulation. Installer sous-compteur temporaire si nécessaire.',
    created_at: '2026-05-26T07:20:00Z',
  },
  {
    id: 'pred-020', reference: 'PRED-2026-020',
    titre: 'Dérive thermique VMC double-flux — Rendement échangeur -28%',
    description: 'Le rendement de l\'échangeur thermique de la VMC double-flux résidence Cavalier est passé de 82% à 54% en 2 mois. Impact direct sur la facture chauffage et la qualité d\'air intérieur.',
    justification_ia: 'Monitoring températures soufflage / reprise / extérieur : calcul rendement échangeur en temps réel. Baisse continue corrélée avec colmatage probable des filtres ou bypassage échangeur intempestif. Consommation chauffage compensatoire +15% estimée.',
    categorie: 'energie', criticite: 'mineure', statut: 'detecte',
    probabilite: 88, score_ia: 82, confiance_ia: 85,
    date_estimee: '2026-07-10',
    source: 'IoT température · GTB · Monitoring énergie',
    equipement: 'VMC DF VMC-CAV-03', batiment: 'Bâtiment A',
    residence: 'Résidence Jacques Cavalier', site: 'Campus Centre / Lyon 6',
    responsable: 'Martin D.',
    cout_estime: 1200,
    impact_utilisateur: 'moyen', impact_energetique: true, impact_reglementaire: false, impact_carbone: true,
    action_recommandee: 'Remplacement filtres G4/F7 VMC-CAV-03 + nettoyage échangeur à contre-courant. Vérifier servo-moteur bypass échangeur.',
    created_at: '2026-05-27T10:00:00Z',
  },
];

// ─── KPI aggregates ───────────────────────────────────────────────────────────

export function computeKpis(preds: Prediction[]) {
  const active = preds.filter(p => p.statut !== 'resolu' && p.statut !== 'ignore' && p.statut !== 'faux_positif');
  return {
    total:            preds.length,
    critiques:        active.filter(p => p.criticite === 'critique').length,
    majeures:         active.filter(p => p.criticite === 'majeure').length,
    mineures:         active.filter(p => p.criticite === 'mineure').length,
    technique:        active.filter(p => p.categorie === 'technique').length,
    rh:               active.filter(p => p.categorie === 'rh').length,
    reglementaire:    active.filter(p => p.categorie === 'reglementaire').length,
    energie:          active.filter(p => p.categorie === 'energie').length,
    budget:           active.filter(p => p.categorie === 'budget').length,
    scorePredictif:   Math.round(active.reduce((s, p) => s + p.score_ia, 0) / (active.length || 1)),
    coutTotal:        active.reduce((s, p) => s + (p.cout_estime ?? 0), 0),
    probMoyenne:      Math.round(active.reduce((s, p) => s + p.probabilite, 0) / (active.length || 1)),
  };
}

// ─── Data sources sync status ─────────────────────────────────────────────────

export const SYNC_SOURCES = [
  { key: 'iot',      label: 'IoT',           icon: '📡', ok: true,  lag: '2 min'  },
  { key: 'rh',       label: 'RH',            icon: '👥', ok: true,  lag: '1 h'    },
  { key: 'regle',    label: 'Réglementation',icon: '📋', ok: true,  lag: '15 min' },
  { key: 'stocks',   label: 'Stocks',        icon: '📦', ok: false, lag: '—'      },
  { key: 'meteo',    label: 'Météo',         icon: '🌤️', ok: true,  lag: '10 min' },
  { key: 'reseaux',  label: 'Réseaux',       icon: '🔌', ok: true,  lag: '30 min' },
  { key: 'energie',  label: 'Énergie',       icon: '⚡', ok: true,  lag: '5 min'  },
];

// ─── Multi-risk timeline data ─────────────────────────────────────────────────

export const RISK_TIMELINE = [
  { month: 'Jan', technique: 42, regle: 28, rh: 18, energie: 35, budget: 22, utilisateurs: 30, carbone: 20 },
  { month: 'Fév', technique: 38, regle: 31, rh: 22, energie: 40, budget: 25, utilisateurs: 28, carbone: 22 },
  { month: 'Mar', technique: 45, regle: 35, rh: 20, energie: 32, budget: 28, utilisateurs: 35, carbone: 25 },
  { month: 'Avr', technique: 52, regle: 38, rh: 25, energie: 28, budget: 30, utilisateurs: 42, carbone: 28 },
  { month: 'Mai', technique: 61, regle: 44, rh: 32, energie: 38, budget: 38, utilisateurs: 55, carbone: 32 },
  { month: 'Jun', technique: 74, regle: 52, rh: 45, energie: 45, budget: 42, utilisateurs: 68, carbone: 38 },
  { month: 'Jul', technique: 65, regle: 48, rh: 52, energie: 50, budget: 45, utilisateurs: 72, carbone: 42 },
  { month: 'Aoû', technique: 58, regle: 42, rh: 48, energie: 44, budget: 40, utilisateurs: 60, carbone: 38 },
  { month: 'Sep', technique: 55, regle: 58, rh: 38, energie: 38, budget: 52, utilisateurs: 48, carbone: 35 },
  { month: 'Oct', technique: 62, regle: 62, rh: 35, energie: 55, budget: 58, utilisateurs: 40, carbone: 40 },
  { month: 'Nov', technique: 70, regle: 55, rh: 30, energie: 65, budget: 62, utilisateurs: 35, carbone: 45 },
  { month: 'Déc', technique: 75, regle: 50, rh: 28, energie: 72, budget: 68, utilisateurs: 30, carbone: 48 },
];

export const RISK_COLORS: Record<string, string> = {
  technique:    '#3b82f6',
  regle:        '#10b981',
  rh:           '#8b5cf6',
  energie:      '#eab308',
  budget:       '#14b8a6',
  utilisateurs: '#ec4899',
  carbone:      '#84cc16',
};

// ─── Financial projection ─────────────────────────────────────────────────────

export const FINANCIAL_PROJECTION = [
  { year: '2024', capex: 320, opex: 185, energie: 92, carbone_cost: 18 },
  { year: '2025', capex: 348, opex: 198, energie: 98, carbone_cost: 21 },
  { year: '2026', capex: 375, opex: 215, energie: 108, carbone_cost: 25 },
  { year: '2027', capex: 442, opex: 228, energie: 118, carbone_cost: 30 },
  { year: '2028', capex: 398, opex: 235, energie: 112, carbone_cost: 28 },
  { year: '2029', capex: 365, opex: 242, energie: 105, carbone_cost: 24 },
];
