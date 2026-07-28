
-- ============================================================
-- SEED: Logement 108 — Résidence Jacques Cavalier
-- 5 EDL entrants + 4 EDL sortants avec items et photos
-- ============================================================

DO $$
DECLARE
  log108  UUID := 'd192009e-47d4-4825-929b-3a2c132b4356';
  res11   UUID := 'b1000001-0000-0000-0000-000000000011';
  edl_e1 UUID := gen_random_uuid(); edl_s1 UUID := gen_random_uuid();
  edl_e2 UUID := gen_random_uuid(); edl_s2 UUID := gen_random_uuid();
  edl_e3 UUID := gen_random_uuid(); edl_s3 UUID := gen_random_uuid();
  edl_e4 UUID := gen_random_uuid(); edl_s4 UUID := gen_random_uuid();
  edl_e5 UUID := gen_random_uuid();
  occ1 UUID; occ2 UUID; occ3 UUID; occ4 UUID; occ5 UUID;
BEGIN

-- Occupants du logement 108
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, lien_edl_entrant, statut_edl_sortant, date_edl_sortant, lien_edl_sortant, statut)
VALUES (log108,'Marchand','Clémence','c.marchand@univ-lyon1.fr','06 18 29 30 41','Université Lyon 1','Résidence CROUS','2020-09-07','2021-06-30','realise','2020-09-07','EDL-2020-CAV-108-E','realise','2021-06-25','EDL-2021-CAV-108-S','ancien_occupant') RETURNING id INTO occ1;

INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, lien_edl_entrant, statut_edl_sortant, date_edl_sortant, lien_edl_sortant, statut)
VALUES (log108,'Dupont','Thomas','t.dupont@insa-lyon.fr','06 29 30 41 52','INSA Lyon','Résidence CROUS','2021-09-06','2022-06-30','realise','2021-09-06','EDL-2021-CAV-108-E','realise','2022-06-27','EDL-2022-CAV-108-S','ancien_occupant') RETURNING id INTO occ2;

INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, lien_edl_entrant, statut_edl_sortant, date_edl_sortant, lien_edl_sortant, statut)
VALUES (log108,'Lefèvre','Sarah','s.lefevre@lyon2.fr','06 30 41 52 63','Université Lyon 2','Résidence CROUS','2022-09-05','2023-06-30','realise','2022-09-05','EDL-2022-CAV-108-E','realise','2023-06-29','EDL-2023-CAV-108-S','ancien_occupant') RETURNING id INTO occ3;

INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, lien_edl_entrant, statut_edl_sortant, date_edl_sortant, lien_edl_sortant, statut)
VALUES (log108,'Perrin','Mathieu','m.perrin@ec-lyon.fr','06 41 52 63 74','École Centrale Lyon','Résidence CROUS','2023-09-04','2024-06-30','realise','2023-09-04','EDL-2023-CAV-108-E','realise','2024-06-28','EDL-2024-CAV-108-S','ancien_occupant') RETURNING id INTO occ4;

INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, lien_edl_entrant, statut_edl_sortant, statut)
VALUES (log108,'Leclerc','Emma','e.leclerc@lyon3.fr','06 52 63 74 85','Université Lyon 3','Résidence CROUS','2024-09-03','2025-06-30','realise','2024-09-03','EDL-2024-CAV-108-E','a_realiser','occupant_actuel') RETURNING id INTO occ5;

