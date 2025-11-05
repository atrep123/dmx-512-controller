# Ovladaci bloky UI

Tato knihovna obsahuje reusable komponenty pro vytvareni ovladacich prvku DMX kontroleru. Kazdy blok je samostatny, plne funkcni a pripraveny k pouziti.

## Instalovane komponenty

### 1. ChannelSliderBlock
Univerzalni slider pro ovladani DMX kanalu s ruznymi variantami zobrazeni.

**Props:**
- `label` (string) - Popisek kanalu
- `value` (number) - Aktualni hodnota (0-255)
- `onChange` (function) - Callback pri zmene hodnoty
- `min` (number, optional) - Minimalni hodnota (vychozi: 0)
- `max` (number, optional) - Maximalni hodnota (vychozi: 255)
- `step` (number, optional) - Krok zmeny (vychozi: 1)
- `disabled` (boolean, optional) - Zakazat ovladani
- `showInput` (boolean, optional) - Zobrazit ciselny vstup (vychozi: true)
- `icon` (ReactNode, optional) - Ikona vedle popisku
- `variant` ('default' | 'compact' | 'large', optional) - Varianta zobrazeni
- `color` ('primary' | 'accent' | 'secondary', optional) - Barva hodnoty

**Pouziti:**
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
Kompletni ovladani RGB a RGBW kanalu s predvolbami barev.

**Props:**
- `red` (number) - Hodnota cerveneho kanalu (0-255)
- `green` (number) - Hodnota zeleneho kanalu (0-255)
- `blue` (number) - Hodnota modreho kanalu (0-255)
- `white` (number, optional) - Hodnota bileho kanalu (0-255)
- `onColorChange` (function) - Callback pri zmene barvy
- `hasWhite` (boolean, optional) - Zobrazit ovladani bileho kanalu
- `variant` ('default' | 'compact', optional) - Varianta zobrazeni

**Pouziti:**
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
Prepinac pro zapinani/vypinani funkci s ruznymi styly zobrazeni.

**Props:**
- `label` (string) - Popisek prepinace
- `active` (boolean) - Aktivni stav
- `onToggle` (function) - Callback pri prepnuti
- `icon` (ReactNode, optional) - Ikona v neaktivnim stavu
- `activeIcon` (ReactNode, optional) - Ikona v aktivnim stavu
- `variant` ('default' | 'large' | 'minimal', optional) - Varianta zobrazeni
- `disabled` (boolean, optional) - Zakazat ovladani
- `showStatus` (boolean, optional) - Zobrazit textovy status (vychozi: true)

**Pouziti:**
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
Mrizka tlacitek pro rychly pristup k efektum, scenam nebo funkcim.

**Props:**
- `title` (string, optional) - Nadpis mrizky
- `items` (ButtonPadItem[]) - Pole tlacitek
- `activeId` (string | null, optional) - ID aktivniho tlacitka
- `onItemClick` (function) - Callback pri kliknuti na tlacitko
- `columns` (2 | 3 | 4 | 6, optional) - Pocet sloupcu (vychozi: 3)
- `variant` ('default' | 'compact', optional) - Varianta zobrazeni

**ButtonPadItem:**
- `id` (string) - Jedinecny identifikator
- `label` (string) - Text tlacitka
- `icon` (ReactNode, optional) - Ikona
- `color` ('default' | 'accent' | 'secondary' | 'destructive', optional) - Barva
- `badge` (string, optional) - Badge v rohu tlacitka

**Pouziti:**
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
Ovladani Pan/Tilt pro moving heads a pozicionery pomoci smerovych tlacitek.

**Props:**
- `panValue` (number) - Hodnota Pan (0-255)
- `tiltValue` (number) - Hodnota Tilt (0-255)
- `onPanChange` (function) - Callback pri zmene Pan
- `onTiltChange` (function) - Callback pri zmene Tilt
- `title` (string, optional) - Nadpis (vychozi: "Pan / Tilt")
- `showReset` (boolean, optional) - Zobrazit reset tlacitko (vychozi: true)
- `variant` ('default' | 'compact', optional) - Varianta zobrazeni

**Pouziti:**
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
Vertikalni fader s vizualnim znazornenim pro presne ovladani intenzity.

**Props:**
- `value` (number) - Aktualni hodnota (0-255)
- `onChange` (function) - Callback pri zmene hodnoty
- `label` (string, optional) - Popisek (vychozi: "Intenzita")
- `variant` ('default' | 'vertical' | 'compact', optional) - Varianta zobrazeni
- `showPresets` (boolean, optional) - Zobrazit rychla tlacitka (vychozi: true)

**Pouziti:**
```tsx
<IntensityFaderBlock
    value={intensity}
    onChange={setIntensity}
    label="Master Dimmer"
    variant="vertical"
/>
```

## Import

Vsechny komponenty lze importovat z jednoho mista:

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

Pro zobrazeni vsech komponent v akci, navstivte zalozku "UI Bloky" v aplikaci nebo se podivejte na `ControlBlocksDemo.tsx`.

## Vlastni styling

Vsechny komponenty pouzivaji shadcn/ui komponenty a Tailwind CSS, takze muzete snadno upravit barvy a styly pomoci CSS promennych v `index.css`.

## Tipy pro pouziti

1. **Kompaktni varianta** - Idealni pro panely s vice kanaly vedle sebe
2. **Velka varianta** - Pouzijte pro hlavni ovladaci prvky
3. **Minimalni varianta** - Vhodna pro panely nastroju a rychle prepinace
4. **Kombinace** - Muzete kombinovat ruzne varianty v jednom layoutu

## Priklad komplexniho layoutu

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
            title="Rychle efekty"
            items={effectButtons}
            activeId={activeEffect}
            onItemClick={setActiveEffect}
            columns={3}
        />
    </div>
</div>
```
