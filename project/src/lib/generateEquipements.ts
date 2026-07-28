// Générateur algorithmique d'équipements — CROUS Lyon
// Produit N équipements réalistes répartis sur 3 niveaux : résidence, étage, logement.
// Utilise un PRNG seedé (mulberry32) pour des données stables entre les renders.

export type NiveauEquipement = 'residence' | 'etage' | 'logement';

export interface EquipementGlobal {
  id: string;
  identifiant: string;
  designation: string;
  categorie: string;
  sous_categorie?: string;
  etat: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
  date_mise_en_service?: string;
  caracteristiques?: Record<string, unknown>;
  niveau: NiveauEquipement;
  site_label: string;
  sous_niveau_label?: string;
}

// ─── PRNG seedé (mulberry32) ──────────────────────────────────────────────────

function makePrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function randDate(rng: () => number, yearMin: number, yearMax: number): string {
  const y = randInt(rng, yearMin, yearMax);
  const m = randInt(rng, 1, 12).toString().padStart(2, '0');
  const d = randInt(rng, 1, 28).toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addYears(date: string, years: number): string {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

// ─── Résidences CROUS Lyon ────────────────────────────────────────────────────

interface ResidenceDef {
  code: string;
  label: string;
  site: string;
  nb_etages: number;
  logements_par_etage: number;
}

const RESIDENCES: ResidenceDef[] = [
  // Campus La Doua / Villeurbanne
  { code: 'JUSS',  label: 'Résidence Jussieu',           site: 'Campus La Doua / Villeurbanne', nb_etages: 7, logements_par_etage: 14 },
  { code: 'ANTO',  label: 'Résidence Les Antonins',       site: 'Campus La Doua / Villeurbanne', nb_etages: 5, logements_par_etage: 10 },
  { code: 'PUVIS', label: 'Résidence Puvis de Chavannes', site: 'Campus La Doua / Villeurbanne', nb_etages: 6, logements_par_etage: 12 },
  { code: 'EINST', label: 'Résidence Einstein',           site: 'Campus La Doua / Villeurbanne', nb_etages: 5, logements_par_etage: 10 },
  { code: 'JSSTU', label: 'Résidence Jussieu Studios',    site: 'Campus La Doua / Villeurbanne', nb_etages: 4, logements_par_etage: 20 },
  { code: 'ARCH',  label: 'Résidence Archimède',          site: 'Campus La Doua / Villeurbanne', nb_etages: 6, logements_par_etage: 12 },
  { code: 'ALTH',  label: 'Résidence Althéa',             site: 'Campus La Doua / Villeurbanne', nb_etages: 5, logements_par_etage: 12 },
  // Campus Rockefeller / Laënnec
  { code: 'PARA',  label: 'Résidence Paradin',            site: 'Campus Rockefeller / Laënnec', nb_etages: 6, logements_par_etage: 10 },
  { code: 'CROIX', label: 'Résidence Croix du Sud',       site: 'Campus Rockefeller / Laënnec', nb_etages: 5, logements_par_etage: 10 },
  { code: 'MERM',  label: 'Résidence Jean Mermoz',        site: 'Campus Rockefeller / Laënnec', nb_etages: 5, logements_par_etage: 12 },
  // Campus Centre / Lyon 6
  { code: 'CAVA',  label: 'Résidence Jacques Cavalier',   site: 'Campus Centre / Lyon 6',        nb_etages: 6, logements_par_etage: 12 },
  { code: 'VOLT',  label: 'Résidence Voltaire',           site: 'Campus Centre / Lyon 6',        nb_etages: 7, logements_par_etage: 14 },
  // Campus de la Manufacture des Tabacs
  { code: 'MADE',  label: 'Résidence La Madeleine',       site: 'Campus de la Manufacture des Tabacs',        nb_etages: 4, logements_par_etage: 10 },
  { code: 'QUAIS', label: 'Résidence Les Quais',          site: 'Campus de la Manufacture des Tabacs',        nb_etages: 5, logements_par_etage: 12 },
  { code: 'GARI',  label: 'Résidence Garibaldi',          site: 'Campus de la Manufacture des Tabacs',        nb_etages: 4, logements_par_etage: 10 },
  { code: 'DELE',  label: 'Résidence Benjamin Delessert', site: 'Campus de la Manufacture des Tabacs',        nb_etages: 4, logements_par_etage: 8  },
  { code: 'LIRO',  label: 'Résidence André Lirondelle',   site: 'Campus de la Manufacture des Tabacs',        nb_etages: 3, logements_par_etage: 10 },
  // Campus ENS Lyon / Gerland
  { code: 'GIRON', label: 'Résidence Les Girondins',      site: 'Campus ENS Lyon / Gerland',     nb_etages: 5, logements_par_etage: 10 },
  // Campus Porte des Alpes (Bron)
  { code: 'ALICE', label: 'Résidence Alice Guy',          site: 'Campus Porte des Alpes (Bron)', nb_etages: 4, logements_par_etage: 12 },
  // Campus Lyon 5 — Saint-Just
  { code: 'ALLIX', label: 'Résidence André Allix',        site: 'Campus Lyon 5 — Saint-Just',    nb_etages: 4, logements_par_etage: 10 },
  { code: 'PHILO', label: 'Résidence Philomène Magnin',   site: 'Campus Lyon 5 — Saint-Just',    nb_etages: 4, logements_par_etage: 10 },
  { code: 'ARCHE', label: "Résidence Arches d'Agrippa",   site: 'Campus Lyon 5 — Saint-Just',    nb_etages: 3, logements_par_etage: 10 },
  { code: 'MEYG',  label: 'Résidence Jean Meygret',       site: 'Campus Lyon 5 — Saint-Just',    nb_etages: 4, logements_par_etage: 8  },
  // Autres campus
  { code: 'CONFL', label: 'Résidence Confluence',         site: "Campus Lyon Centre / Presqu'île", nb_etages: 5, logements_par_etage: 14 },
  { code: 'BUGE',  label: 'Résidence Bugeaud',            site: 'Campus Lyon Centre / Lyon 6',   nb_etages: 4, logements_par_etage: 10 },
  { code: 'AIME',  label: 'Résidence Aimé Césaire',       site: 'Campus Saint-Priest',            nb_etages: 5, logements_par_etage: 12 },
  { code: 'BOURG', label: 'Résidences CROUS Bourg-en-Bresse', site: 'Campus Bourg-en-Bresse',   nb_etages: 3, logements_par_etage: 8  },
  { code: 'STET',  label: 'Résidences CROUS Saint-Étienne',   site: 'Campus Saint-Étienne',     nb_etages: 4, logements_par_etage: 10 },
  { code: 'ROAN',  label: 'Résidences CROUS Roanne',          site: 'Campus Roanne',            nb_etages: 3, logements_par_etage: 8  },
];

// ─── Templates équipements ────────────────────────────────────────────────────

interface EquipTemplate {
  categorie: string;
  sous_categorie: string;
  designations: string[];
  marques: { marque: string; modeles: string[] }[];
  niveau: NiveauEquipement;
  nb_min: number;
  nb_max: number;
  garantie_ans: number;
  duree_vie_ans: number;
}

const TEMPLATES_RESIDENCE: EquipTemplate[] = [
  {
    categorie: 'cvc', sous_categorie: 'Chauffage collectif',
    designations: ['Chaudière gaz collective', 'Sous-station chauffage urbain', 'Échangeur thermique'],
    marques: [
      { marque: 'Viessmann',  modeles: ['Vitodens 200-W 80kW', 'Vitoladens 300-C', 'Vitocal 200-S'] },
      { marque: 'De Dietrich',modeles: ['MCR3 80', 'Innovens Pro MCA 90', 'Calora Tower'] },
      { marque: 'Chaffoteaux',modeles: ['Talia Green 80', 'Inoa System 80', 'Arona Green'] },
      { marque: 'Bulex',      modeles: ['Thema Classic C 80', 'Innovens 90'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 2, garantie_ans: 10, duree_vie_ans: 20,
  },
  {
    categorie: 'cvc', sous_categorie: 'Pompe à chaleur',
    designations: ['Pompe à chaleur air/eau', 'PAC réversible collectif', 'Pompe à chaleur géothermique'],
    marques: [
      { marque: 'Daikin',      modeles: ['Altherma 3 H HT 16kW', 'Altherma 3 R 12kW'] },
      { marque: 'Atlantic',    modeles: ['Alfea Extensa Duo AI 12kW', 'Calypso Duo'] },
      { marque: 'Mitsubishi',  modeles: ['Ecodan PUHZ-SW100', 'Ecodan PUHZ-SW120'] },
      { marque: 'Thermor',     modeles: ['Aéromax HP 12kW', 'Aéromax HP 15kW'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 1, garantie_ans: 5, duree_vie_ans: 15,
  },
  {
    categorie: 'cvc', sous_categorie: 'Climatisation collective',
    designations: ['Groupe de climatisation collectif', 'VRV / VRF collectif', 'Rooftop CTA'],
    marques: [
      { marque: 'Mitsubishi Electric', modeles: ['PURY-EP250YNW-A', 'PURY-EP200YNW-A'] },
      { marque: 'Daikin',              modeles: ['VRV IV RYYQ16T', 'VRV IV RYYQ20T'] },
      { marque: 'Toshiba',             modeles: ['Super Digital Inverter MMY-MAP1206HT8-E'] },
    ],
    niveau: 'residence', nb_min: 0, nb_max: 1, garantie_ans: 5, duree_vie_ans: 15,
  },
  {
    categorie: 'serrure', sous_categorie: 'Ascenseur',
    designations: ['Ascenseur principal', 'Ascenseur de service', 'Monte-charge'],
    marques: [
      { marque: 'KONE',      modeles: ['EcoSpace MonoSpace', 'TranSys 200', 'MiniSpace'] },
      { marque: 'Schindler', modeles: ['3100', '3300', '2400 300kg'] },
      { marque: 'Otis',      modeles: ['Gen2 Comfort', 'GeN2 Switch', 'Otis ONE'] },
      { marque: 'Thyssen',   modeles: ['synergy 100', 'evolution 100', 'MRL 320'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 2, garantie_ans: 10, duree_vie_ans: 25,
  },
  {
    categorie: 'incendie', sous_categorie: 'Système sécurité incendie',
    designations: ['SSI central + colonnes sèches', 'Centrale de détection incendie', 'Système SSI catégorie A'],
    marques: [
      { marque: 'Notifier',  modeles: ['ID3000', 'ID50', 'AFP-200'] },
      { marque: 'Esser',     modeles: ['8008', 'FlexES Control'] },
      { marque: 'Siemens',   modeles: ['Cerberus FIT FC721', 'Cerberus PRO FC900'] },
      { marque: 'Hochiki',   modeles: ['ESP', 'EF-Series'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 1, garantie_ans: 10, duree_vie_ans: 20,
  },
  {
    categorie: 'electricite', sous_categorie: 'Tableau général BT',
    designations: ['TGBT principal', 'Tableau divisionnaire général', 'Armoire AGCP'],
    marques: [
      { marque: 'Schneider Electric', modeles: ['Prisma P 400A', 'Okken', 'Prisma Plus G'] },
      { marque: 'Legrand',            modeles: ['XL³ 4000', 'XL³ 800', 'Drivia 18'] },
      { marque: 'Hager',              modeles: ['Univers N 630A', 'Vector 400A'] },
      { marque: 'ABB',                modeles: ['MNS iS 630A', 'System pro M compact'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 1, garantie_ans: 5, duree_vie_ans: 30,
  },
  {
    categorie: 'sanitaires', sous_categorie: 'Eau chaude sanitaire',
    designations: ['Ballon ECS collectif', 'Production ECS + surpresseur', 'Échangeur ECS solaire'],
    marques: [
      { marque: 'Atlantic',    modeles: ['Calypso Neo 300L', 'CET3 800L', 'Opalys 300'] },
      { marque: 'Chaffoteaux', modeles: ['Aquanext EVO 300L', 'Aquavitesse Neo 250L'] },
      { marque: 'Thermor',     modeles: ['Concept N 300L', 'Sauter SF 400'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 2, garantie_ans: 10, duree_vie_ans: 20,
  },
  {
    categorie: 'cvc', sous_categorie: 'VMC collective',
    designations: ['Extracteur VMC collectif', 'Centrale double flux collective', 'Groupe moto-ventilateur'],
    marques: [
      { marque: 'Aldes',    modeles: ['T.Flow Hygro+ B', 'T.Flow Hygro+', 'DFE Connect'] },
      { marque: 'Atlantic', modeles: ['Bahia Essential', 'Ideo 325 Ecowatt'] },
      { marque: 'Novent',   modeles: ['Nordik Air Box', 'Easy-to-Connect'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 1, garantie_ans: 10, duree_vie_ans: 20,
  },
  {
    categorie: 'eclairage', sous_categorie: 'Éclairage extérieur',
    designations: ['Éclairage parking / accès', "Borne d'éclairage extérieur", 'Projecteur LED façade'],
    marques: [
      { marque: 'Philips Lighting', modeles: ['CoreLine Wallmount WL120', 'TownGuide'] },
      { marque: 'Schreder',         modeles: ['Avanza LED 60W', 'Axia 2 LED'] },
      { marque: 'Disano',           modeles: ['Girasole LED 80W', 'Palladian II 60W'] },
    ],
    niveau: 'residence', nb_min: 1, nb_max: 2, garantie_ans: 5, duree_vie_ans: 20,
  },
  {
    categorie: 'electricite', sous_categorie: 'Bornes de recharge VE',
    designations: ['Borne de recharge véhicules électriques', 'Station de charge VE 7kW', 'Prise renforcée VE'],
    marques: [
      { marque: 'Schneider Electric', modeles: ['EVLink Pro AC 7kW', 'EVlink Parking 22kW'] },
      { marque: 'ABB',                modeles: ['Terra AC W7', 'Terra AC W22'] },
      { marque: 'Legrand',            modeles: ['Green\'Up Premium 7kW', 'DPX³ VE'] },
    ],
    niveau: 'residence', nb_min: 0, nb_max: 1, garantie_ans: 3, duree_vie_ans: 10,
  },
];

const TEMPLATES_ETAGE: EquipTemplate[] = [
  {
    categorie: 'electromenager', sous_categorie: 'Laverie commune',
    designations: ['Machine à laver collective', 'Lave-linge professionnel 9kg', 'Lave-linge collectif 7kg'],
    marques: [
      { marque: 'Electrolux',  modeles: ['W375H 7kg', 'W4850H 8kg', 'W5800H 9kg'] },
      { marque: 'Miele',       modeles: ['PW 5065 Plus 7kg', 'PW 6055 Plus Vario 7kg'] },
      { marque: 'Primus',      modeles: ['FX80 8kg', 'FS20 7kg'] },
      { marque: 'Speed Queen', modeles: ['SWT 9kg', 'AWM 8kg'] },
    ],
    niveau: 'etage', nb_min: 2, nb_max: 4, garantie_ans: 5, duree_vie_ans: 12,
  },
  {
    categorie: 'electromenager', sous_categorie: 'Séchage commun',
    designations: ['Sèche-linge collectif', 'Sèche-linge professionnel 8kg', 'Sèche-linge à condensation'],
    marques: [
      { marque: 'Miele',       modeles: ['PT 8337 WP 8kg', 'PT 5137 WP 8kg'] },
      { marque: 'Electrolux',  modeles: ['T5190LE 8kg', 'T5290LE 9kg'] },
      { marque: 'Primus',      modeles: ['DX10 10kg', 'DX7P 7kg'] },
    ],
    niveau: 'etage', nb_min: 1, nb_max: 2, garantie_ans: 5, duree_vie_ans: 12,
  },
  {
    categorie: 'electromenager', sous_categorie: 'Espace commun',
    designations: ['Machine à café / boissons chaudes', 'Distributeur automatique boissons', 'Machine expresso collectif'],
    marques: [
      { marque: 'Nespresso Professional', modeles: ['Momento 100', 'Momento 200', 'Aguila 440'] },
      { marque: 'Krups',                  modeles: ['Evidence EA893C', 'Barista EA9015'] },
      { marque: 'Lavazza',                modeles: ['Flavia Creation 500', 'BLUE 4700'] },
      { marque: 'Jura',                   modeles: ['GIGA X3', 'GIGA W3 Professional'] },
    ],
    niveau: 'etage', nb_min: 1, nb_max: 1, garantie_ans: 3, duree_vie_ans: 7,
  },
  {
    categorie: 'eclairage', sous_categorie: 'Éclairage commun',
    designations: ['Éclairage palier avec détecteur', 'Luminaire couloir LED', 'Bloc secours palier'],
    marques: [
      { marque: 'Legrand',  modeles: ['Céliane détecteur 300W', 'Niloe détection', 'URA21 SATI'] },
      { marque: 'Schneider',modeles: ['Odace détecteur 300W', 'Unica détection'] },
      { marque: 'Hager',    modeles: ['WNT550 détecteur', 'WNT551 SFK'] },
    ],
    niveau: 'etage', nb_min: 1, nb_max: 2, garantie_ans: 3, duree_vie_ans: 15,
  },
  {
    categorie: 'cvc', sous_categorie: 'VMC palier',
    designations: ['Extracteur VMC palier', 'Bouche d\'extraction VMC', 'Gaine VMC collective palier'],
    marques: [
      { marque: 'Aldes',  modeles: ['T.Flow Hygro+ B', 'BAHIA 300 Officiel', 'BPH-T'] },
      { marque: 'Atlantic',modeles: ['Bahia Essential', 'Oméga Standard'] },
      { marque: 'Unelvent',modeles: ['Vortice M 100/4" T', 'CVVT 25/4" T'] },
    ],
    niveau: 'etage', nb_min: 1, nb_max: 1, garantie_ans: 10, duree_vie_ans: 20,
  },
  {
    categorie: 'serrure', sous_categorie: 'Contrôle d\'accès palier',
    designations: ['Lecteur badge accès palier', 'Interphone palier', 'Visiophone palier'],
    marques: [
      { marque: 'Vigik',   modeles: ['Intratone SM6', 'VigikSTAR 6B'] },
      { marque: 'Cogelec', modeles: ['Intratone SM6', 'SM3 Cogelec'] },
      { marque: 'Aiphone', modeles: ['IX Series', 'GT-1C7W'] },
    ],
    niveau: 'etage', nb_min: 1, nb_max: 1, garantie_ans: 5, duree_vie_ans: 10,
  },
  {
    categorie: 'reseau', sous_categorie: 'Infrastructure réseau',
    designations: ['Switch réseau palier', 'Baie de brassage palier', 'Répéteur Wi-Fi palier'],
    marques: [
      { marque: 'Cisco',   modeles: ['Catalyst 2960-X 24', 'CBS110-24T'] },
      { marque: 'Netgear', modeles: ['GS316 16-port', 'M4100-D12G'] },
      { marque: 'TP-Link', modeles: ['TL-SG1024 24-port', 'TL-SG1016'] },
    ],
    niveau: 'etage', nb_min: 1, nb_max: 1, garantie_ans: 3, duree_vie_ans: 8,
  },
];

const TEMPLATES_LOGEMENT: EquipTemplate[] = [
  {
    categorie: 'cvc', sous_categorie: 'Chauffage individuel',
    designations: ['Radiateur électrique', 'Convecteur électrique', 'Panneau rayonnant'],
    marques: [
      { marque: 'Atlantic',  modeles: ['Galéo 1500W', 'Galéo 2000W', 'F127 Design'] },
      { marque: 'Thermor',   modeles: ['Doris Digital 1500W', 'Mozart Digital 2000W'] },
      { marque: 'Noirot',    modeles: ['Spot D 1500W', 'Calidou Smart Plus 2000W'] },
      { marque: 'Airelec',   modeles: ['Tactil A702 1500W', 'Airelec A702 2000W'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 2, garantie_ans: 5, duree_vie_ans: 15,
  },
  {
    categorie: 'cvc', sous_categorie: 'Ventilation individuelle',
    designations: ['VMC simple flux', 'Bouche VMC salle de bain', 'Grille d\'entrée d\'air'],
    marques: [
      { marque: 'Aldes',    modeles: ['T.ONE Compact', 'B-ONE 90m²', 'DF CLASSIC'] },
      { marque: 'Atlantic', modeles: ['Aéromatic 500', 'Nano VMC'] },
      { marque: 'Unelvent', modeles: ['Vortice Point Fan 100 LL', 'Vort 100'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 5, duree_vie_ans: 15,
  },
  {
    categorie: 'incendie', sous_categorie: 'Détection individuelle',
    designations: ['Détecteur de fumée', 'DAAF normalisé NF', 'Détecteur avertisseur autonome'],
    marques: [
      { marque: 'Kidde',    modeles: ['10Y29', '2030-DSCR', 'Firex i4618'] },
      { marque: 'Abus',     modeles: ['RM40 9V', 'RM30 9V'] },
      { marque: 'Ei Electronics', modeles: ['Ei650i', 'Ei603C'] },
      { marque: 'Nest',     modeles: ['Protect 2e génération', 'Protect 3e génération'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 10, duree_vie_ans: 10,
  },
  {
    categorie: 'electromenager', sous_categorie: 'Cuisson',
    designations: ['Plaques de cuisson induction', 'Plaques vitrocéramique', 'Micro-ondes encastrable'],
    marques: [
      { marque: 'Whirlpool',  modeles: ['ACM 868/BA', 'WVH 92 K', 'AMW 460'] },
      { marque: 'Bosch',      modeles: ['PKD611B17E', 'PIF645FB1E', 'HMT75M651'] },
      { marque: 'Fagor',      modeles: ['WOK 301', 'IFA 75', 'MO 17'] },
      { marque: 'Brandt',     modeles: ['TI1015B', 'BPI7320X', 'BFC7615NX'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 2, duree_vie_ans: 8,
  },
  {
    categorie: 'electromenager', sous_categorie: 'Froid',
    designations: ['Réfrigérateur', 'Mini-bar réfrigéré', 'Réfrigérateur combiné'],
    marques: [
      { marque: 'Bosch',     modeles: ['KTR15NWFA', 'KGN36VWEC', 'KGN49XIEA'] },
      { marque: 'Whirlpool', modeles: ['BSNF 9152 OX', 'W9 931D OX', 'ARC 4020'] },
      { marque: 'Electrolux',modeles: ['ERN1501FOW', 'ERL6297XX', 'ETB2PE22S'] },
      { marque: 'Candy',     modeles: ['CVBN 6182W', 'CFF 195E', 'CHICS 5144'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 2, duree_vie_ans: 10,
  },
  {
    categorie: 'mobilier', sous_categorie: 'Chambre',
    designations: ['Lit 1 place + matelas', 'Lit simple + sommier', 'Lit mezzanine + bureau'],
    marques: [
      { marque: 'IKEA',    modeles: ['MALM 90×200', 'NORDLI 90×200', 'HEMNES 90×200'] },
      { marque: 'Gautier', modeles: ['Campus T20 90×200', 'Play 90×200'] },
      { marque: 'Conforama', modeles: ['Stuva Lit 90×200', 'Gauthier 90×200'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 2, duree_vie_ans: 15,
  },
  {
    categorie: 'mobilier', sous_categorie: 'Bureau',
    designations: ['Bureau + chaise de travail', 'Meuble de rangement', 'Étagère murale'],
    marques: [
      { marque: 'IKEA',    modeles: ['MICKE + MILLBERGET', 'KALLAX + ALEX', 'LINNMON + ADILS'] },
      { marque: 'Gautier', modeles: ['Bibliothèque Campus', 'Armoire Campus T20'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 2, duree_vie_ans: 15,
  },
  {
    categorie: 'serrure', sous_categorie: 'Contrôle d\'accès logement',
    designations: ['Serrure électronique', 'Serrure à code', 'Verrou de sûreté'],
    marques: [
      { marque: 'Mul-T-Lock',  modeles: ['Entr-e', 'ClassicPro', 'Interactive+'] },
      { marque: 'Yale',        modeles: ['Conexis L1 Smart', 'Linus Smart Lock', 'YD-01'] },
      { marque: 'Vachette',    modeles: ['Radialis A2P*', 'Saxo + Verrou B', 'Néo'] },
      { marque: 'Thirard',     modeles: ['Titan Connect', 'Magnum+'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 3, duree_vie_ans: 10,
  },
  {
    categorie: 'sanitaires', sous_categorie: 'Salle de bain',
    designations: ['Douche + robinetterie', 'Mitigeur thermostatique douche', 'Bac à douche + paroi'],
    marques: [
      { marque: 'Grohe',     modeles: ['Euphoria 110', 'Grohtherm 1000', 'Precision Trend'] },
      { marque: 'Hansgrohe', modeles: ['Croma E 200', 'Crometta 100 Vario', 'Raindance S'] },
      { marque: 'Kludi',     modeles: ['Balance 5270005', 'Freshline 360 S'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 2, duree_vie_ans: 15,
  },
  {
    categorie: 'reseau', sous_categorie: 'Réseau individuel',
    designations: ['Point d\'accès Wi-Fi', 'Routeur Wi-Fi individuel', 'Répéteur Wi-Fi'],
    marques: [
      { marque: 'TP-Link',  modeles: ['EAP245', 'EAP225', 'Deco M5'] },
      { marque: 'Netgear',  modeles: ['WAX204', 'WAX202', 'Orbi RBK50'] },
      { marque: 'Ubiquiti', modeles: ['UniFi U6 Lite', 'UniFi U6 Pro'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 3, duree_vie_ans: 7,
  },
  {
    categorie: 'electricite', sous_categorie: 'Tableau divisionnaire',
    designations: ['Tableau électrique individuel', 'Tableau divisionnaire logement', 'Coffret de protection'],
    marques: [
      { marque: 'Legrand',            modeles: ['XL³ 125 13 modules', 'Drivia 13 modules', 'XL Pro 13 mod.'] },
      { marque: 'Schneider Electric', modeles: ['Resi9 13 mod.', 'Pragma D 13 mod.'] },
      { marque: 'Hager',              modeles: ['Gamma 13 mod.', 'Vector 13 mod.'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 10, duree_vie_ans: 30,
  },
  {
    categorie: 'eclairage', sous_categorie: 'Éclairage individuel',
    designations: ['Luminaire plafond chambre', 'Éclairage cuisine LED', 'Plafonnier salle de bain'],
    marques: [
      { marque: 'Philips',   modeles: ['Hue White E27', 'Hue White Ambiance', 'SceneSwitch E27'] },
      { marque: 'Osram',     modeles: ['LED Star+ Classic A 9W', 'Smart+ E27 10W'] },
      { marque: 'Legrand',   modeles: ['Céliane LED E27', 'Plexo IP55'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 2, garantie_ans: 2, duree_vie_ans: 10,
  },
  {
    categorie: 'sanitaires', sous_categorie: 'Plomberie logement',
    designations: ['WC suspendu + mécanisme', 'Robinet mitigeur lavabo', 'Chauffe-eau électrique individuel'],
    marques: [
      { marque: 'Geberit',   modeles: ['UP720', 'UP320 Duofix', 'Sigma20'] },
      { marque: 'Grohe',     modeles: ['Eurosmart 23537', 'BauEdge 23328', 'Eurocube 23131'] },
      { marque: 'Atlantic',  modeles: ['Steatite Essentiel 50L', 'Steatite Essentiel 80L'] },
    ],
    niveau: 'logement', nb_min: 1, nb_max: 1, garantie_ans: 2, duree_vie_ans: 15,
  },
];

const ALL_TEMPLATES = [...TEMPLATES_RESIDENCE, ...TEMPLATES_ETAGE, ...TEMPLATES_LOGEMENT];

// Poids probabilistes pour les statuts selon l'état
const STATUTS_PAR_ETAT: Record<string, string[]> = {
  tres_bon:    ['en_service', 'en_service', 'en_service', 'en_service', 'en_service'],
  fonctionnel: ['en_service', 'en_service', 'en_service', 'en_service', 'en_maintenance'],
  moyen:       ['en_service', 'en_service', 'en_maintenance', 'en_maintenance', 'en_panne'],
  degrade:     ['en_service', 'en_maintenance', 'en_panne', 'neutralise'],
  a_remplacer: ['en_maintenance', 'en_panne', 'hors_service', 'neutralise', 'remplace'],
  en_panne:    ['en_panne', 'en_panne', 'en_maintenance', 'hors_service'],
  hors_service:['hors_service', 'hors_service', 'neutralise', 'reforme'],
};

const ETATS = [
  'tres_bon', 'fonctionnel', 'fonctionnel', 'fonctionnel', 'moyen',
  'moyen', 'degrade', 'a_remplacer', 'en_panne', 'hors_service',
];

function buildSerialNumber(rng: () => number, marque: string, year: number): string | undefined {
  if (rng() < 0.15) return undefined;
  const prefix = marque.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(3, 'X');
  const suffix = Math.floor(rng() * 99999).toString().padStart(5, '0');
  return `${prefix}-${year}-${suffix}`;
}

// ─── Génération principale ────────────────────────────────────────────────────

export function generateEquipements(targetCount: number = 2000): EquipementGlobal[] {
  const rng = makePrng(42); // seed fixe → données stables
  const result: EquipementGlobal[] = [];
  let globalIdx = 0;

  // Calcul de la répartition : on cible environ targetCount équipements
  // Distribution : ~20% résidence, ~25% étage, ~55% logement
  const budgetResidence = Math.round(targetCount * 0.20);
  const budgetEtage     = Math.round(targetCount * 0.25);
  const budgetLogement  = targetCount - budgetResidence - budgetEtage;

  const counts = { residence: 0, etage: 0, logement: 0 };

  for (const res of RESIDENCES) {
    // ── Équipements niveau RÉSIDENCE ─────────────────────────────────────────
    const resTemplates = TEMPLATES_RESIDENCE;
    for (const tpl of resTemplates) {
      if (counts.residence >= budgetResidence) break;
      const n = randInt(rng, tpl.nb_min, tpl.nb_max);
      for (let i = 0; i < n && counts.residence < budgetResidence; i++) {
        const desig = pick(rng, tpl.designations);
        const mObj  = pick(rng, tpl.marques);
        const modele = pick(rng, mObj.modeles);
        const etat   = pick(rng, ETATS);
        const statut = pick(rng, STATUTS_PAR_ETAT[etat] ?? ['en_service']);
        const annee  = randInt(rng, 2008, 2024);
        const datePose = randDate(rng, annee, annee);
        const hasGar   = rng() > 0.3;
        const dureeGar = hasGar ? tpl.garantie_ans : 0;
        const dateFinGar = hasGar ? addYears(datePose, dureeGar) : undefined;
        const qty = randInt(rng, 1, 2);

        result.push({
          id: `g-${++globalIdx}`,
          identifiant: `${res.code}-${tpl.categorie.slice(0,3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
          designation: desig,
          categorie: tpl.categorie,
          sous_categorie: tpl.sous_categorie,
          etat,
          marque: mObj.marque,
          modele,
          numero_serie: buildSerialNumber(rng, mObj.marque, annee),
          date_mise_en_service: datePose,
          caracteristiques: {
            quantite: qty, statut,
            garantie: hasGar,
            ...(hasGar && dateFinGar ? { date_fin_garantie: dateFinGar, duree_garantie_mois: dureeGar * 12 } : {}),
          },
          niveau: 'residence',
          site_label: res.label,
        });
        counts.residence++;
      }
    }

    // ── Équipements niveau ÉTAGE ─────────────────────────────────────────────
    for (let etage = 1; etage <= res.nb_etages && counts.etage < budgetEtage; etage++) {
      const etageLabel = etage === 1 ? '1er étage' : `${etage}e étage`;
      const etageTemplates = TEMPLATES_ETAGE;
      for (const tpl of etageTemplates) {
        if (counts.etage >= budgetEtage) break;
        // Pas tous les étages ont toutes les machines — probabilité 70%
        if (rng() > 0.7 && tpl.nb_min === 0) continue;
        const n = randInt(rng, tpl.nb_min, tpl.nb_max);
        for (let i = 0; i < n && counts.etage < budgetEtage; i++) {
          const desig = pick(rng, tpl.designations);
          const mObj  = pick(rng, tpl.marques);
          const modele = pick(rng, mObj.modeles);
          const etat   = pick(rng, ETATS);
          const statut = pick(rng, STATUTS_PAR_ETAT[etat] ?? ['en_service']);
          const annee  = randInt(rng, 2010, 2024);
          const datePose = randDate(rng, annee, annee);
          const hasGar = rng() > 0.35;
          const dureeGar = hasGar ? tpl.garantie_ans : 0;
          const dateFinGar = hasGar ? addYears(datePose, dureeGar) : undefined;

          result.push({
            id: `g-${++globalIdx}`,
            identifiant: `${res.code}-E${etage}-${tpl.categorie.slice(0,3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
            designation: desig,
            categorie: tpl.categorie,
            sous_categorie: tpl.sous_categorie,
            etat,
            marque: mObj.marque,
            modele,
            numero_serie: buildSerialNumber(rng, mObj.marque, annee),
            date_mise_en_service: datePose,
            caracteristiques: {
              quantite: randInt(rng, 1, tpl.nb_max), statut,
              garantie: hasGar,
              ...(hasGar && dateFinGar ? { date_fin_garantie: dateFinGar, duree_garantie_mois: dureeGar * 12 } : {}),
            },
            niveau: 'etage',
            site_label: res.label,
            sous_niveau_label: etageLabel,
          });
          counts.etage++;
        }
      }
    }

    // ── Équipements niveau LOGEMENT ──────────────────────────────────────────
    // On ne génère pas tous les logements (trop) — on en échantillonne
    const logCount = Math.min(
      res.nb_etages * res.logements_par_etage,
      Math.ceil(budgetLogement / RESIDENCES.length),
    );
    for (let li = 0; li < logCount && counts.logement < budgetLogement; li++) {
      const etage = Math.floor(li / res.logements_par_etage) + 1;
      const numLocal = (li % res.logements_par_etage) + 1;
      const logLabel = `Logement ${etage}${String(numLocal).padStart(2, '0')}`;

      // On tire 4-7 équipements parmi les templates logement
      const nbEqLog = randInt(rng, 4, 7);
      const shuffled = [...TEMPLATES_LOGEMENT].sort(() => rng() - 0.5).slice(0, nbEqLog);

      for (const tpl of shuffled) {
        if (counts.logement >= budgetLogement) break;
        const desig = pick(rng, tpl.designations);
        const mObj  = pick(rng, tpl.marques);
        const modele = pick(rng, mObj.modeles);
        const etat   = pick(rng, ETATS);
        const statut = pick(rng, STATUTS_PAR_ETAT[etat] ?? ['en_service']);
        const annee  = randInt(rng, 2012, 2024);
        const datePose = randDate(rng, annee, annee);
        const hasGar = rng() > 0.4;
        const dureeGar = hasGar ? tpl.garantie_ans : 0;
        const dateFinGar = hasGar ? addYears(datePose, dureeGar) : undefined;

        result.push({
          id: `g-${++globalIdx}`,
          identifiant: `${res.code}-L${String(etage * 100 + numLocal).padStart(3, '0')}-${tpl.categorie.slice(0,3).toUpperCase()}`,
          designation: desig,
          categorie: tpl.categorie,
          sous_categorie: tpl.sous_categorie,
          etat,
          marque: mObj.marque,
          modele,
          numero_serie: buildSerialNumber(rng, mObj.marque, annee),
          date_mise_en_service: datePose,
          caracteristiques: {
            quantite: 1, statut,
            garantie: hasGar,
            ...(hasGar && dateFinGar ? { date_fin_garantie: dateFinGar, duree_garantie_mois: dureeGar * 12 } : {}),
          },
          niveau: 'logement',
          site_label: res.label,
          sous_niveau_label: logLabel,
        });
        counts.logement++;
      }
    }
  }

  // Si on n'a pas atteint targetCount, on complète avec des équipements logement supplémentaires
  while (result.length < targetCount) {
    const res    = pick(rng, RESIDENCES);
    const tpl    = pick(rng, ALL_TEMPLATES);
    const desig  = pick(rng, tpl.designations);
    const mObj   = pick(rng, tpl.marques);
    const modele = pick(rng, mObj.modeles);
    const etat   = pick(rng, ETATS);
    const statut = pick(rng, STATUTS_PAR_ETAT[etat] ?? ['en_service']);
    const annee  = randInt(rng, 2010, 2024);
    const datePose = randDate(rng, annee, annee);
    const hasGar = rng() > 0.4;
    const dureeGar = hasGar ? tpl.garantie_ans : 0;
    const dateFinGar = hasGar ? addYears(datePose, dureeGar) : undefined;
    const etage = randInt(rng, 1, 6);
    const num   = randInt(rng, 1, 15);
    const sous = tpl.niveau === 'residence' ? undefined
      : tpl.niveau === 'etage' ? (etage === 1 ? '1er étage' : `${etage}e étage`)
      : `Logement ${etage}${String(num).padStart(2, '0')}`;

    result.push({
      id: `g-${++globalIdx}`,
      identifiant: `${res.code}-X${String(globalIdx).padStart(4, '0')}`,
      designation: desig,
      categorie: tpl.categorie,
      sous_categorie: tpl.sous_categorie,
      etat,
      marque: mObj.marque,
      modele,
      numero_serie: buildSerialNumber(rng, mObj.marque, annee),
      date_mise_en_service: datePose,
      caracteristiques: {
        quantite: 1, statut,
        garantie: hasGar,
        ...(hasGar && dateFinGar ? { date_fin_garantie: dateFinGar, duree_garantie_mois: dureeGar * 12 } : {}),
      },
      niveau: tpl.niveau,
      site_label: res.label,
      sous_niveau_label: sous,
    });
  }

  return result.slice(0, targetCount);
}

// Singleton — généré une seule fois au chargement du module
export const EQUIPEMENTS_GLOBAL = generateEquipements(2000);
