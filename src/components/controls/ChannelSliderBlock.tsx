import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/inpu
import { Input } from '@/components/ui/input'
import { useState } from 'react'

    max?: number
    disabled?: bo
    icon?: React.
    color?: 'primary' | 'accent' | 's

    label,
    onChange,
    max = 255,
    disabled = false,
    icon,
    color = 'primary',
    const [inputValue, setInputValue] = useSta
 

            onChange(numValue)
    label,
    value,
    onChange,
    min = 0,
    max = 255,
    step = 1,
    disabled = false,
    showInput = true,
    icon,
    variant = 'default',
    color = 'primary',
}: ChannelSliderBlockProps) {
    const [inputValue, setInputValue] = useState(value.toString())

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue)
        const numValue = parseInt(newValue)
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
            onChange(numValue)
        }
     

                            {label}
                        {showInput && (
     

                          
                                
                            />
                    </div>
     

                        step={st
                
                    <div className="flex 
                        <span>{max}</span>
                </div>
        )

        <div className="spac
                <label className="text-muted-foreground flex items-center gap-2">
                    {label}
                {showInput 
                      
                       
                        min={min}
                        disabled={disabled}
                    />
                    <span cla
                    </span>
            </div>
                value={[value]}
                mi
                st
         
     




                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-base font-medium flex items-center gap-2">
                            {icon && <span>{icon}</span>}
                            {label}
                        </label>
                        {showInput && (
                            <Input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onBlur={handleInputBlur}
                                min={min}
                                max={max}
                                disabled={disabled}
                                className="w-20 text-center font-mono"
                            />
                        )}
                    </div>
                    <Slider
                        value={[value]}
                        onValueChange={(values) => onChange(values[0])}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabled}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{min}</span>
                        <span>{max}</span>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <label className="text-muted-foreground flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                {showInput ? (
                    <Input
                        type="number"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        min={min}
                        max={max}
                        disabled={disabled}
                        className="w-16 h-7 text-center font-mono text-sm"
                    />
                ) : (
                    <span className={`font-mono font-semibold ${colorClasses[color]}`}>
                        {value}
                    </span>
                )}
            </div>
            <Slider
                value={[value]}
                onValueChange={(values) => onChange(values[0])}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="cursor-pointer"
            />
        </div>
    )
}
