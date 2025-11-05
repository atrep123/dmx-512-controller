import { useEffect, useMemo, useRef } from 'react'
import type { Effect } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EffectPreviewProps {
    effect: Effect
    fixtureCount?: number
    size?: 'sm' | 'lg'
    className?: string
}

const SIZE_MAP: Record<'sm' | 'lg', { width: number; height: number }> = {
    sm: { width: 220, height: 80 },
    lg: { width: 340, height: 120 },
}

const DEFAULT_FIXTURE_COUNT = 6

export default function EffectPreview({
    effect,
    fixtureCount,
    size = 'sm',
    className,
}: EffectPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const animationRef = useRef<number>()
    const effectRef = useRef(effect)

    useEffect(() => {
        effectRef.current = effect
    }, [effect])

    const dimensions = useMemo(() => SIZE_MAP[size] ?? SIZE_MAP.sm, [size])
    const fixtures = Math.max(
        fixtureCount ?? effect.fixtureIds.length ?? DEFAULT_FIXTURE_COUNT,
        1
    )

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }

        const dpr = window.devicePixelRatio ?? 1
        canvas.width = dimensions.width * dpr
        canvas.height = dimensions.height * dpr
        canvas.style.width = `${dimensions.width}px`
        canvas.style.height = `${dimensions.height}px`

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            return
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)

        let isMounted = true
        const startedAt = performance.now()

        const drawFrame = (timestamp: number) => {
            if (!isMounted) {
                return
            }

            renderFrame(
                ctx,
                dimensions,
                fixtures,
                effectRef.current,
                (timestamp - startedAt) / 1000
            )
            animationRef.current = requestAnimationFrame(drawFrame)
        }

        animationRef.current = requestAnimationFrame(drawFrame)

        return () => {
            isMounted = false
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [dimensions, fixtures, effect])

    return (
        <canvas
            ref={canvasRef}
            className={cn('rounded-md bg-background/80 shadow-inner shadow-black/30', className)}
        />
    )
}