-- EDL dans edl_etats_des_lieux (type_edl: entree/sortie | statut: signe/termine)
INSERT INTO edl_etats_des_lieux (id, reference, type_edl, statut, logement_id, residence_id, occupant_id, etudiant_nom, etudiant_email, etudiant_telephone, agent_nom, date_edl, date_signature, score_global, nb_anomalies, nb_anomalies_critiques, cout_estime, observations, synced_si_logement, synced_bns) VALUES
  (edl_e1,'EDL-2020-CAV-108-E','entree','signe',log108,res11,occ1,'Marchand Clémence','c.marchand@univ-lyon1.fr','06 18 29 30 41','Marie Leconte','2020-09-07','2020-09-07',95,0,0,0,'Logement en très bon état à l''entrée. Aucune anomalie constatée. Toutes les pièces propres et fonctionnelles.',true,true),
  (edl_s1,'EDL-2021-CAV-108-S','sortie','signe',log108,res11,occ1,'Marchand Clémence','c.marchand@univ-lyon1.fr','06 18 29 30 41','Marie Leconte','2021-06-25','2021-06-25',82,3,0,120,'Légères marques sur les murs de la pièce principale. Sol cuisine à nettoyer. Ampoule SDB à remplacer.',true,true),
  (edl_e2,'EDL-2021-CAV-108-E','entree','signe',log108,res11,occ2,'Dupont Thomas','t.dupont@insa-lyon.fr','06 29 30 41 52','Marie Leconte','2021-09-06','2021-09-06',88,2,0,80,'Bon état général. Mur légèrement taché côté fenêtre. Poignée porte WC à surveiller.',true,true),
  (edl_s2,'EDL-2022-CAV-108-S','sortie','signe',log108,res11,occ2,'Dupont Thomas','t.dupont@insa-lyon.fr','06 29 30 41 52','Paul Renard','2022-06-27','2022-06-27',74,5,1,320,'Trou dans mur PP. Sol PP accrocs. Robinet cuisine fuite légère. Abattant WC cassé. Porte kitchenette pb fermeture.',true,true),
  (edl_e3,'EDL-2022-CAV-108-E','entree','signe',log108,res11,occ3,'Lefèvre Sarah','s.lefevre@lyon2.fr','06 30 41 52 63','Paul Renard','2022-09-05','2022-09-05',91,1,0,0,'Bon état après remise en état. Légère trace peinture plafond WC.',true,true),
  (edl_s3,'EDL-2023-CAV-108-S','sortie','signe',log108,res11,occ3,'Lefèvre Sarah','s.lefevre@lyon2.fr','06 30 41 52 63','Paul Renard','2023-06-29','2023-06-29',87,2,0,90,'Kitchenette à nettoyer. Vitre côté cour légèrement rayée.',true,true),
  (edl_e4,'EDL-2023-CAV-108-E','entree','signe',log108,res11,occ4,'Perrin Mathieu','m.perrin@ec-lyon.fr','06 41 52 63 74','Sophie Arnaud','2023-09-04','2023-09-04',93,1,0,0,'Très bon état général. Détecteur de fumée vérifié. Radiateur légèrement encrassé.',true,true),
  (edl_s4,'EDL-2024-CAV-108-S','sortie','signe',log108,res11,occ4,'Perrin Mathieu','m.perrin@ec-lyon.fr','06 41 52 63 74','Sophie Arnaud','2024-06-28','2024-06-28',79,4,0,210,'Mur PP tâché. Sol SDB accroc. Crédence cuisine décolée. Volet bloqué à mi-hauteur.',true,true),
  (edl_e5,'EDL-2024-CAV-108-E','entree','signe',log108,res11,occ5,'Leclerc Emma','e.leclerc@lyon3.fr','06 52 63 74 85','Sophie Arnaud','2024-09-03','2024-09-03',96,0,0,0,'Logement remis en état complet. Peinture fraîche. Tout équipement fonctionnel. RAS.',true,true);

-- ── Items — etat: neuf/bon/use/degrade/casse/absent ───────────────────────────
-- Entrant 1 — Clémence 2020 (tout en bon/neuf état)
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_e1,'Pièce Principale','Porte','bon',NULL,0),(edl_e1,'Pièce Principale','Mur','bon',NULL,0),(edl_e1,'Pièce Principale','Plafond','bon',NULL,0),(edl_e1,'Pièce Principale','Sol','bon',NULL,0),(edl_e1,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_e1,'Pièce Principale','Radiateur','bon',NULL,0),
  (edl_e1,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_e1,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_e1,'Salle de Bain','Sol','bon',NULL,0),(edl_e1,'Salle de Bain','Miroir','bon',NULL,0),
  (edl_e1,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_e1,'WC / Toilettes','Abattant','bon',NULL,0),
  (edl_e1,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_e1,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_e1,'Cuisine / Kitchenette','Réfrigérateur','bon',NULL,0),(edl_e1,'Cuisine / Kitchenette','Plaques cuisson','bon',NULL,0),
  (edl_e1,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_e1,'Entrée / Couloir','Sol','bon',NULL,0);

