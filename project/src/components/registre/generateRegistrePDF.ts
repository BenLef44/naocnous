import type { RegistreSecuriteRecord, ERP } from './registreTypes';
import { CATEGORIE_ERP_LABELS, TYPE_ERP_LABELS, fmtDate, fmtDateTime } from './registreTypes';

export function generateRegistrePDF(r: RegistreSecuriteRecord, erp?: ERP | null): void {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;

  const orgs = (r.organismes_controle ?? []).join(', ') || '—';
  const points = r.points_rassemplement ?? [];
  const equipements = r.equipements_securite ?? [];
  const exercices = r.exercices ?? [];
  const commissions = r.commissions ?? [];
  const sigs = r.signatures ?? [];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Registre de sécurité — ${r.reference}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 11px; line-height: 1.5; }
  .header { border-bottom: 3px solid #059669; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: 18px; color: #059669; }
  .header .ref { font-size: 13px; font-weight: 700; color: #475569; }
  .header .year { font-size: 24px; font-weight: 900; color: #059669; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 13px; font-weight: 800; color: #059669; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
  .field { padding: 3px 0; }
  .field-label { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
  .field-value { font-size: 11px; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { text-align: left; font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; padding: 4px 6px; border-bottom: 2px solid #e2e8f0; background: #f8fafc; }
  td { font-size: 10px; padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
  .badge { display: inline-block; padding: 1px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; }
  .badge-ok { background: #d1fae5; color: #065f46; }
  .badge-warn { background: #fef3c7; color: #92400e; }
  .badge-err { background: #fee2e2; color: #991b1b; }
  .sig-box { display: inline-block; width: 48%; vertical-align: top; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; margin-right: 2%; margin-bottom: 8px; }
  .sig-box h4 { font-size: 10px; font-weight: 700; margin-bottom: 4px; }
  .sig-box .sig-status { font-size: 9px; font-weight: 600; }
  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; text-align: center; }
  .completude-bar { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-top: 4px; }
  .completude-fill { height: 100%; background: #059669; border-radius: 99px; }
  .consignes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 10px; white-space: pre-wrap; }
  @media print { .no-print { display: none; } body { font-size: 10px; } }
  .print-btn { position: fixed; bottom: 16px; right: 16px; background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,0.3); }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Registre de sécurité</h1>
    <div class="ref">${r.reference}</div>
    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${erp?.nom ?? '—'} — ${CATEGORIE_ERP_LABELS[erp?.categorie_erp ?? ''] ?? '—'} · ${TYPE_ERP_LABELS[erp?.type_erp ?? ''] ?? '—'}</div>
  </div>
  <div style="text-align: right;">
    <div class="year">${r.annee}</div>
    <div style="font-size: 10px; color: #64748b;">Complétude: ${r.completude_pct}%</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Identification</div>
  <div class="grid">
    <div class="field"><div class="field-label">Responsable registre</div><div class="field-value">${r.responsable_registre ?? '—'}</div></div>
    <div class="field"><div class="field-label">Responsable légal</div><div class="field-value">${r.responsable_legal ?? '—'}</div></div>
    <div class="field"><div class="field-label">Date d'ouverture</div><div class="field-value">${fmtDate(r.date_ouverture)}</div></div>
    <div class="field"><div class="field-label">Organismes de contrôle</div><div class="field-value">${orgs}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Consignes de sécurité</div>
  <div class="consignes-box">${r.consignes_incendie ?? '—'}</div>
  <div class="grid" style="margin-top: 8px;">
    <div class="field"><div class="field-label">Point de rassemblement</div><div class="field-value">${r.point_rassemblement ?? '—'}</div></div>
    <div class="field"><div class="field-label">Plan d'évacuation</div><div class="field-value">${r.plan_evac_url ? 'Disponible' : '—'}</div></div>
    <div class="field"><div class="field-label">Consignes PMR</div><div class="field-value">${r.consignes_pmr ?? '—'}</div></div>
    <div class="field"><div class="field-label">Points sur plan</div><div class="field-value">${points.length} point(s)</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Équipements de sécurité (${equipements.length})</div>
  ${equipements.length > 0 ? `
  <table>
    <thead><tr><th>Désignation</th><th>Localisation</th><th>Dernier contrôle</th><th>Prochain contrôle</th><th>Statut</th></tr></thead>
    <tbody>
      ${equipements.map(e => `<tr>
        <td>${e.designation}</td>
        <td>${e.localisation ?? '—'}</td>
        <td>${fmtDate(e.date_dernier_controle)}</td>
        <td>${fmtDate(e.date_prochain_controle)}</td>
        <td>${e.statut === 'OK' ? '<span class="badge badge-ok">OK</span>' : e.statut === 'A_VERIFIER' ? '<span class="badge badge-warn">À vérifier</span>' : '<span class="badge badge-err">HS</span>'}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : '<p style="color:#94a3b8;font-size:10px;">Aucun équipement enregistré</p>'}
  <div class="grid" style="margin-top: 8px;">
    <div class="field"><div class="field-label">Dernière vérif. SSI</div><div class="field-value">${fmtDate(r.derniere_verif_ssi)}</div></div>
    <div class="field"><div class="field-label">Dernière vérif. extincteurs</div><div class="field-value">${fmtDate(r.derniere_verif_extincteurs)}</div></div>
  </div>
</div>

${commissions.length > 0 ? `
<div class="section">
  <div class="section-title">Commissions de sécurité (${commissions.length})</div>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Prescriptions</th><th>Réserves</th><th>Levée</th></tr></thead>
    <tbody>
      ${commissions.map(c => `<tr>
        <td>${fmtDate(c.date_visite)}</td>
        <td>${c.type}</td>
        <td>${c.prescriptions || '—'}</td>
        <td>${c.reserves || '—'}</td>
        <td>${c.levee_reserves ? '<span class="badge badge-ok">Levée</span>' : c.reserves ? '<span class="badge badge-warn">En cours</span>' : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

<div class="section">
  <div class="section-title">Exercices & incidents</div>
  ${exercices.length > 0 ? `
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Participants</th><th>Durée (min)</th><th>Statut</th></tr></thead>
    <tbody>
      ${exercices.map(e => `<tr>
        <td>${fmtDate(e.date)}</td>
        <td>${e.type}</td>
        <td>${e.effectif_participants ?? '—'}</td>
        <td>${e.duree_evacuation ?? '—'}</td>
        <td>${e.satisfaisant ? '<span class="badge badge-ok">Satisfaisant</span>' : '<span class="badge badge-err">Non satisfaisant</span>'}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : '<p style="color:#94a3b8;font-size:10px;">Aucun exercice enregistré</p>'}
  <div class="grid" style="margin-top: 8px;">
    <div class="field"><div class="field-label">Incidents déclarés (année)</div><div class="field-value">${r.nb_incidents_annee ?? '0'}</div></div>
    <div class="field"><div class="field-label">Observations</div><div class="field-value">${r.observations ?? '—'}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Signatures (${sigs.filter(s => s.valide).length}/${sigs.length})</div>
  ${sigs.length > 0 ? sigs.map(s => `
  <div class="sig-box">
    <h4>${s.acteur}</h4>
    <div style="font-size:9px;color:#64748b;">${s.role}${s.email ? ' · ' + s.email : ''}</div>
    <div class="sig-status" style="color:${s.valide ? '#059669' : '#94a3b8'};">
      ${s.valide ? 'Signé le ' + fmtDate(s.date) : 'En attente de signature'}
    </div>
  </div>`).join('') : '<p style="color:#94a3b8;font-size:10px;">Aucun signataire</p>'}
</div>

<div class="footer">
  Registre généré le ${fmtDateTime(new Date().toISOString())} — Naofix · Registre de sécurité
</div>

<button class="print-btn no-print" onclick="window.print()">Imprimer / PDF</button>

<script>
  setTimeout(function() { window.print(); }, 300);
</script>

</body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
}
