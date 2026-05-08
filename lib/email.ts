import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM ?? 'Médéric Souccar <mederic@medericsouccar.com>'
const BROKER_EMAIL = 'mederic@medericsouccar.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medericsouccar.com'

// ── Notification interne à Médéric quand un lead arrive ──────
export async function sendNewLeadNotification(lead: {
  first_name: string; last_name: string; email: string; phone?: string | null; message: string
}) {
  return resend.emails.send({
    from: FROM,
    to: BROKER_EMAIL,
    subject: `🏡 Nouveau lead — ${lead.first_name} ${lead.last_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h2 style="font-weight:400;border-bottom:1px solid #e4e4e0;padding-bottom:12px;">
          Nouveau lead reçu
        </h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px 0;color:#888;width:120px;">Nom</td>
              <td style="padding:8px 0;font-weight:500;">${lead.first_name} ${lead.last_name}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Courriel</td>
              <td style="padding:8px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#888;">Téléphone</td>
              <td style="padding:8px 0;">${lead.phone ?? '—'}</td></tr>
        </table>
        <div style="background:#f9f9f7;border:1px solid #e4e4e0;padding:16px;border-radius:2px;margin-bottom:24px;">
          <p style="margin:0;color:#3a3a3a;line-height:1.7;">${lead.message}</p>
        </div>
        <a href="${SITE_URL}/crm/leads"
           style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">
          Voir dans le CRM →
        </a>
        <p style="margin-top:32px;font-size:11px;color:#888;">RE/MAX Vision · Médéric Souccar</p>
      </div>
    `,
  })
}

// ── Email de bienvenue automatique au lead ───────────────────
export async function sendLeadWelcomeEmail(lead: {
  first_name: string; last_name: string; email: string
}) {
  return resend.emails.send({
    from: FROM,
    to: lead.email,
    subject: `Bonjour ${lead.first_name} — votre demande a bien été reçue`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h2 style="font-family:Georgia,serif;font-weight:400;font-size:28px;">
          Bonjour ${lead.first_name},
        </h2>
        <p style="color:#3a3a3a;line-height:1.8;margin:20px 0;">
          Merci pour votre message. Je l'ai bien reçu et je vous répondrai dans les prochaines heures.
        </p>
        <p style="color:#3a3a3a;line-height:1.8;margin:20px 0;">
          En attendant, n'hésitez pas à consulter mes propriétés disponibles ou à me rejoindre directement :
        </p>
        <div style="border:1px solid #e4e4e0;padding:20px;border-radius:2px;margin:24px 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#888;">📞 819-743-9192</p>
          <p style="margin:0;font-size:13px;color:#888;">📍 225 boul. de la Gappe, unité 102, Gatineau</p>
        </div>
        <a href="${SITE_URL}/listings"
           style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">
          Voir les propriétés
        </a>
        <p style="margin-top:40px;font-size:12px;color:#888;border-top:1px solid #e4e4e0;padding-top:16px;">
          Médéric Souccar · Courtier immobilier agréé · RE/MAX Vision
        </p>
      </div>
    `,
  })
}

// ── Email de follow-up de rappel à Médéric ──────────────────
export async function sendFollowUpReminder(items: Array<{
  type: 'lead' | 'client'; name: string; date: string; id: string
}>) {
  const rows = items.map((i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e0;">${i.type === 'lead' ? 'Lead' : 'Client'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e0;font-weight:500;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e4e4e0;">
        <a href="${SITE_URL}/crm/${i.type === 'lead' ? 'leads' : 'clients'}/${i.id}" style="color:#111;">Voir →</a>
      </td>
    </tr>
  `).join('')

  return resend.emails.send({
    from: FROM,
    to: BROKER_EMAIL,
    subject: `📅 ${items.length} follow-up(s) à faire aujourd'hui`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h2 style="font-weight:400;border-bottom:1px solid #e4e4e0;padding-bottom:12px;">
          Follow-ups du jour
        </h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <thead>
            <tr style="background:#f9f9f7;">
              <th style="text-align:left;padding:8px 12px;font-weight:400;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Type</th>
              <th style="text-align:left;padding:8px 12px;font-weight:400;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Nom</th>
              <th style="text-align:left;padding:8px 12px;font-weight:400;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Lien</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <a href="${SITE_URL}/crm"
           style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">
          Ouvrir le CRM
        </a>
      </div>
    `,
  })
}

// ── Email manuel à un lead ───────────────────────────────────
export async function sendManualEmail(to: string, subject: string, body: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;line-height:1.7;">
        ${body.replace(/\n/g, '<br>')}
        <p style="margin-top:40px;font-size:12px;color:#888;border-top:1px solid #e4e4e0;padding-top:16px;">
          Médéric Souccar · Courtier immobilier agréé · RE/MAX Vision<br>
          819-743-9192 · 225 boul. de la Gappe, unité 102, Gatineau
        </p>
      </div>
    `,
  })
}