-- Sortant 1 — Clémence 2021
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_s1,'Pièce Principale','Porte','bon',NULL,0),(edl_s1,'Pièce Principale','Mur','use','Légères marques côté bureau',50),(edl_s1,'Pièce Principale','Plafond','bon',NULL,0),(edl_s1,'Pièce Principale','Sol','bon',NULL,0),(edl_s1,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_s1,'Pièce Principale','Radiateur','use','Encrassement léger',20),
  (edl_s1,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_s1,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_s1,'Salle de Bain','Éclairage','degrade','Ampoule grillée',50),
  (edl_s1,'WC / Toilettes','Cuvette','use','Tartre à détartrer',0),(edl_s1,'WC / Toilettes','Abattant','bon',NULL,0),
  (edl_s1,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_s1,'Cuisine / Kitchenette','Évier','use','Calcaire sur le robinet',0),(edl_s1,'Cuisine / Kitchenette','Sol','use','Traces de graisse',0),
  (edl_s1,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_s1,'Entrée / Couloir','Sol','bon',NULL,0);

-- Entrant 2 — Thomas 2021
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_e2,'Pièce Principale','Porte','bon',NULL,0),(edl_e2,'Pièce Principale','Mur','use','Légère tache côté fenêtre',0),(edl_e2,'Pièce Principale','Plafond','bon',NULL,0),(edl_e2,'Pièce Principale','Sol','bon',NULL,0),(edl_e2,'Pièce Principale','Fenêtre','use','Traces calcaire',0),(edl_e2,'Pièce Principale','Radiateur','bon',NULL,0),
  (edl_e2,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_e2,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_e2,'Salle de Bain','Sol','bon',NULL,0),
  (edl_e2,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_e2,'WC / Toilettes','Porte','degrade','Poignée desserrée',80),
  (edl_e2,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_e2,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_e2,'Cuisine / Kitchenette','Réfrigérateur','bon',NULL,0),(edl_e2,'Cuisine / Kitchenette','Plaques cuisson','bon',NULL,0),
  (edl_e2,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_e2,'Entrée / Couloir','Sol','bon',NULL,0);

-- Sortant 2 — Thomas 2022 (dégradations notables)
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_s2,'Pièce Principale','Porte','bon',NULL,0),(edl_s2,'Pièce Principale','Mur','degrade','Trou de cheville, marques multiples',80),(edl_s2,'Pièce Principale','Plafond','bon',NULL,0),(edl_s2,'Pièce Principale','Sol','degrade','Accrocs visibles côté lit, brûlure possible',120),(edl_s2,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_s2,'Pièce Principale','Radiateur','bon',NULL,0),
  (edl_s2,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_s2,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_s2,'Salle de Bain','Sol','bon',NULL,0),
  (edl_s2,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_s2,'WC / Toilettes','Abattant','casse','Fissuré, charnières cassées',40),
  (edl_s2,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_s2,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_s2,'Cuisine / Kitchenette','Mitigeur cuisine','degrade','Fuite légère au niveau du joint',80),(edl_s2,'Cuisine / Kitchenette','Porte kitchenette','use','Fermeture difficile, gond à resserrer',0),
  (edl_s2,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_s2,'Entrée / Couloir','Sol','bon',NULL,0);

-- Entrant 3 — Sarah 2022
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_e3,'Pièce Principale','Porte','bon',NULL,0),(edl_e3,'Pièce Principale','Mur','neuf','Remis en peinture',0),(edl_e3,'Pièce Principale','Plafond','bon',NULL,0),(edl_e3,'Pièce Principale','Sol','bon','Parquet remis en état',0),(edl_e3,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_e3,'Pièce Principale','Radiateur','bon',NULL,0),
  (edl_e3,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_e3,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_e3,'Salle de Bain','Sol','bon',NULL,0),
  (edl_e3,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_e3,'WC / Toilettes','Plafond','use','Légère trace de peinture',0),
  (edl_e3,'Cuisine / Kitchenette','Plan de travail','neuf','Plan de travail neuf',0),(edl_e3,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_e3,'Cuisine / Kitchenette','Réfrigérateur','bon',NULL,0),(edl_e3,'Cuisine / Kitchenette','Plaques cuisson','bon',NULL,0),
  (edl_e3,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_e3,'Entrée / Couloir','Sol','bon',NULL,0);

