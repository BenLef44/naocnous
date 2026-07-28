
-- ============================================================
-- SEED EDL généraux — occupants avec statuts EDL réalistes
-- ============================================================

-- André Allix — occupants actifs 2024-2025
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, statut_edl_sortant, statut) VALUES
('73820577-41c6-487c-9114-4589c2234260','Moreau','Clémence','c.moreau@univ-lyon1.fr','06 11 22 33 44','Université Lyon 1','Résidence CROUS','2024-09-05','2025-06-30','realise','2024-09-05','a_realiser','occupant_actuel'),
('baa1a4cd-7f05-4135-a952-bc2746b65336','Girard','Thomas','t.girard@univ-lyon2.fr','06 22 33 44 55','Université Lyon 2','Résidence CROUS','2024-09-06','2025-06-30','realise','2024-09-06','a_realiser','occupant_actuel'),
('f046fadf-a1ec-4b24-8edb-60cd46d18024','Dubois','Sarah','s.dubois@insa-lyon.fr','06 33 44 55 66','INSA Lyon','Résidence CROUS','2024-09-07','2025-06-30','realise','2024-09-07','a_realiser','occupant_actuel'),
('0c9f97f4-1817-420c-bb46-e9d2c4b56b5f','Bernard','Mathieu','m.bernard@ec-lyon.fr','06 44 55 66 77','École Centrale Lyon','Résidence CROUS','2024-09-03','2025-06-30','realise','2024-09-03','a_realiser','occupant_actuel'),
('a319f43f-661d-4b23-9ed0-0c5e0c58a614','Laurent','Justine','j.laurent@univ-lyon3.fr','06 55 66 77 88','Université Lyon 3','Résidence CROUS','2024-09-08','2025-06-30','realise','2024-09-08','a_realiser','occupant_actuel'),
('6124a23b-78ea-4c09-89cb-ff9ee44fad48','Petit','Antoine','a.petit@lyon1.fr','06 66 77 88 99','Université Lyon 1','Résidence CROUS','2024-09-04','2025-06-30','a_realiser',NULL,'a_realiser','occupant_actuel'),
('c74a2cac-08b2-4e52-a4a5-e059cc40466c','Roux','Marie','m.roux@lyon2.fr','06 77 88 99 00','Université Lyon 2','Résidence CROUS','2024-09-09','2025-06-30','realise','2024-09-09','a_realiser','occupant_actuel'),
('f1fefdd4-310c-49c0-a801-16fef272c318','Simon','Lucas','l.simon@insa-lyon.fr','06 88 99 00 11','INSA Lyon','Résidence CROUS','2024-09-05','2025-06-30','realise','2024-09-05','a_realiser','occupant_actuel'),
('b45b6b61-f550-4c55-84ad-c17d46945fa4','Michel','Lucie','l.michel@lyon3.fr','06 99 00 11 22','Université Lyon 3','Résidence CROUS','2024-09-06','2025-06-30','realise','2024-09-06','a_realiser','occupant_actuel'),
('915131a9-2706-4c51-bc78-2393772e7b27','Lefebvre','Hugo','h.lefebvre@ec-lyon.fr','06 10 21 32 43','École Centrale Lyon','Résidence CROUS','2024-09-07','2025-06-30','realise','2024-09-07','a_realiser','occupant_actuel'),
('8a12df7f-456f-4c22-a023-8526629c00ec','Garcia','Léa','l.garcia@lyon1.fr','06 21 32 43 54','Université Lyon 1','Résidence CROUS','2024-09-03','2025-06-30','realise','2024-09-03','a_realiser','occupant_actuel'),
('6a55528d-a521-486e-b4ab-741b6305ad33','Martinez','Romain','r.martinez@lyon2.fr','06 32 43 54 65','Université Lyon 2','Résidence CROUS','2024-09-08','2025-06-30','realise','2024-09-08','a_realiser','occupant_actuel'),
('e9b5442c-06a9-4aad-8f93-609d4daf7f5f','David','Camille','c.david@insa-lyon.fr','06 43 54 65 76','INSA Lyon','Résidence CROUS','2024-09-04','2025-06-30','realise','2024-09-04','a_realiser','occupant_actuel'),
('9d6e82f3-4a7b-4915-95ef-54c297e98e92','Bertrand','Théo','t.bertrand@lyon3.fr','06 54 65 76 87','Université Lyon 3','Résidence CROUS','2024-09-09','2025-06-30','a_realiser',NULL,'a_realiser','occupant_actuel'),
('12ae0f9e-2952-41bb-a031-758797357db1','Morel','Inès','i.morel@lyon1.fr','06 65 76 87 98','Université Lyon 1','Résidence CROUS','2024-09-05','2025-06-30','realise','2024-09-05','a_realiser','occupant_actuel');

