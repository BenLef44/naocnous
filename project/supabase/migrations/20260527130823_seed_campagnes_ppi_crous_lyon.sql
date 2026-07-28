/*
  # Seed campagnes PPI CROUS Lyon 2026-2030

  12 campagnes de renouvellement couvrant le parc CROUS Lyon.
  Données cohérentes avec le contexte : résidences universitaires, restauration, campus.
  Budget total simulé ~18.4M sur 5 ans.
*/

INSERT INTO campagnes_renouvellement (
  reference, nom, type_operation, statut, criticite, score_risque,
  annee_ppi, trimestre_debut, trimestre_fin,
  perimetre_libelle, nb_equipements, vetuste_moyenne,
  capex_estime, budget_consomme_pct, roi_ans,
  impact_energie, impact_exploitation, impact_conformite, impact_confort,
  avancement_pct, responsable, notes
) VALUES

-- 1. SSI Cavalier + résidences Lyon 6 — URGENT RÉGLEMENTAIRE
('PPI-2026-001',
 'Renouvellement SSI — Résidences Lyon 6',
 'remplacement', 'planifie', 'critique', 92,
 2026, 'T2', 'T3',
 'Résidence Jacques Cavalier + Résidence Voltaire — 2 bâtiments',
 4, 95.0,
 95000.00, 12.0, NULL,
 '', 'Suppression alarmes intempestives. Fiabilité exploitation.', '-18% écarts commission sécurité. Mise en conformité 2027 respectée.', 'Confort nocturne occupants amélioré.',
 18, 'Dupont A.',
 'Commission sécurité 2024 exige remplacement SSI Cavalier avant 2027. Systèmes Notifier ID3000 âgés de 12 ans, fin vie constructeur.'),

-- 2. ECS Cavalier — URGENT eau froide récurrent
('PPI-2026-002',
 'Remplacement ballons ECS — Résidence Jacques Cavalier',
 'remplacement', 'travaux', 'critique', 85,
 2026, 'T1', 'T2',
 'Résidence Jacques Cavalier — 3 ballons Atlantic Calypso Neo',
 3, 100.0,
 66000.00, 68.0, 5.2,
 '-22% consommation électrique chauffage ECS.', 'Fin des pannes eau froide récurrentes. Durée de vie 15 ans.', 'Conformité légionelles rétablie.', 'Eau chaude permanente pour 108 étudiants.',
 68, 'Moreau F.',
 'Ballons 2014 — durée de vie théorique dépassée. 3 pannes eau froide en 3 ans. Risque légionelles élevé.'),

-- 3. Armoires réfrigérées Manufacture + résidences Tabacs
('PPI-2027-001',
 'Renouvellement équipements froid — Campus Manufacture',
 'remplacement', 'etude', 'fort', 76,
 2027, 'T2', 'T3',
 'Resto''U Manufacture + Résidence La Madeleine — équipements froid',
 8, 78.5,
 145000.00, 5.0, 4.8,
 '-30% consommation électrique réfrigération (R452A → R290).', 'MTBF multiplié par 2,5. Fin interventions urgentes.', 'Conformité F-Gaz 2027. Transition fluide naturel.', '',
 8, 'Leroy P.',
 'Armoire positive Liebherr 2014 + 7 équipements froid divers. Campagne de massification pour bénéficier de marchés groupés.'),

-- 4. Ascenseurs Cavalier + Jussieu
('PPI-2028-001',
 'Modernisation ascenseurs — Campus Lyon 6 et Doua',
 'modernisation', 'arbitrage', 'fort', 68,
 2028, 'T1', 'T4',
 'Résidence Jacques Cavalier + Résidence Jussieu + Résidence Jussieu Studios',
 6, 62.0,
 380000.00, 0.0, 7.5,
 '-15% consommation électrique (variateurs régénératifs).', 'Disponibilité 99,5% cible vs 94% actuel. PMR garanti.', 'Conformité EN 81-20. Accessibilité PMR garantie.', 'Fiabilité ascenseurs critique pour PMR.',
 2, 'Leroy P.',
 'Ascenseurs KONE EcoSpace 2014. Variateurs remplacés 2024. Modernisation complète recommandée plutôt que remplacement partiel.'),

-- 5. VMC résidences La Doua
('PPI-2028-002',
 'Remplacement VMC — Campus La Doua (lot 1)',
 'remplacement', 'planifie', 'moyen', 55,
 2028, 'T2', 'T3',
 'Résidence Jussieu + Résidence Les Antonins + Résidence Puvis de Chavannes',
 12, 68.0,
 185000.00, 8.0, 6.2,
 '-40% consommation ventilation (VMC double flux avec récupération chaleur).', 'Qualité air intérieur améliorée. Confort thermique renforcé.', 'RE2020 compatible. Conformité DPE.', 'Confort thermique et acoustique des logements.',
 8, 'Simon A.',
 'VMC hygro simples 2012-2016. Remplacement par VMC double flux avec récupération 85% permettant gain énergétique significatif.'),