-- Sortant 3 — Sarah 2023
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_s3,'Pièce Principale','Porte','bon',NULL,0),(edl_s3,'Pièce Principale','Mur','bon',NULL,0),(edl_s3,'Pièce Principale','Plafond','bon',NULL,0),(edl_s3,'Pièce Principale','Sol','bon',NULL,0),(edl_s3,'Pièce Principale','Fenêtre','use','Traces calcaire extérieur',0),(edl_s3,'Pièce Principale','Radiateur','bon',NULL,0),
  (edl_s3,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_s3,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_s3,'Salle de Bain','Sol','bon',NULL,0),
  (edl_s3,'WC / Toilettes','Cuvette','bon',NULL,0),
  (edl_s3,'Cuisine / Kitchenette','Plan de travail','use','Taches légères près des plaques',40),(edl_s3,'Cuisine / Kitchenette','Évier','use','Calcaire sur le bec',0),(edl_s3,'Cuisine / Kitchenette','Réfrigérateur','use','Bac intérieur à nettoyer',0),(edl_s3,'Cuisine / Kitchenette','Vitre fenêtre','degrade','Rayure diagonale côté cour',50),
  (edl_s3,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_s3,'Entrée / Couloir','Sol','bon',NULL,0);

-- Entrant 4 — Mathieu 2023
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_e4,'Pièce Principale','Porte','bon',NULL,0),(edl_e4,'Pièce Principale','Mur','bon',NULL,0),(edl_e4,'Pièce Principale','Plafond','bon',NULL,0),(edl_e4,'Pièce Principale','Sol','bon',NULL,0),(edl_e4,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_e4,'Pièce Principale','Radiateur','use','Léger encrassement sur les ailettes',0),
  (edl_e4,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_e4,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_e4,'Salle de Bain','Sol','bon',NULL,0),
  (edl_e4,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_e4,'WC / Toilettes','Abattant','bon',NULL,0),
  (edl_e4,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_e4,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_e4,'Cuisine / Kitchenette','Réfrigérateur','bon',NULL,0),(edl_e4,'Cuisine / Kitchenette','Plaques cuisson','bon',NULL,0),
  (edl_e4,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_e4,'Entrée / Couloir','Sol','bon',NULL,0);

-- Sortant 4 — Mathieu 2024
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_s4,'Pièce Principale','Porte','bon',NULL,0),(edl_s4,'Pièce Principale','Mur','use','Traces de marqueur côté bureau, tache humidité angle',60),(edl_s4,'Pièce Principale','Plafond','bon',NULL,0),(edl_s4,'Pièce Principale','Sol','bon',NULL,0),(edl_s4,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_s4,'Pièce Principale','Volet','casse','Volet roulant bloqué à mi-hauteur',80),
  (edl_s4,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_s4,'Salle de Bain','Sol','degrade','Accroc dans le revêtement vinyle',50),(edl_s4,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),
  (edl_s4,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_s4,'WC / Toilettes','Abattant','bon',NULL,0),
  (edl_s4,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_s4,'Cuisine / Kitchenette','Crédence','degrade','Carrelage décollé 2 carreaux, angle gauche',20),(edl_s4,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_s4,'Cuisine / Kitchenette','Réfrigérateur','bon',NULL,0),
  (edl_s4,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_s4,'Entrée / Couloir','Sol','bon',NULL,0);

