import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const FROM = process.env.TWILIO_PHONE_NUMBER!
const BROKER_PHONE = process.env.TWILIO_PHONE_NUMBER!

// ── SMS de bienvenue automatique au lead ─────────────────────
export async function sendLeadWelcomeSms(lead: {
  first_name: string; phone: string
}) {
  const body =
    `Bonjour ${lead.first_name}, c'est Médéric Souccar de RE/MAX Vision. ` +
    `J'ai bien reçu votre demande et je vous reviens très bientôt. ` +
    `N'hésitez pas à m'appeler au 819-743-9192.`

  return client.messages.create({ from: FROM, to: lead.phone, body })
}

// ── SMS de notif à Médéric quand lead arrive ─────────────────
export async function sendBrokerLeadAlert(lead: {
  first_name: string; last_name: string; phone?: string | null; email: string
}) {
  const body =
    `🏡 Nouveau lead : ${lead.first_name} ${lead.last_name}` +
    `${lead.phone ? ` · ${lead.phone}` : ''} · ${lead.email}`

  return client.messages.create({ from: FROM, to: BROKER_PHONE, body })
}

// ── SMS manuel ────────────────────────────────────────────────
export async function sendManualSms(to: string, body: string) {
  return client.messages.create({
    from: FROM,
    to,
    body: body + '\n\n— Médéric Souccar, RE/MAX Vision · 819-743-9192',
  })
}
