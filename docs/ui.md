# Shubh Samay — UI / Design System

## Theme
- Built with Tailwind CSS v4 CSS variables (oklch color space)
- Dark mode via `class` strategy (next-themes)
- Three modes: Light, Dark, System (default: System)

## Color palette (Light)
| Token | Value | Description |
|-------|-------|-------------|
| `--background` | oklch(0.985 0.012 65) | Warm ivory |
| `--foreground` | oklch(0.27 0.03 30) | Deep warm brown |
| `--primary` | oklch(0.62 0.16 35) | Warm coral / terracotta |
| `--secondary` | oklch(0.95 0.025 55) | Soft peach tint |
| `--accent` | oklch(0.86 0.11 75) | Soft gold |
| `--radius` | 1rem | Large border radius |

## Color palette (Dark)
| Token | Value | Description |
|-------|-------|-------------|
| `--background` | oklch(0.18 0.018 35) | Warm charcoal |
| `--foreground` | oklch(0.96 0.012 60) | Warm cream |
| `--primary` | oklch(0.74 0.17 38) | Bright coral |
| `--accent` | oklch(0.55 0.1 70) | Muted gold |

## Background image
- Warm dawn-style gradient mesh with 3 radial gradients
- Different oklch values for light vs dark mode (radial gradients at corners)
- Fixed attachment, min-height 100vh

## Fonts
- Primary: **Bahnschrift** (Windows system font, DIN 1451 style)
- Fallback: **Saira** (Google Font, loaded via next/font) for non-Windows
- Cascade: `"Bahnschrift", var(--font-saira), "DIN Alternate", "Segoe UI", system-ui, sans-serif`

## Shadcn/ui style
- "New York" style (components.json)
- `baseColor: "neutral"` with CSS variables override
- 48+ shadcn/ui components available

## Tier color coding (panchang / results)
- **Highly Auspicious**: Green (good)
- **Auspicious**: Yellow / amber (mixed/average)
- **Good**: Blue
- **Avoid**: Red (bad)
- Tiles use green/yellow/blue border colors matching tier

## Animations
- `glowPulse` — subtle glow animation on top-tier cards
- `fadeUp` — smooth fade-in for results
- Custom scrollbar (`fancy-scroll`) — thin 6px coral thumb

## Layout
- `min-h-screen flex flex-col` — footer sticks to bottom
- Max width 672px (max-w-2xl) centered on desktop
- Header: sticky, backdrop-blur, with logo + location + settings
- 4-step wizard: Event → Methods → Dates → Results (step progress dots)
