# Contributing to DMX 512 Kontroler

Děkujeme za váš zájem přispět do DMX 512 Kontroler projektu!
Tento dokument poskytuje pokyny pro efektivní spolupráci.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Tento projekt dodržuje [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).
Účastí v tomto projektu souhlasíte s dodržováním těchto pravidel.

### Základní pravidla

- Buďte respektující a inkluzivní
- Vítejte konstruktivní kritiku
- Zaměřte se na to, co je nejlepší pro komunitu
- Ukažte empatii vůči ostatním členům komunity

## How to Contribute

### Typy příspěvků

Vítáme následující typy příspěvků:

1. **Bug Reports** - Nahlášení problémů a chyb
2. **Feature Requests** - Návrhy nových funkcí
3. **Code Contributions** - Opravy chyb a nové funkce
4. **Documentation** - Vylepšení dokumentace
5. **Translations** - Překlady do dalších jazyků
6. **Design** - UI/UX vylepšení

### Před začátkem

1. **Zkontrolujte existující issues** - Možná už někdo řeší váš problém
2. **Diskutujte velké změny** - Otevřete issue před začátkem práce na velkých funkcích
3. **Jeden problém = jeden PR** - Usnadňuje to review a merge

## Development Environment

### Požadavky

- **Node.js**: 18.x nebo vyšší
- **npm**: 9.x nebo vyšší
- **Git**: 2.x nebo vyšší
- **Editor**: VSCode doporučeno (s ESLint a TypeScript rozšířeními)

### Setup

```bash
# 1. Forkněte repozitář na GitHubu
# 2. Klonujte váš fork
git clone https://github.com/VASE_UZIVATELSKE_JMENO/dmx-512-controller.git
cd dmx-512-controller

# 3. Přidejte upstream remote
git remote add upstream https://github.com/atrep123/dmx-512-controller.git

# 4. Instalujte závislosti
npm install

# 5. Vytvořte nový branch pro vaši feature
git checkout -b feature/moje-super-feature

# 6. Spusťte vývojový server
npm run dev
```text

### Dostupné scripty

```bash
# Vývojový server (s hot reload)
npm run dev

# Linting
npm run lint

# Typechecker (tsc --build)
npm run typecheck

# Unit tests (Vitest)
npm run test

# Produkční build
npm run build

# Preview produkční build
npm run preview
```text

### VSCode Extensions

Doporučené rozšíření pro VSCode:

- ESLint
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier
- GitLens

### Doporučené nastavení VSCode

Vytvořte `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Project Structure

```text
dmx-512-controller/
├── src/
│   ├── components/          # React komponenty
│   │   ├── controls/        # Reusable UI kontroly
│   │   │   ├── ChannelSliderBlock.tsx
│   │   │   ├── ColorPickerBlock.tsx
│   │   │   └── ...
│   │   ├── ui/              # shadcn/ui komponenty
│   │   ├── FixturesView.tsx # View komponenty
│   │   ├── ScenesView.tsx
│   │   └── ...
│   ├── lib/                 # Utility a typy
│   │   ├── types.ts         # TypeScript definice
│   │   ├── utils.ts         # Helper funkce
│   │   └── blockCompiler.ts # Efekt kompilátor
│   ├── styles/              # Global styles
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Root aplikace
│   └── main.tsx             # Entry point
├── public/                  # Statické soubory
├── docs/                    # Dokumentace
└── dist/                    # Build output (gitignored)
```

### Konvence pro soubory

- **Komponenty**: PascalCase (např. `FixturesView.tsx`)
- **Utilities**: camelCase (např. `utils.ts`)
- **Typy**: PascalCase interface/type (např. `interface Fixture`)
- **Konstanty**: UPPER_CASE (např. `const MAX_DMX_VALUE = 255`)

## Coding Standards

### TypeScript

- **Striktní typing** - Vyhněte se `any`, použijte proper types
- **Interface vs Type** - Preferujte `interface` pro objekty, `type` pro unions
- **Explicitní return types** - U složitějších funkcí

```typescript
// ✅ Dobře
interface Fixture {
  id: string
  name: string
  dmxAddress: number
}

