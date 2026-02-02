# Styles and Themes Architecture - Patient Speak

## 1. Overview

This project uses **Tailwind CSS v4** with **Angular 19** and **PrimeNG 19**. The theming system supports light and dark modes with a unified design token approach.

### Key Files

| File | Purpose |
|------|---------|
| [src/styles.css](../src/styles.css) | Tailwind v4 configuration, theme variables, global styles |
| [src/styles.ts](../src/styles.ts) | PrimeNG theme presets |
| [src/app/services/theme.service.ts](../src/app/services/theme.service.ts) | Theme toggle logic |
| [src/app/app.config.ts](../src/app/app.config.ts) | PrimeNG theme provider configuration |

## 2. Architecture Diagram

```
                    User clicks theme toggle
                            |
                            v
                    ThemeService.toggleTheme()
                            |
                            v
            +---------------+---------------+
            |                               |
            v                               v
    Adds/removes class              Updates BehaviorSubject
    'app-dark' on <html>            (isDarkMode$)
            |                               |
            v                               v
    +-------+-------+               Components can
    |               |               subscribe to changes
    v               v
Tailwind CSS    PrimeNG
detects via     detects via
@custom-variant darkModeSelector
    |               |
    v               v
dark:* classes  DarkPreset
are applied     colors applied
```

## 3. Tailwind CSS v4 Configuration

### 3.1 No More tailwind.config.js

With Tailwind v4, configuration moved to CSS. The file `tailwind.config.js` is **no longer used**.

### 3.2 styles.css Structure

```css
/* 1. Imports */
@import "primeicons/primeicons.css";
@import "tailwindcss";
@plugin "tailwindcss-primeui";

/* 2. Dark mode selector - CRITICAL */
@custom-variant dark (&:where(.app-dark, .app-dark *));

/* 3. Theme variables */
@theme {
  --color-primary: #3b82f6;
  --color-surface-base: #ffffff;
  --color-surface-base-dark: #1a202e;
  /* ... more variables */
}

/* 4. Custom styles */
.page-body { ... }
```

### 3.3 The @custom-variant Directive

This is **critical** for dark mode to work:

```css
@custom-variant dark (&:where(.app-dark, .app-dark *));
```

This tells Tailwind: "When you see `dark:` prefix, apply those styles when the element or any ancestor has the class `.app-dark`".

**Without this line**, the `dark:` prefix would only respond to `@media (prefers-color-scheme: dark)` instead of our custom class.

## 4. Design Tokens

### 4.1 Token Naming Convention

All tokens follow the pattern: `--color-[category]-[name]-[variant]`

| Category | Purpose |
|----------|---------|
| `surface` | Background colors |
| `text` | Text colors |
| `border` | Border colors |
| `interactive` | Hover/active states |

### 4.2 Available Tokens

#### Surfaces

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `surface-base` | `#ffffff` | `#1a202e` | Main page background |
| `surface-elevated` | `#ffffff` | `#243447` | Sidebar, top-bar, cards |
| `surface-overlay` | `#f9fafb` | `#1a202e` | Footer, modals |

#### Text

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `text-primary` | `#111827` | `#e2e8f0` | Main text, headings |
| `text-secondary` | `#64748b` | `#94a3b8` | Descriptions |
| `text-muted` | `#94a3b8` | `#64748b` | Timestamps, hints |

#### Borders

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `border-default` | `#e2e8f0` | `#2d3748` | All borders |

#### Interactive

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `interactive-hover` | `#f3f4f6` | `#2d3748` | Hover backgrounds |
| `interactive-active` | `#dbeafe` | `rgba(59,130,246,0.15)` | Active/selected states |

### 4.3 How Tokens Become Classes

When you define `--color-surface-base` in `@theme`, Tailwind automatically generates:

- `bg-surface-base`
- `text-surface-base`
- `border-surface-base`
- etc.

## 5. Using the Design System

### 5.1 Basic Pattern

Always specify both light and dark variants:

```html
<div class="bg-surface-base dark:bg-surface-base-dark">
  <p class="text-text-primary dark:text-text-primary-dark">
    Content
  </p>
</div>
```

### 5.2 Component Examples

#### Page Container
```html
<div class="bg-surface-base dark:bg-surface-base-dark min-h-screen">
```

