/*
  # Seed données fictives v2 — Charges, Budgets, Fluides, Factures
  Corrige l'erreur VALUES lists must all be the same length
*/

DO $$
DECLARE
  res_cavalier    uuid;
  res_jaurès      uuid;
  res_manufacture uuid;
  res_bellecombe  uuid;
  bat_cavalier_1  uuid;
  bat_jaurès_1    uuid;
  bat_manu_1      uuid;
  bat_bell_1      uuid;
  prest_1 uuid; prest_2 uuid; prest_3 uuid;
  contrat_1 uuid; contrat_2 uuid;
  i int;
  ref_charge text;
  charge_id uuid;
BEGIN
  SELECT id INTO res_cavalier    FROM residences WHERE nom ILIKE '%cavalier%'    LIMIT 1;
  SELECT id INTO res_jaurès      FROM residences WHERE nom ILIKE '%jaur%'        LIMIT 1;
  SELECT id INTO res_manufacture FROM residences WHERE nom ILIKE '%manufactur%'  LIMIT 1;
  SELECT id INTO res_bellecombe  FROM residences WHERE nom ILIKE '%bellecomb%'   LIMIT 1;
  SELECT id INTO bat_cavalier_1  FROM batiments  WHERE residence_id = res_cavalier   LIMIT 1;
  SELECT id INTO bat_jaurès_1    FROM batiments  WHERE residence_id = res_jaurès     LIMIT 1;
  SELECT id INTO bat_manu_1      FROM batiments  WHERE residence_id = res_manufacture LIMIT 1;
  SELECT id INTO bat_bell_1      FROM batiments  WHERE residence_id = res_bellecombe  LIMIT 1;
  SELECT id INTO prest_1  FROM prestataires LIMIT 1 OFFSET 0;
  SELECT id INTO prest_2  FROM prestataires LIMIT 1 OFFSET 1;
  SELECT id INTO prest_3  FROM prestataires LIMIT 1 OFFSET 2;
  SELECT id INTO contrat_1 FROM contrats LIMIT 1 OFFSET 0;
  SELECT id INTO contrat_2 FROM contrats LIMIT 1 OFFSET 1;

  -- ── BUDGETS 2026 ──────────────────────────────────────────────────────────
  IF res_cavalier IS NOT NULL THEN
    INSERT INTO budgets(residence_id,annee,type_budget,montant_initial,montant_consomme,montant_engage,statut_budget,source_systeme)
    VALUES
      (res_cavalier,2026,'maintenance',85000,42300,18000,'dans_les_clous','BNS'),
      (res_cavalier,2026,'energie',62000,38500,0,'avertissement','OPERAT/OSFI'),
      (res_cavalier,2026,'travaux',120000,35000,65000,'dans_les_clous','BNS'),
      (res_cavalier,2025,'maintenance',80000,79200,0,'avertissement','BNS'),
      (res_cavalier,2025,'energie',58000,61200,0,'depasse','OPERAT/OSFI')
    ON CONFLICT DO NOTHING;
  END IF;
  IF res_jaurès IS NOT NULL THEN
    INSERT INTO budgets(residence_id,annee,type_budget,montant_initial,montant_consomme,montant_engage,statut_budget,source_systeme)
    VALUES
      (res_jaurès,2026,'maintenance',72000,28900,12000,'dans_les_clous','BNS'),
      (res_jaurès,2026,'energie',54000,29800,0,'dans_les_clous','OPERAT/OSFI'),
      (res_jaurès,2026,'travaux',95000,5000,82000,'dans_les_clous','BNS'),
      (res_jaurès,2025,'maintenance',70000,68500,0,'dans_les_clous','BNS')
    ON CONFLICT DO NOTHING;
  END IF;
  IF res_manufacture IS NOT NULL THEN
    INSERT INTO budgets(residence_id,annee,type_budget,montant_initial,montant_consomme,montant_engage,statut_budget,source_systeme)
    VALUES
      (res_manufacture,2026,'maintenance',48000,31200,8500,'avertissement','BNS'),
      (res_manufacture,2026,'energie',89000,45600,0,'dans_les_clous','OPERAT/OSFI'),
      (res_manufacture,2026,'travaux',200000,88000,95000,'avertissement','BNS'),
      (res_manufacture,2025,'maintenance',45000,47200,0,'depasse','BNS')
    ON CONFLICT DO NOTHING;
  END IF;
  IF res_bellecombe IS NOT NULL THEN
    INSERT INTO budgets(residence_id,annee,type_budget,montant_initial,montant_consomme,montant_engage,statut_budget,source_systeme)
    VALUES
      (res_bellecombe,2026,'maintenance',38000,12400,6000,'dans_les_clous','BNS'),
      (res_bellecombe,2026,'energie',31000,19800,0,'dans_les_clous','OPERAT/OSFI')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── CHARGES — 50 fiches ───────────────────────────────────────────────────
  -- Cavalier 1-10
  INSERT INTO charges(reference,batiment_id,residence_id,type_charge,type_intervention,responsable,cout_estime,cout_reel,statut,date_declaration,date_intervention,contrat_id,source_systeme,commentaire)
  VALUES
    ('CH-2026-001',bat_cavalier_1,res_cavalier,'Menuiseries extérieures : fenêtres','Réparation et entretien','Gestionnaire',320,290,'valide','2026-01-08','2026-01-15',contrat_1,'Manuel','Joint fenêtre chambre 201 défectueux'),
    ('CH-2026-002',bat_cavalier_1,res_cavalier,'Revêtements + isolation extérieures','Réparation ponctuelle','Gestionnaire',850,920,'valide','2026-01-12','2026-01-22',NULL,'Manuel','Fissure façade Nord-Est côté escalier B'),
    ('CH-2026-003',bat_cavalier_1,res_cavalier,'Production chauffage (P3 - gestionnaire)','Réparation et Entretien','Gestionnaire',1200,1150,'valide','2026-01-20','2026-01-28',contrat_2,'BNS',NULL),
    ('CH-2026-004',bat_cavalier_1,res_cavalier,'Alarmes incendie','Réparation et Entretien','Gestionnaire',480,NULL,'en_cours','2026-02-03','2026-02-15',contrat_1,'Manuel','Détecteur 3ème étage défaillant'),
    ('CH-2026-005',bat_cavalier_1,res_cavalier,'Parties privatives','Remplacement','Gestionnaire',650,NULL,'planifie','2026-02-10','2026-03-05',NULL,'Manuel','Remplacement porte chambre 112'),
    ('CH-2026-006',bat_cavalier_1,res_cavalier,'Distribution chauffage','Remplacement','Propriétaire',8500,NULL,'en_attente','2026-02-14',NULL,contrat_2,'BNS','Remplacement colonne montante chauffage bât A'),
    ('CH-2026-007',bat_cavalier_1,res_cavalier,'Revêtements de sols','Remplacement total ou partiel','Gestionnaire',2400,2380,'valide','2026-02-20','2026-03-01',NULL,'Manuel','Couloir RdC — sol dégradé'),
    ('CH-2026-008',bat_cavalier_1,res_cavalier,'Production ECS','Réfection partielle','Gestionnaire',3200,NULL,'planifie','2026-03-05','2026-04-10',contrat_2,'BNS','Ballon ECS 2ème étage à remplacer'),
    ('CH-2026-009',bat_cavalier_1,res_cavalier,'Couverture','Réparation ou Entretien','Propriétaire',1800,1950,'litige','2026-03-12','2026-03-20',NULL,'Manuel','Litige: CROUS considère Gestionnaire responsable'),
    ('CH-2026-010',bat_cavalier_1,res_cavalier,'Appareillage Parties communes et privatives','Réparation et Entretien','Gestionnaire',560,510,'valide','2026-03-18','2026-03-25',contrat_1,'Manuel','Remplacement prises électriques RdC')
  ON CONFLICT DO NOTHING;

  -- Jaurès 11-20
  INSERT INTO charges(reference,batiment_id,residence_id,type_charge,type_intervention,responsable,cout_estime,cout_reel,statut,date_declaration,date_intervention,contrat_id,source_systeme,commentaire)
  VALUES
    ('CH-2026-011',bat_jaurès_1,res_jaurès,'Menuiseries extérieures : fenêtres','Remplacement ponctuel','Propriétaire',4200,4150,'valide','2026-01-15','2026-02-10',NULL,'SI Logement',NULL),
    ('CH-2026-012',bat_jaurès_1,res_jaurès,'Réseau EF','Réparation et Entretien','Gestionnaire',780,820,'valide','2026-01-22','2026-02-01',contrat_2,'Manuel','Fuite réseau eau froide sous-sol'),
    ('CH-2026-013',bat_jaurès_1,res_jaurès,'Appareils sanitaires et robinetterie','Renouvellement partiel','Gestionnaire',1850,NULL,'en_cours','2026-02-08','2026-03-20',NULL,'Manuel','Robinets vestiaires sport — remplacement lot'),
    ('CH-2026-014',bat_jaurès_1,res_jaurès,'Parties communes et privatives','Remplacement','Gestionnaire',340,290,'valide','2026-02-15','2026-02-20',contrat_1,'Manuel','Serrure hall entrée bloquée'),
    ('CH-2026-015',bat_jaurès_1,res_jaurès,'Revêtements muraux','Remplacement total ou partiel','Gestionnaire',1200,1180,'valide','2026-02-28','2026-03-10',NULL,'Manuel','Carrelage salle de bain T4 — éclatement'),
    ('CH-2026-016',bat_jaurès_1,res_jaurès,'Eclairage extérieur','Réfection partielle','Gestionnaire',2800,NULL,'planifie','2026-03-10','2026-04-20',contrat_1,'BNS','Remplacement éclairage parking LED'),
    ('CH-2026-017',bat_jaurès_1,res_jaurès,'Charpente','Réparation ou Entretien','Propriétaire',6500,NULL,'en_attente','2026-03-20',NULL,NULL,'BNS','Inspection charpente — résultat diagnostic'),
    ('CH-2026-018',bat_jaurès_1,res_jaurès,'Détection incendie','Entretien','Gestionnaire',420,390,'valide','2026-04-05','2026-04-08',contrat_1,'Manuel',NULL),
    ('CH-2026-019',bat_jaurès_1,res_jaurès,'Cloisons','Réfection','Gestionnaire',950,NULL,'en_attente','2026-04-12',NULL,NULL,'Manuel','Cloison chambre 308 — humidité'),
    ('CH-2026-020',bat_jaurès_1,res_jaurès,'Evacuations','Réfection partielle','Gestionnaire',1100,1050,'valide','2026-04-18','2026-04-25',contrat_2,'Manuel',NULL)
  ON CONFLICT DO NOTHING;

  -- Manufacture 21-30
  INSERT INTO charges(reference,batiment_id,residence_id,type_charge,type_intervention,responsable,cout_estime,cout_reel,statut,date_declaration,date_intervention,contrat_id,source_systeme,commentaire)
  VALUES
    ('CH-2026-021',bat_manu_1,res_manufacture,'Machinerie','Remplacement et mise aux normes','Propriétaire',45000,43800,'valide','2026-01-10','2026-02-28',NULL,'BNS','Remplacement moteur ascenseur A — mise aux normes'),
    ('CH-2026-022',bat_manu_1,res_manufacture,'Cabines, portes palières','Entretien','Gestionnaire',1200,1180,'valide','2026-01-20','2026-01-25',contrat_2,'Manuel',NULL),
    ('CH-2026-023',bat_manu_1,res_manufacture,'Cuisines','Réparation','Gestionnaire',3800,4100,'valide','2026-02-05','2026-02-18',NULL,'Epona','Réparation lave-vaisselle tunnel — pièce détachée'),
    ('CH-2026-024',bat_manu_1,res_manufacture,'Appareillage parties spécifiques (ex : cuisines)','Réfection complète','Gestionnaire',8500,NULL,'travaux','2026-02-15','2026-03-10',contrat_1,'BNS','Mise aux normes tableau électrique cuisine'),
    ('CH-2026-025',bat_manu_1,res_manufacture,'Ventilation spécifiques cuisines','Réfection ponctuelle','Gestionnaire',5200,5100,'valide','2026-03-01','2026-03-15',contrat_1,'BNS','Filtres et caissons VMC cuisine centrale'),
    ('CH-2026-026',bat_manu_1,res_manufacture,'Production chauffage (P3 - gestionnaire)','Remplacement total','Propriétaire',85000,NULL,'en_attente','2026-03-08',NULL,contrat_2,'BNS','Chaudière principale — fin de vie confirmée'),
    ('CH-2026-027',bat_manu_1,res_manufacture,'Revêtements de sols','Remplacement total ou partiel','Gestionnaire',7200,6900,'valide','2026-03-22','2026-04-05',NULL,'Manuel','Salle de restauration — revêtement anti-dérapant'),
    ('CH-2026-028',bat_manu_1,res_manufacture,'Distribution Courants forts','Réfection partielle','Gestionnaire',4300,NULL,'planifie','2026-04-02','2026-05-15',contrat_1,'BNS',NULL),
    ('CH-2026-029',bat_manu_1,res_manufacture,'Toiture terrasse - étanchéité','Réfection partielle ou réparation ponctuelle','Propriétaire',12000,11800,'valide','2026-04-10','2026-04-28',NULL,'BNS','Etanchéité aile Nord'),
    ('CH-2026-030',bat_manu_1,res_manufacture,'Extincteurs','Entretien','Gestionnaire',850,820,'valide','2026-04-15','2026-04-16',contrat_1,'Manuel','Contrôle annuel extincteurs')
  ON CONFLICT DO NOTHING;

  -- Bellecombe 31-37
  INSERT INTO charges(reference,batiment_id,residence_id,type_charge,type_intervention,responsable,cout_estime,cout_reel,statut,date_declaration,date_intervention,contrat_id,source_systeme,commentaire)
  VALUES
    ('CH-2026-031',bat_bell_1,res_bellecombe,'Appareils sanitaires et robinetterie','Réparation et Entretien','Gestionnaire',280,260,'valide','2026-01-18','2026-01-22',NULL,'Manuel',NULL),
    ('CH-2026-032',bat_bell_1,res_bellecombe,'Protections sécurité (crinolines)','Entretien','Gestionnaire',650,620,'valide','2026-02-05','2026-02-12',contrat_1,'Manuel','Contrôle annuel crinolines toiture'),
    ('CH-2026-033',bat_bell_1,res_bellecombe,'Parties communes','Entretien','Gestionnaire',420,NULL,'en_cours','2026-02-20','2026-03-15',NULL,'Manuel','Nettoyage façades parties communes'),
    ('CH-2026-034',bat_bell_1,res_bellecombe,'Réseau extérieur','Réparation et Entretien','Gestionnaire',1800,1750,'valide','2026-03-08','2026-03-18',contrat_2,'Manuel','Réparation canalisation extérieure'),
    ('CH-2026-035',bat_bell_1,res_bellecombe,'Menuiseries extérieures : fenêtres','Remplacement généralisé','Propriétaire',28000,NULL,'en_attente','2026-03-15',NULL,NULL,'BNS','Programme remplacement fenêtres R+1 et R+2'),
    ('CH-2026-036',bat_bell_1,res_bellecombe,'Clôture ou murs d''enceinte','Réfection partielle, Réparation','Gestionnaire',3200,3100,'valide','2026-04-08','2026-04-20',NULL,'Manuel',NULL),
    ('CH-2026-037',bat_bell_1,res_bellecombe,'Isolation coupe-feu, encloisonnement','Remplacement','Gestionnaire',1500,NULL,'planifie','2026-04-22','2026-06-01',contrat_1,'BNS','Remplacement porte coupe-feu palier 2')
  ON CONFLICT DO NOTHING;

  -- Charges 38-50 sans batiment_id
  INSERT INTO charges(reference,residence_id,batiment_id,type_charge,type_intervention,responsable,cout_estime,cout_reel,statut,date_declaration,date_intervention,contrat_id,source_systeme,commentaire)
  VALUES
    ('CH-2026-038',res_cavalier,NULL,'Descentes EP, Cheneaux','Entretien','Gestionnaire',380,360,'valide','2026-01-25','2026-02-02',NULL,'Manuel','Débouchage chéneau bâtiment C'),
    ('CH-2026-039',res_cavalier,NULL,'Désenfumage','Réparation et Entretien','Gestionnaire',920,NULL,'en_cours','2026-02-28','2026-03-20',NULL,'BNS',NULL),
    ('CH-2026-040',res_jaurès,NULL,'Voirie et stationnement (en surface)','Réparation et entretien','Gestionnaire',2100,2050,'valide','2026-01-30','2026-02-15',NULL,'BNS','Réfection marquages au sol parking'),
    ('CH-2026-041',res_jaurès,NULL,'Espaces verts','Remplacement ou transformation','Gestionnaire',4500,NULL,'planifie','2026-03-28','2026-04-15',NULL,'Manuel','Replantation haies côté rue'),
    ('CH-2026-042',res_manufacture,NULL,'Mobilier','Création, Remplacement','Gestionnaire',12000,11500,'valide','2026-02-22','2026-03-08',NULL,'Epona','Mobilier salle de restauration — 80 chaises'),
    ('CH-2026-043',res_manufacture,NULL,'Laverie','Réparation','Gestionnaire',1400,1380,'valide','2026-03-18','2026-03-22',NULL,'Epona','Réparation machine à laver N°3'),
    ('CH-2026-044',res_cavalier,NULL,'Production ECS','Installation','Propriétaire',22000,NULL,'en_attente','2026-04-02',NULL,NULL,'BNS','Nouveau ballon solaire — validation CROUS requise'),
    ('CH-2026-045',res_jaurès,NULL,'Appareillage : bouches d''extractions','Entretien (nettoyage)','Gestionnaire',680,650,'valide','2026-04-10','2026-04-11',contrat_1,'Manuel',NULL),
    ('CH-2026-046',res_bellecombe,NULL,'Radiateurs (ou réseau sols)','Réparation et Entretien','Gestionnaire',540,520,'valide','2026-04-18','2026-04-22',contrat_2,'Manuel',NULL),
    ('CH-2026-047',res_manufacture,NULL,'Isolation par l''intérieur','Réfection','Gestionnaire',8800,NULL,'planifie','2026-04-28','2026-06-15',NULL,'BNS','Réfection ITE couloirs administration'),
    ('CH-2026-048',res_cavalier,NULL,'Revêtements muraux','Remplacement total ou partiel','Gestionnaire',1600,1580,'valide','2026-05-05','2026-05-12',NULL,'Manuel','Salle commune R+1'),
    ('CH-2026-049',res_jaurès,NULL,'Distribution ECS','Réfection partielle','Gestionnaire',5400,NULL,'en_cours','2026-05-10','2026-05-28',contrat_2,'BNS','Calorifugeage réseau ECS'),
    ('CH-2026-050',res_manufacture,NULL,'RIA, Colonnes sèches','Réparation et Entretien','Gestionnaire',760,720,'valide','2026-05-18','2026-05-20',contrat_1,'Manuel',NULL)
  ON CONFLICT DO NOTHING;

  -- ── CONSOMMATIONS FLUIDES ─────────────────────────────────────────────────
  IF res_cavalier IS NOT NULL THEN
    INSERT INTO consommations_fluides(residence_id,annee,mois,type_fluide,valeur_kwh,valeur_m3,cout_euros,indice_base100,alerte_seuil,source_systeme)
    VALUES
      (res_cavalier,2025,1,'electricite',42800,NULL,8200,98,false,'OPERAT/OSFI'),
      (res_cavalier,2025,2,'electricite',39500,NULL,7600,96,false,'OPERAT/OSFI'),
      (res_cavalier,2025,3,'electricite',35200,NULL,6700,95,false,'OPERAT/OSFI'),
      (res_cavalier,2025,4,'electricite',28600,NULL,5500,93,false,'OPERAT/OSFI'),
      (res_cavalier,2025,5,'electricite',24100,NULL,4700,92,false,'OPERAT/OSFI'),
      (res_cavalier,2025,6,'electricite',21800,NULL,4300,91,false,'OPERAT/OSFI'),
      (res_cavalier,2025,7,'electricite',19500,NULL,3900,89,false,'OPERAT/OSFI'),
      (res_cavalier,2025,8,'electricite',18200,NULL,3600,88,false,'OPERAT/OSFI'),
      (res_cavalier,2025,9,'electricite',26800,NULL,5200,94,false,'OPERAT/OSFI'),
      (res_cavalier,2025,10,'electricite',34500,NULL,6600,96,false,'OPERAT/OSFI'),
      (res_cavalier,2025,11,'electricite',40200,NULL,7800,99,false,'OPERAT/OSFI'),
      (res_cavalier,2025,12,'electricite',44800,NULL,8600,102,true,'OPERAT/OSFI'),
      (res_cavalier,2026,1,'electricite',45200,NULL,9100,105,true,'OPERAT/OSFI'),
      (res_cavalier,2026,2,'electricite',41800,NULL,8400,102,true,'OPERAT/OSFI'),
      (res_cavalier,2026,3,'electricite',37500,NULL,7600,107,true,'OPERAT/OSFI'),
      (res_cavalier,2026,4,'electricite',30200,NULL,6100,106,true,'OPERAT/OSFI'),
      (res_cavalier,2026,5,'electricite',26100,NULL,5300,108,true,'OPERAT/OSFI'),
      (res_cavalier,2025,1,'gaz',82000,NULL,6500,100,false,'OPERAT/OSFI'),
      (res_cavalier,2025,2,'gaz',76500,NULL,6050,99,false,'OPERAT/OSFI'),
      (res_cavalier,2025,3,'gaz',65200,NULL,5150,97,false,'OPERAT/OSFI'),
      (res_cavalier,2025,4,'gaz',42100,NULL,3300,93,false,'OPERAT/OSFI'),
      (res_cavalier,2025,5,'gaz',18500,NULL,1450,89,false,'OPERAT/OSFI'),
      (res_cavalier,2025,6,'gaz',8200,NULL,650,85,false,'OPERAT/OSFI'),
      (res_cavalier,2025,7,'gaz',6100,NULL,480,83,false,'OPERAT/OSFI'),
      (res_cavalier,2025,8,'gaz',6800,NULL,540,84,false,'OPERAT/OSFI'),
      (res_cavalier,2025,9,'gaz',28600,NULL,2250,93,false,'OPERAT/OSFI'),
      (res_cavalier,2025,10,'gaz',58200,NULL,4600,98,false,'OPERAT/OSFI'),
      (res_cavalier,2025,11,'gaz',74800,NULL,5900,100,false,'OPERAT/OSFI'),
      (res_cavalier,2025,12,'gaz',85600,NULL,6800,104,true,'OPERAT/OSFI'),
      (res_cavalier,2026,1,'gaz',89200,NULL,7400,109,true,'OPERAT/OSFI'),
      (res_cavalier,2026,2,'gaz',82100,NULL,6800,107,true,'OPERAT/OSFI'),
      (res_cavalier,2026,3,'gaz',71500,NULL,5900,110,true,'OPERAT/OSFI'),
      (res_cavalier,2026,4,'gaz',48200,NULL,4000,115,true,'OPERAT/OSFI'),
      (res_cavalier,2026,5,'gaz',22400,NULL,1850,121,true,'OPERAT/OSFI'),
      (res_cavalier,2025,1,'eau',NULL,820,2870,100,false,'OPERAT/OSFI'),
      (res_cavalier,2025,2,'eau',NULL,780,2730,99,false,'OPERAT/OSFI'),
      (res_cavalier,2025,3,'eau',NULL,840,2940,101,false,'OPERAT/OSFI'),
      (res_cavalier,2025,4,'eau',NULL,760,2660,98,false,'OPERAT/OSFI'),
      (res_cavalier,2025,5,'eau',NULL,720,2520,97,false,'OPERAT/OSFI'),
      (res_cavalier,2025,6,'eau',NULL,680,2380,95,false,'OPERAT/OSFI'),
      (res_cavalier,2025,7,'eau',NULL,550,1925,88,false,'OPERAT/OSFI'),
      (res_cavalier,2025,8,'eau',NULL,490,1715,85,false,'OPERAT/OSFI'),
      (res_cavalier,2025,9,'eau',NULL,710,2485,96,false,'OPERAT/OSFI'),
      (res_cavalier,2025,10,'eau',NULL,800,2800,100,false,'OPERAT/OSFI'),
      (res_cavalier,2025,11,'eau',NULL,830,2905,101,false,'OPERAT/OSFI'),
      (res_cavalier,2025,12,'eau',NULL,860,3010,103,true,'OPERAT/OSFI'),
      (res_cavalier,2026,1,'eau',NULL,890,3290,109,true,'OPERAT/OSFI'),
      (res_cavalier,2026,2,'eau',NULL,850,3145,109,true,'OPERAT/OSFI'),
      (res_cavalier,2026,3,'eau',NULL,870,3219,104,true,'OPERAT/OSFI'),
      (res_cavalier,2026,4,'eau',NULL,790,2923,104,true,'OPERAT/OSFI'),
      (res_cavalier,2026,5,'eau',NULL,740,2738,103,true,'OPERAT/OSFI')
    ON CONFLICT DO NOTHING;
  END IF;

  IF res_manufacture IS NOT NULL THEN
    INSERT INTO consommations_fluides(residence_id,annee,mois,type_fluide,valeur_kwh,valeur_m3,cout_euros,indice_base100,alerte_seuil,source_systeme)
    VALUES
      (res_manufacture,2025,1,'electricite',128000,NULL,24500,102,true,'OPERAT/OSFI'),
      (res_manufacture,2025,2,'electricite',121000,NULL,23200,100,false,'OPERAT/OSFI'),
      (res_manufacture,2025,3,'electricite',118000,NULL,22600,99,false,'OPERAT/OSFI'),
      (res_manufacture,2025,4,'electricite',112000,NULL,21500,98,false,'OPERAT/OSFI'),
      (res_manufacture,2025,5,'electricite',108000,NULL,20700,97,false,'OPERAT/OSFI'),
      (res_manufacture,2025,6,'electricite',105000,NULL,20100,96,false,'OPERAT/OSFI'),
      (res_manufacture,2025,7,'electricite',102000,NULL,19600,95,false,'OPERAT/OSFI'),
      (res_manufacture,2025,8,'electricite',98000,NULL,18800,93,false,'OPERAT/OSFI'),
      (res_manufacture,2025,9,'electricite',110000,NULL,21100,98,false,'OPERAT/OSFI'),
      (res_manufacture,2025,10,'electricite',119000,NULL,22800,100,false,'OPERAT/OSFI'),
      (res_manufacture,2025,11,'electricite',125000,NULL,24000,102,true,'OPERAT/OSFI'),
      (res_manufacture,2025,12,'electricite',132000,NULL,25300,106,true,'OPERAT/OSFI'),
      (res_manufacture,2026,1,'electricite',135000,NULL,27000,106,true,'OPERAT/OSFI'),
      (res_manufacture,2026,2,'electricite',128500,NULL,25700,106,true,'OPERAT/OSFI'),
      (res_manufacture,2026,3,'electricite',122000,NULL,24400,103,true,'OPERAT/OSFI'),
      (res_manufacture,2026,4,'electricite',115000,NULL,23000,103,true,'OPERAT/OSFI'),
      (res_manufacture,2026,5,'electricite',109500,NULL,21900,101,true,'OPERAT/OSFI')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── FACTURES — 1 par charge validée ──────────────────────────────────────
  FOR i IN 1..50 LOOP
    ref_charge := 'CH-2026-' || LPAD(i::text, 3, '0');
    SELECT id INTO charge_id FROM charges WHERE reference = ref_charge;
    IF charge_id IS NOT NULL THEN
      INSERT INTO factures(reference,charge_id,prestataire_id,montant_ht,montant_tva,date_emission,date_echeance,date_paiement,statut,source_systeme)
      SELECT
        'FAC-2026-' || LPAD(i::text, 4, '0'),
        charge_id,
        CASE WHEN i % 3 = 0 THEN prest_1 WHEN i % 3 = 1 THEN prest_2 ELSE prest_3 END,
        ROUND(COALESCE(c.cout_reel, c.cout_estime) * 0.8333),
        ROUND(COALESCE(c.cout_reel, c.cout_estime) * 0.1667),
        COALESCE(c.date_intervention, c.date_declaration) + INTERVAL '5 days',
        COALESCE(c.date_intervention, c.date_declaration) + INTERVAL '35 days',
        CASE WHEN c.statut = 'valide' AND i % 6 <> 0
             THEN COALESCE(c.date_intervention, c.date_declaration) + INTERVAL '28 days'
             ELSE NULL END,
        CASE WHEN c.statut = 'valide' AND i % 6 <> 0 THEN 'paye'
             WHEN c.statut = 'valide' AND i % 6 = 0  THEN 'impaye'
             WHEN c.statut IN ('en_cours','travaux')  THEN 'facture'
             ELSE 'non_facture' END,
        'Epona'
      FROM charges c WHERE c.id = charge_id
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

END $$;
