# Planning Guide

A mobile-first DMX 512 lighting controller application that allows users to control stage lighting fixtures, create scenes, and manage multiple DMX universes through an intuitive touch interface.

**Experience Qualities**:
1. **Tactile** - Controls should feel responsive and physical, like operating a real lighting console with immediate visual feedback
2. **Professional** - Design conveys reliability and precision expected in live production environments
3. **Intuitive** - Complex lighting control made accessible through clear visual hierarchy and logical grouping

**Complexity Level**: Light Application (multiple features with basic state)
  - The app provides multiple interconnected features (fixture control, scene management, universe setup) with persistent state, but doesn't require accounts or server synchronization.

## Essential Features

### Fixture Channel Control
- **Functionality**: Individual DMX channel faders (0-255 values) for controlling fixture parameters
- **Purpose**: Direct control over individual lighting parameters (intensity, color, position)
- **Trigger**: User taps on a fixture or channel group
- **Progression**: Select fixture → View channels → Adjust faders → Values update in real-time → State persists
- **Success criteria**: Smooth fader interaction with immediate value display, values persist between sessions

### Scene Management
- **Functionality**: Save and recall complete lighting states across all fixtures
- **Purpose**: Quickly switch between pre-programmed looks during performances
- **Trigger**: User taps scene save/recall button
- **Progression**: Create scene → Set all desired channel values → Save with name → Recall instantly applies all values
- **Success criteria**: Scenes load within 100ms, all channel values restore accurately

### Universe/Fixture Setup
- **Functionality**: Configure DMX universes and add fixtures with DMX addresses and channel counts
- **Purpose**: Define the lighting rig layout and address mapping
- **Trigger**: User opens setup/configuration panel
- **Progression**: Add universe → Add fixture → Set DMX address → Choose fixture type/channel count → Fixture appears in control view
- **Success criteria**: Configuration persists, fixtures display correctly in control interface

### Color Picker
- **Functionality**: Visual RGB/HSV color selection for RGB fixtures
- **Purpose**: Intuitive color selection instead of manually adjusting individual color channels
- **Trigger**: User taps color control on RGB-capable fixture
- **Progression**: Tap color button → Color wheel appears → Select color → RGB channels auto-calculate → Color applies
- **Success criteria**: Color translates accurately to DMX values, picker feels responsive

## Edge Case Handling
- **Empty State**: Friendly onboarding showing how to add first universe and fixture with visual guide
- **Invalid DMX Addresses**: Validation prevents overlapping fixture addresses with clear warning messages
- **Maximum Channels**: Limit universes to 512 channels per DMX spec, show warning when approaching limit
- **Deleted Fixtures in Scenes**: Gracefully handle scenes referencing deleted fixtures by skipping those channels
- **Touch Precision**: Fader controls sized appropriately for finger interaction with generous hit areas

## Design Direction
The design should feel professional and precise like pro-grade lighting equipment, while remaining accessible and modern. Think sleek lighting console meets modern mobile UI - dark interface to preserve night vision during shows, with vibrant accent colors for active controls. Minimal interface that prioritizes the actual control surfaces over chrome.

## Color Selection
Triadic color scheme with deep blacks and vibrant accent colors that pop against dark backgrounds, evoking professional stage lighting equipment aesthetics.

- **Primary Color**: Deep Cyan (oklch(0.65 0.15 210)) - Represents the digital/DMX technology aspect, used for primary actions and key interactive elements
- **Secondary Colors**: Dark charcoal backgrounds (oklch(0.15 0 0)) with slightly lighter panels (oklch(0.20 0 0)) for depth and layering
- **Accent Color**: Magenta (oklch(0.65 0.20 330)) - Theatrical lighting magenta for call-to-action buttons, active states, and important highlights
- **Foreground/Background Pairings**:
  - Background (Dark Charcoal oklch(0.15 0 0)): Light text oklch(0.95 0 0) - Ratio 11.8:1 ✓
  - Card (Darker Panel oklch(0.20 0 0)): Light text oklch(0.95 0 0) - Ratio 10.2:1 ✓
  - Primary (Deep Cyan oklch(0.65 0.15 210)): White text oklch(1 0 0) - Ratio 5.1:1 ✓
  - Secondary (Medium Gray oklch(0.30 0 0)): Light text oklch(0.95 0 0) - Ratio 7.8:1 ✓
  - Accent (Magenta oklch(0.65 0.20 330)): White text oklch(1 0 0) - Ratio 4.9:1 ✓
  - Muted (Subtle Gray oklch(0.25 0 0)): Muted text oklch(0.65 0 0) - Ratio 4.6:1 ✓

## Font Selection
The typeface should feel technical and precise but remain highly legible, with good distinction between numbers for DMX values. Inter font family provides excellent legibility at all sizes with tabular numbers perfect for channel values.

- **Typographic Hierarchy**:
  - H1 (Universe Names): Inter Bold/24px/tight letter spacing
  - H2 (Fixture Names): Inter Semibold/18px/normal letter spacing
  - H3 (Section Headers): Inter Medium/16px/normal letter spacing
  - Body (Channel Labels): Inter Regular/14px/relaxed letter spacing
  - DMX Values: Inter Tabular/14px/monospace for aligned numbers
  - Small (Helper Text): Inter Regular/12px/normal letter spacing

## Animations
Animations should feel precise and mechanical like physical lighting equipment, with subtle transitions that provide feedback without creating distracting motion. The balance leans heavily toward subtle functionality - this is a tool, not entertainment.

- **Purposeful Meaning**: Quick, snappy animations convey the precision and responsiveness expected in live production environments
- **Hierarchy of Movement**: Fader movements are immediate (no animation), scene transitions fade smoothly (200ms), panel transitions slide with purpose (250ms)

## Component Selection
- **Components**: 
  - Cards for fixture grouping and scene containers
  - Slider components for DMX channel faders with custom styling
  - Tabs for switching between fixtures/scenes/setup views
  - Dialog for fixture setup and scene naming
  - Button variants for actions (primary for scenes, secondary for settings)
  - Badge components for DMX address display
  - ScrollArea for long fixture lists
  - Input/Label for DMX values and names
  
- **Customizations**: 
  - Custom vertical fader component styled like professional lighting console
  - Custom color picker wheel for RGB fixtures
  - DMX value display overlay on sliders showing 0-255 range
  
- **States**: 
  - Faders: Active (bright accent), inactive (muted), dragging (highlighted with value popup)
  - Scene buttons: Default (card), active/selected (accent border), hover (subtle glow)
  - Fixtures: Collapsed/expanded states for channel visibility
  
- **Icon Selection**: 
  - Lightbulb for fixtures, Palette for color picker, Faders for channel control
  - Plus for add actions, Gear for settings, Play for scene recall
  - Eye for visibility toggles, Trash for deletions
  
- **Spacing**: 
  - Consistent 4px base unit, 16px card padding, 8px between related elements
  - 24px gaps between major sections, 12px between fixture cards
  
- **Mobile**: 
  - Single column layout on mobile with full-width faders
  - Bottom navigation for main sections (Fixtures/Scenes/Setup)
  - Collapsible fixture cards to save vertical space
  - Large touch targets (min 44px) for all interactive elements
  - Faders optimized for thumb/finger dragging with haptic-feeling resistance
