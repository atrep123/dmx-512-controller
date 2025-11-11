import type {
  CustomBlock,
  CustomBlockKind,
  CustomLayout,
  EffectToggleBlock,
  MarkdownNoteBlock,
} from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Fragment,
  useCallback,
  useRef,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type CSSProperties,
} from 'react'
import { SquaresFour, CopySimple, TrashSimple } from '@phosphor-icons/react'
import { appearancePresets, defaultBlockPalette, BLOCK_KIND_LABELS } from '@/components/customLayoutShared'
import type { AppearancePreset, AppearanceStyles, BlockPalette } from '@/components/customLayoutShared'

export type BlockRendererContext = {
  block: CustomBlock
  index: number
  bindingInfo?: BindingInfo
}

export type BlockRenderer = (block: CustomBlock, ctx: BlockRendererContext) => ReactNode
export type BlockRendererMap = Partial<Record<CustomBlockKind, BlockRenderer>>

export type BlockActions = {
  onDuplicate?: (block: CustomBlock) => void
  onRemove?: (block: CustomBlock) => void
}

const getBlockSummary = (block: CustomBlock) => {
  const title = block.title?.trim() || block.kind
  const position = block.position
  return position
    ? `${title} - c${position.col ?? 0} r${position.row ?? 0} w${position.width ?? 3} h${position.height ?? 1}`
    : title
}

const getBlockSurfaceClass = (block: CustomBlock, palette: BlockPalette, fallback: string) =>
  cn('bg-gradient-to-b', palette[block.kind] ?? fallback)

const withMeta = (
  block: CustomBlock,
  content: ReactNode,
  bindingInfo: BindingInfo,
  appearanceStyles: AppearanceStyles,
  surfaceClass?: string
) => {
  const hasBindingDescription = Boolean(bindingInfo.warning || bindingInfo.preview)
  const position = block.position
  const positionLabel = position ? `c${position.col ?? 0} r${position.row ?? 0}` : 'bez pozice'
  const sizeLabel = block.size?.toUpperCase() ?? 'MD'
  const kindLabel = BLOCK_KIND_LABELS[block.kind] ?? block.kind
  return (
    <div className={appearanceStyles.cardBase}>
      <div className={cn('flex h-full flex-col gap-3', surfaceClass)}>
        <div
          className={cn(
            'flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide',
            appearanceStyles.metaText
          )}
        >
          <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', appearanceStyles.badgeClass)}>
            {kindLabel}
          </span>
          <span className="text-[11px] font-medium">
            {positionLabel} | {sizeLabel}
          </span>
        </div>
        <div className="flex-1">{content}</div>
        {hasBindingDescription ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-background/70 p-2 text-xs leading-snug">
            {bindingInfo.preview ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                  Vazba
                </Badge>
                {bindingInfo.preview}
              </p>
            ) : null}
            {bindingInfo.warning ? (
              <p className="mt-1 text-amber-600 dark:text-amber-300">{bindingInfo.warning}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const renderSkeletonGrid = (
  className: string | undefined,
  skeletonCount: number,
  appearanceStyles: AppearanceStyles
) => (
  <div className={cn('grid', appearanceStyles.wrapper, className)}>
    {Array.from({ length: skeletonCount }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className={cn(
          'h-28 animate-pulse rounded-2xl border border-dashed border-muted/40',
          appearanceStyles.button
        )}
      />
    ))}
  </div>
)

const BlockActionOverlay = ({
  block,
  actions,
  overlayClass,
}: {
  block: CustomBlock
  actions?: BlockActions
  overlayClass: string
}) => {
  if (!actions?.onDuplicate && !actions?.onRemove) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-end opacity-0 transition group-hover:opacity-100">
      <div className={cn('pointer-events-auto mt-2 mr-2 flex gap-1 rounded-full p-1 shadow', overlayClass)}>
        {actions.onDuplicate ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation()
              actions.onDuplicate?.(block)
            }}
            aria-label={`Duplikovat ${block.title || block.kind}`}
          >
            <CopySimple size={14} weight="bold" />
          </button>
        ) : null}
        {actions.onRemove ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation()
              actions.onRemove?.(block)
            }}
            aria-label={`Odstranit ${block.title || block.kind}`}
          >
            <TrashSimple size={14} weight="bold" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