-- André Allix — anciens occupants 2023-2024 (entrant + sortant)
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, statut_edl_sortant, date_edl_sortant, statut) VALUES
('ac0ac5ea-1fb2-45e8-94d5-4dfd3a02ed51','Fournier','Alexis','a.fournier@lyon1.fr','06 71 82 93 04','Université Lyon 1','Résidence CROUS','2023-09-04','2024-06-30','realise','2023-09-04','realise','2024-06-28','ancien_occupant'),
('af2ae3df-c2fa-4ce8-a24a-fb25a68810a8','Henry','Chloé','c.henry@lyon2.fr','06 82 93 04 15','Université Lyon 2','Résidence CROUS','2023-09-05','2024-06-30','realise','2023-09-05','realise','2024-06-29','ancien_occupant'),
('b5d169cb-6727-43df-9097-0907eb07b492','Rousseau','Maxime','m.rousseau@insa-lyon.fr','06 93 04 15 26','INSA Lyon','Résidence CROUS','2023-09-06','2024-06-30','realise','2023-09-06','realise','2024-06-27','ancien_occupant'),
('f5f1b113-7941-426b-829c-444de3a91608','Vincent','Emma','e.vincent@ec-lyon.fr','06 04 15 26 37','École Centrale Lyon','Résidence CROUS','2023-09-07','2024-06-30','realise','2023-09-07','realise','2024-06-28','ancien_occupant'),
('f6d7770d-db1e-42cc-907c-685cf0289f9b','Durand','Paul','p.durand@lyon3.fr','06 15 26 37 48','Université Lyon 3','Résidence CROUS','2023-09-04','2024-06-30','realise','2023-09-04','realise','2024-06-30','ancien_occupant'),
('fab1d1d2-d43c-4035-a5d2-42c5a7a00885','Robert','Manon','m.robert@lyon1.fr','06 26 37 48 59','Université Lyon 1','Résidence CROUS','2023-09-05','2024-06-30','realise','2023-09-05','realise','2024-06-29','ancien_occupant'),
('1a748b7e-fff2-4fc7-bdb4-b710fe014551','Leroy','Nathan','n.leroy@lyon2.fr','06 37 48 59 60','Université Lyon 2','Résidence CROUS','2023-09-08','2024-06-30','realise','2023-09-08','realise','2024-06-28','ancien_occupant'),
('dea948dd-6498-4705-a6bc-762b1f79ac71','Moreau','Anaïs','a.moreau@insa-lyon.fr','06 48 59 60 71','INSA Lyon','Résidence CROUS','2023-09-09','2024-06-30','realise','2023-09-09','realise','2024-06-27','ancien_occupant'),
('8c00ac3f-cf6e-4653-9560-863f3ba2402b','Blanc','Florian','f.blanc@lyon3.fr','06 59 60 71 82','Université Lyon 3','Résidence CROUS','2023-09-03','2024-06-30','realise','2023-09-03','realise','2024-06-30','ancien_occupant'),
('df5dcd4a-620d-44d1-b068-78ee407399b0','Guerin','Pauline','p.guerin@ec-lyon.fr','06 60 71 82 93','École Centrale Lyon','Résidence CROUS','2023-09-06','2024-06-30','realise','2023-09-06','realise','2024-06-28','ancien_occupant');

