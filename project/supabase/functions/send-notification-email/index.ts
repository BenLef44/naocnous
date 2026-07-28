import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CRITICITE_LABEL: Record<string, { label: string; color: string; dot: string }> = {
  critique: { label: "Urgente",  color: "#dc2626", dot: "🔴" },
  haute:    { label: "Haute",    color: "#ea580c", dot: "🟠" },
  moyenne:  { label: "Normale",  color: "#d97706", dot: "🟡" },
  faible:   { label: "Faible",   color: "#16a34a", dot: "🟢" },
};

function slaLabel(sla: number): string {
  if (sla <= 4)  return "moins de 4 heures";
  if (sla <= 8)  return "sous 8 heures ouvrées";
  if (sla <= 24) return "sous 24 heures ouvrées";
  if (sla <= 48) return "sous 2 jours ouvrés";
  if (sla <= 72) return "sous 3 jours ouvrés";
  return `sous ${Math.round(sla / 24)} jours ouvrés`;
}

function buildHtml(p: {
  reference: string; demandeurNom: string; titre: string;
  locSummary: string; categorie: string; criticite: string;
  sla_heures: number; createdAt: string; trackingUrl: string;
}): string {
  const crit = CRITICITE_LABEL[p.criticite] ?? CRITICITE_LABEL.moyenne;
  const dateStr = new Date(p.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de demande</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px 40px;">
            <p style="margin:0;color:rgba(255,255,255,.7);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">CROUS Lyon · OpenGST</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
              Votre demande a bien été enregistrée
            </h1>
          </td>
        </tr>

        <!-- Confirmation banner -->
        <tr>
          <td style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:16px 40px;">
            <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">
              ✅ Demande n° <span style="font-family:monospace;background:#dcfce7;padding:2px 8px;border-radius:6px;">${p.reference}</span> créée avec succès
            </p>
          </td>
        </tr>

        <!-- Info table -->
        <tr>
          <td style="padding:32px 40px 24px;">
            <p style="margin:0 0 16px;font-size:14px;color:#475569;">Bonjour ${p.demandeurNom || ""},</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              Votre demande d'intervention a bien été enregistrée dans notre système de gestion. Voici un récapitulatif :
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              ${row("Numéro", `<span style="font-family:monospace;font-weight:700;color:#1e40af;">${p.reference}</span>`)}
              ${row("Créée le", dateStr)}
              ${row("Objet", `<strong>${p.titre}</strong>`)}
              ${p.locSummary ? row("Lieu", p.locSummary) : ""}
              ${p.categorie  ? row("Catégorie", p.categorie) : ""}
              ${row("Priorité", `${crit.dot} <strong style="color:${crit.color};">${crit.label}</strong>`)}
              ${row("Délai estimé", `⏱ Première prise en charge ${slaLabel(p.sla_heures)}`)}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 40px 32px;text-align:center;">
            <a href="${p.trackingUrl}"
              style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:.3px;">
              Suivre ma demande →
            </a>
            <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">
              Ou copiez ce lien : <a href="${p.trackingUrl}" style="color:#3b82f6;">${p.trackingUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              Cet email a été envoyé automatiquement par OpenGST — CROUS Lyon.<br/>
              En cas d'urgence, contactez directement le service technique.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr style="border-bottom:1px solid #f1f5f9;">
    <td style="padding:10px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;white-space:nowrap;background:#f8fafc;width:120px;">${label}</td>
    <td style="padding:10px 16px;font-size:13px;color:#1e293b;">${value}</td>
  </tr>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { to, demandeurNom, reference, titre, locSummary, categorie, criticite, sla_heures, trackingUrl, createdAt } = body;

    if (!to || !reference) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, reference" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured", skipped: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildHtml({ reference, demandeurNom: demandeurNom ?? "", titre: titre ?? reference, locSummary: locSummary ?? "", categorie: categorie ?? "", criticite: criticite ?? "moyenne", sla_heures: sla_heures ?? 48, createdAt: createdAt ?? new Date().toISOString(), trackingUrl });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CROUS Lyon OpenGST <noreply@crous-lyon.fr>",
        to: [to],
        subject: `Votre demande d'intervention a bien été enregistrée — ${reference}`,
        html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
