export interface DMXChannel {
  id: string
  number: number
  name: string
  value: number
}

export interface Fixture {
  id: string
  name: string
  dmxAddress: number
  channelCount: number
  universeId: string
  channels: DMXChannel[]
  fixtureType: 'generic' | 'rgb' | 'rgbw' | 'moving-head' | 'stepper-motor' | 'servo'
}

export interface StepperMotor {
  id: string
  name: string
  dmxAddress: number
  universeId: string
  channelCount: number
  channels: DMXChannel[]
  currentPosition: number
  targetPosition: number
  speed: number
  acceleration: number
  maxSteps: number
}

export interface Servo {
  id: string
  name: string
  dmxAddress: number
  universeId: string
  channelId: string
  currentAngle: number
  targetAngle: number
  minAngle: number
  maxAngle: number
  speed: number
}

export interface EffectBlock {
  id: string
  type: 'set-color' | 'fade' | 'wait' | 'chase-step' | 'strobe-pulse' | 'loop-start' | 'loop-end' | 'set-intensity' | 'rainbow-shift' | 'random-color' | 'pan-tilt'
  parameters: {
    color?: string
    red?: number
    green?: number
    blue?: number
    white?: number
    intensity?: number
    duration?: number
    waitTime?: number
    fixtureIndex?: number
    loopCount?: number
    hueShift?: number
    pan?: number
    tilt?: number
  }
  order: number
}

export interface Effect {
  id: string
  name: string
  type: 'chase' | 'strobe' | 'rainbow' | 'fade' | 'sweep' | 'block-program' | 'sparkle' | 'wipe' | 'bounce' | 'theater-chase' | 'fire' | 'wave' | 'pulse' | 'color-fade'
  fixtureIds: string[]
  speed: number
  intensity: number
  isActive: boolean
  parameters: Record<string, number>
  blocks?: EffectBlock[]
}

export interface Universe {
  id: string
  name: string
  number: number
}

export interface Scene {
  id: string
  name: string
  channelValues: Record<string, number>
  motorPositions?: Record<string, number>
  servoAngles?: Record<string, number>
  timestamp: number
}

export interface AppState {
  universes: Universe[]
  fixtures: Fixture[]
  scenes: Scene[]
  activeScene: string | null
  stepperMotors: StepperMotor[]
  servos: Servo[]
  effects: Effect[]
}
