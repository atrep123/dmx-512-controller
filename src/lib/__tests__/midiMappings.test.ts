import { describe, expect, it } from 'vitest'
import type { MidiMessage } from '@/hooks/useMidiBridge'
import { matchMidiMapping, midiValueToPercent, normalizeMidiValue, type MidiMapping } from '@/lib/midiMappings'

const createMessage = (overrides: Partial<MidiMessage>): MidiMessage => ({
    command: 'control-change',
    data: [0, 10, 64],
    deviceId: 'dev-1',
    status: 0xb0,
    timestamp: Date.now(),
    ...overrides,
})

const channelMapping: MidiMapping = {
    id: 'm1',
    command: 'control-change',
    controller: 10,
    action: { type: 'channel', channel: 5 },
    deviceId: 'dev-1',
}

describe('midiMappings helpers', () => {
    it('normalizes MIDI values to 0-255 range', () => {
        expect(normalizeMidiValue(0)).toBe(0)
        expect(normalizeMidiValue(64)).toBe(129)
        expect(normalizeMidiValue(200)).toBe(255)
    })

    it('converts MIDI values to percent', () => {
        expect(midiValueToPercent(0)).toBe(0)
        expect(midiValueToPercent(63)).toBe(50)
        expect(midiValueToPercent(127)).toBe(100)
    })

    it('matches mapping by command, controller and device', () => {
        const message = createMessage({})
        expect(matchMidiMapping(message, [channelMapping])).toBe(channelMapping)

        expect(matchMidiMapping(createMessage({ data: [0, 11, 64] }), [channelMapping])).toBeUndefined()

        expect(
            matchMidiMapping(
                createMessage({ command: 'note-on' }),
                [channelMapping]
            )
        ).toBeUndefined()

        expect(
            matchMidiMapping(
                createMessage({ deviceId: 'dev-2' }),
                [channelMapping]
            )
        ).toBeUndefined()
    })

    it('supports note mappings', () => {
        const noteMapping: MidiMapping = {
            id: 'n1',
            command: 'note-on',
            controller: 60,
            action: { type: 'scene', sceneId: 'scene-1' },
        }
        const message = createMessage({ command: 'note-on', data: [0, 60, 100] })
        expect(matchMidiMapping(message, [noteMapping])).toBe(noteMapping)
    })
})
