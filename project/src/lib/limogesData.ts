import type { TreeNode, NodeType } from '../types/patrimoine';

let _idSeq = 0;
function uid(prefix: string): string {
  return `limoges-${prefix}-${++_idSeq}`;
}

function piece(nom: string, fonction: string, surface: number, etage: string, batiment: string, domaine: string, ancestors: { type: NodeType; nom: string; id: string }[]): TreeNode {
  const id = uid('piece');
  return {
    id,
    type: 'piece',
    nom,
    statut: 'fonctionnel',
    data: {
      fonction,
      surface,
      etage,
      batiment,
      domaine,
      adresse: 'Ville de Limoges',
    },
    ancestors,
  };
}

function niveau(nom: string, pieces: { nom: string; fonction: string; surface: number }[], batNom: string, domNom: string, batAncestors: { type: NodeType; nom: string; id: string }[]): TreeNode {
  const id = uid('niveau');
  const niveauAncestors = [...batAncestors, { type: 'niveau' as NodeType, nom, id }];
  return {
    id,
    type: 'niveau',
    nom,
    statut: 'fonctionnel',
    data: {},
    ancestors: batAncestors,
    children: pieces.map(p => piece(p.nom, p.fonction, p.surface, nom, batNom, domNom, niveauAncestors)),
  };
}

function batiment(nom: string, adresse: string, niveaux: ReturnType<typeof niveau>[], domAncestors: { type: NodeType; nom: string; id: string }[], fixedId?: string): TreeNode {
  const id = fixedId ?? uid('bat');
  const batAncestors = [...domAncestors, { type: 'batiment_ext' as NodeType, nom, id }];
  return {
    id,
    type: 'batiment_ext',
    nom,
    statut: 'fonctionnel',
    data: { adresse, ...(fixedId ? { hasEquip: true } : {}) },
    ancestors: domAncestors,
    adresse_heritee: adresse,
    children: niveaux.map(n => ({ ...n, ancestors: batAncestors })),
  };
}

function ecole(nom: string, adresse: string, batiments: ReturnType<typeof batiment>[], domAncestors: { type: NodeType; nom: string; id: string }[], fixedId?: string): TreeNode {
  const id = fixedId ?? uid('ecole');
  const ecoleAncestors = [...domAncestors, { type: 'site' as NodeType, nom, id }];
  return {
    id,
    type: 'site',
    nom,
    statut: 'en_service',
    data: { adresse, ...(fixedId ? { hasEquip: true } : {}) },
    ancestors: domAncestors,
    adresse_heritee: adresse,
    children: batiments.map(b => ({ ...b, ancestors: ecoleAncestors })),
  };
}

function domaine(nom: string, batiments: ReturnType<typeof batiment>[], villeAncestors: { type: NodeType; nom: string; id: string }[]): TreeNode {
  const id = uid('dom');
  const domAncestors = [...villeAncestors, { type: 'domaine' as NodeType, nom, id }];
  return {
    id,
    type: 'domaine',
    nom,
    statut: 'fonctionnel',
    data: {},
    ancestors: villeAncestors,
    children: batiments.map(b => ({ ...b, ancestors: domAncestors })),
  };
}

// ── Domaine CULTURE ──────────────────────────────────────────────────────────

const domCulture = domaine('CULTURE', [

  batiment('CCM Jean Gagnant', '15 Place Léon Betoulle, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Régie', fonction: 'Régie technique', surface: 28 },
      { nom: 'Pièce 2 Couloir', fonction: 'Circulation', surface: 14 },
    ], 'CCM Jean Gagnant', 'CULTURE', []),
    niveau('Sous-Sol', [
      { nom: 'Pièce 1 Chaufferie', fonction: 'Chaufferie', surface: 42 },
      { nom: 'Pièce 2 Stockage', fonction: 'Stockage matériel', surface: 31 },
    ], 'CCM Jean Gagnant', 'CULTURE', []),
  ], []),

  batiment('CCM John Lennon', '3 Rue du Chambon, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Régie', fonction: 'Régie technique', surface: 22 },
      { nom: 'Pièce 2 Couloir', fonction: 'Circulation', surface: 11 },
    ], 'CCM John Lennon', 'CULTURE', []),
    niveau('Sous-Sol', [
      { nom: 'Pièce 1 Archives', fonction: 'Archives', surface: 35 },
    ], 'CCM John Lennon', 'CULTURE', []),
  ], []),

  batiment('Maison des Arts et de la danse', '10 Rue Haute-Vienne, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Hall', fonction: 'Accueil / Hall', surface: 45 },
      { nom: 'Pièce 2 Salle polyvalente', fonction: 'Salle polyvalente', surface: 110 },
    ], 'Maison des Arts et de la danse', 'CULTURE', []),
    niveau('1er étage', [
      { nom: 'Pièce 1 Studio danse', fonction: 'Studio de danse', surface: 75 },
      { nom: 'Pièce 2 Loge', fonction: 'Loge artistes', surface: 18 },
    ], 'Maison des Arts et de la danse', 'CULTURE', []),
  ], []),

], []);