-- Entrant 5 — Emma 2024 (logement tout remis à neuf)
INSERT INTO edl_items (edl_id, zone, element, etat, commentaire, cout_estime) VALUES
  (edl_e5,'Pièce Principale','Porte','bon',NULL,0),(edl_e5,'Pièce Principale','Mur','neuf','Repeint',0),(edl_e5,'Pièce Principale','Plafond','bon',NULL,0),(edl_e5,'Pièce Principale','Sol','bon',NULL,0),(edl_e5,'Pièce Principale','Fenêtre','bon',NULL,0),(edl_e5,'Pièce Principale','Volet','neuf','Volet réparé',0),(edl_e5,'Pièce Principale','Radiateur','bon',NULL,0),
  (edl_e5,'Salle de Bain','Cabine / Baignoire','bon',NULL,0),(edl_e5,'Salle de Bain','Mitigeur / Robinet','bon',NULL,0),(edl_e5,'Salle de Bain','Sol','neuf','Revêtement neuf',0),
  (edl_e5,'WC / Toilettes','Cuvette','bon',NULL,0),(edl_e5,'WC / Toilettes','Abattant','bon',NULL,0),
  (edl_e5,'Cuisine / Kitchenette','Plan de travail','bon',NULL,0),(edl_e5,'Cuisine / Kitchenette','Crédence','neuf','Crédence refaite',0),(edl_e5,'Cuisine / Kitchenette','Évier','bon',NULL,0),(edl_e5,'Cuisine / Kitchenette','Réfrigérateur','bon',NULL,0),(edl_e5,'Cuisine / Kitchenette','Plaques cuisson','bon',NULL,0),
  (edl_e5,'Entrée / Couloir','Porte d''entrée','bon',NULL,0),(edl_e5,'Entrée / Couloir','Sol','bon',NULL,0);