const createDefaultBlockRenderers = (
  appearanceStyles: AppearanceStyles,
  palette: BlockPalette
): BlockRendererMap => ({
  'master-dimmer': (block, ctx) =>
    withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <p className="text-sm font-semibold">{block.title || 'Master dimmer'}</p>
        <div className="space-y-2">
          <div className="h-1.5 rounded-full bg-white/30">
            <div className="h-1.5 w-3/4 rounded-full bg-white" />
          </div>
          <p className="text-xs uppercase tracking-wide text-white/80">100 %</p>
        </div>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-slate-900/60 via-slate-900/20 to-slate-900/30')
    ),
  'scene-button': (block, ctx) =>
    withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">Scéna</p>
          <p className="text-lg font-semibold leading-tight">{block.title || 'Scéna'}</p>
        </div>
        <p className="text-xs text-white/70">Tap & hold pro další volby</p>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-rose-500/50 via-transparent to-rose-900/40')
    ),
  'effect-toggle': (block, ctx) => {
    const toggleBlock = block as EffectToggleBlock
    return withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <p className="text-xs uppercase tracking-wide text-white/70">Efekt</p>
        <div>
          <p className="text-lg font-semibold">{toggleBlock.title || 'Effect'}</p>
          <p className="text-xs text-white/70">Režim: {toggleBlock.behavior ?? 'toggle'}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1">ON</span>
          <span className="text-white/60">/</span>
          <span className="inline-flex rounded-full border border-white/30 px-3 py-1">OFF</span>
        </div>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-amber-400/40 via-transparent to-amber-900/30')
    )
  },
  'fixture-slider': (block, ctx) =>
    withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">Fixture slider</p>
          <p className="text-lg font-semibold">{block.title || 'Kanál'}</p>
        </div>
        <div className="space-y-2">
          <div className="h-32 rounded-full bg-white/10 p-1">
            <div className="mx-auto h-full w-3 rounded-full bg-white/80" />
          </div>
          <p className="text-xs text-white/70">64 %</p>
        </div>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-blue-400/40 via-transparent to-blue-900/40')
    ),
  'motor-pad': (block, ctx) =>
    withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <p className="text-xs uppercase tracking-wide text-white/70">Motorický pad</p>
        <div className="flex items-center justify-center">
          <div className="grid h-16 w-16 grid-cols-3 grid-rows-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={index}
                className={cn('rounded-sm border border-white/30', index === 4 && 'bg-white/60')}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-white/70">Pan/Tilt realtime</p>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-emerald-400/40 via-transparent to-emerald-900/40')
    ),
  'servo-knob': (block, ctx) =>
    withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <p className="text-xs uppercase tracking-wide text-white/70">Servo knob</p>
        <div className="flex flex-1 items-center justify-center">
          <div className="relative h-20 w-20 rounded-full border border-white/30">
            <div className="absolute inset-2 rounded-full border border-white/40">
              <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-full rounded-full bg-white" />
            </div>
          </div>
        </div>
        <p className="text-xs text-white/70">Cíl 37°</p>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-purple-400/40 via-transparent to-purple-900/40')
    ),
  'markdown-note': (block, ctx) => {
    const noteBlock = block as MarkdownNoteBlock
    return withMeta(
      block,
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">Poznámka</p>
          <p className="text-lg font-semibold">{noteBlock.title || 'Instrukce'}</p>
        </div>
        <p className="line-clamp-4 text-sm text-white/80">{noteBlock.content || 'Přidej instrukce nebo QR.'}</p>
      </div>,
      ctx.bindingInfo ?? getBindingInfo(block),
      appearanceStyles,
      getBlockSurfaceClass(block, palette, 'from-muted/40 via-transparent to-muted-foreground/30')
    )
  },
})