function getFixture(id: string): Fixture | null {
  // ...
}

// ❌ Špatně
function getFixture(id: any) {
  // ...
}
```

### React

- **Functional Components** - Používejte function komponenty s hooks
- **Props interface** - Vždy definujte props interface
- **Destructuring** - Destructurujte props a state

```typescript
// ✅ Dobře
interface FixtureCardProps {
  fixture: Fixture
  onEdit: (id: string) => void
}

function FixtureCard({ fixture, onEdit }: FixtureCardProps) {
  return <div>...</div>
}

// ❌ Špatně
function FixtureCard(props) {
  return <div>{props.fixture.name}</div>
}
```

### Styling

- **Tailwind utility classes** - Preferujte Tailwind před custom CSS
- **cn() helper** - Pro conditional classes
- **Component variants** - Používejte CVA (class-variance-authority)

```typescript
// ✅ Dobře
<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/10"
)}>

// ❌ Špatně
<div style={{ borderRadius: '8px', padding: '16px' }}>
```

### Naming Conventions

- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_CASE
- **Private functions**: _prefixedCamelCase
- **Boolean props/state**: is/has prefix (např. `isActive`, `hasError`)

## Commit Guidelines

Používáme [Conventional Commits](https://www.conventionalcommits.org/) formát.

### Commit message struktura

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nová funkce
- `fix`: Oprava bugu
- `docs`: Změny v dokumentaci
- `style`: Formátování, chybějící středníky, atd.
- `refactor`: Refactoring kódu
- `perf`: Zlepšení výkonu
- `test`: Přidání testů
- `chore`: Změny build procesu, dependencies

### Příklady

```bash
# Dobrý commit
feat(fixtures): add RGB color picker to fixture controls

# Bug fix
fix(effects): resolve strobe effect timing issue

# Documentation
docs(api): add JSDoc comments to DMX types

# Refactoring
refactor(components): extract common slider logic to hook
```

### Commit best practices

- Používejte imperativ ("add" místo "added")
- První řádek max 72 znaků
- Přidejte tělo commitu pro komplexní změny
- Referencujte issues (`Fixes #123`, `Closes #456`)

## Testing

### Running Tests

```bash
npm run lint        # ESLint + TypeScript rules
npm run typecheck   # tsc -b (project references)
npm run test        # Vitest run (headless)
npm run test:watch  # Vitest watch mode pro lokální vývoj
```

Používáme **Vitest + React Testing Library** pro komponenty a hooks.
Každá nová feature nebo bugfix by měla mít odpovídající testy (unit/komponentové)
a případně aktualizovaný mock pro `msw`/REST klienty.

### Co testovat

1. **Unit testy**
   Utility funkce, hooks
2. **Component testy**
   UI komponenty v izolaci
3. **Integration testy**
   Interakce mezi komponenty
4. **E2E testy**
   Celé user flows

### Testing best practices

- Testujte chování, ne implementaci
- Jeden test = jeden koncept
- Popisné názvy testů
- Arrange-Act-Assert pattern

## Pull Request Process

### Před odesláním PR

1. **✅ Zkontrolujte checklist**
   - [ ] `npm run lint`
   - [ ] `npm run typecheck`
   - [ ] `npm run test`
   - [ ] (Volitelné) `npm run build` pro ověření produkčního bundlu
   - [ ] Commit messages jsou korektní
   - [ ] Branch je up-to-date s main
   - [ ] Přidána dokumentace (pokud potřeba)

1. **Sync s upstream**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

1. **Cleanup**

   ```bash
   # Squash commits pokud je to vhodné
   git rebase -i upstream/main
   ```

### PR Template

```markdown
## Popis změn
Krátký popis toho, co tento PR dělá.

## Type změny
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testování
Jak jste testovali tyto změny?

## Screenshots (pokud relevantní)
Přidejte screenshots pro UI změny.

## Checklist
- [ ] Kód je naformátovaný
- [ ] TypeScript kompiluje
- [ ] Dokumentace aktualizována
- [ ] Self-review proveden
```

