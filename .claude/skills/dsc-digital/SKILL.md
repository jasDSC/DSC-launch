---
name: dsc-digital
description: Use this skill to generate well-branded interfaces and assets in the DSC-Digital design language — a calm, considered, Scandinavian visual system for internal tools and admin dashboards. Built on the real DSC brand palette (navy / tan / sage / mist / sand / plum-sparingly). Covers tokens (colors, type, spacing, radii, shadow), the canonical token aliases, and two reference UI kits (dashboard + launchpad). Apply to Next.js apps, prototypes, throwaway demos, or production code that needs a distinct, recognizable look across multiple unrelated systems.
user-invocable: true
---

# DSC-Digital Design Skill

Read `README.md` in this skill first — it contains the full palette,
typography rules, content tone, and decision rationale. Then explore the
other files:

- `colors_and_type.css` — drop this into any project and import once. All
  tokens come from CSS custom properties (`var(--navy-500)`,
  `var(--radius-lg)`, etc.). Canonical scale names: `--navy-*`, `--tan-*`,
  `--sage-*`, `--mist-*`, `--plum-*`, `--sand-*`.
- `assets/` — logo wordmark, logo mark.
- `ui_kits/dashboard/index.html` — the canonical reference screen. Fork
  this for any new dashboard view.
- `ui_kits/launchpad/index.html` — secondary reference. Tool-launcher
  layout + activity feed pattern.
- `preview/*.html` — small atomic component examples (buttons, pills,
  chart, table, sidebar, metric cards). Copy markup from these.

## Working in production code

1. Copy `colors_and_type.css` into the project (e.g. `app/styles/dsc-digital.css`)
   and import it in the root layout.
2. Reference tokens by their semantic name (`--bg-page`, `--brand-primary`,
   `--fg-1`) — never re-declare hex values.
3. Use Manrope from Google Fonts. The CSS already imports it.
4. For icons: 2px stroke (lucide-style) in navigation/buttons; filled
   glyphs only inside the 44×44 rounded-square icon tiles on cards.

## Working on throwaway artifacts (HTML mocks, slides, prototypes)

1. Copy `colors_and_type.css` and `assets/` into your output directory.
2. Use the UI kits as starting templates.
3. Static HTML is fine — the system was designed to work without React.

## Hard rules

- **Manrope only.** One typeface, full weight range. No font pairing.
  Hero numerals are 300 weight, tight tracking. Headings are 800 weight,
  -0.025 to -0.03em tracking.
- **Six brand hues.** Navy / Tan / Sage / Mist / Sand / Plum. Each has a
  scale (most 50–800; sage/mist 50–700). Don't invent new hues.
- **Plum is sparing.** Reserved for hero emphasis words, critical states,
  one deliberate alert. Aim for ≤ 1 plum element per screen. Never the
  default action color.
- **Warm neutrals.** Backgrounds and borders use the `sand-*` scale; cool
  variants use `mist-*`. Shadows are warm-tinted (navy-rgba), never pure
  cool blue.
- **No emoji.** No exclamation marks in UI copy. No marketing exuberance.
- **Filled glyphs only inside tonal rounded-square tiles** (sage-200 /
  sand-200 / mist-200 / tan-100). Stroke icons everywhere else.
- **Navy + tan is the canonical chart pair.** Two data series. Add sage as
  a third only if needed.

## If invoked without other guidance

Ask the user:
1. What kind of artifact (full app, single screen, slide deck, mock)?
2. Which surface from the system fits (dashboard, launchpad, settings, new)?
3. What real product copy or data should populate it?

Then output static HTML or Next.js components depending on need, copying
assets and tokens out of this skill folder.
