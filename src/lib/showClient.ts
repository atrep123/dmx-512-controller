import type { Universe, Fixture, Scene, Effect, StepperMotor, Servo, CustomLayout } from '@/lib/types'
import type { MidiMapping } from '@/lib/midiMappings'
import { buildBackendUrl } from '@/lib/env'

export type ShowSnapshot = {
  version: string;
  exportedAt: number | string;
  universes: Universe[];
  fixtures: Fixture[];
  scenes: Scene[];
  effects: Effect[];
  stepperMotors: StepperMotor[];
  servos: Servo[];
  midiMappings?: MidiMapping[];
  customLayout?: CustomLayout;
};

const jsonHeaders = {
  'content-type': 'application/json',
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const target = buildBackendUrl(path)
  const response = await fetch(target, init)
  if (!response.ok) {
    throw new Error(`Request failed for ${path}`)
  }
  return (await response.json()) as T
}

export async function downloadShow(): Promise<ShowSnapshot> {
  return request<ShowSnapshot>('/export', { method: 'GET' })
}

export async function uploadShow(payload: ShowSnapshot): Promise<ShowSnapshot> {
  return request<ShowSnapshot>('/import', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })
}
