import { useEffect, useRef } from 'react'


  className?: string
}
export default functio
  className?: string
  size?: 'sm' | 'lg'
}

export default function EffectPreview({ 
  effect, 
    : { width: 3
  const maxFixtur

    startTimeRef.current
    const canvas = canvasRef.current

    if (!ctx) return

    canvas.height = dimensions.heig

      const time = Date.now() - startTimeRef.curren


        const x = i * (fixtureWidth + dimensions.gap)

        ctx.beginPa
        ctx.fill()

    }
    animate()

        cancelAnimationFrame(animationF
    }

    <canvas
      width={dimensions.width}
      className={className}
    />

function getFixtureColor(
  index: number,
  time: number,



      const activeIndex = Math.floor((time / 
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

        r = 255 * p

    }
    case 'sweep':
      const cycleTime = 2000 / speed
     

    }
}
function hslToRgb(h: number, s: number, l: number, a:
  l /= 100
  const k = (n: number) => (n + h / 30) % 12



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