// ── Domaine ENSEIGNEMENT ──────────────────────────────────────────────────────

const domEnseignement = domaine('ENSEIGNEMENT', [

  batiment('Ferry Jules', '2 Rue Jules Ferry, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Chaufferie', fonction: 'Chaufferie', surface: 38 },
      { nom: 'Pièce 2 Couloir', fonction: 'Circulation', surface: 20 },
    ], 'Ferry Jules (Élémentaire)', 'ENSEIGNEMENT', []),
    niveau('1er étage', [
      { nom: 'Pièce 12', fonction: 'Salle de classe', surface: 62 },
    ], 'Ferry Jules (Élémentaire)', 'ENSEIGNEMENT', []),
    niveau('2ème étage', [
      { nom: 'Classe CM1', fonction: 'Salle de classe', surface: 62 },
    ], 'Ferry Jules (Élémentaire)', 'ENSEIGNEMENT', []),
  ], []),

  batiment('Le Bail Jean', '8 Rue Jean Bail, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Hall', fonction: 'Hall accueil', surface: 30 },
      { nom: 'Pièce 2 Salle de classe', fonction: 'Salle de classe', surface: 58 },
    ], 'Le Bail Jean', 'ENSEIGNEMENT', []),
  ], []),

  ecole('École Angèle Vannier', '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo', [
    batiment('Bâtiment A — Maternelle', '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo', [
      niveau('Rez-de-chaussée', [
        { nom: 'Classe PS', fonction: 'Salle de classe — Petite Section', surface: 55 },
        { nom: 'Classe MS', fonction: 'Salle de classe — Moyenne Section', surface: 55 },
        { nom: 'Classe GS', fonction: 'Salle de classe — Grande Section', surface: 55 },
        { nom: "Hall d'accueil", fonction: 'Hall accueil', surface: 40 },
        { nom: 'Salle de motricité', fonction: 'Salle de motricité', surface: 70 },
      ], 'Bâtiment A — Maternelle', 'ENSEIGNEMENT', []),
      niveau('1er étage', [
        { nom: 'Salle des maîtres', fonction: 'Salle des maîtres', surface: 25 },
        { nom: 'Bibliothèque maternelle', fonction: 'Bibliothèque', surface: 35 },
        { nom: 'Couloir 1er étage', fonction: 'Circulation', surface: 20 },
      ], 'Bâtiment A — Maternelle', 'ENSEIGNEMENT', []),
    ], [], 'a0000030-0000-0000-0000-000000000001'),

    batiment('Bâtiment B — Élémentaire', '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo', [
      niveau('Rez-de-chaussée', [
        { nom: 'Classe CP', fonction: 'Salle de classe — CP', surface: 50 },
        { nom: 'Classe CE1', fonction: 'Salle de classe — CE1', surface: 50 },
        { nom: 'Classe CE2', fonction: 'Salle de classe — CE2', surface: 50 },
        { nom: "Hall d'entrée", fonction: 'Hall accueil', surface: 35 },
      ], 'Bâtiment B — Élémentaire', 'ENSEIGNEMENT', []),
      niveau('1er étage', [
        { nom: 'Classe CM1', fonction: 'Salle de classe — CM1', surface: 50 },
        { nom: 'Classe CM2', fonction: 'Salle de classe — CM2', surface: 50 },
        { nom: 'Bibliothèque', fonction: 'Bibliothèque', surface: 40 },
        { nom: 'Salle informatique', fonction: 'Salle informatique', surface: 30 },
        { nom: 'Couloir 1er étage', fonction: 'Circulation', surface: 25 },
      ], 'Bâtiment B — Élémentaire', 'ENSEIGNEMENT', []),
    ], [], 'a0000030-0000-0000-0000-000000000002'),

    batiment('Bâtiment C — Restauration / Activités', '2 Rue du Bosquet aux Pommes, 35400 Saint-Malo', [
      niveau('Rez-de-chaussée', [
        { nom: 'Salle de restauration', fonction: 'Salle de restauration', surface: 120 },
        { nom: 'Office / Cuisine', fonction: 'Cuisine', surface: 50 },
      ], 'Bâtiment C — Restauration / Activités', 'ENSEIGNEMENT', []),
      niveau('1er étage', [
        { nom: 'Salle polyvalente', fonction: 'Salle polyvalente', surface: 80 },
        { nom: 'Salle de musique', fonction: 'Salle de musique', surface: 45 },
        { nom: 'Local associations', fonction: 'Local associations', surface: 25 },
      ], 'Bâtiment C — Restauration / Activités', 'ENSEIGNEMENT', []),
    ], [], 'a0000030-0000-0000-0000-000000000003'),
  ], [], 'a0000010-0000-0000-0000-000000000001'),

], []);

