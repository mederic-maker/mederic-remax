export type KanbanStage = 'nouveau' | 'contacté' | 'visite' | 'offre' | 'fermé' | 'perdu'

export const STAGES: { id: KanbanStage; label: string; color: string; dot: string }[] = [
  { id: 'nouveau',  label: 'Nouveau',         color: 'bg-bg border-border', dot: 'bg-black' },
  { id: 'contacté', label: 'Contacté',         color: 'bg-bg border-border', dot: 'bg-mid' },
  { id: 'visite',   label: 'Visite planifiée', color: 'bg-bg border-border', dot: 'bg-gray' },
  { id: 'offre',    label: 'Offre en cours',   color: 'bg-bg border-border', dot: 'bg-dark' },
  { id: 'fermé',    label: 'Fermé ✓',          color: 'bg-bg border-border', dot: 'bg-black' },
  { id: 'perdu',    label: 'Perdu',            color: 'bg-bg border-border', dot: 'bg-light' },
]
