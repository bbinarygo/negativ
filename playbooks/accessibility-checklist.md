# Accessibility Checklist for Error States

Error states require extra care for accessibility. Users who rely on screen readers, keyboard navigation, or high contrast modes are most likely to struggle when something goes wrong.

---

## ARIA Requirements

Every error message must have:

```html
role="alert"           <!-- announces immediately to screen readers -->
aria-live="polite"     <!-- for most errors: waits for current speech to finish -->
aria-live="assertive"  <!-- for blocking/critical errors: interrupts immediately -->
```

Use `assertive` only for errors that completely block the user (network offline, server down).
Use `polite` for everything else (validation errors, warnings).

## Focus Management

When an error appears:

1. **Inline validation errors** — focus stays on the field. The error is announced via `aria-describedby` linking the field to the error message.

   ```html
   <input id="email" aria-describedby="email-error" aria-invalid="true" />
   <p id="email-error" role="alert">Please enter a valid email address.</p>
   ```

2. **Full-page errors** — move focus to the error heading so screen readers announce it immediately.

   ```javascript
   errorHeading.focus(); // after rendering the error page
   ```

3. **Modal errors** — trap focus inside the modal. Return focus to the trigger element when dismissed.

## Color + Contrast

- Never use color alone to indicate an error. Always pair with an icon or text label.
- Error text must meet WCAG AA contrast: at minimum 4.5:1 against its background.
- Provide a high-contrast variant for all error screens (see `screens/patterns/`).

## Icon Usage

- Use `aria-hidden="true"` on decorative error icons.
- For meaningful icons (the only indicator of state), add `aria-label`.

```html
<!-- Decorative: hidden from screen readers -->
<svg aria-hidden="true">...</svg>

<!-- Meaningful: announced -->
<svg aria-label="Error" role="img">...</svg>
```

## Keyboard Navigation

- All CTAs in error states (retry, go home, contact support) must be reachable via `Tab`.
- Retry buttons must trigger the same action as clicking.
- Dismiss buttons must close the error and return focus correctly.

## Testing Checklist

Before shipping any error screen:

- [ ] Tested with VoiceOver (macOS/iOS) or NVDA (Windows)
- [ ] Error announced immediately on appear
- [ ] Focus moves to error heading on full-page errors
- [ ] CTA button reachable via keyboard
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Error readable without color (icon + text label present)
- [ ] RTL layout tested for Arabic/Hebrew if localized