const createFallbackRenderer = (appearanceStyles: AppearanceStyles): BlockRenderer => (block, ctx) =>
  withMeta(
    block,
    <div className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-muted-foreground/40 p-4 text-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{block.kind}</p>
        <p className="text-sm font-semibold">{block.title || 'Neznámý blok'}</p>
      </div>
      <p className="text-xs text-muted-foreground">{getBlockSummary(block)}</p>
    </div>,
    ctx.bindingInfo ?? getBindingInfo(block),
    appearanceStyles,
    'from-muted/30 via-transparent to-muted/50'
  )

const getBindingInfo = (block: CustomBlock): BindingInfo => {
  switch (block.kind) {
    case 'scene-button':
      return {
        warning: block.sceneId ? null : 'Vyber scénu v konfiguraci.',
        preview: block.sceneId ? `Scéna: ${block.sceneId}` : null,
      }
    case 'effect-toggle':
      return {
        warning: block.effectId ? null : 'Přiřaď efekt tomuto přepínači.',
        preview: block.effectId ? `Efekt: ${block.effectId}` : null,
      }
    case 'fixture-slider':
      if (!block.fixtureId) {
        return { warning: 'Zvol svítidlo pro slider.', preview: null }
      }
      if (!block.channelId) {
        return { warning: 'Vyber DMX kanál.', preview: null }
      }
      return { warning: null, preview: `Fixture ${block.fixtureId} | kanál ${block.channelId}` }
    case 'motor-pad':
      return {
        warning: block.motorId ? null : 'Přiřaď motor k tomuto ovladači.',
        preview: block.motorId ? `Motor: ${block.motorId}` : null,
      }
    case 'servo-knob':
      return {
        warning: block.servoId ? null : 'Vyber servo, které má knob ovládat.',
        preview: block.servoId ? `Servo: ${block.servoId}` : null,
      }
    default:
      return { warning: null, preview: null }
  }
}

type CustomLayoutRendererProps = {
  layout: CustomLayout | null | undefined
  className?: string
  selectedBlockId?: string | null
  selectedBlockIds?: string[]
  onBlockSelect?: (blockId: string, event?: ReactMouseEvent<HTMLButtonElement>) => void
  renderers?: BlockRendererMap
  showEmptyState?: boolean
  renderBlockWrapper?: (wrapperProps: RenderBlockWrapperProps) => ReactNode
  renderEmptyState?: () => ReactNode
  highlightedBlockId?: string | null
  onBlockHoverChange?: (blockId: string | null) => void
  showGridGuides?: boolean
  showGridSummary?: boolean
  appearance?: AppearancePreset
  blockPalette?: BlockPalette
  actions?: BlockActions
  isLoading?: boolean
  skeletonCount?: number
}

