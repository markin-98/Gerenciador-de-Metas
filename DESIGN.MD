---
name: Tranquil Progress
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414844'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#727973'
  outline-variant: '#c1c8c2'
  surface-tint: '#446554'
  primary: '#416352'
  on-primary: '#ffffff'
  primary-container: '#5a7c6a'
  on-primary-container: '#f5fff7'
  inverse-primary: '#aacfba'
  secondary: '#5e5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdb'
  on-secondary-container: '#63635f'
  tertiary: '#565e5a'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e7672'
  on-tertiary-container: '#f7fef9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6ebd5'
  primary-fixed-dim: '#aacfba'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#2c4d3d'
  secondary-fixed: '#e4e2dd'
  secondary-fixed-dim: '#c8c6c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#474744'
  tertiary-fixed: '#dce4df'
  tertiary-fixed-dim: '#c0c8c3'
  on-tertiary-fixed: '#161d1a'
  on-tertiary-fixed-variant: '#414845'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm-mobile:
    fontFamily: Literata
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 48px
---

## Brand & Style

This design system centers on a **Human-Centric Minimalism** philosophy, specifically tailored for collaborative financial goal setting. The emotional objective is to replace the typical anxiety of financial management with a sense of calm, steady progress.

The aesthetic blends digital precision with a **Tactile / Paper-like** quality. By utilizing generous white space and a soft color palette, the UI avoids overwhelming the user. Interaction patterns should feel deliberate and grounded, mimicking the satisfying experience of marking a physical ledger or paper checklist.

## Colors

The palette is rooted in nature-inspired neutrals to foster a tranquil environment.

*   **Primary (Sage Green):** Used for progress indicators, success states, and primary actions. It represents growth and the completion of goals.
*   **Secondary (Warm White):** The foundational surface color. It provides a "paper" feel that is easier on the eyes than pure white.
*   **Tertiary (Soft Clay):** Used for subtle UI elements, inactive states, or secondary progress bars.
*   **Neutral (Charcoal Grey):** Reserved for high-readability text and icons, ensuring accessibility without the harshness of pure black.

Avoid high-vibrancy alerts; use tonal shifts in the primary or soft amber for warnings to maintain the "tranquil" brand promise.

## Typography

The typography system uses a pairing of a modern serif and a clean sans-serif to balance "human/literary" warmth with "functional/digital" clarity.

*   **Headlines (Literata):** Used for goal titles and financial totals. Its serif structure provides an authoritative yet comfortable feel. (Note: *Literata* is used as the closest available match to the requested modern serif style).
*   **Body & UI (Inter):** Used for all functional text, data inputs, and collaborative comments. It ensures maximum legibility at small sizes on mobile devices.

Use tight letter-spacing for large displays to maintain a sophisticated look, and increased line-height for body text to promote a relaxed reading pace.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous safe areas to prevent visual clutter.

*   **Mobile:** 4-column grid with 24px side margins. Elements should mostly stack vertically to emphasize the linear progress of goals.
*   **Desktop/PWA:** 12-column grid with a max-width of 1100px to keep financial data within a comfortable eye-span. 
*   **Rhythm:** Use the 8px base unit religiously. Padding inside cards should be a minimum of 24px (`stack-lg`) to maintain the "airy" minimalist feel.

Negative space is considered a functional element in this design system; do not crowd the UI with secondary information.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and very soft, ambient shadows.

1.  **Base Layer:** The "Secondary" warm white color serves as the background.
2.  **Card Layer:** Goals and financial metrics sit on white cards with a very subtle 1px border (`#EAE7E0`) and a diffused, low-opacity shadow (4% opacity charcoal) to create a "paper on paper" effect.
3.  **Active Elements:** Floating Action Buttons (FABs) or active modal states use a slightly higher elevation with a tint of the Primary color in the shadow to indicate interactability.

Avoid heavy blurs or glassmorphism to stay true to the tactile, paper-like narrative.

## Shapes

The shape language is consistently soft and welcoming.

*   **Standard Containers:** Use a 12px to 16px corner radius (`rounded-lg` or `rounded-xl`).
*   **Deposit Grid:** Buttons and icons within financial grids should be **Circular** to represent coins or tokens, reinforcing the "deposit" metaphor.
*   **Inputs:** Use the 12px radius to match the cards.

The lack of sharp corners reduces visual tension and reinforces the "tranquil" brand personality.

## Components

### Elevated Cards
The primary container for goals. Cards should feature a clear "Progress Bar" at the bottom. The transition of the bar should be slow (300ms+) and ease-in-out to feel rhythmic rather than mechanical.

### Circular Buttons
Used specifically for quick-action financial increments (e.g., "+$10", "+$50"). These should have a subtle "pressed" state that feels like pushing a physical button into a soft surface.

### Input Fields
Minimalist styling. Use a bottom-border only or a very light-tinted fill. Focus states should transition the border color to the Primary Sage Green smoothly.

### Progress Bars
Thick, rounded tracks. The background of the track should be a very pale version of the primary color, while the active progress is the solid Primary Sage.

### Collaboration Chips
Small, rounded-pill avatars or labels indicating who contributed to a goal. These should be unobtrusive, appearing in a row with slight overlaps to show the "shared" nature of the goal.