/*
  # Création de la table occupants

  ## Objectif
  Stocker l'historique complet des occupants par logement (occupant actuel, anciens occupants, à venir).

  ## Nouvelle table : occupants
  - id                   : identifiant unique
  - logement_id          : référence au logement (FK logements.id)
  - photo_url            : URL de la photo de l'étudiant
  - nom                  : nom de famille (ex. DUPONT)
  - prenom               : prénom (ex. Jean)
  - telephone            : numéro de téléphone (optionnel, RGPD)
  - email                : adresse email
  - etablissement        : université / école de rattachement
  - type_contrat         : bail_classique | colocation | logement_temporaire | echange_international
  - reference_bail       : numéro unique du bail (ex. BAIL-LYON-2026-00123)
  - date_entree          : date de début d'occupation
  - date_sortie_prevue   : date de fin de contrat (null = toujours occupant)
  - statut_edl_entrant   : statut état des lieux entrant (a_realiser | realise | non_applicable)
  - date_edl_entrant     : date de l'état des lieux entrant
  - lien_edl_entrant     : URL vers le document dans la GED
  - statut_edl_sortant   : statut état des lieux sortant
  - date_edl_sortant     : date de l'état des lieux sortant
  - lien_edl_sortant     : URL vers le document dans la GED
  - factures_ref         : références factures interventions (jsonb)
  - factures_montant     : montant total des factures (numeric)
  - statut               : occupant_actuel | ancien_occupant | a_venir
  - created_at           : date de création de l'enregistrement

  ## Sécurité
  - RLS activé
  - Accès en lecture/écriture pour les utilisateurs authentifiés uniquement
*/

CREATE TABLE IF NOT EXISTS occupants (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id          uuid NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  photo_url            text,
  nom                  text NOT NULL DEFAULT '',
  prenom               text NOT NULL DEFAULT '',
  telephone            text,
  email                text,
  etablissement        text,
  type_contrat         text NOT NULL DEFAULT 'bail_classique',
  reference_bail       text,
  date_entree          date,
  date_sortie_prevue   date,
  statut_edl_entrant   text NOT NULL DEFAULT 'a_realiser',
  date_edl_entrant     date,
  lien_edl_entrant     text,
  statut_edl_sortant   text NOT NULL DEFAULT 'a_realiser',
  date_edl_sortant     date,
  lien_edl_sortant     text,
  factures_ref         jsonb DEFAULT '[]'::jsonb,
  factures_montant     numeric DEFAULT 0,
  statut               text NOT NULL DEFAULT 'occupant_actuel',
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_occupants_logement_id ON occupants(logement_id);
CREATE INDEX IF NOT EXISTS idx_occupants_statut      ON occupants(statut);
CREATE INDEX IF NOT EXISTS idx_occupants_date_entree ON occupants(date_entree DESC);

ALTER TABLE occupants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select occupants"
  ON occupants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert occupants"
  ON occupants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update occupants"
  ON occupants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete occupants"
  ON occupants FOR DELETE
  TO authenticated
  USING (true);