// ── Domaine PATRIMOINE ADMINISTRATIF ─────────────────────────────────────────

const domAdmin = domaine('PATRIMOINE ADMINISTRATIF', [

  batiment('Hôtel de Ville', '1 Place Léon Betoulle, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Accueil', fonction: 'Accueil public', surface: 55 },
      { nom: 'Pièce 2 Salle des mariages', fonction: 'Salle cérémonies', surface: 80 },
    ], 'Hôtel de Ville', 'PATRIMOINE ADMINISTRATIF', []),
    niveau('1er étage', [
      { nom: 'Pièce 1 Bureau du Maire', fonction: 'Bureau direction', surface: 45 },
      { nom: 'Pièce 2 Salle du conseil', fonction: 'Salle de réunion', surface: 95 },
    ], 'Hôtel de Ville', 'PATRIMOINE ADMINISTRATIF', []),
  ], []),

  batiment('Direction des Services Techniques', '12 Rue de la Boucherie, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Open space', fonction: 'Bureau open space', surface: 120 },
      { nom: 'Pièce 2 Salle de réunion', fonction: 'Salle de réunion', surface: 35 },
    ], 'Direction des Services Techniques', 'PATRIMOINE ADMINISTRATIF', []),
  ], []),

], []);

// ── Domaine Restaurants Scolaires ────────────────────────────────────────────

const domRestosSco = domaine('Restaurants Scolaires', [

  batiment('Restaurant Scolaire Ferry Jules', '2 Rue Jules Ferry, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Salle de restauration', fonction: 'Salle de restauration', surface: 150 },
      { nom: 'Pièce 2 Cuisine', fonction: 'Cuisine', surface: 60 },
      { nom: 'Pièce 3 Office', fonction: 'Office de préparation', surface: 25 },
    ], 'Restaurant Scolaire Ferry Jules', 'Restaurants Scolaires', []),
  ], [], 'c0000001-0000-0000-0000-000000000001'),

  batiment('Restaurant Scolaire Beaubreuil', '45 Rue Émile Zola, 87000 Limoges', [
    niveau('RDC', [
      { nom: 'Pièce 1 Salle de restauration', fonction: 'Salle de restauration', surface: 180 },
      { nom: 'Pièce 2 Cuisine', fonction: 'Cuisine', surface: 72 },
    ], 'Restaurant Scolaire Beaubreuil', 'Restaurants Scolaires', []),
  ], []),

], []);

// ── Domaine Non-bâti ──────────────────────────────────────────────────────────

function nonBatiElement(nom: string, adresse: string, subcatId: string, subcatNom: string): TreeNode {
  const id = uid('nbe');
  return {
    id,
    type: 'batiment_ext',
    nom,
    statut: 'fonctionnel',
    data: { adresse },
    ancestors: [{ type: 'domaine' as NodeType, nom: subcatNom, id: subcatId }],
    adresse_heritee: adresse,
  };
}

const PARCS_ID = 'a0000002-0000-0000-0000-000000000001';
const PLACES_ID = 'a0000002-0000-0000-0000-000000000002';
const VOIRIE_ID = 'a0000002-0000-0000-0000-000000000003';
const SPORTIFS_ID = 'a0000002-0000-0000-0000-000000000004';

