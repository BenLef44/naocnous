/*
  # Module Approvisionnements

  ## Nouvelles tables
  - `appro_entrepots` : lieux de stockage (code Epona, site, responsable)
  - `appro_articles`  : référentiel articles/pièces
  - `appro_stocks`    : stock disponible par article et entrepôt
  - `appro_demandes`  : demandes d'achat avec workflow et sync Epona
  - `appro_mouvements`: historique des mouvements de stock

  ## Sécurité
  RLS activé sur toutes les tables. Accès lecture anonyme pour la démo.
*/

CREATE TABLE IF NOT EXISTS appro_entrepots (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom          text        NOT NULL,
  code         text        NOT NULL DEFAULT '',
  site_nom     text        NOT NULL DEFAULT '',
  adresse      text        DEFAULT '',
  responsable  text        DEFAULT '',
  surface_m2   numeric     DEFAULT 0,
  actif        boolean     NOT NULL DEFAULT true,
  code_epona   text        DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE appro_entrepots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read entrepots"          ON appro_entrepots FOR SELECT TO anon        USING (true);
CREATE POLICY "auth full access entrepots"   ON appro_entrepots FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS appro_articles (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference             text        NOT NULL UNIQUE,
  designation           text        NOT NULL,
  categorie             text        NOT NULL DEFAULT '',
  sous_categorie        text        DEFAULT '',
  unite                 text        NOT NULL DEFAULT 'unité',
  fournisseur_prefere   text        DEFAULT '',
  reference_fournisseur text        DEFAULT '',
  prix_unitaire_ht      numeric     DEFAULT 0,
  delai_livraison_jours int         DEFAULT 7,
  created_at            timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE appro_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read articles"        ON appro_articles FOR SELECT TO anon        USING (true);
CREATE POLICY "auth full access articles" ON appro_articles FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS appro_stocks (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id          uuid        NOT NULL REFERENCES appro_articles(id),
  entrepot_id         uuid        NOT NULL REFERENCES appro_entrepots(id),
  quantite_disponible numeric     NOT NULL DEFAULT 0,
  quantite_reservee   numeric     NOT NULL DEFAULT 0,
  stock_mini          numeric     NOT NULL DEFAULT 0,
  stock_maxi          numeric     DEFAULT NULL,
  emplacement         text        DEFAULT '',
  derniere_maj        timestamptz NOT NULL DEFAULT now(),
  sync_epona_at       timestamptz DEFAULT NULL,
  UNIQUE (article_id, entrepot_id)
);
ALTER TABLE appro_stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read stocks"        ON appro_stocks FOR SELECT TO anon        USING (true);
CREATE POLICY "auth full access stocks" ON appro_stocks FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_appro_stocks_article  ON appro_stocks(article_id);
CREATE INDEX IF NOT EXISTS idx_appro_stocks_entrepot ON appro_stocks(entrepot_id);

CREATE TABLE IF NOT EXISTS appro_demandes (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference               text        NOT NULL UNIQUE,
  titre                   text        NOT NULL,
  description             text        DEFAULT '',
  statut                  text        NOT NULL DEFAULT 'brouillon',
  priorite                text        NOT NULL DEFAULT 'normale',
  site_nom                text        DEFAULT '',
  demandeur_nom           text        NOT NULL DEFAULT '',
  demandeur_email         text        DEFAULT '',
  intervention_liee_ref   text        DEFAULT '',
  designation_libre       text        DEFAULT '',
  quantite_demandee       numeric     NOT NULL DEFAULT 1,
  quantite_recue          numeric     NOT NULL DEFAULT 0,
  unite                   text        DEFAULT 'unité',
  epona_sync_statut       text        DEFAULT 'non_envoye',
  epona_numero_commande   text        DEFAULT '',
  epona_sync_at           timestamptz DEFAULT NULL,
  epona_sync_date_envoi   timestamptz DEFAULT NULL,
  date_besoin             date        DEFAULT NULL,
  date_commande           date        DEFAULT NULL,
  date_livraison_prevue   date        DEFAULT NULL,
  date_reception          date        DEFAULT NULL,
  fournisseur             text        DEFAULT '',
  montant_estime_ht       numeric     DEFAULT NULL,
  commentaire             text        DEFAULT '',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE appro_demandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read demandes"        ON appro_demandes FOR SELECT TO anon        USING (true);
CREATE POLICY "auth full access demandes" ON appro_demandes FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_appro_demandes_statut   ON appro_demandes(statut);
CREATE INDEX IF NOT EXISTS idx_appro_demandes_priorite ON appro_demandes(priorite);

CREATE TABLE IF NOT EXISTS appro_mouvements (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id    uuid        NOT NULL REFERENCES appro_articles(id),
  entrepot_id   uuid        NOT NULL REFERENCES appro_entrepots(id),
  type_mvt      text        NOT NULL DEFAULT 'entree',
  quantite      numeric     NOT NULL DEFAULT 0,
  reference_doc text        DEFAULT '',
  auteur        text        DEFAULT '',
  commentaire   text        DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE appro_mouvements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read mouvements"        ON appro_mouvements FOR SELECT TO anon        USING (true);
CREATE POLICY "auth full access mouvements" ON appro_mouvements FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_appro_mouvements_created ON appro_mouvements(created_at DESC);

CREATE OR REPLACE FUNCTION update_appro_demandes_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appro_demandes_updated_at ON appro_demandes;
CREATE TRIGGER trg_appro_demandes_updated_at
  BEFORE UPDATE ON appro_demandes
  FOR EACH ROW EXECUTE FUNCTION update_appro_demandes_updated_at();