#### Card/Panel
```html
<div class="bg-surface-elevated dark:bg-surface-elevated-dark
            border border-border-default dark:border-border-default-dark
            rounded-lg p-6">
```

#### Navigation Link
```html
<a class="text-text-primary dark:text-text-primary-dark
          hover:bg-interactive-hover dark:hover:bg-interactive-hover-dark
          transition-colors">
```

#### Active Navigation Link (with routerLinkActive)
```html
<a routerLinkActive="bg-interactive-active dark:bg-interactive-active-dark"
   class="text-text-primary dark:text-text-primary-dark
          hover:bg-interactive-hover dark:hover:bg-interactive-hover-dark">
```

#### Footer
```html
<footer class="bg-surface-overlay dark:bg-surface-overlay-dark
               border-t border-border-default dark:border-border-default-dark
               text-text-muted dark:text-text-muted-dark">
```

### 5.3 Quick Reference Table

| Element | Light Classes | Dark Classes |
|---------|---------------|--------------|
| Page background | `bg-surface-base` | `dark:bg-surface-base-dark` |
| Card/sidebar/topbar | `bg-surface-elevated` | `dark:bg-surface-elevated-dark` |
| Footer/overlay | `bg-surface-overlay` | `dark:bg-surface-overlay-dark` |
| Main text | `text-text-primary` | `dark:text-text-primary-dark` |
| Secondary text | `text-text-secondary` | `dark:text-text-secondary-dark` |
| Muted text | `text-text-muted` | `dark:text-text-muted-dark` |
| Borders | `border-border-default` | `dark:border-border-default-dark` |
| Hover state | `hover:bg-interactive-hover` | `dark:hover:bg-interactive-hover-dark` |
| Active state | `bg-interactive-active` | `dark:bg-interactive-active-dark` |

## 6. Theme Service

### 6.1 How It Works

```typescript
// theme.service.ts
const CSS_CLASS = 'app-dark';

toggleTheme(): void {
  const next = !this.isDarkModeSubject.value;
  this.setDarkMode(next);
}

private setDarkMode(isDark: boolean): void {
  const html = document.documentElement;

  if (isDark) {
    html.classList.add(CSS_CLASS);  // <html class="app-dark">
  } else {
    html.classList.remove(CSS_CLASS);  // <html>
  }

  localStorage.setItem('prefers-dark-mode', String(isDark));
}
```

### 6.2 Using in Components

**Most components don't need to inject ThemeService**. Just use `dark:` classes in templates.

Only inject ThemeService if you need to:
- Show different icons based on theme
- Programmatically check current theme

```typescript
// Only if needed
constructor(private themeService: ThemeService) {}

ngOnInit() {
  this.themeService.isDarkMode$.subscribe(isDark => {
    // React to theme changes
  });
}
```

## 7. PrimeNG Integration

### 7.1 Configuration

In `app.config.ts`:

```typescript
providePrimeNG({
  theme: {
    preset: DarkPreset,
    options: {
      darkModeSelector: '.app-dark'  // Same class as ThemeService
    }
  }
})
```

### 7.2 DarkPreset (styles.ts)

The `DarkPreset` aligns PrimeNG component colors with our design tokens:

```typescript
export const DarkPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      dark: {
        background: '#1a202e',     // = surface-base-dark
        textColor: '#e2e8f0',      // = text-primary-dark
        surface: {
          '900': '#1a202e',        // = surface-base-dark
          '800': '#243447',        // = surface-elevated-dark
          '700': '#2d3748',        // = interactive-hover-dark
        },
      },
    },
  },
});
```

### 7.3 PrimeNG Components Auto-Adapt

PrimeNG components (p-card, p-button, p-table, etc.) automatically switch themes when `.app-dark` is present on `<html>`.

## 8. Adding New Design Tokens

### 8.1 Step-by-Step

1. **Add to styles.css @theme block**:

```css
@theme {
  /* Existing tokens... */

  /* New token */
  --color-status-success: #10b981;
  --color-status-success-dark: #34d399;
}
```

2. **Use in HTML**:

```html
<span class="text-status-success dark:text-status-success-dark">
  Success message
</span>
```

### 8.2 Naming Guidelines

- Use semantic names: `status-success` not `green-500`
- Include `-dark` suffix for dark mode variants
- Group related tokens together in comments

## 9. Adding New Components

### 9.1 Checklist

