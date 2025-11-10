import type { CustomBlock, CustomBlockKind, CustomLayout } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Fragment, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react'

export type BlockRendererContext = {
  block: CustomBlock
  index: number
}

export type BlockRenderer = (block: CustomBlock, ctx: BlockRendererContext) => ReactNode
export type BlockRendererMap = Partial<Record<CustomBlockKind, BlockRenderer>>

const fallbackRenderer: BlockRenderer = (block) => (
  <div className="flex h-full flex-col justify-between rounded-lg border border-dashed border-muted-foreground/40 bg-background/60 p-3 shadow-sm">
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{block.kind}</p>
      <p className="text-sm font-semibold">{block.title || 'Neznámý blok'}</p>
    </div>
    <p className="text-xs text-muted-foreground">
      c{block.position?.col ?? 0} · r{block.position?.row ?? 0} · w{block.position?.width ?? 3} · h{block.position?.height ?? 1}
    </p>
  </div>
)

/**
 * Default placeholder renderers for each block kind.
 * Real UI can override them via the `renderers` prop.
 */
export const defaultBlockRenderers: BlockRendererMap = {
  'master-dimmer': (block) => (
    <Card className="flex h-full flex-col justify-between p-4 text-sm">
      <p className="font-semibold">{block.title || 'Master dimmer'}</p>
      <p className="text-muted-foreground text-xs">Slider placeholder</p>
    </Card>
  ),
  'scene-button': (block) => (
    <button className="h-full rounded-lg border bg-primary/5 p-4 text-left transition hover:bg-primary/10">
      <p className="text-xs uppercase text-primary">Scéna</p>
      <p className="text-sm font-semibold">{block.title || 'Scéna'}</p>
    </button>
  ),
  'effect-toggle': (block) => (
    <Card className="flex h-full flex-col justify-between p-4">
      <p className="text-xs uppercase text-muted-foreground">Efekt</p>
      <p className="text-sm font-semibold">{block.title || 'Effect'}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{block.behavior ?? 'toggle'}</span>
        <span className="inline-flex rounded-full bg-primary/10 px-2 text-xs">Toggle</span>
      </div>
    </Card>
  ),
  'fixture-slider': (block) => (
    <Card className="flex h-full flex-col gap-2 p-4">
      <p className="text-xs uppercase text-muted-foreground">Fixture</p>
      <p className="text-sm font-semibold">{block.title || 'Kanál'}</p>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 w-1/2 rounded-full bg-primary" />
      </div>
    </Card>
  ),
  'motor-pad': fallbackRenderer,
  'servo-knob': fallbackRenderer,
  'markdown-note': (block) => (
    <Card className="h-full bg-muted/30 p-4 text-sm">
      <p className="font-semibold mb-1">{block.title || 'Poznámka'}</p>
      <p className="text-muted-foreground line-clamp-4 text-xs whitespace-pre-line">{block.content}</p>
    </Card>
  ),
}

type CustomLayoutRendererProps = {
  layout: CustomLayout | null | undefined
  className?: string
  selectedBlockId?: string | null
  selectedBlockIds?: string[]
  onBlockSelect?: (blockId: string, event?: ReactMouseEvent<HTMLButtonElement>) => void
  renderers?: BlockRendererMap
  showEmptyState?: boolean
}

export function CustomLayoutRenderer({
  layout,
  className,
  selectedBlockId,
  onBlockSelect,
  renderers,
  showEmptyState = true,
}: CustomLayoutRendererProps) {
  const blocks = layout?.blocks ?? []
  if (!blocks.length) {
    return showEmptyState ? (
      <div className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground', className)}>
        Přidej bloky pro zobrazení rozložení.
      </div>
    ) : null
  }
  const grid = {
    columns: layout?.grid?.columns ?? 12,
    gap: layout?.grid?.gap ?? 1,
  }
  const mergedRenderers: BlockRendererMap = { ...defaultBlockRenderers, ...renderers }

  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
        gap: `${grid.gap}rem`,
      }}
    >
      {blocks.map((block, index) => {
        const renderer = mergedRenderers[block.kind] ?? fallbackRenderer
        const width = Math.max(1, Math.min(block.position?.width ?? 3, grid.columns))
        const height = Math.max(1, block.position?.height ?? 1)
        return (
          <Fragment key={block.id}>
            <button
              type="button"
              onClick={onBlockSelect ? (event) => onBlockSelect(block.id, event) : undefined}
              className={cn(
                'relative w-full text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                (selectedBlockId === block.id || (selectedBlockIds && selectedBlockIds.includes(block.id))) && 'ring-2 ring-primary'
              )}
              style={{
                gridColumn: `span ${width}`,
                gridRow: `span ${height}`,
              }}
            >
              {renderer(block, { block, index })}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
