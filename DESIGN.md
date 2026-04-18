# SquidCrawl Design System

## Aesthetic Direction: Dark Intelligence / AI Command Center

A sophisticated, powerful interface that positions SquidCrawl as the definitive command center for AI brand visibility monitoring. The aesthetic draws from high-end analytics dashboards, intelligence terminals, and modern cyber-security interfaces.

### Philosophy
- **Purpose**: Give brands complete visibility and control over their AI presence
- **Tone**: Professional, analytical, authoritative, cutting-edge
- **Differentiation**: Unlike generic SaaS, this feels like a powerful intelligence tool

---

## Color System

### Primary Palette
- **Background**: `#0a0a0f` (Deep void black)
- **Surface**: `#12121a` (Elevated panels)
- **Surface Highlight**: `#1a1a25` (Hover states)
- **Border**: `#2a2a3a` (Subtle definition)

### Accent Colors
- **Primary Accent**: `#6366f1` (Indigo - intelligence, trust)
- **Secondary Accent**: `#22d3ee` (Cyan - data, technology)
- **Tertiary Accent**: `#f59e0b` (Amber - warmth, action)

### Semantic Colors
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

### Text Colors
- **Primary**: `#fafafa` (Near white)
- **Secondary**: `#a1a1aa` (Muted zinc)
- **Tertiary**: `#71717a` (Deeper zinc)
- **Disabled**: `#52525b` (Dark zinc)

---

## Typography

### Font Families
- **Display/Headlines**: `Space Grotesk` - Geometric, modern, technical feel
- **Body**: `Inter` - Clean, highly readable
- **Mono/Numbers**: `JetBrains Mono` - Data, code, metrics

### Type Scale
- **Hero**: `clamp(3rem, 8vw, 6rem)` / 700 weight / -0.02em letter-spacing
- **H1**: `clamp(2rem, 5vw, 3.5rem)` / 600 weight
- **H2**: `clamp(1.5rem, 3vw, 2.5rem)` / 600 weight
- **H3**: `1.5rem` / 600 weight
- **Body Large**: `1.25rem` / 400 weight
- **Body**: `1rem` / 400 weight / 1.6 line-height
- **Small**: `0.875rem`
- **Tiny**: `0.75rem`

---

## Spacing System

### Section Spacing
- **Hero**: `py-24 lg:py-32`
- **Standard**: `py-16 lg:py-24`
- **Compact**: `py-12`

### Content Spacing
- **XXL**: `6rem` (96px)
- **XL**: `4rem` (64px)
- **L**: `3rem` (48px)
- **M**: `2rem` (32px)
- **S**: `1.5rem` (24px)
- **XS**: `1rem` (16px)
- **XXS**: `0.5rem` (8px)

---

## Components

### Buttons

#### Primary Button
```
- Background: gradient from #6366f1 to #4f46e5
- Border: 1px solid rgba(99, 102, 241, 0.3)
- Shadow: 0 0 20px rgba(99, 102, 241, 0.3)
- Hover: brightness increase, shadow intensify
- Text: white, font-medium
- Padding: 0.875rem 2rem
- Border-radius: 0.75rem
```

#### Secondary Button
```
- Background: transparent
- Border: 1px solid #3f3f46
- Hover: background #27272a
- Text: #fafafa
```

#### Ghost Button
```
- Background: transparent
- Hover: background rgba(255,255,255,0.05)
- Text: #a1a1aa
```

### Cards

#### Standard Card
```
- Background: #12121a
- Border: 1px solid #2a2a3a
- Border-radius: 1rem
- Shadow: subtle inner glow option
```

#### Feature Card
```
- Background: #12121a with gradient overlay
- Border: 1px solid #2a2a3a
- Left accent border: 3px solid primary
- Hover: border-color transitions to primary
```

### Inputs
```
- Background: #0a0a0f
- Border: 1px solid #3f3f46
- Border-radius: 0.75rem
- Focus: border-color #6366f1, ring shadow
- Placeholder: #52525b
```

---

## Visual Effects

### Gradients
- **Hero Background**: Radial gradient from #1a1a2e at top to #0a0a0f
- **Card Glow**: Linear gradient from transparent to rgba(99, 102, 241, 0.1)
- **Text Gradient**: Linear from #fafafa to #a1a1aa (for headlines)
- **Accent Gradient**: Linear from #6366f1 to #22d3ee

### Shadows
- **Card**: `0 4px 24px rgba(0, 0, 0, 0.4)`
- **Elevated**: `0 8px 32px rgba(0, 0, 0, 0.5)`
- **Glow (primary)**: `0 0 40px rgba(99, 102, 241, 0.4)`
- **Glow (cyan)**: `0 0 40px rgba(34, 211, 238, 0.3)`

### Animations
- **Page Load**: Staggered fade-in-up (0.6s ease-out)
- **Hover**: Subtle scale (1.02) and brightness
- **Pulse**: Subtle glow pulse on active elements
- **Scroll**: Parallax on hero elements

---

## Layout Patterns

### Hero Section
- Full viewport height option
- Asymmetric text alignment (left-aligned, not centered)
- Large typography with gradient text (subtle, not neon)
- Background: radial gradient + optional grid pattern
- CTA buttons: horizontal on desktop, stacked on mobile

### Feature Grid
- Bento-style grid layout (not uniform)
- Varied card sizes for visual interest
- Feature cards with left accent borders
- Hover reveals more info

### Pricing
- Side-by-side comparison (not 3-column grid)
- Featured plan highlighted with glow
- Clear visual hierarchy between tiers

---

## Anti-Patterns (Avoid)

- ❌ Purple-to-blue gradients (AI slop)
- ❌ Glassmorphism everywhere
- ❌ Centered text for everything
- ❌ Rounded rectangles with drop shadows
- ❌ Generic icon + heading + text cards
- ❌ Hero metrics with gradient text
- ❌ Neon accents on dark backgrounds
- ❌ System fonts only

---

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1280px

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Focus indicators: 2px solid primary color
- Reduced motion support: `prefers-reduced-motion`
- Keyboard navigation: All interactive elements
