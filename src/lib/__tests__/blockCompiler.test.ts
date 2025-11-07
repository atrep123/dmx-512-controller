import { describe, expect, it } from 'vitest'
import { compileBlocks, getEffectSummary } from '../blockCompiler'
import type { EffectBlock } from '../types'

const baseBlocks: EffectBlock[] = [
  {
    id: 'b1',
    type: 'set-color',
    parameters: { red: 255, green: 128, blue: 64 },
    order: 0,
  },
  {
    id: 'b2',
    type: 'fade',
    parameters: { duration: 1500 },
    order: 1,
  },
  {
    id: 'b3',
    type: 'wait',
    parameters: { waitTime: 250 },
    order: 2,
  },
]

describe('blockCompiler', () => {
  it('compiles blocks into instructions and human readable code', () => {
    const compiled = compileBlocks(baseBlocks)

    expect(compiled.blockCount).toBe(3)
    expect(compiled.instructions).toHaveLength(3)
    expect(compiled.instructions[0]).toMatchObject({
      type: 'action',
      action: 'setColor',
      params: { r: 255, g: 128, b: 64 },
    })
    expect(compiled.instructions[1]).toMatchObject({
      type: 'action',
      action: 'fade',
      duration: 1500,
    })
    expect(compiled.instructions[2]).toMatchObject({
      type: 'wait',
      duration: 250,
    })
    expect(compiled.estimatedDuration).toBe(1750)
    expect(compiled.compiled).toContain('setColor')
    expect(compiled.compiled).toContain('fade(duration: 1500ms)')
    expect(compiled.compiled).toContain('wait(250ms)')
  })

  it('tracks loop metadata and produces summary text', () => {
    const loopBlocks: EffectBlock[] = [
      ...baseBlocks,
      {
        id: 'loop-start',
        type: 'loop-start',
        parameters: { loopCount: 3 },
        order: 3,
      },
      {
        id: 'loop-body',
        type: 'strobe-pulse',
        parameters: { duration: 100 },
        order: 4,
      },
      {
        id: 'loop-end',
        type: 'loop-end',
        parameters: {},
        order: 5,
      },
    ]
    const compiled = compileBlocks(loopBlocks)

    expect(compiled.loopCount).toBe(1)
    const summary = getEffectSummary(compiled)
    expect(summary).toMatch(/6\s+blok/i)
    expect(summary).toMatch(/1\s+smy/i)
    expect(summary).toMatch(/~1\.\d/)
  })
})
