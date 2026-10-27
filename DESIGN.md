---
version: alpha
name: ShopFlow
description: Thai IT equipment storefront with a compact inventory-management workspace.
colors:
  primary: 'oklch(12.9% 0.042 264.695)'
  accent: 'oklch(70.5% 0.213 47.604)'
  focus: 'oklch(55.3% 0.195 38.402)'
  background: 'oklch(98.4% 0.003 247.858)'
  surface: '#ffffff'
  danger: 'oklch(50.5% 0.213 27.518)'
typography:
  sans:
    fontFamily: 'IBM Plex Sans Thai, sans-serif'
  mono:
    fontFamily: 'ui-monospace, monospace'
rounded:
  control: '0.75rem'
  panel: '1rem'
spacing:
  page-max: '80rem'
  mobile-gutter: '1.25rem'
  desktop-gutter: '2rem'
---

# ShopFlow Design System

The catalog is browsable by guests. Guest navigation shows a clear Thai login
action, without a placeholder account identity or logout action. On product detail,
the purchase action explains that login is required, with the existing account
approval policy stated below it. Auth screens provide a way back to browsing.
The public storefront is also the landing page after logout and 404 recovery.
Login's back-to-browsing action is placed above the form, with contextual Thai
copy when the shopper is returning to a specific product.

Product-image editing uses the existing slate form surface with an orange file
picker, a square contained preview, Thai inline errors, and visible transfer status.
The native single-file input remains keyboard-accessible. Controls stack on small
screens; long filenames wrap instead of widening the form. Existing image URLs
remain supported alongside local uploads.

## Overview

### Creative North Star

An IT equipment shelf: recognizable product categories, clearly visible stock,
prices and controls. Preserve the established orange accents, white product
surfaces and dark slate navigation. The product finder is the storefront's
signature: search, category and page-scoped ordering form one practical panel.

### Product context and register

- Product UI for Thai-speaking customers and store administrators; Thai copy in
  existing screens is the evidence. Specific commercial market/legal scope is not established.
- Desktop administration and mobile shopping. Product tasks take precedence over promotional decoration.
- Keep English product/category names; new control labels and status copy are Thai.
- Runtime ownership: Tailwind's default palette/spacing remain canonical. The
  frontmatter mirrors the selected runtime values, not a second generated theme.
  `src/assets/main.css` owns semantic focus/scrollbar aliases and shared control classes.
- Token path: Tailwind theme → CSS `--color-*` → `--app-*` aliases → global selectors/shared classes.
  Changes must update this file and CSS together; review against the installed Tailwind theme.
- Avoid a marketing hero, decorative metrics or a rebrand in an operational workflow.

## Colors

Dark slate owns primary actions/navigation. Orange marks the brand and selected
filters; orange-700 provides stronger control focus contrast. White panels sit on
slate-50. Danger actions use red with explicit text, separated from safe actions.
Only the existing light theme is supported. Forced colors use system focus and scrollbars.

## Typography

IBM Plex Sans Thai is the established body and heading family. Use weight/size
to distinguish roles: 24px bold page headings, 16px panel headings, 14–16px
controls/body and 12px supporting metadata. Keep Thai line height generous.
System monospace is reserved for technical identifiers. Material Symbols Rounded
remains the existing icon family. Icons accompanying text are decorative.

## Layout

Storefront max width is 80rem with 20/24/32px gutters. Product grid uses one,
two, three then four columns at the existing Tailwind breakpoints. Filters stack
on phones. Document scrolling owns long forms; tables scroll horizontally inside
their panel. Keep loading/results/status geometry stable and use a global stable gutter.

## Elevation & Depth

Border + subtle shadow distinguish white panels. Reserve strong shadows and
backdrops for modal dialogs. Avoid decorative depth around ordinary data values.

## Shapes

12px control/card radius, 16px panels/dialogs, pill-shaped filter chips. Keep native
selects for ordinary fields. At the user's request, catalog category/sort and admin product-filter menus
use the shared icon combobox so every option can display its own Material symbol.

## Components

Registration groups personal details separately from login credentials, with visible
Thai labels and Material icons. Names share a row on wider screens; contact and
credential fields use full width. Phone is explicitly optional. Inline field errors
and a summary preserve form context; existing users display neutral missing-data
text in the admin list. No verification badge or delivery promise is shown for email.
The registration sidebar is a top-aligned dark slate guide with Thai copy, a
three-step icon timeline and a storefront link. It highlights data entry before
submission and awaiting approval after success. Its height follows content; only
desktop windows at least 900px tall use sticky positioning. Shorter windows use
normal document scrolling, avoiding the previous bottom-aligned content gap.

- `AppSearchField`: visible label, 48px input/submit controls, explicit clear button,
  keyboard focus and composition-safe search. Shared by catalog and user search.
- `ProductFilter`: one search/category/order panel. Ordering is explicitly page-scoped
  because the verified backend only orders globally by creation time.
- `AppConfirmDialog`: native modal dialog, cancel-first focus, contained scrolling,
  busy controls, inline failure and focus restoration. Cart is the existing reference flow.
- `ProductForm`: labels/errors associated with fields; first-invalid focus; data
  preserved after failure; app-owned discard confirmation.
- `PageSkeleton`: existing canonical loading treatment. No new artificial delay in catalog requests.
- `AppToast`: existing shared acknowledgement. Persistent field/dialog errors remain visible separately.
- `main.css`: global focus, cursor, scrollbar and reduced-motion baseline; `.app-field`,
  `.filter-chip`, `.page-button` are reusable visual classes.

Motion is limited to existing transitions and feedback. Reduced-motion preference
disables movement. Busy labels reserve minimum dimensions. Currency/counts use
Thai formatting in new catalog code; broader formatting migration remains tracked.

## Do's and Don'ts

Catalog and admin product-filter dropdowns reuse `AppIconSelect.vue`: a select-only combobox with Material
Symbols Rounded on each option and on the selected value. Category icons match the
equipment and are shared through `utils/product-icons.ts`. Stock choices use inventory,
check-circle and unavailable-cart symbols; price sorting uses trending-up/down.
Match the search field's 48px
minimum height, orange selection accent and rounded white surface. Options wrap
long text and show a check for the current value. Keep text labels beside icons.

- Do keep stock, price and filter scope truthful.
- Do reuse shared search, confirmations and feedback.
- Don't imply that page-local sorting represents the entire inventory.
- Don't hide errors in a transient toast or make core actions hover-only.
