# AutoAPI — UI Theme Reference (Tailwind)

Use this as the source of truth when generating new components. Stack: React + Tailwind, dark mode via `dark:` class strategy.

## Backgrounds

| Surface | Light | Dark |
| --- | --- | --- |
| Page background | `bg-white` | `dark:bg-gray-900` |
| Card / panel | `bg-white` | `dark:bg-gray-800` |
| Card header / muted panel | `bg-gray-50` | `dark:bg-gray-900/50` |
| Input / field / chip bg | `bg-gray-100` | `dark:bg-gray-700` |
| Code block bg | `bg-gray-50` | `dark:bg-gray-900/70` |

## Text

| Role | Light | Dark |
| --- | --- | --- |
| Heading / primary text | `text-gray-900` | `dark:text-gray-100` |
| Body / paragraph text | `text-gray-600` | `dark:text-gray-300` |
| Secondary label (tabs, code text) | `text-gray-700` | `dark:text-gray-300` |
| Muted / placeholder text | `text-gray-500` | `dark:text-gray-400` |
| Strong label on light chip | `text-gray-800` | `dark:text-gray-200` |

## Brand Gradient (logo, headline accent, primary CTA)

`bg-linear-to-r from-blue-600 to-purple-600`

- Used as text gradient: add `bg-clip-text text-transparent`
- Used as button fill: apply directly as background, `text-white`

## Buttons

| Type | Classes |
| --- | --- |
| Primary | `bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-xl` |
| Secondary / outline | `border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800` |
| Icon / toggle button | `bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700` |

## Links / Nav

- Default: inherits body text color
- Hover: `hover:text-blue-600 dark:hover:text-blue-400`
- Active tab: `text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400`
- Inactive tab: `text-gray-500 dark:text-gray-400`

## Borders

- Default card/section border: `border-gray-200 dark:border-gray-700`
- Input border: `border-gray-200 dark:border-gray-600`

## Status / Semantic Colors

| Meaning | Classes |
| --- | --- |
| Success (e.g. 200 OK) | `bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300` |
| Info / GET method | `bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300` |
| Neutral pill | `bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200` |
| Window dots (decorative) | `bg-red-400`, `bg-yellow-400`, `bg-green-400` |

## Shape / Elevation

- Cards: `rounded-2xl shadow-2xl`
- Buttons / inputs / small panels: `rounded-lg` or `rounded-md`
- Hover elevation: `hover:shadow-xl`
- Transitions: `transition-colors duration-300` (theme toggle), `transition-all duration-200` (buttons)

## Logo

- Light UI: `autoapi-web-logo.svg` (blue → violet → magenta gradient wordmark)
- Dark UI: `autoapi-web-logo-dark.svg` (brighter gradient variant)
- Favicon/app icon: `autoapi-favicon.svg` — gradient "A" mark
