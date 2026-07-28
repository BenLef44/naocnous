/*
  # Seed événements — Armoire positive EQ-MANU-CUIS-001

  Historique réaliste sur 4 ans (2022–2026) pour l'armoire positive
  Liebherr GKPV 1470 — Resto'U Manufacture des Tabacs.

  Pannes : 7 pannes avec durées et coûts variables
  Maintenances préventives : contrat semestriel → 8 visites
  Maintenances correctives : 4 interventions non-panne
  1 incident partiel (porte joint défectueux — taux 40%)

  Cela produit :
  - MTBF calculable ~140 jours
  - Temps arrêt cumulé ~82h
  - Coût maintenance annuel ~2 200€
*/

DO $$
DECLARE
  eq_id uuid := 'c3000001-0000-0000-0000-000000000001';
BEGIN

-- ─── Pannes ────────────────────────────────────────────────────────────────────
INSERT INTO evenements (equipement_id, type_evenement, libelle, description,
  est_panne, rend_indisponible, taux_indisponibilite,
  date_debut_reel, date_fin_reel, statut, responsable, prestataire,
  cout_intervention, gravite, impact_service, observations)
VALUES

-- Panne 1 — Compresseur défaillant (2022-03)
(eq_id, 'panne', 'Panne compresseur — arrêt total', 'Compresseur principal en défaut — température +18°C. Stock déplacé vers autre armoire.',
 true, true, 100,
 '2022-03-14 07:30'::timestamptz, '2022-03-14 16:00'::timestamptz,
 'termine', 'Moreau F.', 'CARRIER Services', 640.00, 'critique', 'fort',
 'Intervention urgente. Remplacement valve de détente + recharge gaz R452A.'),

-- Panne 2 — Thermostat défectueux (2022-08)
(eq_id, 'panne', 'Dérive température — thermostat hors plage', 'Température mesurée +9°C alors que consigne +5°C. Détection alarme BMS.',
 true, true, 80,
 '2022-08-22 05:00'::timestamptz, '2022-08-22 10:30'::timestamptz,
 'termine', 'Leroy P.', 'CARRIER Services', 320.00, 'majeure', 'fort',
 'Remplacement sonde NTC + recalibration. Stock partiellement affecté.'),

-- Panne 3 — Défaut ventilateur évaporateur (2023-01)
(eq_id, 'panne', 'Panne ventilateur évaporateur', 'Ventilateur évaporateur bloqué — gel partiel évaporateur.',
 true, true, 100,
 '2023-01-09 20:00'::timestamptz, '2023-01-10 09:00'::timestamptz,
 'termine', 'Bernard C.', 'CARRIER Services', 280.00, 'critique', 'fort',
 'Dégivrage forcé + remplacement moteur ventilateur. Durée 13h.'),

-- Panne 4 — Fuite circuit frigorifique (2023-06)
(eq_id, 'panne', 'Fuite réfrigérant R452A', 'Fuite détectée circuit HP — pression basse alarme. Taux indisponibilité 100%.',
 true, true, 100,
 '2023-06-05 11:00'::timestamptz, '2023-06-06 08:00'::timestamptz,
 'termine', 'Moreau F.', 'CARRIER Services', 780.00, 'critique', 'critique',
 'Rechargement + test étanchéité 24h. Perte stock 1 journée.'),

-- Panne 5 — Carte électronique (2023-11)
(eq_id, 'panne', 'Défaut carte contrôleur Liebherr', 'Écran contrôleur mort — aucune régulation. Température non maîtrisée.',
 true, true, 100,
 '2023-11-18 06:00'::timestamptz, '2023-11-18 14:00'::timestamptz,
 'termine', 'Leroy P.', 'Liebherr SAV', 890.00, 'critique', 'fort',
 'Commande pièce en urgence. Délai 4h. Remplacement carte SMART. Coût élevé — pièce importée.'),

-- Panne 6 — Porte joint défectueux (2024-04, partielle)
(eq_id, 'panne', 'Joint porte droit détérioré — perte froid', 'Joint porte droite décollé sur 60cm — remontée progressive T°. Taux 40% (armoire gauche fonctionnelle).',
 true, true, 40,
 '2024-04-02 08:00'::timestamptz, '2024-04-02 11:00'::timestamptz,
 'termine', 'Roux P.', 'CARRIER Services', 140.00, 'mineure', 'moyen',
 'Joint commandé et posé en 3h. Opération continue avec armoire gauche.'),

-- Panne 7 — Compresseur bruit anormal (2025-02)
(eq_id, 'panne', 'Bruit anormal compresseur + vibrations', 'Roulements compresseur usés — bruit métallique. Arrêt préventif demandé.',
 true, true, 100,
 '2025-02-10 07:00'::timestamptz, '2025-02-10 16:30'::timestamptz,
 'termine', 'Moreau F.', 'CARRIER Services', 960.00, 'critique', 'fort',
 'Remplacement compresseur complet. Coût 960€. Age équipement : 11 ans — usure normale.'),

