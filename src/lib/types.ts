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
  description?: string
  tags?: string[]
  favorite?: boolean
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

export type CustomBlockKind =
  | 'master-dimmer'
  | 'scene-button'
  | 'effect-toggle'
  | 'fixture-slider'
  | 'motor-pad'
  | 'servo-knob'
  | 'markdown-note'

export type CustomBlockSize = 'xs' | 'sm' | 'md' | 'lg'

export interface CustomBlockPosition {
  col: number
  row: number
  width: number
  height: number
}

interface CustomBlockBase {
  id: string
  kind: CustomBlockKind
  title?: string
  description?: string
  /**
   * Visual hint for default width/height presets. Concrete renderer should map it to grid spans.
   */
  size?: CustomBlockSize
  position?: CustomBlockPosition
}

export interface MasterDimmerBlock extends CustomBlockBase {
  kind: 'master-dimmer'
  showPercent?: boolean
}

export interface SceneButtonBlock extends CustomBlockBase {
  kind: 'scene-button'
  sceneId: string | null
  behavior: 'recall' | 'toggle' | 'preview'
}

export interface EffectToggleBlock extends CustomBlockBase {
  kind: 'effect-toggle'
  effectId: string | null
  behavior: 'toggle' | 'on' | 'off'
}

export interface FixtureSliderBlock extends CustomBlockBase {
  kind: 'fixture-slider'
  fixtureId: string | null
  channelId: string | null
  min?: number
  max?: number
  showValue?: boolean
}

export interface MotorPadBlock extends CustomBlockBase {
  kind: 'motor-pad'
  motorId: string | null
  axis: 'pan' | 'tilt' | 'linear'
  speedScale?: number
}

export interface ServoKnobBlock extends CustomBlockBase {
  kind: 'servo-knob'
  servoId: string | null
  showTarget?: boolean
}

export interface MarkdownNoteBlock extends CustomBlockBase {
  kind: 'markdown-note'
  content: string
}

export type CustomBlock =
  | MasterDimmerBlock
  | SceneButtonBlock
  | EffectToggleBlock
  | FixtureSliderBlock
  | MotorPadBlock
  | ServoKnobBlock
  | MarkdownNoteBlock

export interface CustomLayout {
  id: string
  name: string
  /**
   * Optional grid definition; renderer can ignore or override.
   */
  grid?: {
    columns: number
    rowHeight: number
    gap: number
  }
  blocks: CustomBlock[]
  updatedAt: number
}

export interface ProjectMeta {
  id: string
  name: string
  venue?: string | null
  eventDate?: string | null
  notes?: string | null
  createdAt: number
  updatedAt: number
  lastBackupAt?: number | null
}

export interface BackupVersion {
  versionId: string
  createdAt: number
  size: number
  label?: string | null
  provider: string
  encrypted: boolean
}