-- 6. Chauffage Campus Manufacture (P3)
('PPI-2028-003',
 'Renouvellement sous-stations chauffage — Campus Manufacture des Tabacs',
 'remplacement', 'etude', 'moyen', 42,
 2028, 'T1', 'T2',
 'Résidences La Madeleine, Les Quais, Garibaldi, Benjamin Delessert, André Lirondelle',
 8, 52.0,
 620000.00, 0.0, 8.5,
 '-25% pertes réseau chauffage. Régulation intelligente.', 'Gestion automatisée. Réduction interventions de 60%.', 'Bilan carbone CROUS amélioré.', 'Confort thermique amélioré. Pilotage par logement.',
 0, 'Bernard C.',
 'Sous-stations Danfoss 2010-2014. Programme P3 avec opérateur chauffage urbain CLY. Massification 5 résidences pour marché groupé.'),

-- 7. TGBT résidences vétustes Saint-Just
('PPI-2029-001',
 'Réhabilitation électrique — Campus Lyon 5 Saint-Just',
 'rehabilitation', 'besoin', 'fort', 72,
 2029, 'T2', 'T4',
 'Campus Lyon 5 — 4 résidences (Paradin, Croix du Sud, Jean Mermoz, André Allix)',
 16, 75.0,
 1850000.00, 0.0, NULL,
 '-18% consommation électrique (automates gestion éclairage+prise).', 'Continuité électrique renforcée. Fin coupures partielles.', 'NF C15-100 mis à jour. Schémas électriques refaits.', '',
 0, 'Martin C.',
 'TGBT 2000-2005 en fin de vie. Plusieurs incidents recensés. Marché global de réhabilitation électrique — appel à projet CNOUS 2028.'),

-- 8. Sécurité incendie — Campus Doua campagne SSI
('PPI-2027-002',
 'Remplacement SSI complet — Campus La Doua',
 'remplacement', 'consultation', 'critique', 88,
 2027, 'T1', 'T4',
 'Campus La Doua — 6 résidences (Jussieu, Les Antonins, Puvis, Einstein, Jussieu Studios, Archimède)',
 24, 88.0,
 840000.00, 0.0, NULL,
 '', 'Zéro alarme intempestive. Gestion centralisée CROUS.', 'Mise en conformité NFS 61-931. Obligation commission sécurité 2027.', 'Sécurité maximale pour 2400 étudiants.',
 15, 'Dupont A.',
 'SSI Notifier 2006-2010. Fin de support constructeur. Marché public lancé. Centralisation GTB campus.'),

-- 9. Éclairage LED — tout le parc Lyon
('PPI-2027-003',
 'Transition éclairage LED — parc résidentiel Lyon',
 'modernisation', 'planifie', 'faible', 28,
 2027, 'T1', 'T4',
 'Parc résidentiel CROUS Lyon — 28 résidences (parties communes)',
 280, 45.0,
 1200000.00, 22.0, 3.8,
 '-65% consommation éclairage parties communes. Capteurs présence.',  'Réduction interventions remplacement lampes de 80%.', 'RE2020. Loi ELAN.', 'Qualité lumineuse améliorée (IRC 90+).',
 22, 'Simon A.',
 'Programme CROUS national — cofinancement CNOUS 40%. ROI 3,8 ans. Marchés allotis par zone géographique.'),

-- 10. Campagne chauffe-eaux individuels La Doua
('PPI-2029-002',
 'Remplacement chauffe-eaux individuels — Campus La Doua',
 'remplacement', 'besoin', 'moyen', 58,
 2029, 'T2', 'T3',
 'Résidences Jussieu, Les Antonins, Puvis de Chavannes, Einstein — 480 logements',
 480, 72.0,
 2160000.00, 0.0, 6.0,
 '-45% consommation eau chaude (chauffe-eaux thermo-dynamiques).', 'Fin pannes individuelles récurrentes.', 'Conformité légionelles individuelle.', 'Eau chaude fiable pour chaque étudiant.',
 0, 'Leroy P.',
 'Chauffe-eaux Ariston 2010-2012. Age moyen 17 ans. Campagne de remplacement par lots de 120 unités. Thermodynamiques pour gain énergétique.'),

-- 11. Toitures terrasses
('PPI-2030-001',
 'Réfection toitures terrasses — résidences vétustes',
 'rehabilitation', 'besoin', 'moyen', 48,
 2030, 'T1', 'T2',
 'Résidences Paradin, Jean Mermoz, La Madeleine, Les Quais — 4 bâtiments',
 4, 55.0,
 3200000.00, 0.0, NULL,
 '-12% pertes thermiques toiture. Isolation renforcée.', 'Fin infiltrations. Protection mécanique améliorée.', 'DTA amiante mis à jour. Conformité ERP.', '',
 0, 'Fontaine P.',
 'Toitures terrasses 1980-1995. Infiltrations signalées. Programme quinquennal. Coordination avec DTA amiante obligatoire.'),

-- 12. Portails et contrôle d'accès
('PPI-2026-003',
 'Modernisation contrôle accès — parc résidentiel',
 'modernisation', 'travaux', 'moyen', 45,
 2026, 'T3', 'T4',
 'CROUS Lyon — 15 résidences prioritaires',
 45, 58.0,
 420000.00, 45.0, 5.5,
 '', 'Réduction incidents accès. Traçabilité renforcée.', 'Conformité RGPD (biométrie → badge NFC).', 'Sécurité et confort d''accès résidents améliorés.',
 45, 'Bernard C.',
 'Migration badges magnétiques vers NFC. Intégration SI CROUS. Couplage vidéo-surveillance.');