-- ── Photos ────────────────────────────────────────────────────────────────────
INSERT INTO edl_photos (edl_id, zone, element, url, thumbnail_url, tag) VALUES
  (edl_e1,'Pièce Principale','Vue générale','https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400','vue-generale'),
  (edl_e1,'Pièce Principale','Sol','https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=400','sol'),
  (edl_e1,'Salle de Bain','Cabine / Baignoire','https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=400','sdb'),
  (edl_e1,'Cuisine / Kitchenette','Plan de travail','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=400','cuisine'),
  (edl_e1,'Entrée / Couloir','Porte d''entrée','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=400','porte'),
  (edl_s1,'Pièce Principale','Mur','https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6474475/pexels-photo-6474475.jpeg?auto=compress&cs=tinysrgb&w=400','mur-marques'),
  (edl_s1,'Pièce Principale','Radiateur','https://images.pexels.com/photos/7937754/pexels-photo-7937754.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/7937754/pexels-photo-7937754.jpeg?auto=compress&cs=tinysrgb&w=400','radiateur'),
  (edl_s1,'Salle de Bain','Éclairage','https://images.pexels.com/photos/3705921/pexels-photo-3705921.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3705921/pexels-photo-3705921.jpeg?auto=compress&cs=tinysrgb&w=400','ampoule-grille'),
  (edl_s1,'Cuisine / Kitchenette','Sol','https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=400','sol-cuisine'),
  (edl_e2,'Pièce Principale','Mur','https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400','mur-tache'),
  (edl_e2,'Pièce Principale','Fenêtre','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400','fenetre'),
  (edl_e2,'WC / Toilettes','Porte','https://images.pexels.com/photos/6585752/pexels-photo-6585752.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6585752/pexels-photo-6585752.jpeg?auto=compress&cs=tinysrgb&w=400','porte-wc'),
  (edl_e2,'Salle de Bain','Sol','https://images.pexels.com/photos/4977406/pexels-photo-4977406.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4977406/pexels-photo-4977406.jpeg?auto=compress&cs=tinysrgb&w=400','sol-sdb'),
  (edl_s2,'Pièce Principale','Mur','https://images.pexels.com/photos/6474743/pexels-photo-6474743.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6474743/pexels-photo-6474743.jpeg?auto=compress&cs=tinysrgb&w=400','mur-trou'),
  (edl_s2,'Pièce Principale','Sol','https://images.pexels.com/photos/6474470/pexels-photo-6474470.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6474470/pexels-photo-6474470.jpeg?auto=compress&cs=tinysrgb&w=400','sol-accroc'),
  (edl_s2,'WC / Toilettes','Abattant','https://images.pexels.com/photos/6585753/pexels-photo-6585753.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6585753/pexels-photo-6585753.jpeg?auto=compress&cs=tinysrgb&w=400','abattant-casse'),
  (edl_s2,'Cuisine / Kitchenette','Mitigeur cuisine','https://images.pexels.com/photos/7937755/pexels-photo-7937755.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/7937755/pexels-photo-7937755.jpeg?auto=compress&cs=tinysrgb&w=400','robinet-fuite'),
  (edl_s2,'Cuisine / Kitchenette','Porte kitchenette','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=400','porte-kitchenette'),
  (edl_e3,'Pièce Principale','Mur','https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400','mur-repeint'),
  (edl_e3,'Pièce Principale','Sol','https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=400','parquet-repose'),
  (edl_e3,'Cuisine / Kitchenette','Plan de travail','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=400','plan-travail-neuf'),
  (edl_e3,'WC / Toilettes','Plafond','https://images.pexels.com/photos/6474473/pexels-photo-6474473.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6474473/pexels-photo-6474473.jpeg?auto=compress&cs=tinysrgb&w=400','plafond-wc'),
  (edl_s3,'Cuisine / Kitchenette','Plan de travail','https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=400','tache-plan-travail'),
  (edl_s3,'Cuisine / Kitchenette','Vitre fenêtre','https://images.pexels.com/photos/4977409/pexels-photo-4977409.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4977409/pexels-photo-4977409.jpeg?auto=compress&cs=tinysrgb&w=400','vitre-rayee'),
  (edl_s3,'Pièce Principale','Fenêtre','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400','fenetre-calcaire'),
  (edl_s3,'Cuisine / Kitchenette','Réfrigérateur','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=400','frigo-a-nettoyer'),
  (edl_e4,'Pièce Principale','Vue générale','https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400','vue-generale'),
  (edl_e4,'Pièce Principale','Radiateur','https://images.pexels.com/photos/7937754/pexels-photo-7937754.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/7937754/pexels-photo-7937754.jpeg?auto=compress&cs=tinysrgb&w=400','radiateur-encrase'),
  (edl_e4,'Salle de Bain','Cabine / Baignoire','https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=400','sdb-etat'),
  (edl_e4,'Cuisine / Kitchenette','Plaques cuisson','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=400','plaques-cuisson'),
  (edl_s4,'Pièce Principale','Mur','https://images.pexels.com/photos/6474743/pexels-photo-6474743.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6474743/pexels-photo-6474743.jpeg?auto=compress&cs=tinysrgb&w=400','mur-marques'),
  (edl_s4,'Pièce Principale','Volet','https://images.pexels.com/photos/6474741/pexels-photo-6474741.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6474741/pexels-photo-6474741.jpeg?auto=compress&cs=tinysrgb&w=400','volet-bloque'),
  (edl_s4,'Salle de Bain','Sol','https://images.pexels.com/photos/4977406/pexels-photo-4977406.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4977406/pexels-photo-4977406.jpeg?auto=compress&cs=tinysrgb&w=400','sol-accroc-sdb'),
  (edl_s4,'Cuisine / Kitchenette','Crédence','https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=400','credence-decollee'),
  (edl_e5,'Pièce Principale','Vue générale','https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400','vue-generale-neuf'),
  (edl_e5,'Pièce Principale','Mur','https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400','mur-neuf'),
  (edl_e5,'Salle de Bain','Sol','https://images.pexels.com/photos/4977406/pexels-photo-4977406.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/4977406/pexels-photo-4977406.jpeg?auto=compress&cs=tinysrgb&w=400','sol-sdb-neuf'),
  (edl_e5,'Cuisine / Kitchenette','Crédence','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3935349/pexels-photo-3935349.jpeg?auto=compress&cs=tinysrgb&w=400','credence-neuve'),
  (edl_e5,'Entrée / Couloir','Porte d''entrée','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=400','porte-entree');

END $$;
