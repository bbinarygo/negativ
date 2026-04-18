# Writing Error Messages

The four rules every error message must follow in Negativ.

---

## Rule 1: Say what happened {#rule-1-say-what-happened}

Bad: "Something went wrong."
Good: "We couldn't save your changes."

Users need to know what failed. Be specific about the operation, not the system.

## Rule 2: Say why (if it helps) {#rule-2-say-why}

Bad: "Payment failed."
Good: "Your payment was declined. This can happen when card details are incorrect or funds are unavailable."

Only include the reason if it helps the user fix the problem. Don't expose internal errors.

## Rule 3: Say what to do next {#rule-3-recovery-action}

Every error must include a recovery action — even if the only action is "try again."

Bad: "Network error."
Good: "It looks like you're offline. Check your connection and try again."

Recovery actions:
- Should be specific: "Go back to the sign-in page" not "Try again"
- Should use imperative verbs: "Check", "Update", "Contact"
- Should never blame the user: "Your connection" not "You disconnected"

## Rule 4: Match the severity {#rule-4-match-severity}

| Severity | When to use | Tone |
|---|---|---|
| `info` | Something the user should know, but doesn't block them | Calm, neutral |
| `warning` | Something that may become a problem | Cautious, helpful |
| `error` | Something that blocks the user from completing their task | Clear, actionable, never alarming |

---

## Anti-Patterns

| Anti-pattern | Why it's bad | Fix |
|---|---|---|
| "Error 500" | Meaningless to users | "Something went wrong on our end" |
| "Invalid input" | Doesn't say which field or why | "Please enter a valid email address" |
| "You must be logged in" | Blame-shifting | "Please sign in to continue" |
| "An unexpected error occurred" | Adds fear, no recovery path | "We couldn't load this page. Try refreshing." |
| All-caps error text | Creates panic | Use sentence case |
| Error modals for minor issues | Interrupts flow unnecessarily | Use inline errors for form validation |

---

## Tone Checklist

Before shipping an error message, ask:
- [ ] Does it say what happened?
- [ ] Does it give a next step?
- [ ] Is it calm (no panic words like "failed", "crashed", "broken")?
- [ ] Does it avoid blaming the user?
- [ ] Is it 1-2 sentences max?
- [ ] Does it work in all languages (no idioms, no wordplay)?
