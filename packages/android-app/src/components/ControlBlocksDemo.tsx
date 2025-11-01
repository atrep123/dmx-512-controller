import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    ChannelSliderBlock,
    ColorPickerBlock,
    ToggleButtonBlock,
    ButtonPadBlock,
    PositionControlBlock,
    IntensityFaderBlock,
} from '@/components/controls'
import {
    Lightbulb,
    Lightning,
    Palette,
    Faders,
    Target,
    Play,
    Pause,
    Stop,
    Sparkle,
    Fire,
    Waves,
} from '@phosphor-icons/react'

export default function ControlBlocksDemo() {
    const [intensity, setIntensity] = useState(127)
    const [red, setRed] = useState(255)
    const [green, setGreen] = useState(100)
    const [blue, setBlue] = useState(50)
    const [white, setWhite] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [activeButton, setActiveButton] = useState<string | null>(null)
    const [pan, setPan] = useState(127)
    const [tilt, setTilt] = useState(127)
    const [speed, setSpeed] = useState(50)
    const [dimmer, setDimmer] = useState(200)

    const effectButtons = [
        { id: 'strobe', label: 'Stroboskop', icon: <Lightning weight="fill" />, color: 'accent' as const },
        { id: 'chase', label: 'Chase', icon: <Sparkle weight="fill" />, color: 'default' as const },
        { id: 'rainbow', label: 'Duha', icon: <Palette weight="fill" />, color: 'secondary' as const },
        { id: 'fire', label: 'Oheň', icon: <Fire weight="fill" />, color: 'accent' as const },
        { id: 'wave', label: 'Vlna', icon: <Waves weight="fill" />, color: 'default' as const },
        { id: 'fade', label: 'Fade', icon: <Lightbulb weight="fill" />, color: 'secondary' as const },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Ovládací bloky UI</h1>
                <p className="text-muted-foreground">
                    Knihovna reusable ovládacích komponent pro DMX kontrolér
                </p>
            </div>

            <Tabs defaultValue="sliders" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="sliders">
                        <Faders className="mr-2" />
                        Slidery
                    </TabsTrigger>
                    <TabsTrigger value="colors">
                        <Palette className="mr-2" />
                        Barvy
                    </TabsTrigger>
                    <TabsTrigger value="toggles">
                        <Lightning className="mr-2" />
                        Přepínače
                    </TabsTrigger>
                    <TabsTrigger value="buttons">
                        <Play className="mr-2" />
                        Tlačítka
                    </TabsTrigger>
                    <TabsTrigger value="position">
                        <Target className="mr-2" />
                        Pozice
                    </TabsTrigger>
                    <TabsTrigger value="intensity">
                        <Lightbulb className="mr-2" />
                        Intenzita
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sliders" className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Channel Slider Block</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Univerzální slider pro ovládání DMX kanálů s různými variantami
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Výchozí varianta</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <ChannelSliderBlock
                                        label="Ch 1: Dimmer"
                                        value={dimmer}
                                        onChange={setDimmer}
                                        icon={<Lightbulb size={16} />}
                                    />
                                    <ChannelSliderBlock
                                        label="Ch 2: Speed"
                                        value={speed}
                                        onChange={setSpeed}
                                        color="accent"
                                        showInput={false}
                                        icon={<Lightning size={16} />}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Kompaktní varianta</h3>
                                <div className="grid gap-3 md:grid-cols-3">
                                    <ChannelSliderBlock
                                        label="Red"
                                        value={red}
                                        onChange={setRed}
                                        variant="compact"
                                        color="accent"
                                    />
                                    <ChannelSliderBlock
                                        label="Green"
                                        value={green}
                                        onChange={setGreen}
                                        variant="compact"
                                        color="accent"
                                    />
                                    <ChannelSliderBlock
                                        label="Blue"
                                        value={blue}
                                        onChange={setBlue}
                                        variant="compact"
                                        color="accent"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Velká varianta</h3>
                                <ChannelSliderBlock
                                    label="Master Dimmer"
                                    value={intensity}
                                    onChange={setIntensity}
                                    variant="large"
                                    icon={<Lightbulb size={24} />}
                                />
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="colors" className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Color Picker Block</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Ovládání RGB a RGBW kanálů s předvolbami barev
                        </p>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <ColorPickerBlock
                                red={red}
                                green={green}
                                blue={blue}
                                onColorChange={(color) => {
                                    setRed(color.red)
                                    setGreen(color.green)
                                    setBlue(color.blue)
                                }}
                            />

                            <ColorPickerBlock
                                red={red}
                                green={green}
                                blue={blue}
                                white={white}
                                hasWhite
                                onColorChange={(color) => {
                                    setRed(color.red)
                                    setGreen(color.green)
                                    setBlue(color.blue)
                                    setWhite(color.white || 0)
                                }}
                            />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Kompaktní varianta</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <ColorPickerBlock
                                    red={red}
                                    green={green}
                                    blue={blue}
                                    onColorChange={(color) => {
                                        setRed(color.red)
                                        setGreen(color.green)
                                        setBlue(color.blue)
                                    }}
                                    variant="compact"
                                />
                                <ColorPickerBlock
                                    red={red}
                                    green={green}
                                    blue={blue}
                                    white={white}
                                    hasWhite
                                    onColorChange={(color) => {
                                        setRed(color.red)
                                        setGreen(color.green)
                                        setBlue(color.blue)
                                        setWhite(color.white || 0)
                                    }}
                                    variant="compact"
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="toggles" className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Toggle Button Block</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Přepínače pro zapínání/vypínání funkcí
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Výchozí varianta</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <ToggleButtonBlock
                                        label="Stroboskop"
                                        active={isActive}
                                        onToggle={() => setIsActive(!isActive)}
                                        icon={<Lightning size={24} />}
                                        activeIcon={<Lightning size={24} weight="fill" />}
                                        showEdit={true}
                                        onEffectChange={() => toast.info('Otevřít nastavení efektu')}
                                    />
                                    <ToggleButtonBlock
                                        label="Efekt zapnut"
                                        active={!isActive}
                                        onToggle={() => setIsActive(!isActive)}
                                        icon={<Sparkle size={24} />}
                                        activeIcon={<Sparkle size={24} weight="fill" />}
                                        showEdit={true}
                                        onEffectChange={() => toast.info('Změnit efekt')}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Velká varianta s editací</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <ToggleButtonBlock
                                        label="Play"
                                        active={isActive}
                                        onToggle={() => setIsActive(!isActive)}
                                        icon={<Play size={32} />}
                                        activeIcon={<Play size={32} weight="fill" />}
                                        variant="large"
                                        showEdit={true}
                                        onEffectChange={() => toast.success('Otevřít editor efektu')}
                                    />
                                    <ToggleButtonBlock
                                        label="Pause"
                                        active={!isActive}
                                        onToggle={() => setIsActive(!isActive)}
                                        icon={<Pause size={32} />}
                                        activeIcon={<Pause size={32} weight="fill" />}
                                        variant="large"
                                        showEdit={true}
                                        onEffectChange={() => toast.success('Změnit nastavení')}
                                    />
                                    <ToggleButtonBlock
                                        label="Stop"
                                        active={false}
                                        onToggle={() => {}}
                                        icon={<Stop size={32} />}
                                        activeIcon={<Stop size={32} weight="fill" />}
                                        variant="large"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Minimální varianta</h3>
                                <div className="flex gap-2 flex-wrap">
                                    <ToggleButtonBlock
                                        label="Stroboskop"
                                        active={isActive}
                                        onToggle={() => setIsActive(!isActive)}
                                        icon={<Lightning size={16} />}
                                        variant="minimal"
                                    />
                                    <ToggleButtonBlock
                                        label="Efekt"
                                        active={!isActive}
                                        onToggle={() => setIsActive(!isActive)}
                                        icon={<Sparkle size={16} />}
                                        variant="minimal"
                                    />
                                    <ToggleButtonBlock
                                        label="Fog"
                                        active={false}
                                        onToggle={() => {}}
                                        icon={<Waves size={16} />}
                                        variant="minimal"
                                        showStatus={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="buttons" className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Button Pad Block</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Mřížka tlačítek pro rychlý přístup k efektům a scénám
                        </p>

                        <div className="space-y-6">
                            <ButtonPadBlock
                                title="Efekty"
                                items={effectButtons}
                                activeId={activeButton}
                                onItemClick={setActiveButton}
                                columns={3}
                            />

                            <ButtonPadBlock
                                title="Scény (kompaktní)"
                                items={[
                                    { id: 'scene1', label: 'Scéna 1', badge: 'RGB' },
                                    { id: 'scene2', label: 'Scéna 2', badge: '5x' },
                                    { id: 'scene3', label: 'Scéna 3' },
                                    { id: 'scene4', label: 'Scéna 4' },
                                ]}
                                activeId={activeButton}
                                onItemClick={setActiveButton}
                                columns={4}
                                variant="compact"
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="position" className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Position Control Block</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Ovládání Pan/Tilt pro moving heads a pozicionéry
                        </p>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <PositionControlBlock
                                panValue={pan}
                                tiltValue={tilt}
                                onPanChange={setPan}
                                onTiltChange={setTilt}
                            />

                            <PositionControlBlock
                                panValue={pan}
                                tiltValue={tilt}
                                onPanChange={setPan}
                                onTiltChange={setTilt}
                                title="Moving Head 2"
                                variant="compact"
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="intensity" className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Intensity Fader Block</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Vertikální fader pro přesné ovládání intenzity
                        </p>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <IntensityFaderBlock
                                value={intensity}
                                onChange={setIntensity}
                                variant="vertical"
                            />

                            <IntensityFaderBlock
                                value={intensity}
                                onChange={setIntensity}
                            />

                            <IntensityFaderBlock
                                value={intensity}
                                onChange={setIntensity}
                                variant="compact"
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
