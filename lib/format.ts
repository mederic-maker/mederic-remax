export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export const STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  vendu: 'Vendu',
  sous_offre: 'Sous offre',
  retiré: 'Retiré',
  prospect: 'Prospect',
  fermé: 'Fermé',
  inactif: 'Inactif',
  acheteur: 'Acheteur',
  vendeur: 'Vendeur',
  les_deux: 'Acheteur & Vendeur',
}