-- Résidence Einstein — occupants actifs 2024-2025
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, statut_edl_sortant, statut) VALUES
('9b915cee-382d-48ab-80a5-926104eb9635','Bonnet','Océane','o.bonnet@lyon1.fr','06 12 23 34 45','Université Lyon 1','Résidence CROUS','2024-09-04','2025-06-30','realise','2024-09-04','a_realiser','occupant_actuel'),
('cfad2b87-cbaf-477f-bdef-eba626a31cae','Brunet','Pierre','p.brunet@insa-lyon.fr','06 23 34 45 56','INSA Lyon','Résidence CROUS','2024-09-05','2025-06-30','realise','2024-09-05','a_realiser','occupant_actuel'),
('f22ff27c-1092-494f-9839-f848a21ab876','Chevalier','Margaux','m.chevalier@lyon2.fr','06 34 45 56 67','Université Lyon 2','Résidence CROUS','2024-09-06','2025-06-30','realise','2024-09-06','a_realiser','occupant_actuel'),
('88d48159-de07-4a47-b5ca-82afe5c06eae','Colin','Bastien','b.colin@ec-lyon.fr','06 45 56 67 78','École Centrale Lyon','Résidence CROUS','2024-09-07','2025-06-30','realise','2024-09-07','a_realiser','occupant_actuel'),
('d41c01d6-625c-4241-a7a1-994ed237fdf2','Denis','Charlotte','c.denis@lyon3.fr','06 56 67 78 89','Université Lyon 3','Résidence CROUS','2024-09-03','2025-06-30','a_realiser',NULL,'a_realiser','occupant_actuel'),
('74a08d04-0b3a-45d6-9529-82ca9b3a3792','Faure','Alexia','a.faure@lyon1.fr','06 67 78 89 90','Université Lyon 1','Résidence CROUS','2024-09-08','2025-06-30','realise','2024-09-08','a_realiser','occupant_actuel'),
('66e2ba6e-62c3-4564-98d5-925ffaf695a3','Fontaine','Julien','j.fontaine@insa-lyon.fr','06 78 89 90 01','INSA Lyon','Résidence CROUS','2024-09-09','2025-06-30','realise','2024-09-09','a_realiser','occupant_actuel'),
('45ce662c-2274-4b3a-b22c-3be844198a30','Gaudin','Mathilde','m.gaudin@lyon2.fr','06 89 90 01 12','Université Lyon 2','Résidence CROUS','2024-09-04','2025-06-30','realise','2024-09-04','a_realiser','occupant_actuel'),
('d18ad3a9-019b-4aa0-97d5-59bf20d6412f','Giraud','Kévin','k.giraud@ec-lyon.fr','06 90 01 12 23','École Centrale Lyon','Résidence CROUS','2024-09-05','2025-06-30','realise','2024-09-05','a_realiser','occupant_actuel'),
('8eb8ff31-6898-471b-911c-a86dda62f2d2','Guillon','Amélie','a.guillon@lyon3.fr','06 01 12 23 34','Université Lyon 3','Résidence CROUS','2024-09-06','2025-06-30','realise','2024-09-06','a_realiser','occupant_actuel'),
('b53bc2c6-a761-4828-8f6a-aefcb298d639','Jacquet','Samuel','s.jacquet@lyon1.fr','06 13 24 35 46','Université Lyon 1','Résidence CROUS','2024-09-07','2025-06-30','realise','2024-09-07','a_realiser','occupant_actuel'),
('87ea6945-8462-43cd-a6ff-6eef0961c1e6','Lambert','Noémie','n.lambert@lyon2.fr','06 24 35 46 57','Université Lyon 2','Résidence CROUS','2024-09-03','2025-06-30','realise','2024-09-03','a_realiser','occupant_actuel'),
('77a77036-0f50-4c57-bc6e-05c3e5120e28','Lemaire','Baptiste','b.lemaire@insa-lyon.fr','06 35 46 57 68','INSA Lyon','Résidence CROUS','2024-09-08','2025-06-30','a_realiser',NULL,'a_realiser','occupant_actuel'),
('68798922-d6cc-48df-8cff-2c0c3de002a0','Maillard','Julie','j.maillard@ec-lyon.fr','06 46 57 68 79','École Centrale Lyon','Résidence CROUS','2024-09-09','2025-06-30','realise','2024-09-09','a_realiser','occupant_actuel'),
('875c53bf-b8ae-4fe4-b16b-59535a927145','Masson','Théodore','t.masson@lyon3.fr','06 57 68 79 80','Université Lyon 3','Résidence CROUS','2024-09-04','2025-06-30','realise','2024-09-04','a_realiser','occupant_actuel');