export function CustomLayoutRenderer({
  layout,
  className,
  selectedBlockId,
  selectedBlockIds,
  onBlockSelect,
  renderers,
  showEmptyState = true,
  renderBlockWrapper,
  renderEmptyState,
  highlightedBlockId = null,
  onBlockHoverChange,
  showGridGuides = false,
  showGridSummary = false,
  appearance = 'soft',
  blockPalette,
  actions,
  isLoading = false,
  skeletonCount = 6,
}: CustomLayoutRendererProps) {
  const blocks = layout?.blocks ?? []
  const appearanceStyles = appearancePresets[appearance] ?? appearancePresets.soft
  const palette = { ...defaultBlockPalette, ...(blockPalette ?? {}) }
  const defaultRenderers = createDefaultBlockRenderers(appearanceStyles, palette)
  const mergedRenderers: BlockRendererMap = { ...defaultRenderers, ...renderers }
  const fallbackRenderer = createFallbackRenderer(appearanceStyles)
  const hoverRef = useRef<string | null>(null)

  const handleHoverChange = useCallback(
    (nextId: string | null) => {
      if (!onBlockHoverChange || hoverRef.current === nextId) {
        return
      }
      hoverRef.current = nextId
      onBlockHoverChange(nextId)
    },
    [onBlockHoverChange]
  )

  if (isLoading) {
    return renderSkeletonGrid(className, skeletonCount, appearanceStyles)
  }

  if (!blocks.length) {
    if (!showEmptyState) {
      return null
    }
    const fallbackEmpty =
      renderEmptyState?.() ?? (
        <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
          <SquaresFour className="mx-auto mb-2 h-8 w-8 text-muted-foreground/70" weight="duotone" />
          <p className="font-semibold">Žádné bloky zatím nejsou přidány.</p>
          <p className="text-xs mt-1">Použij katalog bloků nebo import show snapshotu.</p>
        </div>
      )
    return <div className={className}>{fallbackEmpty}</div>
  }

  const grid = {
    columns: layout?.grid?.columns ?? 12,
    gap: layout?.grid?.gap ?? 1,
    rowHeight: layout?.grid?.rowHeight ?? 1,
  }

  const gridGuides = showGridGuides
    ? {
        backgroundImage: `
          linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
        `,
        backgroundSize: `${Math.max(24, 96 / grid.columns)}px ${Math.max(24, grid.rowHeight * 48)}px`,
      }
    : undefined

  const gridElement = (
    <div
      className={cn('grid', appearanceStyles.wrapper, className)}
      role="grid"
      aria-label="Custom layout"
      style={{
        gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
        gap: `${grid.gap}rem`,
        ...gridGuides,
      }}
    >
      {blocks.map((block, index) => {
        const renderer = mergedRenderers[block.kind] ?? fallbackRenderer
        const bindingInfo = getBindingInfo(block)
        const width = Math.max(1, Math.min(block.position?.width ?? 3, grid.columns))
        const height = Math.max(1, block.position?.height ?? 1)
        const isSelected =
          selectedBlockId === block.id || Boolean(selectedBlockIds && selectedBlockIds.includes(block.id))
        const blockStyle: CSSProperties = {
          gridColumn: `span ${width}`,
          gridRow: `span ${height}`,
        }
        const content = renderer(block, { block, index, bindingInfo })

        if (renderBlockWrapper) {
          return (
            <Fragment key={block.id}>
              {renderBlockWrapper({
                block,
                index,
                isSelected,
                className: cn('group relative w-full text-left transition', appearanceStyles.button),
                style: blockStyle,
                onSelect: onBlockSelect ? (event) => onBlockSelect(block.id, event) : undefined,
                onHoverChange: onBlockHoverChange
                  ? (isHovering) => handleHoverChange(isHovering ? block.id : null)
                  : undefined,
                children: content,
              })}
            </Fragment>
          )
        }

        return (
          <Fragment key={block.id}>
            <button
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={getBlockSummary(block)}
              data-block-id={block.id}
              data-selected={isSelected}
              data-highlighted={highlightedBlockId === block.id ? 'true' : undefined}
              onClick={onBlockSelect ? (event) => onBlockSelect(block.id, event) : undefined}
              onMouseEnter={() => handleHoverChange(block.id)}
              onMouseLeave={() => handleHoverChange(null)}
              className={cn(
                'group relative w-full text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                appearanceStyles.button,
                highlightedBlockId === block.id && 'ring-primary/40 bg-primary/5',
                isSelected && 'ring-2 ring-primary/70 ring-offset-2 ring-offset-background shadow-lg'
              )}
              style={blockStyle}
              title={getBlockSummary(block)}
            >
              <span className="sr-only">{getBlockSummary(block)}</span>
              {content}
              <BlockActionOverlay block={block} actions={actions} overlayClass={appearanceStyles.overlay} />
            </button>
          </Fragment>
        )
      })}
    </div>
  )

  if (!showGridSummary) {
    return gridElement
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Blok?: {blocks.length}</span>
        <span>Sloupce: {grid.columns}</span>
        <span>Řádková výška: {grid.rowHeight} rem</span>
        <span>Mezera: {grid.gap} rem</span>
      </div>
      {gridElement}
    </div>
  )
}

