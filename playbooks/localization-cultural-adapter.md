---
persona: global
---
# Localization & Cultural Adapter Playbook

**Tone rules + cultural notes for negative UX messages.**

**Core Tone (all languages):** Helpful, calm, actionable, never blaming the user.

---

## Vietnamese (vi-VN)

### Address & Formality

Vietnamese has two levels of user address in UI copy:

| Context | Preferred form | Avoid |
|---------|---------------|-------|
| Web UI (default) | `Quý khách` | `bạn` (too casual for error states) |
| Formal / banking / health | `Kính thưa Quý khách` | `bạn`, `anh/chị` without context |
| SMS / push notification | `Bạn` is acceptable | `Kính thưa` (too long for notifications) |

**Rule:** Always prefer `Quý khách` in web UI error messages. Use `Kính thưa Quý khách` only for high-severity errors (payment failures, account suspension).

### Soft Negation Patterns

Direct negation (`không thể`) feels abrupt and blaming in Vietnamese. Prefer `chưa thể` (not yet able) + a reason clause.

| Pattern | Example | Notes |
|---------|---------|-------|
| ❌ Hard negation | `Hệ thống không thể xử lý yêu cầu.` | Sounds like a wall |
| ✅ Soft negation | `Hệ thống chưa thể xử lý yêu cầu lúc này.` | "not yet" implies recovery |
| ✅ With reason | `Chưa thể thực hiện do kết nối bị gián đoạn.` | Explains, doesn't blame |

### Recovery Phrasing by Error Category

**Auth errors** (NEG-401, NEG-403):

```
Quý khách vui lòng kiểm tra lại thông tin đăng nhập và thử lại.
```
*(Please check your login information and try again.)*

**Payment errors** (NEG-402, NEG-402-payment-\*):

```
Giao dịch chưa thể hoàn tất lúc này. Quý khách vui lòng thử lại sau ít phút hoặc liên hệ ngân hàng phát hành thẻ.
```
*(Transaction could not be completed right now. Please try again in a few minutes or contact your card issuer.)*

**Validation errors** (NEG-400, NEG-422):

```
Thông tin Quý khách nhập chưa đúng định dạng yêu cầu. Vui lòng kiểm tra lại trường được đánh dấu.
```
*(The information you entered is not in the required format. Please review the highlighted field.)*

### SMS / Push Notification Context

Notifications are shorter and less formal. Use `Bạn` instead of `Quý khách`. Keep to one sentence.

| Error type | Web UI | SMS/Push |
|-----------|--------|----------|
| Auth failure | `Quý khách vui lòng đăng nhập lại.` | `Bạn cần đăng nhập lại để tiếp tục.` |
| Payment failed | `Giao dịch chưa thể hoàn tất. Vui lòng thử lại.` | `Thanh toán thất bại. Thử lại ngay.` |
| Validation | `Vui lòng kiểm tra lại thông tin đã nhập.` | `Thông tin chưa hợp lệ. Kiểm tra lại nhé.` |

---

## Expansion needed

Arabic (right-to-left + politeness levels), Spanish (formal vs informal by region), French (tutoyer vs vouvoyer), Japanese (keigo levels). See CONTRIBUTING.md for how to add cultural notes.

**How to contribute:** Add cultural notes + message variants → PR updates `llm-context.json`.
