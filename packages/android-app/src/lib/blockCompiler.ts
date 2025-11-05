import { EffectBlock } from './types'

export interface CompiledEffect {
  instructions: CompiledInstruction[]
  compiled: string
  blockCount: number
  loopCount: number
  estimatedDuration: number
}

export interface CompiledInstruction {
  type: 'action' | 'loop' | 'wait'
  action?: string
  params?: Record<string, number>
  duration?: number
  loopStart?: number
  loopEnd?: number
  iterations?: number
}

export function compileBlocks(blocks: EffectBlock[]): CompiledEffect {
  const instructions: CompiledInstruction[] = []
  const codeLines: string[] = []
  let estimatedDuration = 0
  let loopCount = 0

  codeLines.push('// Zkompilovaný efektový program')
  codeLines.push('// Automaticky vygenerováno z blokového programování\n')

  const loopStarts: number[] = []

  blocks.forEach((block, index) => {
    switch (block.type) {
      case 'set-color':
        instructions.push({
          type: 'action',
          action: 'setColor',
          params: {
            r: block.parameters.red || 0,
            g: block.parameters.green || 0,
            b: block.parameters.blue || 0,
            w: block.parameters.white || 0,
          },
        })
        codeLines.push(
          `setColor(R:${block.parameters.red}, G:${block.parameters.green}, B:${block.parameters.blue}${
            block.parameters.white ? `, W:${block.parameters.white}` : ''
          })`
        )
        break

      case 'set-intensity':
        instructions.push({
          type: 'action',
          action: 'setIntensity',
          params: { intensity: block.parameters.intensity || 0 },
        })
        codeLines.push(`setIntensity(${block.parameters.intensity}%)`)
        break

      case 'fade': {
        const fadeDuration = block.parameters.duration || 0
        instructions.push({
          type: 'action',
          action: 'fade',
          duration: fadeDuration,
        })
        codeLines.push(`fade(duration: ${fadeDuration}ms)`)
        estimatedDuration += fadeDuration
        break
      }

      case 'wait': {
        const waitTime = block.parameters.waitTime || 0
        instructions.push({
          type: 'wait',
          duration: waitTime,
        })
        codeLines.push(`wait(${waitTime}ms)`)
        estimatedDuration += waitTime
        break
      }

      case 'chase-step': {
        const chaseDuration = block.parameters.duration || 0
        instructions.push({
          type: 'action',
          action: 'chaseStep',
          params: { fixtureIndex: block.parameters.fixtureIndex || 0 },
          duration: chaseDuration,
        })
        codeLines.push(`chaseStep(fixture: ${block.parameters.fixtureIndex}, ${chaseDuration}ms)`)
        estimatedDuration += chaseDuration
        break
      }

      case 'strobe-pulse': {
        const strobeDuration = block.parameters.duration || 0
        instructions.push({
          type: 'action',
          action: 'strobeFlash',
          duration: strobeDuration,
        })
        codeLines.push(`strobeFlash(${strobeDuration}ms)`)
        estimatedDuration += strobeDuration
        break
      }

      case 'rainbow-shift': {
        const rainbowDuration = block.parameters.duration || 0
        instructions.push({
          type: 'action',
          action: 'rainbowShift',
          params: { hueShift: block.parameters.hueShift || 0 },
          duration: rainbowDuration,
        })
        codeLines.push(`rainbowShift(hue: +${block.parameters.hueShift}°, ${rainbowDuration}ms)`)
        estimatedDuration += rainbowDuration
        break
      }

      case 'random-color':
        instructions.push({
          type: 'action',
          action: 'randomColor',
        })
        codeLines.push(`randomColor()`)
        break

      case 'pan-tilt':
        instructions.push({
          type: 'action',
          action: 'panTilt',
          params: {
            pan: block.parameters.pan || 128,
            tilt: block.parameters.tilt || 128,
          },
        })
        codeLines.push(`panTilt(pan: ${block.parameters.pan}, tilt: ${block.parameters.tilt})`)
        break

      case 'loop-start': {
        loopStarts.push(index)
        loopCount++
        const iterations = block.parameters.loopCount || 1
        instructions.push({
          type: 'loop',
          loopStart: index,
          iterations,
        })
        codeLines.push(`loop(${iterations}x) {`)
        break
      }

      case 'loop-end': {
        const startIdx = loopStarts.pop()
        if (startIdx !== undefined) {
          instructions.push({
            type: 'loop',
            loopEnd: startIdx,
          })
          codeLines.push(`}`)
        }
        break
      }
    }
  })

  codeLines.push('')
  codeLines.push(`// Statistiky: ${blocks.length} bloků, ${loopCount} smyček, ~${estimatedDuration}ms`)

  return {
    instructions,
    compiled: codeLines.join('\n'),
    blockCount: blocks.length,
    loopCount,
    estimatedDuration,
  }
}

export function getEffectSummary(compiled: CompiledEffect): string {
  const { blockCount, loopCount, estimatedDuration } = compiled
  const durationSeconds = (estimatedDuration / 1000).toFixed(1)
  
  return `${blockCount} bloků · ${loopCount} smyček · ~${durationSeconds}s cyklus`
}
