
CREATE TABLE IF NOT EXISTS config_roles_bibliotheque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT,
  categorie TEXT NOT NULL DEFAULT 'Métier',
  icone TEXT DEFAULT '👤',
  couleur TEXT DEFAULT '#64748b',
  modules JSONB DEFAULT '[]'::jsonb,
  dashboard_defaut TEXT,
  perimetre TEXT,
  nb_utilisations INT NOT NULL DEFAULT 0,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE config_roles_bibliotheque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_roles_bibliotheque" ON config_roles_bibliotheque FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_roles_bibliotheque" ON config_roles_bibliotheque FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_roles_bibliotheque" ON config_roles_bibliotheque FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_roles_bibliotheque" ON config_roles_bibliotheque FOR DELETE TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION update_config_roles_bibliotheque_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_config_roles_bibliotheque_updated_at
BEFORE UPDATE ON config_roles_bibliotheque
FOR EACH ROW EXECUTE FUNCTION update_config_roles_bibliotheque_updated_at();

INSERT INTO config_roles_bibliotheque (nom, description, categorie, icone, couleur, modules, dashboard_defaut, nb_utilisations) VALUES
(
  'Agent de maintenance',
  'Technicien intervenant sur les équipements et les bâtiments. Accès aux interventions, équipements et documents techniques.',
  'Métier',
  '🔧',
  '#0ea5e9',
  '[{"module_id":"interventions","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false},{"module_id":"equipements","peut_voir":true,"peut_creer":false,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false},{"module_id":"documents","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false},{"module_id":"maintenance","peut_voir":true,"peut_creer":false,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false}]'::jsonb,
  'maintenance',
  14
),
(
  'Responsable de maintenance',
  'Pilote l''ensemble de l''activité de maintenance. Planifie, supervise et valide les interventions. Accès étendu aux modules opérationnels.',
  'Métier',
  '🛠️',
  '#6366f1',
  '[{"module_id":"interventions","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":true},{"module_id":"equipements","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":false},{"module_id":"maintenance","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":true},{"module_id":"documents","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"approvisionnements","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false},{"module_id":"fluides","peut_voir":true,"peut_creer":false,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false}]'::jsonb,
  'maintenance',
  6
),
(
  'Responsable réglementaire',
  'Suit la conformité réglementaire des bâtiments (contrôles périodiques, levée des non-conformités). Accès aux modules réglementaire et documents.',
  'Métier',
  '📋',
  '#f59e0b',
  '[{"module_id":"reglementaire","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":true},{"module_id":"documents","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"equipements","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"arborescence","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false}]'::jsonb,
  'reglementaire',
  4
),
(
  'Gestionnaire des approvisionnements',
  'Gère les stocks, commandes et fournisseurs. Accès aux modules approvisionnements, contrats et finances.',
  'Métier',
  '📦',
  '#10b981',
  '[{"module_id":"approvisionnements","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":true},{"module_id":"contrats","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"finance","peut_voir":true,"peut_creer":false,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"documents","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false}]'::jsonb,
  'approvisionnements',
  3
),
(
  'Gestionnaire de contrats',
  'Administre les contrats fournisseurs, prestataires et mainteneurs. Suit les engagements et les renouvellements.',
  'Métier',
  '📄',
  '#8b5cf6',
  '[{"module_id":"contrats","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":true},{"module_id":"finance","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"documents","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"interventions","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false}]'::jsonb,
  'contrats',
  5
),
(
  'Gestionnaire du patrimoine',
  'Maintient le référentiel des bâtiments, logements et équipements. Accès complet aux modules patrimoine.',
  'Métier',
  '🏗️',
  '#06b6d4',
  '[{"module_id":"arborescence","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":true},{"module_id":"equipements","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":true,"peut_exporter":true,"peut_administrer":true},{"module_id":"documents","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"edl","peut_voir":true,"peut_creer":true,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"ppi","peut_voir":true,"peut_creer":false,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false}]'::jsonb,
  'maintenance',
  7
),
(
  'Direction',
  'Accès lecture globale à l''ensemble des modules, tableaux de bord stratégiques et indicateurs clés. Pas d''accès opérationnel.',
  'Direction',
  '🎯',
  '#ef4444',
  '[{"module_id":"interventions","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"finance","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"contrats","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"reglementaire","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"maintenance","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"ppi","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":true,"peut_administrer":false},{"module_id":"predictif","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false}]'::jsonb,
  'direction',
  2
),
(
  'Prestataire externe',
  'Accès restreint pour un intervenant externe. Consultation des interventions assignées et saisie de compte-rendus uniquement.',
  'Prestataire',
  '🏢',
  '#64748b',
  '[{"module_id":"interventions","peut_voir":true,"peut_creer":false,"peut_modifier":true,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false},{"module_id":"documents","peut_voir":true,"peut_creer":false,"peut_modifier":false,"peut_supprimer":false,"peut_exporter":false,"peut_administrer":false}]'::jsonb,
  'maintenance',
  9
);