const subcatParcs: TreeNode = {
  id: PARCS_ID,
  type: 'domaine',
  nom: 'Parcs et jardins',
  statut: 'fonctionnel',
  data: { nonBatiRes: true },
  ancestors: [],
  children: [
    nonBatiElement('Parc Victor-Thuillat', 'Rue Victor-Thuillat, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc de l\'Aurence', 'Allée de l\'Aurence, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc du Bas-Fargeas', 'Rue du Bas-Fargeas, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc du Mas-Rome', 'Avenue du Mas-Rome, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc de l\'Auzette', 'Chemin de l\'Auzette, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc de la Borie', 'Rue de la Borie, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Jardin d\'Orsay', 'Quai Orsay, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Jardins de l\'Évêché', 'Place de la Cathédrale, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Jardin du Champ de Juillet', 'Place Carnot, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc des Bords de Vienne', 'Berges de la Vienne, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc Sainte-Félicité', 'Rue Sainte-Félicité, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Parc de la Filature', 'Rue de la Filature, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Square des Emailleurs', 'Place des Emailleurs, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Square Winston-Churchill', 'Boulevard Winston-Churchill, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
    nonBatiElement('Square des Carmes', 'Rue des Carmes, 87000 Limoges', PARCS_ID, 'Parcs et jardins'),
  ],
};

const subcatPlaces: TreeNode = {
  id: PLACES_ID,
  type: 'domaine',
  nom: 'Places publiques',
  statut: 'fonctionnel',
  data: { nonBatiRes: true },
  ancestors: [],
  children: [
    nonBatiElement('Place de la République', 'Place de la République, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place Denis-Dussoubs', 'Place Denis-Dussoubs, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place de la Motte', 'Place de la Motte, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place des Bancs', 'Place des Bancs, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place Carnot', 'Place Carnot, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place Jourdan', 'Place Jourdan, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place Winston-Churchill', 'Place Winston-Churchill, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place d\'Aine', 'Place d\'Aine, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place Haute-Vienne', 'Place Haute-Vienne, 87000 Limoges', PLACES_ID, 'Places publiques'),
    nonBatiElement('Place Léon-Betoulle', 'Place Léon-Betoulle, 87000 Limoges', PLACES_ID, 'Places publiques'),
  ],
};

const subcatVoirie: TreeNode = {
  id: VOIRIE_ID,
  type: 'domaine',
  nom: 'Voirie',
  statut: 'fonctionnel',
  data: { nonBatiRes: true },
  ancestors: [],
  children: [
    nonBatiElement('Avenue Garibaldi', 'Avenue Garibaldi, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Avenue du Général-Leclerc', 'Avenue du Général-Leclerc, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Avenue Émile-Labussière', 'Avenue Émile-Labussière, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Rue François-Chénieux', 'Rue François-Chénieux, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Rue Théodore-Bac', 'Rue Théodore-Bac, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Boulevard de Vanteaux', 'Boulevard de Vanteaux, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Boulevard Bel-Air', 'Boulevard Bel-Air, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Boulevard de la Corderie', 'Boulevard de la Corderie, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Berges de Vienne (secteur Font Pinot)', 'Font Pinot, Berges de Vienne, 87000 Limoges', VOIRIE_ID, 'Voirie'),
    nonBatiElement('Coulée verte de l\'Auzette', 'Chemin de l\'Auzette, 87000 Limoges', VOIRIE_ID, 'Voirie'),
  ],
};

const subcatSportifs: TreeNode = {
  id: SPORTIFS_ID,
  type: 'domaine',
  nom: 'Sites sportifs extérieurs',
  statut: 'fonctionnel',
  data: { nonBatiRes: true },
  ancestors: [],
  children: [
    nonBatiElement('Stade de Beaublanc', 'Rue du Stade, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Stade municipal de Landouge', 'Rue de Landouge, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Stade Saint-Lazare', 'Rue Saint-Lazare, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Stade des Casseaux', 'Rue des Casseaux, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Complexe sportif de la Borie', 'Rue de la Borie, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Terrain de football de Beaubreuil', 'Allée de Beaubreuil, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Terrain de football de Val de l\'Aurence', 'Val de l\'Aurence, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Terrain de football de La Bastide', 'Rue de la Bastide, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Terrain de rugby de Beaublanc', 'Rue du Stade, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Piste d\'athlétisme de Beaublanc', 'Rue du Stade, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
    nonBatiElement('Terrains extérieurs du Parc des Sports de Beaublanc', 'Parc des Sports, 87000 Limoges', SPORTIFS_ID, 'Sites sportifs extérieurs'),
  ],
};

const domNonBati: TreeNode = {
  id: 'lim-nonbati-root',
  type: 'domaine',
  nom: 'Non-bâti',
  statut: 'fonctionnel',
  data: {},
  ancestors: [],
  children: [subcatParcs, subcatPlaces, subcatVoirie, subcatSportifs],
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const LIMOGES_DOMAINES: TreeNode[] = [
  domCulture,
  domEnseignement,
  domRestosSco,
  domAdmin,
  domNonBati,
];
