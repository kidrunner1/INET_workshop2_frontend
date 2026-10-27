# ShopFlow UX Contract

## Product context and authoritative evidence

Thai-language storefront and admin tool; target WCAG 2.2 AA. Existing source is
implementation evidence, not proof of complete accessibility compliance.
Backend source reviewed on 2026-10-26 in `C:/src/INET_Workshop1`:

| Scope                            | Source                                                                     | UI consequence                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Products, pagination, deletion   | `src/controllers/product.controller.js`                                    | Search/category/page/limit; latest-first server ordering; empty totalPages can be zero; delete is permanent |
| Field validation                 | `src/validations/request.schemas.js`                                       | Product limits mirrored by `product-validation.ts`; server remains authoritative                            |
| Permissions and sessions         | `src/middlewares/auth.middleware.js`, `src/controllers/auth.controller.js` | Protected routes, admin actions; current API uses 401 for both invalid session and admin denial             |
| Approval                         | `src/controllers/user.controller.js`                                       | Explicit admin confirmation before allowing a pending user to sign in                                       |
| Orders                           | `src/controllers/adminOrder.controller.js`                                 | Server owns stock and order transitions; no new transitions introduced                                      |
| Routing/configuration            | `src/app.js`, `src/server.js`                                              | `/api/v1`, default port 3000                                                                                |
| Payments/legal/privacy retention | No maintained policy supplied                                              | No new payment, legal or retention behavior inferred                                                        |

## Visual contract

Catalog category/sort and admin product category/stock controls share `AppIconSelect.vue`. User-requested icons on
every option require an owned combobox/listbox popup. Icons are decorative and
aria-hidden; visible labels and the sorting scope hint remain. Arrow/Home/End/Page
keys navigate, typing matches labels, Enter/Space/Tab commit, and Escape/outside
click cancel. DOM focus stays on the trigger with aria-activedescendant; keyboard
navigation scrolls the active option into view. The menu opens above when space
below is limited and scrolls within its height. Resize closes it; listeners are
removed on unmount. Forced-colors mode outlines the active option. Implementation
reference: [WAI-ARIA select-only combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/).
No automated or browser tests were run, per user preference.

See `DESIGN.md`. Runtime ownership is Tailwind + `src/assets/main.css`; one light
theme, Thai labels and native selects outside the shared icon filter menus. No custom date picker or
table selection capability is introduced.

## Canonical UI Map

| Capability     | Canonical owner                                                                    | Source of truth                 | Allowed variants                 | Verification                      |
| -------------- | ---------------------------------------------------------------------------------- | ------------------------------- | -------------------------------- | --------------------------------- |
| Select/Listbox | `AppIconSelect.vue` for storefront/admin product filters; native selects elsewhere | DESIGN.md + current user request | shared icon combobox; native      | manual check pending; no tests run |
| Form           | `ProductForm.vue`, `product-validation.ts`; existing auth handlers                 | Backend schemas + this contract | create/edit/auth                 | unit + browser validation         |
| Scrollbar      | `src/assets/main.css`                                                              | DESIGN.md                       | global; geometry exceptions only | browser computed style            |
| Toast          | `toast.store.ts`, `AppToast.vue`                                                   | this contract                   | success/info/error               | browser live regions              |
| CRUD           | product/user services, `ProductsView.vue`, `UsersView.vue`, `AppConfirmDialog.vue` | Backend controllers             | pessimistic mutation             | browser success/failure fixtures  |
| Search         | `AppSearchField.vue`                                                               | this contract                   | 300ms remote / immediate local   | debounce, clear, IME, stale tests |

## Dataset navigation

- Catalog query source of truth is the URL: committed search, category, page,
  limit and page-local sort. Typing is a separate draft; chips describe committed values.
- Page sizes 12/24/48. Search/category/size reset to page 1. Page values are
  validated; empty API results display zero records on logical page 1. Out-of-range
  pages replace the URL with the last valid page and reload.
- Latest-first pagination is server-owned. Other ordering applies only to the current
  page and is labelled accordingly. Do not pretend to support a server sort parameter.
- Product links/back links carry list state. Browser Back/Forward restores query state.
- Distinguish loading, failed request with retry, empty inventory and no search results.
- Legacy admin lists are not fully migrated: products still load at most 100 records,
  users/orders are unpaginated server responses. This is a tracked gap, not the desired contract.

## Flow ledger

| Operation                 | Pending                         | Success                                              | Failure                                 | Focus                            |
| ------------------------- | ------------------------------- | ---------------------------------------------------- | --------------------------------------- | -------------------------------- |
| Create/edit product       | disabled form/actions           | close inline form, refresh list, shared toast        | retain form/values and persistent error | list heading                     |
| Delete product            | modal locked while request runs | close after server confirmation, refresh list, toast | modal stays open with error/retry       | original trigger or list heading |
| Approve user              | modal locked while request runs | replace returned user, close modal, toast            | modal stays open with error/retry       | trigger or list heading          |
| Search                    | stable loading region           | render count and grid                                | retry current URL query                 | keep input focus                 |
| Cancel dirty product form | discard dialog                  | discard or continue editing                          | no mutation                             | original control                 |

