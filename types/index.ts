export type ListingStatus = 'actif' | 'vendu' | 'sous_offre' | 'retiré'
export type ClientType = 'acheteur' | 'vendeur' | 'les_deux'
export type ClientStatus = 'prospect' | 'actif' | 'fermé' | 'inactif'
export type InteractionType = 'appel' | 'courriel' | 'visite' | 'réunion' | 'note'
export type KanbanStage = 'nouveau' | 'contacté' | 'visite' | 'offre' | 'fermé' | 'perdu'

export interface Listing {
  id: string
  created_at: string
  address: string
  city: string
  price: number
  status: ListingStatus
  bedrooms: number
  bathrooms: number
  sqft: number
  description: string | null
  photos: string[]
  featured: boolean
  mls_number: string | null
}

export interface Client {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  type: ClientType
  status: ClientStatus
  notes: string | null
  budget_min: number | null
  budget_max: number | null
  linked_listing_id: string | null
  follow_up_date: string | null
  follow_up_sent: boolean
}

export interface Lead {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  message: string
  notes: string | null
  listing_id: string | null
  converted: boolean
  converted_client_id: string | null
  stage: KanbanStage
  stage_order: number
  follow_up_date: string | null
  follow_up_sent: boolean
  auto_email_sent: boolean
  auto_sms_sent: boolean
}

export interface Interaction {
  id: string
  created_at: string
  client_id: string
  type: InteractionType
  notes: string
  date: string
}

export interface EmailLog {
  id: string
  created_at: string
  lead_id: string | null
  client_id: string | null
  to_email: string
  subject: string
  body: string
  sent: boolean
  error: string | null
}

export interface SmsLog {
  id: string
  created_at: string
  lead_id: string | null
  client_id: string | null
  to_phone: string
  body: string
  sent: boolean
  twilio_sid: string | null
  error: string | null
}

export interface PushSubscriptionRecord {
  id: string
  created_at: string
  endpoint: string
  p256dh: string
  auth: string
}