### Review proces

1. **Automatické checks** - ESLint, TypeScript, build
2. **Code review** - Minimálně 1 reviewer
3. **Testing** - Manuální otestování změn
4. **Merge** - Squash and merge do main

### Co dělat během review

- **Buďte responzivní** - Odpovídejte na komentáře
- **Buďte otevření** - Přijímejte konstruktivní kritiku
- **Diskutujte** - Vysvětlete vaše rozhodnutí
- **Iterujte** - Opravte požadované změny

## Feature Development Guidelines

### Před začátkem nové feature

1. **Otevřete issue** - Diskutujte feature předem
2. **Design review** - U UI změn přidejte mockupy/návrhy
3. **Rozdělte práci** - Velké features rozdělte do menších PR

### Během vývoje

1. **Incremental commits** - Commitujte často
2. **Update documentation** - Dokumentujte průběžně
3. **Consider accessibility** - WCAG guidelines
4. **Mobile-first** - Testujte na mobilních zařízeních

### Před dokončením

1. **Performance check** - Zkontrolujte Lighthouse score
2. **Browser testing** - Chrome, Safari, Firefox
3. **Accessibility audit** - Keyboard navigation, screen readers
4. **Documentation** - Aktualizujte README/docs

## Bug Fix Guidelines

### Reprodukce

1. Vytvořte minimální reprodukční případ
2. Zdokumentujte kroky k reprodukci
3. Identifikujte root cause

### Fix

1. Napište failing test (pokud možné)
2. Implementujte fix
3. Ověřte že test prochází
4. Zkontrolujte side effects

### Regression prevention

1. Přidejte test case
2. Dokumentujte v changelog
3. Zvažte preventivní refactoring

## Documentation Guidelines

### Co dokumentovat

- **Public API** - Všechny exportované funkce/komponenty
- **Complex logic** - Vysvětlete "proč", ne jen "co"
- **Configuration** - Setup options a jejich význam
- **Usage examples** - Ukázky použití

### Dokumentační formáty

- **JSDoc** - Pro TypeScript functions/interfaces
- **README** - Pro komponenty a moduly
- **Markdown files** - Pro návody a guides

### JSDoc příklad

```typescript
/**
 * Calculates DMX channel value for RGB color.
 * 
 * @param red - Red component (0-255)
 * @param green - Green component (0-255)
 * @param blue - Blue component (0-255)
 * @returns Array of DMX values [red, green, blue]
 * 
 * @example
 * ```ts
 * const dmxValues = rgbToDMX(255, 0, 128);
 * // Returns [255, 0, 128]
 * ```
 */
function rgbToDMX(red: number, green: number, blue: number): number[] {
  return [red, green, blue];
}
```

## Internationalization (i18n)

Pokud přidáváte texty do UI:

1. **Používejte hook `useI18n`** –
   `const { t } = useI18n()` a texty renderujte přes `t('translation.key')`.
2. **Udržujte `src/lib/i18n.ts`** –
   každý nový klíč musí mít český i anglický překlad.
3. **Placeholdery jsou podporované** –
   `t('desktop.onboarding.test.success', { target })` nahradí `{target}` hodnotou.

```tsx
import { useI18n } from '@/lib/i18n'

function Example() {
  const { t } = useI18n()
  return t('app.tabs.custom')
}
```

## Release Process

(Pro maintainers)

1. Update version v `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Deploy to production
5. Announce release

## Questions

- 💬 [Otevřete Discussion](https://github.com/atrep123/dmx-512-controller/discussions)
- 🐛 [Report Issue](https://github.com/atrep123/dmx-512-controller/issues)
- 📧 Contact maintainers

## Thank You

Děkujeme za váš čas a příspěvek do projektu!
Každý příspěvek, ať už velký nebo malý, je velmi ceněn. 💚

---

Happy coding! 🎭✨