## Navigation and overlays

Router owns localized document titles and page scrolling. Unknown paths show an
app-owned 404 with a safe destination. Login returns to a validated known protected
route, preserving its query; role guards still apply. Current admin rejection redirects
to products; a dedicated 403 flow is a future task.

Use `AppConfirmDialog` for destructive/approval/discard decisions. Name the object
and consequence; focus cancel first; preserve errors until retry/cancel. Its native
modal top layer makes the background inert and traps focus. Toasts never replace
critical inline errors. The original cart confirmation is the sibling reference.

## Validation and resilience

Product forms own validation with novalidate, associated text errors, first-invalid
focus and duplicate protection. No password data or draft product values are persisted
by this change. In-app navigation/cancel asks before discarding changed product data;
actual unload uses the browser's beforeunload mechanism. Product switching is disabled
while the inline editor is open.

Catalog requests use AbortController plus a request-generation check. Clear/submit
cancel debounce, IME composition suppresses dispatch, and unmount cancels pending work.
Mutations are pessimistic and never auto-retried. A network timeout can leave a write's
outcome uncertain: server idempotency support is still needed for guaranteed recovery.
Do not add a blanket 401 logout interceptor while the backend conflates permission denial
with expired authentication. Cross-tab session handling remains a tracked task.

## Registration profiles

New signups require first/last name (1–80 characters each), email (up to 254),
username (3–50), and a confirmed password (at least 8 characters; at most 72 UTF-8
bytes for the existing bcrypt implementation). Phone is optional, normalized to
8–15 digits with an optional leading plus. Email is trimmed/lowercased and protected
by a partial unique database index; documents without email remain valid. Names
and contact fields remain optional on stored legacy accounts and response types.
Only new registration requires them. Login still uses username and the approval rule.

The server applies validated body transformations before calling controllers,
whitelists registration fields, and fixes new accounts to user/pending. Validation
and duplicate errors map to inline fields; failed submissions retain values, focus
the first invalid input, and never store form drafts/passwords in localStorage.
Submission disables form controls. Admin users can see/search names, email and
phone; list/approval/login responses explicitly omit passwords. Approval preserves
profile fields and timestamps. Email verification, email login, password recovery,
and editing existing profiles are not implemented by this change.
No test/build/lint/browser verification was run; manual verification remains pending.

## Catalog access

Opening `/` lands on `/products` for guests and signed-in users alike. The shared
header exposes Login for guests on both desktop and mobile. Logout and 404 recovery
return to Products. Login provides a visible back-to-browsing action above the form;
when entered from a product, customer login success and that back action preserve
its internal URL and catalog query. Admin login always lands on `/admin/users`,
taking precedence over any return URL. Cancelling login does not require authentication.

`/products` and `/products/:id` are public, including the corresponding GET APIs.
Only cart, orders and administration routes require authentication. Guests see a
login link instead of a signed-in identity; the shared layout does not fetch their
cart. Add-to-cart sends guests to login and returns customers to the same product
after successful authentication. Login/register preserve the internal return path, and
offer a route back to browsing. Returning does not automatically mutate the cart.
Account approval remains required by the existing login API. Product writes and
image uploads remain admin-only. No automated verification was run for this change.

## Product images

Admin create/edit accepts one still JPG, PNG or WebP up to 5 MiB, with a local
preview and an optional existing URL. Selection is part of the unsaved draft;
upload begins only on Save. Progress reflects transferred bytes and switches to
an indeterminate processing state while the server prepares the image. Upload
cancellation retains the file and all form values. Failed uploads can be retried
with Save; a successful upload followed by a failed product save reuses its URL.
Preview object URLs are revoked on replacement/unmount. Removing a reference
does not delete files from storage. Backend decoding and admin authorization are
authoritative. This feature has not been runtime-tested per user preference.

## Verification and migration

User preference (2026-10-26): do not run tests, build, or lint automatically during
development. The user will check changes manually; run those commands only when
explicitly requested. The CI workflow is manual-only (`workflow_dispatch`).

Optional checks: `npm run test`, `npm run test:e2e`, `npm run lint:check`, `npm run type-check`,
`npm run build` and formatter checks for changed files. Playwright uses synthetic API
responses matching the inspected source, never real customer data. This verifies UI
behavior, not MongoDB integration or backend authorization. Desktop + 390px phone,
keyboard, reduced motion, empty/error, stale responses and mutation retry are covered.
The strict premium audit is static evidence only. See `docs/DEVELOPMENT.md` for gaps
and implementation priorities.
