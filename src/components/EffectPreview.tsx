import { useEffect, useRef } from 'react'
import { Effect } from '@/lib/types'

interface EffectPreviewProps {
  effect: Effect
  fixtureCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function EffectPreview({ 
  effect, 
  fixtureCount, 
  className = '',
  size = 'sm'
}: EffectPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)

  const dimensions = size === 'sm' 
    ? { width: 120, height: 24, gap: 2, radius: 3 }
    : size === 'md'
    ? { width: 200, height: 40, gap: 3, radius: 4 }
    : { width: 300, height: 60, gap: 4, radius: 6 }

  const maxFixtures = Math.min(fixtureCount > 0 ? fixtureCount : 8, 8)
  const fixtureWidth = (dimensions.width - (dimensions.gap * (maxFixtures - 1))) / maxFixtures

  useEffect(() => {
    startTimeRef.current = Date.now()

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
        ctx.beginPath()
        ctx.roundRect(x, 0, fixtureWidth, dimensions.height, dimensions.radius)
        ctx.fill()
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
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      style={{ width: dimensions.width, height: dimensions.height }}
    />
  )
}

function getFixtureColor(
  effect: Effect,
  index: number,
  total: number,
  time: number,
  speed: number
): string {
  const intensity = effect.intensity / 255

  switch (effect.type) {
    case 'chase': {
      const cycleTime = 1000 / speed
      const activeIndex = Math.floor((time / cycleTime) % total)
      const value = activeIndex === index ? intensity : 0.1
      return `rgba(100, 150, 255, ${value})`
    }

    case 'strobe': {
      const cycleTime = 200 / speed
      const isOn = Math.floor(time / cycleTime) % 2 === 0
      const value = isOn ? intensity : 0
      return `rgba(255, 255, 255, ${value})`
    }

    case 'rainbow': {
      const cycleTime = 3000 / speed
      const progress = (time % cycleTime) / cycleTime
      const hue = ((progress + (index / total)) % 1) * 360
      return hslToRgb(hue, 100, 50, intensity)
    }

    case 'fade': {
      const cycleTime = 2000 / speed
      const progress = (time % cycleTime) / cycleTime
      const value = (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5) * intensity
      return `rgba(255, 200, 100, ${value})`
    }

    case 'sparkle': {
      const value = Math.random() > 0.9 ? intensity : 0.1
      return `rgba(255, 255, 255, ${value})`
    }

    case 'wipe': {
      const cycleTime = 1500 / speed
      const progress = (time % cycleTime) / cycleTime
      const activeCount = Math.floor(progress * total)
      const isActive = index <= activeCount
      const value = isActive ? intensity : 0.1
      return `rgba(100, 200, 255, ${value})`
    }

    case 'bounce': {
      const cycleTime = 2000 / speed
      const progress = (time % cycleTime) / cycleTime
      const bounce = Math.abs(Math.sin(progress * Math.PI))
      const activeIndex = Math.floor(bounce * (total - 1))
      const isActive = index === activeIndex
      const value = isActive ? intensity : 0.1
      return `rgba(255, 150, 100, ${value})`
    }

    case 'theater-chase': {
      const cycleTime = 1000 / speed
      const step = Math.floor((time / cycleTime) % 3)
      const value = index % 3 === step ? intensity : 0.1
      return `rgba(255, 100, 150, ${value})`
    }

    case 'fire': {
      const cycleTime = 100 / speed
      const flicker = 0.7 + Math.random() * 0.3
      const red = 255
      const green = 100 + Math.random() * 50
      const blue = 0
      return `rgba(${red}, ${green}, ${blue}, ${flicker * intensity})`
    }

    case 'wave': {
      const cycleTime = 3000 / speed
      const progress = (time % cycleTime) / cycleTime
      const wave = Math.sin((progress + (index / total)) * Math.PI * 2) * 0.5 + 0.5
      const value = wave * intensity
      return `rgba(100, 200, 255, ${value})`
    }

    case 'pulse': {
      const cycleTime = 1500 / speed
      const progress = (time % cycleTime) / cycleTime
      const pulse = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5
      const value = pulse * intensity
      return `rgba(255, 200, 150, ${value})`
    }

    case 'color-fade': {
      const cycleTime = 5000 / speed
      const progress = (time % cycleTime) / cycleTime
      let r = 0, g = 0, b = 0

      if (progress < 0.33) {
        const p = progress / 0.33
        r = 255
        g = 255 * p
      } else if (progress < 0.66) {
        const p = (progress - 0.33) / 0.33
        r = 255 * (1 - p)
        g = 255
        b = 255 * p
      } else {
        const p = (progress - 0.66) / 0.34
        g = 255 * (1 - p)
        b = 255
        r = 255 * p
      }

      return `rgba(${r}, ${g}, ${b}, ${intensity})`
    }

    case 'sweep':
    default: {
      const cycleTime = 2000 / speed
      const progress = (time % cycleTime) / cycleTime
      const position = progress * total
      const distance = Math.abs(index - position)
      const value = Math.max(0, 1 - distance) * intensity
      return `rgba(150, 100, 255, ${value})`
    }
  }
}

function hslToRgb(h: number, s: number, l: number, a: number = 1): string {
  s /= 100
  l /= 100

  const k = (n: number) => (n + h / 30) % 12
  const f = (n: number) => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  const r = Math.round(255 * f(0))
  const g = Math.round(255 * f(8))
  const b = Math.round(255 * f(4))

  return `rgba(${r}, ${g}, ${b}, ${a})`
}
