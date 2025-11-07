import type { Fixture } from '@/lib/types'

export interface FixtureTemplate {
  id: string
  name: string
  description: string
  fixtureType: Fixture['fixtureType']
  channelCount: number
  channelNames: string[]
}

export const fixtureTemplates: FixtureTemplate[] = [
  {
    id: 'rgb-par-3',
    name: 'RGB PAR (3ch)',
    description: 'Červená, zelená, modrá – ideální pro jednoduché washe.',
    fixtureType: 'rgb',
    channelCount: 3,
    channelNames: ['Červená', 'Zelená', 'Modrá'],
  },
  {
    id: 'rgbw-par-4',
    name: 'RGBW PAR (4ch)',
    description: 'Přidává bílý kanál pro čisté tóny a pastelové barvy.',
    fixtureType: 'rgbw',
    channelCount: 4,
    channelNames: ['Červená', 'Zelená', 'Modrá', 'Bílá'],
  },
  {
    id: 'rgb-par-7',
    name: 'RGB PAR (7ch, makra)',
    description: 'Dimmer, strobe a makra pro běžné scénické PARy.',
    fixtureType: 'rgb',
    channelCount: 7,
    channelNames: ['Dimmer', 'Strobe', 'Červená', 'Zelená', 'Modrá', 'Makro', 'Rychlost makra'],
  },
  {
    id: 'moving-head-16',
    name: 'Moving Head (16ch)',
    description: 'Pan/Tilt 16-bit, barvy, goba a frost.',
    fixtureType: 'moving-head',
    channelCount: 16,
    channelNames: [
      'Pan coarse',
      'Pan fine',
      'Tilt coarse',
      'Tilt fine',
      'Dimmer',
      'Strobe',
      'Barva',
      'Gobo',
      'Gobo rotace',
      'Prisma',
      'Prisma rotace',
      'Frost',
      'Focus',
      'Pan/Tilt speed',
      'Macro',
      'Reset',
    ],
  },
  {
    id: 'moving-head-20',
    name: 'Moving Head (20ch FX)',
    description: 'Rozšířený režim s makry a pixel efekty.',
    fixtureType: 'moving-head',
    channelCount: 20,
    channelNames: [
      'Pan coarse',
      'Pan fine',
      'Tilt coarse',
      'Tilt fine',
      'Dimmer',
      'Strobe',
      'Barva',
      'CTO/CTB',
      'Gobo',
      'Gobo rotace',
      'Animace kolo',
      'Animace rotace',
      'Prisma',
      'Prisma rotace',
      'Frost',
      'Focus',
      'Iris',
      'Macro',
      'Pan/Tilt speed',
      'Reset',
    ],
  },
  {
    id: 'stepper-motor',
    name: 'Stepper motor (3ch)',
    description: 'Horní/dolní limit a rychlost.',
    fixtureType: 'stepper-motor',
    channelCount: 3,
    channelNames: ['Pozice horní', 'Pozice dolní', 'Rychlost'],
  },
  {
    id: 'servo-basic',
    name: 'Servo (1ch)',
    description: 'Jednoduché PWM servo mapované na 0–180°.',
    fixtureType: 'servo',
    channelCount: 1,
    channelNames: ['Úhel'],
  },
  {
    id: 'generic-dimmer',
    name: 'Jednokanálový dimmer',
    description: 'Libovolné DMX zařízení na jednom kanálu.',
    fixtureType: 'generic',
    channelCount: 1,
    channelNames: ['Intenzita'],
  },
]

export function findFixtureTemplate(templateId: string) {
  return fixtureTemplates.find((template) => template.id === templateId)
}
