import type { Notification, ModeleComm, RegleDeclenchement, Escalade, Synthese, HistoriqueEnvoi } from './commTypes';

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1',  date: '2026-06-07 08:12', type: 'Intervention créée',        objet: 'DI-2026-089 — Panne chaudière résidence Cavalier', module: 'interventions',      destinataire: 'j.martin@crous-lyon.fr',   canal: 'email_notif', statut: 'lue',        lu: true,  equipement: 'Chaudière collective gaz 150 kW',           localisation: ['Campus Centre Lyon 6', 'Résidence Jacques Cavalier', 'Local chaudière RDC'], targetView: 'interventions'     },
  { id: 'n2',  date: '2026-06-07 08:45', type: 'Contrat expirant',          objet: 'Contrat maintenance CVC — Thermique Atlantique',   module: 'contrats',           destinataire: 'g.leroy@crous-lyon.fr',    canal: 'email',       statut: 'distribuee', lu: false, equipement: 'Chaufferie CVC — réseau primaire',          localisation: ['Campus Centre Lyon 6', 'Résidence Jacques Cavalier', 'Local technique'], targetView: 'contrats'          },
  { id: 'n3',  date: '2026-06-07 09:03', type: 'Contrôle à échéance',       objet: 'Contrôle SSI — Résidence Les Quais (J-7)',          module: 'reglementaire',      destinataire: 'r.dupont@crous-lyon.fr',   canal: 'notif',       statut: 'envoyee',    lu: false, equipement: 'Système de Sécurité Incendie (SSI)',        localisation: ['Campus Nord', 'Résidence Les Quais', 'Tableau SSI — Hall entrée'], targetView: 'reglementaire'     },
  { id: 'n4',  date: '2026-06-07 09:15', type: 'Rupture de stock',          objet: 'Filtre G4 600×400mm — stock = 0',                   module: 'approvisionnements', destinataire: 'a.bernard@crous-lyon.fr',  canal: 'notif',       statut: 'lue',        lu: true,  equipement: 'Filtre G4 600×400mm',                       localisation: ['Stock central', 'Magasin maintenance', 'Rayonnage filtres'], targetView: 'approvisionnements' },
  { id: 'n5',  date: '2026-06-07 09:30', type: 'Intervention en retard',    objet: 'DI-2026-076 — Fuite robinetterie non traitée',       module: 'interventions',      destinataire: 'j.martin@crous-lyon.fr',   canal: 'email_notif', statut: 'lue',        lu: true,  equipement: 'Robinetterie cuisine — évier principal',    localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'], targetView: 'interventions'     },
  { id: 'n6',  date: '2026-06-07 10:00', type: 'Plan maintenance à venir',  objet: 'Nettoyage condenseurs — Armoire positive (J-3)',     module: 'maintenance',        destinataire: 'f.moreau@crous-lyon.fr',   canal: 'notif',       statut: 'envoyee',    lu: false, equipement: 'Armoire positive 5°C ± 2°C 1361 L',         localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'], targetView: 'interventions'     },
  { id: 'n7',  date: '2026-06-06 17:45', type: 'Nouvel état des lieux',     objet: 'EDL sortant — Logement 108 Résidence Cavalier',      module: 'edl',                destinataire: 'a.dupont@crous-lyon.fr',   canal: 'email',       statut: 'lue',        lu: true,  equipement: 'Logement T1 — chambre 108',                 localisation: ['Campus Centre Lyon 6', 'Résidence Jacques Cavalier', 'Bâtiment A — 1er étage'], targetView: 'edl'               },
  { id: 'n8',  date: '2026-06-06 16:12', type: 'Escalade déclenchée',       objet: 'DI-2026-072 — Critique non prise en charge 48h',     module: 'interventions',      destinataire: 'direction@crous-lyon.fr',  canal: 'email',       statut: 'erreur',     lu: false, equipement: 'Ascenseur — cabine principale',             localisation: ['Campus Centre Lyon 6', 'Résidence Jacques Cavalier', 'Cage d\'ascenseur'], targetView: 'interventions'     },
  { id: 'n9',  date: '2026-06-06 14:00', type: 'Devis validé',              objet: 'DA-2026-041 — Pièces armoire réfrigérée',             module: 'approvisionnements', destinataire: 'a.bernard@crous-lyon.fr',  canal: 'email_notif', statut: 'lue',        lu: true,  equipement: 'Armoire réfrigérée positive 1430 L',        localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'], targetView: 'approvisionnements' },
  { id: 'n10', date: '2026-06-06 11:30', type: 'Synthèse hebdomadaire',     objet: 'Synthèse maintenance — semaine 23',                  module: 'maintenance',        destinataire: 'direction@crous-lyon.fr',  canal: 'email',       statut: 'distribuee', lu: false, equipement: undefined,                                   localisation: undefined, targetView: 'interventions'     },
  { id: 'n11', date: '2026-06-05 09:00', type: 'Équipement à renouveler',   objet: 'Armoire positive — Score de vétusté > 80%',           module: 'renouvellements',    destinataire: 'g.leroy@crous-lyon.fr',    canal: 'email',       statut: 'lue',        lu: true,  equipement: 'Armoire positive 5°C ± 2°C 1361 L',         localisation: ['Campus Manufacture des Tabacs', 'Resto\'U Manu', 'Cuisine'], targetView: 'ppi'               },
  { id: 'n12', date: '2026-06-05 08:15', type: 'Action corrective créée',   objet: 'Non-conformité SSI — Résidence Garibaldi',           module: 'reglementaire',      destinataire: 'r.dupont@crous-lyon.fr',   canal: 'notif',       statut: 'lue',        lu: true,  equipement: 'Système de Sécurité Incendie (SSI)',        localisation: ['Campus Nord', 'Résidence Garibaldi', 'Tableau SSI — RDC'], targetView: 'reglementaire'     },
];

export const MOCK_MODELES: ModeleComm[] = [
  { id: 'm1', nom: 'Demande d\'intervention enregistrée',   type: 'email_notif', module: 'interventions',     evenement: 'Demande créée',             actif: true,  sujet: 'Demande {{ticket.reference}} enregistrée',            corps: 'Bonjour {{demandeur.prenom}},\n\nVotre demande {{ticket.reference}} a bien été enregistrée.\n\nNous vous tiendrons informé de son avancement.\n\nCordialement,', dernierEnvoi: '2026-06-07 08:12', nbEnvois: 1240, tauxOuverture: 94 },
  { id: 'm2', nom: 'Intervention affectée à un technicien', type: 'email_notif', module: 'interventions',     evenement: 'Demande affectée',          actif: true,  sujet: 'Intervention {{ticket.reference}} assignée à {{responsable.nom}}', corps: 'Bonjour,\n\nL\'intervention {{ticket.reference}} vous a été assignée.\n\nDate prévue : {{intervention.date_prevue}}\n\nCordialement,', dernierEnvoi: '2026-06-07 09:45', nbEnvois: 876, tauxOuverture: 98 },
  { id: 'm3', nom: 'Rappel contrôle réglementaire J-7',     type: 'email',       module: 'reglementaire',     evenement: 'Contrôle à échéance',       actif: true,  sujet: 'Rappel : contrôle {{controle.type}} prévu le {{controle.date}}',    corps: 'Bonjour {{responsable.prenom}},\n\nRappel : le contrôle {{controle.type}} est prévu dans 7 jours.\n\nVeuillez vous assurer de la disponibilité de l\'équipement.', dernierEnvoi: '2026-06-07 09:03', nbEnvois: 342, tauxOuverture: 89 },
  { id: 'm4', nom: 'Contrat expirant à 30 jours',           type: 'email',       module: 'contrats',          evenement: 'Contrat expirant',          actif: true,  sujet: 'Contrat {{contrat.ref}} expire le {{contrat.date_fin}}',            corps: 'Bonjour {{gestionnaire.prenom}},\n\nLe contrat {{contrat.ref}} avec {{contrat.prestataire}} expire dans 30 jours.\n\nVeuillez lancer la procédure de renouvellement.', dernierEnvoi: '2026-06-07 08:45', nbEnvois: 128, tauxOuverture: 91 },
  { id: 'm5', nom: 'Rupture de stock détectée',             type: 'notif',       module: 'approvisionnements', evenement: 'Rupture de stock',         actif: true,  sujet: 'Rupture stock : {{article.nom}}',                                   corps: 'Le stock de {{article.nom}} (réf. {{article.ref}}) est épuisé.\n\nDemande d\'achat urgente à créer.', dernierEnvoi: '2026-06-07 09:15', nbEnvois: 67, tauxOuverture: 100 },
  { id: 'm6', nom: 'Synthèse hebdomadaire maintenance',     type: 'email',       module: 'maintenance',        evenement: 'Synthèse hebdomadaire',    actif: true,  sujet: 'Synthèse maintenance — semaine {{semaine}}',                        corps: 'Bonjour,\n\nVoici la synthèse de la semaine {{semaine}} :\n\n• {{nb_interventions}} interventions réalisées\n• {{nb_retards}} en retard\n• {{nb_controles}} contrôles à échéance', dernierEnvoi: '2026-06-06 10:00', nbEnvois: 52, tauxOuverture: 86 },
  { id: 'm7', nom: 'Escalade critique 48h sans réponse',    type: 'email',       module: 'interventions',      evenement: 'Intervention en retard',   actif: true,  sujet: 'URGENT — Intervention {{ticket.reference}} sans réponse depuis 48h', corps: 'Attention,\n\nL\'intervention critique {{ticket.reference}} est sans réponse depuis 48 heures.\n\nEscalade vers la Direction technique.', dernierEnvoi: '2026-06-06 16:12', nbEnvois: 8, tauxOuverture: 100 },
  { id: 'm8', nom: 'Nouvel état des lieux créé',            type: 'email_notif', module: 'edl',                evenement: 'EDL créé',                  actif: false, sujet: 'Nouvel état des lieux — {{logement.ref}}',                          corps: 'Bonjour {{occupant.prenom}},\n\nUn état des lieux a été créé pour le logement {{logement.ref}}.\n\nDate prévue : {{edl.date}}\n\nCordialement,', nbEnvois: 0, tauxOuverture: 0 },
];

export const MOCK_REGLES: RegleDeclenchement[] = [
  { id: 'r1', module: 'interventions',     evenement: 'Demande créée',          modeleId: 'm1', modeleNom: 'Demande d\'intervention enregistrée',   delai: 'Immédiat',   frequence: 'Une seule fois',    actif: true  },
  { id: 'r2', module: 'interventions',     evenement: 'Demande affectée',       modeleId: 'm2', modeleNom: 'Intervention affectée à un technicien', delai: 'Immédiat',   frequence: 'Une seule fois',    actif: true  },
  { id: 'r3', module: 'interventions',     evenement: 'Intervention en retard', modeleId: 'm7', modeleNom: 'Escalade critique 48h sans réponse',    delai: '48h après',  frequence: 'Rappel quotidien',  actif: true  },
  { id: 'r4', module: 'reglementaire',     evenement: 'Contrôle à échéance',    modeleId: 'm3', modeleNom: 'Rappel contrôle réglementaire J-7',     delai: '7j avant',   frequence: 'Une seule fois',    actif: true  },
  { id: 'r5', module: 'contrats',          evenement: 'Contrat expirant',       modeleId: 'm4', modeleNom: 'Contrat expirant à 30 jours',           delai: '30j avant',  frequence: 'Une seule fois',    actif: true  },
  { id: 'r6', module: 'approvisionnements', evenement: 'Rupture de stock',      modeleId: 'm5', modeleNom: 'Rupture de stock détectée',             delai: 'Immédiat',   frequence: 'Une seule fois',    actif: true  },
  { id: 'r7', module: 'maintenance',       evenement: 'Synthèse hebdomadaire',  modeleId: 'm6', modeleNom: 'Synthèse hebdomadaire maintenance',     delai: 'Lundi 8h',   frequence: 'Rappel hebdomadaire', actif: true },
  { id: 'r8', module: 'edl',              evenement: 'EDL créé',               modeleId: 'm8', modeleNom: 'Nouvel état des lieux créé',            delai: 'Immédiat',   frequence: 'Une seule fois',    actif: false },
];

export const MOCK_ESCALADES: Escalade[] = [
  {
    id: 'e1', nom: 'Intervention critique non prise en charge', module: 'interventions', evenement: 'Intervention critique en retard', actif: true,
    niveaux: [
      { niveau: 1, destinataire: 'Responsable maintenance', delai: '24h' },
      { niveau: 2, destinataire: 'Gestionnaire patrimoine', delai: '48h' },
      { niveau: 3, destinataire: 'Direction technique',     delai: '72h' },
    ],
  },
  {
    id: 'e2', nom: 'Contrôle réglementaire non réalisé', module: 'reglementaire', evenement: 'Contrôle en retard', actif: true,
    niveaux: [
      { niveau: 1, destinataire: 'Responsable sécurité', delai: '24h' },
      { niveau: 2, destinataire: 'Direction technique',  delai: '72h' },
    ],
  },
  {
    id: 'e3', nom: 'Contrat expirant sans action', module: 'contrats', evenement: 'Contrat expirant à 15j sans renouvellement', actif: true,
    niveaux: [
      { niveau: 1, destinataire: 'Gestionnaire patrimoine', delai: '7j avant' },
      { niveau: 2, destinataire: 'Direction administrative', delai: '3j avant' },
    ],
  },
];

export const MOCK_SYNTHESES: Synthese[] = [
  { id: 's1', nom: 'Synthèse quotidienne interventions', frequence: 'quotidienne',  destinataires: ['Responsable maintenance', 'Gestionnaire patrimoine'], modules: ['interventions'],           actif: true,  prochainEnvoi: '2026-06-08 07:00' },
  { id: 's2', nom: 'Synthèse hebdomadaire complète',    frequence: 'hebdomadaire',  destinataires: ['Direction technique', 'Gestionnaire patrimoine'],    modules: ['interventions', 'maintenance', 'contrats', 'reglementaire'], actif: true, prochainEnvoi: '2026-06-10 08:00' },
  { id: 's3', nom: 'Rapport mensuel maintenance',        frequence: 'mensuelle',     destinataires: ['Direction technique', 'Direction administrative'],   modules: ['maintenance', 'approvisionnements', 'renouvellements'],  actif: true, prochainEnvoi: '2026-07-01 08:00' },
  { id: 's4', nom: 'Synthèse contrôles réglementaires', frequence: 'hebdomadaire',  destinataires: ['Responsable sécurité', 'Direction technique'],       modules: ['reglementaire'],           actif: false, prochainEnvoi: '—' },
];

export const MOCK_HISTORIQUE: HistoriqueEnvoi[] = [
  { id: 'h1',  date: '2026-06-07 08:12', canal: 'email_notif', destinataire: 'j.martin@crous-lyon.fr',   modele: 'Demande créée',                objet: 'DI-2026-089 enregistrée',          statut: 'lue',        module: 'interventions'     },
  { id: 'h2',  date: '2026-06-07 08:45', canal: 'email',       destinataire: 'g.leroy@crous-lyon.fr',    modele: 'Contrat expirant à 30 jours',  objet: 'Contrat maintenance CVC',          statut: 'distribuee', module: 'contrats'          },
  { id: 'h3',  date: '2026-06-07 09:03', canal: 'notif',       destinataire: 'r.dupont@crous-lyon.fr',   modele: 'Rappel contrôle J-7',          objet: 'Contrôle SSI Résidence Les Quais', statut: 'envoyee',    module: 'reglementaire'     },
  { id: 'h4',  date: '2026-06-07 09:15', canal: 'notif',       destinataire: 'a.bernard@crous-lyon.fr',  modele: 'Rupture de stock détectée',    objet: 'Filtre G4 600×400mm',              statut: 'lue',        module: 'approvisionnements'},
  { id: 'h5',  date: '2026-06-07 09:30', canal: 'email_notif', destinataire: 'j.martin@crous-lyon.fr',   modele: 'Intervention en retard',       objet: 'DI-2026-076 — Fuite robinetterie', statut: 'lue',        module: 'interventions'     },
  { id: 'h6',  date: '2026-06-07 10:00', canal: 'notif',       destinataire: 'f.moreau@crous-lyon.fr',   modele: 'Plan maintenance à venir',     objet: 'Nettoyage condenseurs J-3',        statut: 'envoyee',    module: 'maintenance'       },
  { id: 'h7',  date: '2026-06-06 17:45', canal: 'email',       destinataire: 'a.dupont@crous-lyon.fr',   modele: 'Nouvel état des lieux',        objet: 'EDL sortant — Logement 108',       statut: 'lue',        module: 'edl'               },
  { id: 'h8',  date: '2026-06-06 16:12', canal: 'email',       destinataire: 'direction@crous-lyon.fr',  modele: 'Escalade critique 48h',        objet: 'DI-2026-072 critique en retard',   statut: 'erreur',     module: 'interventions'     },
  { id: 'h9',  date: '2026-06-06 14:00', canal: 'email_notif', destinataire: 'a.bernard@crous-lyon.fr',  modele: 'Devis validé',                 objet: 'DA-2026-041 — Pièces armoire',     statut: 'lue',        module: 'approvisionnements'},
  { id: 'h10', date: '2026-06-06 11:30', canal: 'email',       destinataire: 'direction@crous-lyon.fr',  modele: 'Synthèse hebdomadaire',        objet: 'Synthèse maintenance semaine 23',  statut: 'distribuee', module: 'maintenance'       },
  { id: 'h11', date: '2026-06-06 09:00', canal: 'email',       destinataire: 'g.leroy@crous-lyon.fr',    modele: 'Équipement à renouveler',      objet: 'Armoire positive — Score 82%',     statut: 'lue',        module: 'renouvellements'   },
  { id: 'h12', date: '2026-06-06 08:15', canal: 'notif',       destinataire: 'r.dupont@crous-lyon.fr',   modele: 'Action corrective créée',      objet: 'Non-conformité SSI Garibaldi',     statut: 'lue',        module: 'reglementaire'     },
];