-- Einstein — anciens occupants 2023-2024
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, statut_edl_sortant, date_edl_sortant, statut) VALUES
('53581c20-17c3-427a-ac4c-add924b03e59','Mercier','Élise','e.mercier@lyon1.fr','06 68 79 80 91','Université Lyon 1','Résidence CROUS','2023-09-04','2024-06-30','realise','2023-09-04','realise','2024-06-28','ancien_occupant'),
('ea71aa1f-3490-411e-b94b-c123e62d345c','Moulin','Rémi','r.moulin@insa-lyon.fr','06 79 80 91 02','INSA Lyon','Résidence CROUS','2023-09-05','2024-06-30','realise','2023-09-05','realise','2024-06-29','ancien_occupant'),
('8dcdb3e2-f19a-45db-a38c-78b0fe96c312','Muller','Laure','l.muller@lyon2.fr','06 80 91 02 13','Université Lyon 2','Résidence CROUS','2023-09-06','2024-06-30','realise','2023-09-06','realise','2024-06-27','ancien_occupant'),
('48bafae2-61cd-4f72-b3e2-a62a1bf98908','Nicolas','Arnaud','a.nicolas@ec-lyon.fr','06 91 02 13 24','École Centrale Lyon','Résidence CROUS','2023-09-07','2024-06-30','realise','2023-09-07','realise','2024-06-28','ancien_occupant'),
('ff341280-0270-46db-8d70-42ac2054642f','Normand','Juliette','j.normand@lyon3.fr','06 02 13 24 35','Université Lyon 3','Résidence CROUS','2023-09-03','2024-06-30','realise','2023-09-03','realise','2024-06-30','ancien_occupant'),
('8f0df0bb-82b3-4197-ba85-53b8497cb402','Pichon','Nicolas','n.pichon@lyon1.fr','06 13 24 35 46','Université Lyon 1','Résidence CROUS','2023-09-08','2024-06-30','realise','2023-09-08','realise','2024-06-29','ancien_occupant'),
('2a6330a7-4d26-4e1e-9dce-b17d908c7b4a','Picard','Lucie','l.picard@insa-lyon.fr','06 24 35 46 57','INSA Lyon','Résidence CROUS','2023-09-09','2024-06-30','realise','2023-09-09','realise','2024-06-27','ancien_occupant'),
('a5d56781-2b21-4cd7-99a4-4a9337c8dbf5','Renard','Sébastien','s.renard@lyon2.fr','06 35 46 57 68','Université Lyon 2','Résidence CROUS','2023-09-04','2024-06-30','realise','2023-09-04','realise','2024-06-28','ancien_occupant'),
('12dfcb0d-9d22-411e-839c-1aaf91a5d4f1','Richard','Alice','a.richard@ec-lyon.fr','06 46 57 68 79','École Centrale Lyon','Résidence CROUS','2023-09-05','2024-06-30','realise','2023-09-05','realise','2024-06-30','ancien_occupant'),
('52cf6acf-08dd-4125-a13f-b3c85f9f23e1','Rivière','Florent','f.riviere@lyon3.fr','06 57 68 79 90','Université Lyon 3','Résidence CROUS','2023-09-06','2024-06-30','realise','2023-09-06','realise','2024-06-28','ancien_occupant');