function renderFrame(
    ctx: CanvasRenderingContext2D,
    dimensions: { width: number; height: number },
    fixtureCount: number,
    effect: Effect,
    elapsedSeconds: number
) {
    const { width, height } = dimensions
    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(12, 14, 24, 0.95)'
    ctx.fillRect(0, 0, width, height)

    const padding = 10
    const gap = Math.max(4, Math.min(14, width / 24))
    const availableWidth = width - padding * 2 - gap * (fixtureCount - 1)
    const fixtureWidth = availableWidth / fixtureCount
    const fixtureHeight = height - padding * 2
    const intensity = clamp((effect.intensity ?? 100) / 100, 0, 1)

    for (let index = 0; index < fixtureCount; index += 1) {
        const color = computeFixtureColor(effect, index, fixtureCount, elapsedSeconds, intensity)
        const x = padding + index * (fixtureWidth + gap)
        const y = padding

        ctx.fillStyle = color
        ctx.fillRect(x, y, fixtureWidth, fixtureHeight)

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.lineWidth = 1
        ctx.strokeRect(x + 0.5, y + 0.5, fixtureWidth - 1, fixtureHeight - 1)

        const glossGradient = ctx.createLinearGradient(x, y, x, y + fixtureHeight)
        glossGradient.addColorStop(0, 'rgba(255,255,255,0.18)')
        glossGradient.addColorStop(0.25, 'rgba(255,255,255,0.05)')
        glossGradient.addColorStop(1, 'rgba(0,0,0,0.35)')
        ctx.fillStyle = glossGradient
        ctx.fillRect(x, y, fixtureWidth, fixtureHeight)
    }

    // Speed indicator
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(padding, height - padding - 6, width - padding * 2, 4)

    const speedIndicator =
        ((elapsedSeconds * clamp(effect.speed ?? 50, 1, 100)) / 100) % 1
    const indicatorX = padding + speedIndicator * (width - padding * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(indicatorX - 3, height - padding - 8, 6, 10)
}

function computeFixtureColor(
    effect: Effect,
    index: number,
    fixtureCount: number,
    elapsedSeconds: number,
    intensity: number
) {
    const safeCount = Math.max(fixtureCount, 1)
    const baseHue = (index / safeCount) * 360
    const speedMultiplier = clamp(effect.speed ?? 50, 1, 100) / 50
    const progress = elapsedSeconds * speedMultiplier
    const activeMultiplier = effect.isActive ? 1 : 0.35
    const brightness = clamp(intensity * activeMultiplier, 0.05, 1)

    switch (effect.type) {
        case 'chase': {
            const activeIndex = Math.floor(progress) % safeCount
            return activeIndex === index
                ? colorFromHsl(baseHue, 0.72, 0.6 * brightness + 0.25)
                : colorFromHsl(baseHue, 0.22, 0.14, 0.35)
        }
        case 'strobe': {
            const strobe = Math.sin(progress * Math.PI * 4) > 0
            return strobe
                ? colorFromHsl(baseHue, 0.05, 0.9 * brightness + 0.05)
                : colorFromHsl(baseHue, 0.05, 0.08, 0.25)
        }
        case 'rainbow': {
            const hue = (baseHue + progress * 120) % 360
            return colorFromHsl(hue, 0.72, 0.55 * brightness + 0.25)
        }
        case 'fade': {
            const wave = (Math.sin(progress) + 1) / 2
            const light = 0.15 + wave * 0.75 * brightness
            return colorFromHsl(baseHue, 0.45, light)
        }
        case 'sweep': {
            const head = progress % safeCount
            const distance = 1 - Math.min(Math.abs(index - head), 1)
            const light = 0.18 + distance * 0.7 * brightness
            return colorFromHsl(baseHue, 0.6, light)
        }
        case 'sparkle': {
            const sparkle = seededNoise(index, progress * 3)
            const light = sparkle > 0.75 ? 0.8 : 0.2 + sparkle * 0.6 * brightness
            return colorFromHsl(baseHue, 0.55, light)
        }
        case 'wipe': {
            const stage = progress % (safeCount + 1)
            const isLit = index <= stage
            return colorFromHsl(baseHue, 0.5, isLit ? 0.55 * brightness + 0.25 : 0.1, isLit ? 1 : 0.3)
        }
        case 'bounce': {
            const period = safeCount * 2
            const position = Math.abs((progress % period) - safeCount)
            const distance = 1 - Math.min(Math.abs(index - position), 1)
            return colorFromHsl(baseHue, 0.6, 0.2 + distance * 0.65 * brightness)
        }
        case 'theater-chase': {
            const offset = Math.floor(progress) % 3
            const on = (index + offset) % 3 === 0
            return colorFromHsl(baseHue, 0.58, on ? 0.55 * brightness + 0.25 : 0.09, on ? 1 : 0.3)
        }
        case 'fire': {
            const flicker = seededNoise(index + 11, progress * 5)
            const hue = 18 + flicker * 18
            const light = 0.18 + flicker * 0.7 * brightness
            return colorFromHsl(hue, 0.88, light)
        }
        case 'wave': {
            const phase = progress + (index / safeCount) * Math.PI * 2
            const wave = (Math.sin(phase) + 1) / 2
            return colorFromHsl(baseHue, 0.65, 0.2 + wave * 0.7 * brightness)
        }
        case 'pulse': {
            const pulse = (Math.sin(progress) + 1) / 2
            return colorFromHsl(baseHue, 0.45, 0.12 + pulse * 0.75 * brightness)
        }
        case 'color-fade': {
            const hue = (progress * 90 + baseHue) % 360
            return colorFromHsl(hue, 0.68, 0.45 * brightness + 0.25)
        }
        case 'block-program': {
            const blockCount = effect.blocks?.length ?? 1
            const hue = (baseHue + (progress * 360) / Math.max(blockCount, 1)) % 360
            const light = 0.2 + ((Math.sin(progress * 2 + index) + 1) / 2) * 0.6 * brightness
            return colorFromHsl(hue, 0.7, light)
        }
        default:
            return colorFromHsl(baseHue, 0.5, 0.4 * brightness + 0.2)
    }
}

function colorFromHsl(h: number, s: number, l: number, alpha = 1) {
    const hue = ((h % 360) + 360) % 360
    const saturation = clamp(s, 0, 1)
    const lightness = clamp(l, 0, 1)

    const c = (1 - Math.abs(2 * lightness - 1)) * saturation
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = lightness - c / 2

    let r = 0
    let g = 0
    let b = 0

    if (hue < 60) {
        r = c
        g = x
    } else if (hue < 120) {
        r = x
        g = c
    } else if (hue < 180) {
        g = c
        b = x
    } else if (hue < 240) {
        g = x
        b = c
    } else if (hue < 300) {
        r = x
        b = c
    } else {
        r = c
        b = x
    }

    const red = Math.round((r + m) * 255)
    const green = Math.round((g + m) * 255)
    const blue = Math.round((b + m) * 255)

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function seededNoise(seed: number, time: number) {
    const x = Math.sin(seed * 31.7 + time * 2.17) * 43758.5453123
    return x - Math.floor(x)
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}