-- ─── Maintenances préventives (contrat semestriel) ─────────────────────────────

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S1-2022',
 'Visite semestrielle : contrôle températures, pressions circuit frigo, nettoyage condenseur, vérification joints.',
 false, false, 0,
 '2022-05-10 09:00'::timestamptz, '2022-05-10 11:30'::timestamptz,
 'termine', 'Leroy P.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'RAS. Condenseur encrassé — nettoyage HP. Pressions normales.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S2-2022',
 'Contrôle annuel complet : fluide, joints, sécurités, mesures électriques, test alarmes BMS.',
 false, false, 0,
 '2022-11-08 09:00'::timestamptz, '2022-11-08 12:00'::timestamptz,
 'termine', 'Leroy P.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Légère usure joint porte gauche signalée. Surveillance recommandée.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S1-2023',
 'Visite de printemps. Nettoyage filtre évaporateur, test dégivrage, vérification câblage.',
 false, false, 0,
 '2023-04-12 09:00'::timestamptz, '2023-04-12 11:00'::timestamptz,
 'termine', 'Bernard C.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Filtre évaporateur fortement encrassé. Nettoyage + remplacement filtre.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S2-2023',
 'Visite automne. Suite suivi fuite R452A de juin — test étanchéité + vérification charges.',
 false, false, 0,
 '2023-10-18 09:00'::timestamptz, '2023-10-18 12:30'::timestamptz,
 'termine', 'Leroy P.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Circuit étanche. Charge OK. Joint porte droite commencé à se décoller — signalé.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S1-2024',
 'Visite de printemps. Contrôle complet post-remplacement carte contrôleur.',
 false, false, 0,
 '2024-05-14 09:00'::timestamptz, '2024-05-14 11:30'::timestamptz,
 'termine', 'Moreau F.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Carte contrôleur fonctionnelle. Performances dans normes.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S2-2024',
 'Visite automne. Contrôle complet. Bilan état mécanique compresseur (age 10 ans).',
 false, false, 0,
 '2024-10-22 09:00'::timestamptz, '2024-10-22 13:00'::timestamptz,
 'termine', 'Bernard C.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Roulements compresseur présentant légère usure sonore. Surveillance rapprochée recommandée.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S1-2025',
 'Visite de printemps post-remplacement compresseur (fév. 2025). Rodage + vérifications.',
 false, false, 0,
 '2025-05-06 09:00'::timestamptz, '2025-05-06 11:30'::timestamptz,
 'termine', 'Leroy P.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Nouveau compresseur dans les normes. Performances nominales retrouvées.'),

(eq_id, 'maintenance_preventive', 'Maintenance préventive semestrielle S2-2025',
 'Visite automne. Contrôle complet. Bilan global machine 11 ans.',
 false, false, 0,
 '2025-10-15 09:00'::timestamptz, '2025-10-15 12:30'::timestamptz,
 'termine', 'Moreau F.', 'CARRIER Services', 350.00, 'mineure', 'faible',
 'Machine vieillissante. 7 pannes en 4 ans. Recommandation formelle de remplacement sous 2 ans.'),

-- ─── Maintenances correctives non-panne ───────────────────────────────────────

(eq_id, 'maintenance_corrective', 'Remplacement éclairage intérieur LED', 'Ampoule intérieure grillée — remplacement éclairage par LED.',
 false, false, 0,
 '2022-10-05 10:00'::timestamptz, '2022-10-05 10:30'::timestamptz,
 'termine', 'Roux P.', NULL, 25.00, 'mineure', 'faible', 'Remplacement 2 tubes LED.'),

(eq_id, 'maintenance_corrective', 'Recalibration sondes température', 'Dérive sonde secondaire +0,8°C. Recalibration.',
 false, false, 0,
 '2023-09-04 14:00'::timestamptz, '2023-09-04 15:00'::timestamptz,
 'termine', 'Leroy P.', 'CARRIER Services', 80.00, 'mineure', 'faible', NULL),

(eq_id, 'maintenance_corrective', 'Nettoyage condenseur urgent (été)', 'Condenseur très encrassé — remontée T° constatée service cuisine.',
 false, false, 20,
 '2024-07-15 14:00'::timestamptz, '2024-07-15 16:00'::timestamptz,
 'termine', 'Roux P.', NULL, 60.00, 'mineure', 'moyen', 'Poussières graisseuses. Nettoyage HP + dégraissant.'),

(eq_id, 'maintenance_corrective', 'Remplacement joint porte gauche', 'Usure progressive joint porte gauche signalée lors visites préventives 2022.',
 false, false, 0,
 '2025-01-14 10:00'::timestamptz, '2025-01-14 11:30'::timestamptz,
 'termine', 'Roux P.', NULL, 95.00, 'mineure', 'faible', 'Joints commandés stock. Remplacement préventif.');

END $$;
