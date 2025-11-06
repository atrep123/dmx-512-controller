import { Card } from '@/components/ui/card'
import type { Effect, Fixture, StepperMotor, Servo } from '@/lib/types'
import type React from 'react'

interface CustomPageBuilderProps {
  effects: Effect[]
  fixtures: Fixture[]
  stepperMotors: StepperMotor[]
  servos: Servo[]
  setEffects: React.Dispatch<React.SetStateAction<Effect[]>>
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>
  setStepperMotors: React.Dispatch<React.SetStateAction<StepperMotor[]>>
  setServos: React.Dispatch<React.SetStateAction<Servo[]>>
}

export default function CustomPageBuilder({
  effects,
  fixtures,
  stepperMotors,
  servos,
  setEffects,
  setFixtures,
  setStepperMotors,
  setServos,
}: CustomPageBuilderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">Vlastní stránka</h2>
        <p className="text-sm text-muted-foreground">
          Tato funkce je momentálně ve vývoji. Zde budete moci vytvářet vlastní ovládací rozhraní.
        </p>
      </Card>
    </div>
  )
}
