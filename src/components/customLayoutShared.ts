import type { CustomBlockKind } from '@/lib/types'

export type BlockPalette = Partial<Record<CustomBlockKind, string>>

export type AppearancePreset = 'soft' | 'flat' | 'glass' | 'custom'

export type AppearanceStyles = {
  wrapper: string
  button: string
  overlay: string
  cardBase: string
  metaText: string
  badgeClass: string
}

export const appearancePresets: Record<AppearancePreset, AppearanceStyles> = {
  soft: {
    wrapper: 'gap-3',
    cardBase: 'rounded-2xl border border-border/25 bg-background/95 p-4 shadow-sm',
    button:
      'rounded-2xl border border-border/10 bg-background/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:border-border/40',
    overlay: 'bg-background/95 shadow-sm',
    metaText: 'text-foreground/70',
    badgeClass: 'border-foreground/30 text-foreground',
  },
  flat: {
    wrapper: 'gap-3 rounded-3xl bg-muted/40 p-3',
    cardBase: 'rounded-2xl border border-border/30 bg-background p-4',
    button:
      'rounded-2xl border border-transparent bg-transparent transition hover:-translate-y-0.5 hover:border-border/50 hover:bg-background/80',
    overlay: 'bg-background/95 border border-border/40',
    metaText: 'text-muted-foreground',
    badgeClass: 'border-border text-foreground',
  },
  glass: {
    wrapper: 'gap-3 rounded-3xl bg-white/5 p-3 backdrop-blur',
    cardBase: 'rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-lg backdrop-blur',
    button:
      'rounded-2xl border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/20 hover:border-white/40',
    overlay: 'bg-white/80 backdrop-blur shadow',
    metaText: 'text-white/80 drop-shadow',
    badgeClass: 'border-white/50 text-white',
  },
  custom: {
    wrapper: 'gap-3',
    cardBase: 'rounded-2xl border border-border/25 bg-background/95 p-4 shadow-sm',
    button:
      'rounded-2xl border border-border/15 bg-background/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:border-border/40',
    overlay: 'bg-background/95 shadow-sm',
    metaText: 'text-foreground/70',
    badgeClass: 'border-foreground/30 text-foreground',
  },
}

export const defaultBlockPalette: BlockPalette = {
  'master-dimmer': 'from-primary/30 via-primary/10 to-background',
  'scene-button': 'from-rose-400/30 via-background to-background',
  'effect-toggle': 'from-amber-400/30 via-background to-background',
  'fixture-slider': 'from-blue-400/30 via-background to-background',
  'motor-pad': 'from-emerald-400/30 via-background to-background',
  'servo-knob': 'from-purple-400/30 via-background to-background',
  'markdown-note': 'from-muted/50 via-background to-background',
}

export const BLOCK_KIND_LABELS: Record<CustomBlockKind, string> = {
  'master-dimmer': 'Master',
  'scene-button': 'Scéna',
  'effect-toggle': 'Efekt',
  'fixture-slider': 'Slider',
  'motor-pad': 'Motor',
  'servo-knob': 'Servo',
  'markdown-note': 'Poznámka',
}
