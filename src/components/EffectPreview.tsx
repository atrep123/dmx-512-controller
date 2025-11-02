import { useEffect, useRef, useState } from 'react'
import { Effect } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EffectPreviewProps {
  effect: Effect
  fixtureCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function EffectPreview({ effect, fixtureCount, className, size = 'md' }: EffectPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(Date.now())

  const sizeMap = {
    sm: { width: 120, height: 24, gap: 2, radius: 3 },
    md: { width: 200, height: 40, gap: 3, radius: 4 },
    lg: { width: 300, height: 60, gap: 4, radius: 6 }
  }

  const dimensions = sizeMap[size]
  const maxFixtures = Math.min(fixtureCount > 0 ? fixtureCount : 8, 16)
  const fixtureWidth = (dimensions.width - (maxFixtures - 1) * dimensions.gap) / maxFixtures

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [effect])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    const animate = () => {
      const time = Date.now() - startTimeRef.current
      const speed = effect.speed / 100

      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      for (let i = 0; i < maxFixtures; i++) {
        const x = i * (fixtureWidth + dimensions.gap)
        const color = getFixtureColor(effect, i, maxFixtures, time, speed)
        
        ctx.fillStyle = color
        drawRoundedRect(ctx, x, 0, fixtureWidth, dimensions.height, dimensions.radius)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [effect, maxFixtures, fixtureWidth, dimensions])

  return (
    <canvas
      ref={canvasRef}
      className={cn('rounded-md', className)}
      style={{ width: dimensions.width, height: dimensions.height }}
    />
  )
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
  ctx.fill()
}

function getFixtureColor(
  effect: Effect,
  index: number,
  total: number,
  time: number,
  speed: number
): string {
  const intensity = effect.intensity / 100

  switch (effect.type) {
    case 'chase': {
      const cycleTime = 2000 / speed
      const activeIndex = Math.floor((time / cycleTime) % total)
      const isActive = index === activeIndex
      const value = isActive ? intensity : 0
      return `rgba(100, 150, 255, ${value})`
    }

    case 'strobe': {
      const strobeTime = 200 / speed
      const isOn = Math.floor((time / strobeTime) % 2) === 0
      const value = isOn ? intensity : 0
      return `rgba(255, 255, 255, ${value})`
    }

    case 'rainbow': {
      const cycleTime = 5000 / speed
      const progress = (time % cycleTime) / cycleTime
      const hue = (progress * 360 + index * 30) % 360
      const rgb = hslToRgb(hue / 360, 1, 0.5)
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`
    }

    case 'fade': {
      const cycleTime = 3000 / speed
      const progress = (time % cycleTime) / cycleTime
      const value = (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5) * intensity
      return `rgba(150, 150, 255, ${value})`
    }

    case 'sparkle': {
      const shouldSparkle = Math.random() < (speed * 0.02)
      const value = shouldSparkle ? intensity : 0
      return `rgba(255, 255, 255, ${value})`
    }

    case 'wipe': {
      const cycleTime = 3000 / speed
      const progress = (time % cycleTime) / cycleTime
      const activeCount = Math.floor(progress * total)
      const isActive = index <= activeCount
      const value = isActive ? intensity : 0
      return `rgba(100, 200, 255, ${value})`
    }

    case 'bounce': {
      const cycleTime = 2000 / speed
      const progress = (time % cycleTime) / cycleTime
      const bounce = Math.abs(Math.sin(progress * Math.PI))
      const activeIndex = Math.floor(bounce * (total - 1))
      const isActive = index === activeIndex
      const value = isActive ? intensity : 0
      return `rgba(255, 150, 100, ${value})`
    }

    case 'theater-chase': {
      const cycleTime = 1000 / speed
      const step = Math.floor((time / cycleTime) % 3)
      const isActive = index % 3 === step
      const value = isActive ? intensity : 0
      return `rgba(200, 100, 255, ${value})`
    }

    case 'fire': {
      const flicker = 0.7 + Math.random() * 0.3
      const red = 255
      const green = 100 + Math.random() * 50
      const blue = 0
      return `rgba(${red}, ${green}, ${blue}, ${flicker * intensity})`
    }

    case 'wave': {
      const cycleTime = 3000 / speed
      const offset = (index / total) * Math.PI * 2
      const progress = ((time % cycleTime) / cycleTime) * Math.PI * 2
      const wave = (Math.sin(progress + offset) + 1) / 2
      const value = wave * intensity
      return `rgba(100, 255, 200, ${value})`
    }

    case 'pulse': {
      const cycleTime = 2000 / speed
      const progress = (time % cycleTime) / cycleTime
      const pulse = Math.pow(Math.sin(progress * Math.PI), 2)
      const value = pulse * intensity
      return `rgba(255, 200, 100, ${value})`
    }

    case 'color-fade': {
      const cycleTime = 5000 / speed
      const progress = (time % cycleTime) / cycleTime
      
      let r = 0, g = 0, b = 0
      if (progress < 0.33) {
        const p = progress / 0.33
        r = 255 * (1 - p)
        g = 255 * p
      } else if (progress < 0.66) {
        const p = (progress - 0.33) / 0.33
        g = 255 * (1 - p)
        b = 255 * p
      } else {
        const p = (progress - 0.66) / 0.34
        b = 255 * (1 - p)
        r = 255 * p
      }
      
      return `rgba(${r}, ${g}, ${b}, ${intensity})`
    }

    case 'sweep':
    case 'block-program':
    default: {
      return `rgba(150, 150, 150, ${intensity * 0.3})`
    }
  }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}