-- André Allix — cohorte 2022-2023
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, statut_edl_sortant, date_edl_sortant, statut) VALUES
('a4486094-3e98-4151-9ffe-7fe9ef2f5cac','Robin','Clara','c.robin@lyon1.fr','06 11 22 33 55','Université Lyon 1','Résidence CROUS','2022-09-05','2023-06-30','realise','2022-09-05','realise','2023-06-28','ancien_occupant'),
('9e707298-125b-4f4d-83d9-31003d0cb799','Roy','Victor','v.roy@insa-lyon.fr','06 22 33 44 66','INSA Lyon','Résidence CROUS','2022-09-06','2023-06-30','realise','2022-09-06','realise','2023-06-27','ancien_occupant'),
('0c5f17b7-84bd-4e7c-9afa-656b14681d63','Schmitt','Mélissa','m.schmitt@lyon2.fr','06 33 44 55 77','Université Lyon 2','Résidence CROUS','2022-09-07','2023-06-30','realise','2022-09-07','realise','2023-06-29','ancien_occupant'),
('e9121732-0b5c-433f-93d4-2b747609753e','Simon','Adrien','a.simon@ec-lyon.fr','06 44 55 66 88','École Centrale Lyon','Résidence CROUS','2022-09-08','2023-06-30','realise','2022-09-08','realise','2023-06-28','ancien_occupant'),
('6ea7332f-7e3a-4b78-96d9-6420e291cca1','Thomas','Marine','m.thomas@lyon3.fr','06 55 66 77 99','Université Lyon 3','Résidence CROUS','2022-09-04','2023-06-30','realise','2022-09-04','realise','2023-06-30','ancien_occupant'),
('4b0dd604-4b19-4785-a56c-5c55919551dd','Vidal','Kevin','k.vidal@lyon1.fr','06 66 77 88 00','Université Lyon 1','Résidence CROUS','2022-09-09','2023-06-30','realise','2022-09-09','realise','2023-06-27','ancien_occupant'),
('d9a85fa0-57ed-4c62-baf6-f22df7356b71','Walter','Amélie','a.walter@insa-lyon.fr','06 77 88 99 11','INSA Lyon','Résidence CROUS','2022-09-05','2023-06-30','realise','2022-09-05','realise','2023-06-29','ancien_occupant'),
('b5964010-4f56-4daf-a5f6-6fc7329cc096','Weiss','Clément','c.weiss@lyon2.fr','06 88 99 00 22','Université Lyon 2','Résidence CROUS','2022-09-06','2023-06-30','realise','2022-09-06','realise','2023-06-28','ancien_occupant'),
('bb0dcc0e-105a-4bb0-8527-73fd62a9e1ff','Zimmermann','Isabelle','i.zimm@ec-lyon.fr','06 99 00 11 33','École Centrale Lyon','Résidence CROUS','2022-09-07','2023-06-30','realise','2022-09-07','realise','2023-06-30','ancien_occupant'),
('53bbe6fa-f07c-4a14-baef-277b416ea0a0','Aubert','Renaud','r.aubert@lyon3.fr','06 00 11 22 44','Université Lyon 3','Résidence CROUS','2022-09-03','2023-06-30','realise','2022-09-03','realise','2023-06-28','ancien_occupant');

-- Einstein — cohorte 2022-2023
INSERT INTO occupants (logement_id, nom, prenom, email, telephone, etablissement, type_contrat, date_entree, date_sortie_prevue, statut_edl_entrant, date_edl_entrant, statut_edl_sortant, date_edl_sortant, statut) VALUES
('ee92925c-043a-4dbd-be18-1fd743e719ca','Barbier','Laure','l.barbier@lyon1.fr','06 14 25 36 47','Université Lyon 1','Résidence CROUS','2022-09-04','2023-06-30','realise','2022-09-04','realise','2023-06-29','ancien_occupant'),
('e007d076-b8fe-421f-965e-38fce98db477','Baudry','Antoine','a.baudry@insa-lyon.fr','06 25 36 47 58','INSA Lyon','Résidence CROUS','2022-09-05','2023-06-30','realise','2022-09-05','realise','2023-06-28','ancien_occupant'),
('1207b808-d118-4127-9243-ee9ab20b00d8','Besson','Cécile','c.besson@lyon2.fr','06 36 47 58 69','Université Lyon 2','Résidence CROUS','2022-09-06','2023-06-30','realise','2022-09-06','realise','2023-06-27','ancien_occupant'),
('3e3ea707-01e5-444f-b455-8bf2d3ff81c5','Boucher','Gaëtan','g.boucher@ec-lyon.fr','06 47 58 69 70','École Centrale Lyon','Résidence CROUS','2022-09-07','2023-06-30','realise','2022-09-07','realise','2023-06-30','ancien_occupant'),
('62f80727-ec1a-42d4-b6d0-b7a31101ff3a','Bourgeois','Perrine','p.bourgeois@lyon3.fr','06 58 69 70 81','Université Lyon 3','Résidence CROUS','2022-09-03','2023-06-30','realise','2022-09-03','realise','2023-06-28','ancien_occupant');
