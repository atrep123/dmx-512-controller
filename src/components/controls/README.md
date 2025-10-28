# Ovládací bloky UI

Tato knihovna obsahuje reusable komponenty pro vytváření ovládacích prvků DMX kontroléru. Každý blok je samostatný, plně funkční a připravený k použití.

## Instalované komponenty

### 1. ChannelSliderBlock
Univerzální slider pro ovládání DMX kanálů s různými variantami zobrazení.

**Props:**
- `label` (string) - Popisek kanálu
- `value` (number) - Aktuální hodnota (0-255)
- `onChange` (function) - Callback při změně hodnoty
- `min` (number, optional) - Minimální hodnota (výchozí: 0)
- `max` (number, optional) - Maximální hodnota (výchozí: 255)
- `step` (number, optional) - Krok změny (výchozí: 1)
- `disabled` (boolean, optional) - Zakázat ovládání
- `showInput` (boolean, optional) - Zobrazit číselný vstup (výchozí: true)
- `icon` (ReactNode, optional) - Ikona vedle popisku
- `variant` ('default' | 'compact' | 'large', optional) - Varianta zobrazení
- `color` ('primary' | 'accent' | 'secondary', optional) - Barva hodnoty

**Použití:**
```tsx
<ChannelSliderBlock
    label="Ch 1: Dimmer"
    value={dimmer}
    onChange={setDimmer}
    icon={<Lightbulb size={16} />}
    variant="default"
/>
```

### 2. ColorPickerBlock
Kompletní ovládání RGB a RGBW kanálů s předvolbami barev.

**Props:**
- `red` (number) - Hodnota červeného kanálu (0-255)
- `green` (number) - Hodnota zeleného kanálu (0-255)
- `blue` (number) - Hodnota modrého kanálu (0-255)
- `white` (number, optional) - Hodnota bílého kanálu (0-255)
- `onColorChange` (function) - Callback při změně barvy
- `hasWhite` (boolean, optional) - Zobrazit ovládání bílého kanálu
- `variant` ('default' | 'compact', optional) - Varianta zobrazení

**Použití:**
```tsx
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
```

### 3. ToggleButtonBlock
Přepínač pro zapínání/vypínání funkcí s různými styly zobrazení.

**Props:**
- `label` (string) - Popisek přepínače
- `active` (boolean) - Aktivní stav
- `onToggle` (function) - Callback při přepnutí
- `icon` (ReactNode, optional) - Ikona v neaktivním stavu
- `activeIcon` (ReactNode, optional) - Ikona v aktivním stavu
- `variant` ('default' | 'large' | 'minimal', optional) - Varianta zobrazení
- `disabled` (boolean, optional) - Zakázat ovládání
- `showStatus` (boolean, optional) - Zobrazit textový status (výchozí: true)

**Použití:**
```tsx
<ToggleButtonBlock
    label="Stroboskop"
    active={isActive}
    onToggle={() => setIsActive(!isActive)}
    icon={<Lightning size={24} />}
    activeIcon={<Lightning size={24} weight="fill" />}
    variant="default"
/>
```

### 4. ButtonPadBlock
Mřížka tlačítek pro rychlý přístup k efektům, scénám nebo funkcím.

**Props:**
- `title` (string, optional) - Nadpis mřížky
- `items` (ButtonPadItem[]) - Pole tlačítek
- `activeId` (string | null, optional) - ID aktivního tlačítka
- `onItemClick` (function) - Callback při kliknutí na tlačítko
- `columns` (2 | 3 | 4 | 6, optional) - Počet sloupců (výchozí: 3)
- `variant` ('default' | 'compact', optional) - Varianta zobrazení

**ButtonPadItem:**
- `id` (string) - Jedinečný identifikátor
- `label` (string) - Text tlačítka
- `icon` (ReactNode, optional) - Ikona
- `color` ('default' | 'accent' | 'secondary' | 'destructive', optional) - Barva
- `badge` (string, optional) - Badge v rohu tlačítka

**Použití:**
```tsx
const effectButtons = [
    { id: 'strobe', label: 'Stroboskop', icon: <Lightning />, color: 'accent' },
    { id: 'chase', label: 'Chase', icon: <Sparkle />, color: 'default' },
]

<ButtonPadBlock
    title="Efekty"
    items={effectButtons}
    activeId={activeButton}
    onItemClick={setActiveButton}
    columns={3}
/>
```

### 5. PositionControlBlock
Ovládání Pan/Tilt pro moving heads a pozicionéry pomocí směrových tlačítek.

**Props:**
- `panValue` (number) - Hodnota Pan (0-255)
- `tiltValue` (number) - Hodnota Tilt (0-255)
- `onPanChange` (function) - Callback při změně Pan
- `onTiltChange` (function) - Callback při změně Tilt
- `title` (string, optional) - Nadpis (výchozí: "Pan / Tilt")
- `showReset` (boolean, optional) - Zobrazit reset tlačítko (výchozí: true)
- `variant` ('default' | 'compact', optional) - Varianta zobrazení

**Použití:**
```tsx
<PositionControlBlock
    panValue={pan}
    tiltValue={tilt}
    onPanChange={setPan}
    onTiltChange={setTilt}
    title="Moving Head 1"
/>
```

### 6. IntensityFaderBlock
Vertikální fader s vizuálním znázorněním pro přesné ovládání intenzity.

**Props:**
- `value` (number) - Aktuální hodnota (0-255)
- `onChange` (function) - Callback při změně hodnoty
- `label` (string, optional) - Popisek (výchozí: "Intenzita")
- `variant` ('default' | 'vertical' | 'compact', optional) - Varianta zobrazení
- `showPresets` (boolean, optional) - Zobrazit rychlá tlačítka (výchozí: true)

**Použití:**
```tsx
<IntensityFaderBlock
    value={intensity}
    onChange={setIntensity}
    label="Master Dimmer"
    variant="vertical"
/>
```

## Import

Všechny komponenty lze importovat z jednoho místa:

```tsx
import {
    ChannelSliderBlock,
    ColorPickerBlock,
    ToggleButtonBlock,
    ButtonPadBlock,
    PositionControlBlock,
    IntensityFaderBlock,
} from '@/components/controls'
```

## Demonstrace

Pro zobrazení všech komponent v akci, navštivte záložku "UI Bloky" v aplikaci nebo se podívejte na `ControlBlocksDemo.tsx`.

## Vlastní styling

Všechny komponenty používají shadcn/ui komponenty a Tailwind CSS, takže můžete snadno upravit barvy a styly pomocí CSS proměnných v `index.css`.

## Tipy pro použití

1. **Kompaktní varianta** - Ideální pro panely s více kanály vedle sebe
2. **Velká varianta** - Použijte pro hlavní ovládací prvky
3. **Minimální varianta** - Vhodná pro panely nástrojů a rychlé přepínače
4. **Kombinace** - Můžete kombinovat různé varianty v jednom layoutu

## Příklad komplexního layoutu

```tsx
<div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-4">
        <IntensityFaderBlock
            value={intensity}
            onChange={setIntensity}
            variant="vertical"
        />
    </div>
    
    <div className="space-y-4">
        <ColorPickerBlock
            red={red}
            green={green}
            blue={blue}
            onColorChange={handleColorChange}
        />
        
        <PositionControlBlock
            panValue={pan}
            tiltValue={tilt}
            onPanChange={setPan}
            onTiltChange={setTilt}
        />
        
        <ButtonPadBlock
            title="Rychlé efekty"
            items={effectButtons}
            activeId={activeEffect}
            onItemClick={setActiveEffect}
            columns={3}
        />
    </div>
</div>
```
