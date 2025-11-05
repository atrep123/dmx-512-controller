# Contributing to DMX 512 Kontroler

Dekujeme za vas zajem prispet do DMX 512 Kontroler projektu! Tento dokument poskytuje pokyny pro efektivni spolupraci.

## Obsah

- [Code of Conduct](#code-of-conduct)
- [Jak prispet](#jak-prispet)
- [Vyvojove prostredi](#vyvojove-prostredi)
- [Struktura projektu](#struktura-projektu)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Tento projekt dodrzuje [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Ucasti v tomto projektu souhlasite s dodrzovanim techto pravidel.

### Zakladni pravidla

- Budte respektujici a inkluzivni
- Vitejte konstruktivni kritiku
- Zamerte se na to, co je nejlepsi pro komunitu
- Ukazte empatii vuci ostatnim clenum komunity

## Jak prispet

### Typy prispevku

Vitame nasledujici typy prispevku:

1. **Bug Reports** - Nahlaseni problemu a chyb
2. **Feature Requests** - Navrhy novych funkci
3. **Code Contributions** - Opravy chyb a nove funkce
4. **Documentation** - Vylepseni dokumentace
5. **Translations** - Preklady do dalsich jazyku
6. **Design** - UI/UX vylepseni

### Pred zacatkem

1. **Zkontrolujte existujici issues** - Mozna uz nekdo resi vas problem
2. **Diskutujte velke zmeny** - Otevrete issue pred zacatkem prace na velkych funkcich
3. **Jeden problem = jeden PR** - Usnadnuje to review a merge

## Vyvojove prostredi

### Pozadavky

- **Node.js**: 18.x nebo vyssi
- **npm**: 9.x nebo vyssi
- **Git**: 2.x nebo vyssi
- **Editor**: VSCode doporuceno (s ESLint a TypeScript rozsirenimi)

### Setup

```bash
# 1. Forknete repozitar na GitHubu
# 2. Klonujte vas fork
git clone https://github.com/VASE_UZIVATELSKE_JMENO/dmx-512-controller.git
cd dmx-512-controller

# 3. Pridejte upstream remote
git remote add upstream https://github.com/atrep123/dmx-512-controller.git

# 4. Instalujte zavislosti
npm ci

# 5. Vytvorte novy branch pro vasi feature
git checkout -b feature/moje-super-feature

# 6. Spustte vyvojovy server
npm run dev
```

### Dostupne scripty

```bash
# Vyvojovy server (s hot reload)
npm run dev

# Linting
npm run lint

# Staticka kontrola typu
npm run typecheck

# Jednotkove testy
npm run test

# Produkcni build
npm run build

# Preview produkcni build
npm run preview
```

### VSCode Extensions

Doporucene rozsireni pro VSCode:

- ESLint
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier
- GitLens

### Doporucene nastaveni VSCode

Vytvorte `.vscode/settings.json`:

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

## Struktura projektu

```
dmx-512-controller/
--- src/
|   --- components/          # React komponenty
|   |   --- controls/        # Reusable UI kontroly
|   |   |   --- ChannelSliderBlock.tsx
|   |   |   --- ColorPickerBlock.tsx
|   |   |   --- ...
|   |   --- ui/              # shadcn/ui komponenty
|   |   --- FixturesView.tsx # View komponenty
|   |   --- ScenesView.tsx
|   |   --- ...
|   --- lib/                 # Utility a typy
|   |   --- types.ts         # TypeScript definice
|   |   --- utils.ts         # Helper funkce
|   |   --- blockCompiler.ts # Efekt kompilator
|   --- styles/              # Global styles
|   --- hooks/               # Custom React hooks
|   --- App.tsx              # Root aplikace
|   --- main.tsx             # Entry point
--- public/                  # Staticke soubory
--- docs/                    # Dokumentace
--- dist/                    # Build output (gitignored)
```

### Konvence pro soubory

- **Komponenty**: PascalCase (napr. `FixturesView.tsx`)
- **Utilities**: camelCase (napr. `utils.ts`)
- **Typy**: PascalCase interface/type (napr. `interface Fixture`)
- **Konstanty**: UPPER_CASE (napr. `const MAX_DMX_VALUE = 255`)

## Coding Standards

### TypeScript

- **Striktni typing** - Vyhnete se `any`, pouzijte proper types
- **Interface vs Type** - Preferujte `interface` pro objekty, `type` pro unions
- **Explicitni return types** - U slozitejsich funkci

```typescript
// [x] Dobre
interface Fixture {
  id: string
  name: string
  dmxAddress: number
}

function getFixture(id: string): Fixture | null {
  // ...
}

// [x] Spatne
function getFixture(id: any) {
  // ...
}
```

### React

- **Functional Components** - Pouzivejte function komponenty s hooks
- **Props interface** - Vzdy definujte props interface
- **Destructuring** - Destructurujte props a state

```typescript
// [x] Dobre
interface FixtureCardProps {
  fixture: Fixture
  onEdit: (id: string) => void
}

function FixtureCard({ fixture, onEdit }: FixtureCardProps) {
  return <div>...</div>
}

// [x] Spatne
function FixtureCard(props) {
  return <div>{props.fixture.name}</div>
}
```

### Styling

- **Tailwind utility classes** - Preferujte Tailwind pred custom CSS
- **cn() helper** - Pro conditional classes
- **Component variants** - Pouzivejte CVA (class-variance-authority)

```typescript
// [x] Dobre
<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/10"
)}>

// [x] Spatne
<div style={{ borderRadius: '8px', padding: '16px' }}>
```

### Naming Conventions

- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_CASE
- **Private functions**: _prefixedCamelCase
- **Boolean props/state**: is/has prefix (napr. `isActive`, `hasError`)

## Commit Guidelines

Pouzivame [Conventional Commits](https://www.conventionalcommits.org/) format.

### Commit message struktura

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nova funkce
- `fix`: Oprava bugu
- `docs`: Zmeny v dokumentaci
- `style`: Formatovani, chybejici stredniky, atd.
- `refactor`: Refactoring kodu
- `perf`: Zlepseni vykonu
- `test`: Pridani testu
- `chore`: Zmeny build procesu, dependencies

### Priklady

```bash
# Dobry commit
feat(fixtures): add RGB color picker to fixture controls

# Bug fix
fix(effects): resolve strobe effect timing issue

# Documentation
docs(api): add JSDoc comments to DMX types

# Refactoring
refactor(components): extract common slider logic to hook
```

### Commit best practices

- Pouzivejte imperativ ("add" misto "added")
- Prvni radek max 72 znaku
- Pridejte telo commitu pro komplexni zmeny
- Referencujte issues (`Fixes #123`, `Closes #456`)

## Testing

### Running Tests

```bash
# Zatim nejsou implementovany testy
# TODO: Pridat testing framework (Vitest + React Testing Library)
```

### Co testovat

1. **Unit testy** - Utility funkce, hooks
2. **Component testy** - UI komponenty v izolaci
3. **Integration testy** - Interakce mezi komponenty
4. **E2E testy** - Cele user flows

### Testing best practices

- Testujte chovani, ne implementaci
- Jeden test = jeden koncept
- Popisne nazvy testu
- Arrange-Act-Assert pattern

## Pull Request Process

### Pred odeslanim PR

1. **[x] Zkontrolujte checklist**
   - [ ] Kod je spravne naformatovany (ESLint pass)
   - [ ] TypeScript kompiluje bez chyb
   - [ ] Commit messages jsou korektni
   - [ ] Branch je up-to-date s main
   - [ ] Pridana dokumentace (pokud potreba)

2. **(refresh) Sync s upstream**
```bash
git fetch upstream
git rebase upstream/main
```

3. **(cleanup) Cleanup**
```bash
# Squash commits pokud je to vhodne
git rebase -i upstream/main
```

### PR Template

```markdown
## Popis zmen
Kratky popis toho, co tento PR dela.

## Type zmeny
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testovani
Jak jste testovali tyto zmeny?

## Screenshots (pokud relevantni)
Pridejte screenshots pro UI zmeny.

## Checklist
- [ ] Kod je naformatovany
- [ ] TypeScript kompiluje
- [ ] Dokumentace aktualizovana
- [ ] Self-review proveden
```

### Review proces

1. **Automaticke checks** - ESLint, TypeScript, build
2. **Code review** - Minimalne 1 reviewer
3. **Testing** - Manualni otestovani zmen
4. **Merge** - Squash and merge do main

### Co delat behem review

- **Budte responzivni** - Odpovidejte na komentare
- **Budte otevreni** - Prijimejte konstruktivni kritiku
- **Diskutujte** - Vysvetlete vase rozhodnuti
- **Iterujte** - Opravte pozadovane zmeny

## Feature Development Guidelines

### Pred zacatkem nove feature

1. **Otevrete issue** - Diskutujte feature predem
2. **Design review** - U UI zmen pridejte mockupy/navrhy
3. **Rozdelte praci** - Velke features rozdelte do mensich PR

### Behem vyvoje

1. **Incremental commits** - Commitujte casto
2. **Update documentation** - Dokumentujte prubezne
3. **Consider accessibility** - WCAG guidelines
4. **Mobile-first** - Testujte na mobilnich zarizenich

### Pred dokoncenim

1. **Performance check** - Zkontrolujte Lighthouse score
2. **Browser testing** - Chrome, Safari, Firefox
3. **Accessibility audit** - Keyboard navigation, screen readers
4. **Documentation** - Aktualizujte README/docs

## Bug Fix Guidelines

### Reprodukce

1. Vytvorte minimalni reprodukcni pripad
2. Zdokumentujte kroky k reprodukci
3. Identifikujte root cause

### Fix

1. Napiste failing test (pokud mozne)
2. Implementujte fix
3. Overte ze test prochazi
4. Zkontrolujte side effects

### Regression prevention

1. Pridejte test case
2. Dokumentujte v changelog
3. Zvazte preventivni refactoring

## Documentation Guidelines

### Co dokumentovat

- **Public API** - Vsechny exportovane funkce/komponenty
- **Complex logic** - Vysvetlete "proc", ne jen "co"
- **Configuration** - Setup options a jejich vyznam
- **Usage examples** - Ukazky pouziti

### Dokumentacni formaty

- **JSDoc** - Pro TypeScript functions/interfaces
- **README** - Pro komponenty a moduly
- **Markdown files** - Pro navody a guides

### JSDoc priklad

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

Pokud pridavate texty do UI:

1. **Pouzivejte i18n keys** - Misto hardcoded textu
2. **Poskytnete anglicky preklad** - Minimalne EN a CS
3. **Context matters** - Komentujte kontext pro prekladatele

```typescript
// TODO: Implementovat i18n
// Prozatim pouzivejte ceske texty
```

## Release Process

(Pro maintainers)

1. Update version v `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Deploy to production
5. Announce release

## Mate otazky?

- [Otevrete Discussion](https://github.com/atrep123/dmx-512-controller/discussions)
- [Report Issue](https://github.com/atrep123/dmx-512-controller/issues)
- Contact maintainers

## Dekujeme!

Dekujeme za vas cas a prispevek do projektu! Kazdy prispevek, at uz velky nebo maly, je velmi cenen. <3

---

**Happy coding!**

