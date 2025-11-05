import { Card } from '@/components/ui/card'

interface CustomPageBuilderProps {
  effects: any[]
  fixtures: any[]
  stepperMotors: any[]
  servos: any[]
  setEffects: (value: any) => void
  setFixtures: (value: any) => void
  setStepperMotors: (value: any) => void
  setServos: (value: any) => void
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
        <h2 className="text-lg font-semibold mb-2">Vlastni stranka</h2>
        <p className="text-sm text-muted-foreground">
          Tato funkce je momentalne ve vyvoji. Zde budete moci vytvaret vlastni ovladaci rozhrani.
        </p>
      </Card>
    </div>
  )
}
