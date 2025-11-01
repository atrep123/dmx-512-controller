/**
 * DMX-512 Controller Protocol Package
 * 
 * Shared protocol definitions and type declarations for all components
 * of the DMX-512 controller system.
 */

// DMX Protocol Types
export interface DMXUniverse {
  id: string;
  name: string;
  number: number;
  channels: number[]; // 512 channels, values 0-255
}

export interface DMXChannel {
  universe: number;
  channel: number; // 1-512
  value: number; // 0-255
}

// Fixture Types
export interface Fixture {
  id: string;
  name: string;
  universeId: string;
  address: number; // DMX start address (1-512)
  channels: number; // Number of channels used
  type: FixtureType;
}

export type FixtureType = 
  | 'rgb'
  | 'rgbw'
  | 'dimmer'
  | 'moving-head'
  | 'par'
  | 'strobe'
  | 'custom';

// Scene Types
export interface Scene {
  id: string;
  name: string;
  state: SceneState;
  timestamp?: number;
}

export interface SceneState {
  [universeId: string]: number[]; // Channel values per universe
}

// Effect Types
export interface Effect {
  id: string;
  name: string;
  type: EffectType;
  speed: number; // 0-100
  intensity: number; // 0-100
  fixtures: string[]; // Fixture IDs
  running: boolean;
}

export type EffectType = 
  | 'chase'
  | 'strobe'
  | 'rainbow'
  | 'fade'
  | 'sweep'
  | 'custom';

// Motor Types
export interface StepperMotor {
  id: string;
  name: string;
  universeId: string;
  address: number;
  position: number; // 0-65535 (16-bit)
  speed: number; // 0-255
  maxSteps: number;
}

export interface Servo {
  id: string;
  name: string;
  universeId: string;
  address: number;
  angle: number; // 0-180 degrees
}

// Network Protocol Types

// Art-Net
export interface ArtNetPacket {
  opCode: number;
  protocolVersion: number;
  sequence: number;
  physical: number;
  universe: number;
  data: number[]; // DMX data (up to 512 bytes)
}

// sACN (E1.31)
export interface SACNPacket {
  universe: number;
  priority: number;
  sequence: number;
  data: number[]; // DMX data (up to 512 bytes)
}

// Control Protocol (WebSocket)
export interface ControlMessage {
  type: MessageType;
  timestamp: number;
  payload: unknown;
}

export type MessageType = 'command' | 'status' | 'event';

export interface CommandMessage extends ControlMessage {
  type: 'command';
  payload: Command;
}

export type Command =
  | SetChannelCommand
  | RecallSceneCommand
  | StartEffectCommand
  | StopEffectCommand
  | SetMotorPositionCommand;

export interface SetChannelCommand {
  command: 'setChannel';
  universe: number;
  channel: number;
  value: number;
}

export interface RecallSceneCommand {
  command: 'recallScene';
  sceneId: string;
}

export interface StartEffectCommand {
  command: 'startEffect';
  effectId: string;
}

export interface StopEffectCommand {
  command: 'stopEffect';
  effectId: string;
}

export interface SetMotorPositionCommand {
  command: 'setMotorPosition';
  motorId: string;
  position: number;
  speed?: number;
}

// Status Messages
export interface StatusMessage extends ControlMessage {
  type: 'status';
  payload: Status;
}

export interface Status {
  connected: boolean;
  universes: UniverseStatus[];
  timestamp: number;
}

export interface UniverseStatus {
  id: string;
  number: number;
  frameRate: number;
  lastUpdate: number;
}

// Event Messages
export interface EventMessage extends ControlMessage {
  type: 'event';
  payload: Event;
}

export type Event =
  | SceneRecalledEvent
  | EffectStartedEvent
  | EffectStoppedEvent
  | ConnectionEvent;

export interface SceneRecalledEvent {
  event: 'sceneRecalled';
  sceneId: string;
  sceneName: string;
}

export interface EffectStartedEvent {
  event: 'effectStarted';
  effectId: string;
  effectName: string;
}

export interface EffectStoppedEvent {
  event: 'effectStopped';
  effectId: string;
}

export interface ConnectionEvent {
  event: 'connection';
  status: 'connected' | 'disconnected';
  clientId?: string;
}

// DMX Timing Constants
export const DMX_TIMING = {
  BREAK_MIN: 88, // microseconds
  BREAK_TYP: 100,
  MAB_MIN: 8, // microseconds (Mark After Break)
  MAB_TYP: 12,
  BAUD_RATE: 250000, // 250 kbaud
  FRAME_RATE_MAX: 44, // Hz
  CHANNELS_PER_UNIVERSE: 512,
} as const;

// Art-Net Constants
export const ARTNET = {
  PORT: 6454,
  PROTOCOL_VERSION: 14,
  OPCODE_DMX: 0x5000,
  OPCODE_POLL: 0x2000,
  OPCODE_POLL_REPLY: 0x2100,
} as const;

// sACN Constants
export const SACN = {
  PORT: 5568,
  MULTICAST_BASE: '239.255.0.0',
  PRIORITY_DEFAULT: 100,
  PRIORITY_MIN: 0,
  PRIORITY_MAX: 200,
} as const;