1. Use semantic token classes (not raw Tailwind colors)
2. Always provide both light and dark variants
3. Add `transition-colors` for smooth theme switches
4. Test in both light and dark modes

### 9.2 Template

```html
<div class="
  bg-surface-elevated dark:bg-surface-elevated-dark
  border border-border-default dark:border-border-default-dark
  text-text-primary dark:text-text-primary-dark
  rounded-lg p-4
  transition-colors duration-200
">
  <h3 class="text-text-primary dark:text-text-primary-dark font-semibold">
    Title
  </h3>
  <p class="text-text-secondary dark:text-text-secondary-dark mt-2">
    Description
  </p>
</div>
```

## 10. Common Mistakes to Avoid

### 10.1 Using Raw Tailwind Colors

```html
<!-- Avoid -->
<div class="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">

<!-- Prefer -->
<div class="bg-surface-base dark:bg-surface-base-dark text-text-primary dark:text-text-primary-dark">
```

### 10.2 Forgetting Dark Variants

```html
<!-- Wrong: Will look bad in dark mode -->
<div class="bg-surface-elevated text-text-primary">

<!-- Correct -->
<div class="bg-surface-elevated dark:bg-surface-elevated-dark text-text-primary dark:text-text-primary-dark">
```

### 10.3 Modifying ThemeService CSS_CLASS

The class name `app-dark` is used in three places that must stay synchronized:
1. `theme.service.ts` - `CSS_CLASS = 'app-dark'`
2. `styles.css` - `@custom-variant dark (&:where(.app-dark, .app-dark *))`
3. `app.config.ts` - `darkModeSelector: '.app-dark'`

If you change it in one place, change it in all three.

## 11. Troubleshooting

### 11.1 Dark Mode Not Working

**Symptoms**: `dark:` classes have no effect

**Check**:
1. Is `@custom-variant dark (&:where(.app-dark, .app-dark *));` in styles.css?
2. Is ThemeService adding `app-dark` class to `<html>`? (Inspect in DevTools)
3. Restart `ng serve` after changing styles.css

### 11.2 PrimeNG Components Not Theming

**Symptoms**: PrimeNG components stay in light mode

**Check**:
1. Is `darkModeSelector: '.app-dark'` in app.config.ts?
2. Is `DarkPreset` imported and used?

### 11.3 New Token Not Working

**Symptoms**: Class like `bg-my-new-token` doesn't apply

**Check**:
1. Is it defined in `@theme { }` block with `--color-` prefix?
2. Did you save styles.css?
3. Hard refresh browser (Ctrl+Shift+R)

### 11.4 VSCode Shows Warning on @custom-variant

The warning "Unknown at rule @custom-variant" is a **false positive** from VSCode's CSS linter. Tailwind v4 supports this directive. The build will work correctly.

## 12. Color Values Reference

### Light Mode Palette

```
Surface Base:       #ffffff (white)
Surface Elevated:   #ffffff (white)
Surface Overlay:    #f9fafb (gray-50)

Text Primary:       #111827 (gray-900)
Text Secondary:     #64748b (slate-500)
Text Muted:         #94a3b8 (slate-400)

Border:             #e2e8f0 (slate-200)

Interactive Hover:  #f3f4f6 (gray-100)
Interactive Active: #dbeafe (blue-100)
```

### Dark Mode Palette

```
Surface Base:       #1a202e (custom dark blue)
Surface Elevated:   #243447 (custom elevated)
Surface Overlay:    #1a202e (same as base)

Text Primary:       #e2e8f0 (slate-200)
Text Secondary:     #94a3b8 (slate-400)
Text Muted:         #64748b (slate-500)

Border:             #2d3748 (custom border)

Interactive Hover:  #2d3748 (custom)
Interactive Active: rgba(59, 130, 246, 0.15) (blue with opacity)
```

## 13. Summary

| Concept | Implementation |
|---------|----------------|
| Dark mode trigger | Class `.app-dark` on `<html>` |
| Tailwind detection | `@custom-variant dark` in styles.css |
| PrimeNG detection | `darkModeSelector: '.app-dark'` in app.config.ts |
| Theme toggle | ThemeService.toggleTheme() |
| Persistence | localStorage key `prefers-dark-mode` |
| Design tokens | CSS variables in `@theme` block |
| Usage pattern | `class-name dark:class-name-dark` |
