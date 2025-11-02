import { useEffect, useRef, useState } from 'react'
import { Effect } from '@/lib/types'


interface EffectPreviewProps {
  effect: Effect
  fixtureCount: number
  className?: string
export default function Eff
 

    sm: { width: 120, height: 24, gap: 2, radius: 3 },
    lg: { width: 300, height: 60, gap: 4, radius: 6

  const maxFixtures = Math.min(fixtureCount > 0 ?

    startTimeRef.cu

    const canvas = canvasRef.current

   

    canvas.height = dimensions.hei

      const time = Date.now() - startTimeRef.current


        const x = i * (fixtureWidth +
        


    }
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
  ctx.lineTo(x + radius, y + height)
  ctx.lineTo(x, y + radius)
  ctx.c
}
function getFixtureColor(

  time: nu
): string {

    case 'chase': {
      const activeIndex = Math.floor((time / cycleTime) % total)
      
   
 

      return `rgba(255, 2

      const cycl
      const hue 
      return `r

      const
      const value = (Math.sin(progress * M

    case 'sparkle': {
      const value =
    }
    case 'wipe': {
      const progress = (time % cycleTime) / 
      const isActive = index <= activeCount
      return `rgba(100, 200, 255, ${value})`


      const bounce =
      const isActive = index === act
      return `rgba(255, 150, 100, ${value})`

      const cycleTime = 1000 / speed
     


      const flicker = 0.7 + Math.ran
      const green = 100 + Math.random() * 50
      return `rgba(${red}, ${green}, ${blue}, ${flick

      const cycleTime = 3000 / speed
     

    }
    case 'pulse': {
      const progress = (time % cycleTime) / cycleTime
      const value = pulse * intensity
    }
    c

      let r = 0, g = 
        const p = progress / 0.33
        g = 255 * p
        const p = (progress - 0.33) / 0.33
     

        r = 255 * 
      
    }
    case 'sweep':
    default: {
    }
}
funct

    r = g = b = l
    const hue2rgb = (p: number, q: n
      if (t > 1) t -= 1
      if (t < 1 / 2) return q
      return p

    const p = 2 * l - q
    g = hue2rgb(p, q, h)
  }
























































































