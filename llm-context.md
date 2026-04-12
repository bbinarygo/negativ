# Negativ Error Code Registry — LLM Context Pack
_Generated: 2026-04-12T03:43:00.471Z · 22 codes · 6 languages · Source: https://github.com/bbinarygo/negativ_

## Error Codes (22)

| Code | Category | HTTP | Severity | Title |
|------|----------|------|----------|-------|
| NEG-400-validation-format | validation | 400 | error | Invalid Format |
| NEG-400-validation-length | validation | 400 | error | Input Too Long |
| NEG-400-validation-required | validation | 400 | error | Required Field Missing |
| NEG-422-validation-conflict | validation | 422 | error | Conflicting Input |
| NEG-401-auth-session-expired | auth | 401 | warning | Session Expired |
| NEG-401-auth-unauthorized | auth | 401 | error | Sign in Required |
| NEG-403-permission-forbidden | permission | 403 | error | Access Denied |
| NEG-403-permission-read-only | permission | 403 | info | Read-Only Access |
| NEG-404-resource-not-found | resource | 404 | error | Not Found |
| NEG-409-resource-conflict | resource | 409 | error | Already Exists |
| NEG-410-resource-deleted | resource | 410 | error | No Longer Available |
| NEG-408-timeout | timeout | 408 | warning | Request Timed Out |
| NEG-504-timeout-gateway | timeout | 504 | error | Gateway Timeout |
| NEG-429-rate-limit | rate-limit | 429 | warning | Too Many Requests |
| NEG-429-rate-limit-daily | rate-limit | 429 | warning | Daily Limit Reached |
| NEG-500-server-internal | server | 500 | error | Something Went Wrong |
| NEG-502-server-bad-gateway | server | 502 | error | Service Unavailable |
| NEG-503-server-unavailable | server | 503 | warning | Down for Maintenance |
| NEG-000-network-offline | network | — | warning | No Internet Connection |
| NEG-000-network-slow | network | — | warning | Slow Connection |
| NEG-402-payment-declined | payment | 402 | error | Payment Declined |
| NEG-402-payment-expired | payment | 402 | error | Card Expired |

### NEG-400-validation-format — Invalid Format
- **Description:** The entered value does not match the expected format.
- **Recovery:** Correct the format and submit again.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "Please enter a valid {field} (e.g. email@example.com)."
  - es: "Por favor ingresa un {field} válido (ej. email@ejemplo.com)."
  - fr: "Veuillez entrer un {field} valide (ex. email@exemple.com)."
  - zh: "请输入有效的{field}（例如：email@example.com）。"
  - ar: "يرجى إدخال {field} صحيح (مثال: email@example.com)."
  - vi: "Vui lòng nhập {field} hợp lệ (ví dụ: email@example.com)."

### NEG-400-validation-length — Input Too Long
- **Description:** The submitted value exceeds the maximum allowed length.
- **Recovery:** Shorten your input to meet the character limit.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "This field is too long. Please use {maxLength} characters or fewer."
  - fr: "Ce champ est trop long. Utilisez {maxLength} caractères ou moins."
  - zh: "此字段过长，请使用{maxLength}个字符或更少。"
  - ar: "هذا الحقل طويل جداً. يرجى استخدام {maxLength} حرف أو أقل."
  - vi: "Trường này quá dài. Vui lòng sử dụng tối đa {maxLength} ký tự."

### NEG-400-validation-required — Required Field Missing
- **Description:** One or more required fields were not provided.
- **Recovery:** Complete the highlighted fields and try again.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "Please fill in the required field{count, plural, one {} other {s}}."
  - es: "Por favor completa {count, plural, one {el campo obligatorio} other {los campos obligatorios}}."
  - fr: "Veuillez remplir le{count, plural, one {s} other {}} champ{count, plural, one {} other {s}} obligatoire{count, plural, one {} other {s}}."
  - zh: "请填写必填字段。"
  - ar: "يرجى ملء الحقل المطلوب."
  - vi: "Vui lòng điền vào trường bắt buộc."

### NEG-422-validation-conflict — Conflicting Input
- **Description:** The submitted value conflicts with an existing entry.
- **Recovery:** Use a different value that doesn't conflict with existing entries.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "This value conflicts with an existing entry. Please use a different one."
  - fr: "Cette valeur est en conflit avec une entrée existante. Veuillez en choisir une autre."
  - zh: "此值与现有条目冲突，请使用不同的值。"
  - ar: "هذه القيمة تتعارض مع إدخال موجود. يرجى استخدام قيمة مختلفة."
  - vi: "Giá trị này xung đột với một mục đã tồn tại. Vui lòng sử dụng giá trị khác."

### NEG-401-auth-session-expired — Session Expired
- **Description:** The user's session token has expired and they need to re-authenticate.
- **Recovery:** Sign in again to continue.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "Your session has expired. Please sign in again."
  - fr: "Votre session a expiré. Veuillez vous reconnecter."
  - zh: "您的会话已过期，请重新登录。"
  - ar: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مجدداً."
  - vi: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."

### NEG-401-auth-unauthorized — Sign in Required
- **Description:** You need to be signed in to access this resource.
- **Recovery:** Go to the sign-in page or refresh the session.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "Please sign in to continue."
  - es: "Por favor inicia sesión para continuar."
  - fr: "Veuillez vous connecter pour continuer."
  - zh: "请登录后继续。"
  - ar: "يرجى تسجيل الدخول للمتابعة."
  - vi: "Vui lòng đăng nhập để tiếp tục."

### NEG-403-permission-forbidden — Access Denied
- **Description:** You do not have permission to perform this action.
- **Recovery:** Contact your administrator or check your account permissions.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "Sorry, you don't have access to this feature."
  - es: "Lo sentimos, no tienes acceso a esta función."
  - fr: "Désolé, vous n'avez pas accès à cette fonctionnalité."
  - zh: "抱歉，您无权访问此功能。"
  - ar: "عذراً، ليس لديك صلاحية الوصول إلى هذه الميزة."
  - vi: "Xin lỗi, bạn không có quyền truy cập tính năng này."

### NEG-403-permission-read-only — Read-Only Access
- **Description:** The user can view but not modify this resource.
- **Recovery:** Contact your administrator to request edit access.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=status, aria-live=polite
- **Messages:**
  - en: "You have read-only access and cannot make changes here."
  - fr: "Vous avez un accès en lecture seule et ne pouvez pas effectuer de modifications."
  - zh: "您只有只读权限，无法进行更改。"
  - ar: "لديك صلاحية القراءة فقط ولا يمكنك إجراء تغييرات."
  - vi: "Bạn chỉ có quyền xem và không thể thực hiện thay đổi."

### NEG-404-resource-not-found — Not Found
- **Description:** The requested resource could not be located.
- **Recovery:** Check the URL or go back to the homepage.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "We couldn't find what you were looking for."
  - es: "No pudimos encontrar lo que buscabas."
  - fr: "Nous n'avons pas trouvé ce que vous cherchiez."
  - zh: "我们找不到您要找的内容。"
  - ar: "لم نتمكن من العثور على ما تبحث عنه."
  - vi: "Chúng tôi không tìm thấy nội dung bạn yêu cầu."

### NEG-409-resource-conflict — Already Exists
- **Description:** The resource being created conflicts with an existing one.
- **Recovery:** Use a different name or identifier.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "This already exists. Please use a different name or identifier."
  - fr: "Cela existe déjà. Veuillez utiliser un autre nom ou identifiant."
  - zh: "此内容已存在，请使用不同的名称或标识符。"
  - ar: "هذا العنصر موجود بالفعل. يرجى استخدام اسم أو معرّف مختلف."
  - vi: "Nội dung này đã tồn tại. Vui lòng sử dụng tên hoặc mã định danh khác."

### NEG-410-resource-deleted — No Longer Available
- **Description:** The resource existed but has been permanently deleted.
- **Recovery:** Go back or search for an alternative.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "This item is no longer available."
  - fr: "Cet élément n'est plus disponible."
  - zh: "此项目已不再可用。"
  - ar: "هذا العنصر لم يعد متاحاً."
  - vi: "Mục này không còn khả dụng."

### NEG-408-timeout — Request Timed Out
- **Description:** The server took too long to respond.
- **Recovery:** Wait a moment and retry.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "The request took too long. Please try again."
  - es: "La solicitud tardó demasiado. Inténtalo de nuevo."
  - fr: "La requête a pris trop de temps. Veuillez réessayer."
  - zh: "请求时间过长，请重试。"
  - ar: "استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى."
  - vi: "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại."

### NEG-504-timeout-gateway — Gateway Timeout
- **Description:** An upstream service did not respond in time.
- **Recovery:** Wait a moment and try again.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "A upstream service is taking too long to respond. Please try again shortly."
  - fr: "Un service en amont met trop de temps à répondre. Veuillez réessayer dans un moment."
  - zh: "上游服务响应超时，请稍后重试。"
  - ar: "يستغرق أحد الخدمات وقتاً طويلاً للاستجابة. يرجى المحاولة مجدداً قريباً."
  - vi: "Một dịch vụ upstream đang phản hồi quá chậm. Vui lòng thử lại sau."

### NEG-429-rate-limit — Too Many Requests
- **Description:** You have exceeded the allowed number of requests.
- **Recovery:** Wait until the rate limit resets.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "Please wait a few moments before trying again."
  - es: "Por favor espera unos momentos antes de intentarlo de nuevo."
  - fr: "Veuillez attendre quelques instants avant de réessayer."
  - zh: "请稍等片刻后再试。"
  - ar: "يرجى الانتظار قليلاً قبل المحاولة مرة أخرى."
  - vi: "Vui lòng chờ một lúc trước khi thử lại."

### NEG-429-rate-limit-daily — Daily Limit Reached
- **Description:** The user has exhausted their daily quota.
- **Recovery:** Come back tomorrow or upgrade your plan.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "You've reached today's limit. Come back tomorrow."
  - fr: "Vous avez atteint la limite quotidienne. Revenez demain."
  - zh: "您已达到今日限额，请明天再来。"
  - ar: "لقد وصلت إلى حدك اليومي. عد غداً."
  - vi: "Bạn đã đạt giới hạn hôm nay. Hãy quay lại vào ngày mai."

### NEG-500-server-internal — Something Went Wrong
- **Description:** An unexpected server error occurred.
- **Recovery:** Try again in a few moments or contact support.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "We're sorry, something went wrong on our end."
  - es: "Lo sentimos, algo salió mal de nuestro lado."
  - fr: "Désolé, une erreur s'est produite de notre côté."
  - zh: "很抱歉，我们这边出了问题。"
  - ar: "عذراً، حدث خطأ من جانبنا."
  - vi: "Xin lỗi, đã xảy ra lỗi từ phía chúng tôi."

### NEG-502-server-bad-gateway — Service Unavailable
- **Description:** The server received an invalid response from an upstream service.
- **Recovery:** Try again in a few minutes.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "One of our services is currently unavailable. We're looking into it."
  - fr: "L'un de nos services est actuellement indisponible. Nous nous en occupons."
  - zh: "我们的某个服务目前不可用，我们正在处理中。"
  - ar: "أحد خدماتنا غير متاح حالياً. نحن نعمل على حل المشكلة."
  - vi: "Một trong các dịch vụ của chúng tôi hiện không khả dụng. Chúng tôi đang xử lý."

### NEG-503-server-unavailable — Down for Maintenance
- **Description:** The service is temporarily unavailable due to planned maintenance.
- **Recovery:** We'll be back shortly. Check our status page for updates.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "We're down for scheduled maintenance. We'll be back shortly."
  - fr: "Nous sommes en maintenance planifiée. Nous serons de retour sous peu."
  - zh: "我们正在进行计划维护，即将恢复。"
  - ar: "نحن في وضع الصيانة المجدولة. سنعود قريباً."
  - vi: "Hệ thống đang bảo trì theo lịch. Chúng tôi sẽ sớm trở lại."

### NEG-000-network-offline — No Internet Connection
- **Description:** Your device appears to be offline.
- **Recovery:** Connect to the internet and refresh.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "It looks like you're offline. Check your connection."
  - es: "Parece que estás sin conexión. Revisa tu conexión."
  - fr: "Vous semblez être hors ligne. Vérifiez votre connexion."
  - zh: "您似乎已离线，请检查您的网络连接。"
  - ar: "يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك."
  - vi: "Có vẻ bạn đang ngoại tuyến. Hãy kiểm tra kết nối mạng."

### NEG-000-network-slow — Slow Connection
- **Description:** The user's network is connected but too slow to complete the request.
- **Recovery:** Move closer to your router or switch to a better network.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=status, aria-live=polite
- **Messages:**
  - en: "Your connection is slow. This may take longer than usual."
  - fr: "Votre connexion est lente. Cela peut prendre plus de temps que d'habitude."
  - zh: "您的网络连接较慢，可能需要更长时间。"
  - ar: "اتصالك بطيء. قد يستغرق هذا وقتاً أطول من المعتاد."
  - vi: "Kết nối của bạn đang chậm. Quá trình này có thể mất nhiều thời gian hơn bình thường."

### NEG-402-payment-declined — Payment Declined
- **Description:** Your payment method was declined by the provider.
- **Recovery:** Update your payment details or try a different card.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=assertive
- **Messages:**
  - en: "Your payment was declined. Please try another method."
  - es: "Tu pago fue rechazado. Intenta con otro método."
  - fr: "Votre paiement a été refusé. Veuillez essayer avec une autre méthode."
  - zh: "您的付款被拒绝，请尝试其他付款方式。"
  - ar: "تم رفض دفعتك. يرجى تجربة طريقة دفع أخرى."
  - vi: "Thanh toán của bạn bị từ chối. Vui lòng thử phương thức khác."

### NEG-402-payment-expired — Card Expired
- **Description:** The payment card used has passed its expiration date.
- **Recovery:** Update your payment details with a valid card.
- **Platforms:** web, mobile, tablet
- **Accessibility:** role=alert, aria-live=polite
- **Messages:**
  - en: "Your card has expired. Please update your payment details."
  - fr: "Votre carte a expiré. Veuillez mettre à jour vos informations de paiement."
  - zh: "您的银行卡已过期，请更新您的付款信息。"
  - ar: "انتهت صلاحية بطاقتك. يرجى تحديث بيانات الدفع الخاصة بك."
  - vi: "Thẻ của bạn đã hết hạn. Vui lòng cập nhật thông tin thanh toán."

## Customer Journeys (4)

### Authentication Failure → Recovery Flow
Negative journey when a user fails to authenticate (wrong credentials, locked account).

**Steps:**
1. Trigger: Auth API returns 401 → Screen: `NEG-401-auth-unauthorized` → User action: Retry or initiate password reset
2. Trigger: Too many failed attempts → 429 → Screen: `NEG-429-rate-limit-exceeded` → User action: Wait for cooldown period
3. Trigger: User requests password reset → Screen: `Password reset confirmation (success state)` → User action: Check email

**Error codes involved:** NEG-401-auth-unauthorized, NEG-429-rate-limit-exceeded, NEG-000-network-offline

### Payment Failed → Recovery Flow
Complete negative journey when payment is declined (NEG-402 + related codes)

**Steps:**
1. Trigger: Payment returns 402 → Screen: `NEG-402-payment-declined` → User action: Choose recovery option
2. Trigger: User updates card → Screen: `NEG-400-validation-format (if invalid)` → User action: Retry
3. Trigger: Still fails → Screen: `NEG-500-server-internal or support` → User action: Escalate

**Error codes involved:** 

### Session Expiry → Re-authentication Flow
Negative journey when a user's session token expires mid-usage.

**Steps:**
1. Trigger: API call returns 401 with session-expired code → Screen: `NEG-401-auth-session-expired` → User action: Sign in again or dismiss
2. Trigger: User re-authenticates successfully → Screen: `Return to original page/action` → User action: Resume task
3. Trigger: Re-authentication fails → Screen: `NEG-401-auth-unauthorized` → User action: Retry or contact support

**Error codes involved:** NEG-401-auth-session-expired, NEG-401-auth-unauthorized, NEG-000-network-offline

### Form Validation Failed → Recovery Flow
Typical negative journey for form errors (NEG-400-validation-required + NEG-400-validation-format)

**Steps:**
1. Trigger: Backend returns 400 → Screen: `NEG-400-validation-required or NEG-400-validation-format` → User action: Correct fields
2. Trigger: User fixes issues → Screen: `Inline error messages` → User action: Submit again

**Error codes involved:** 

## Playbooks

- [`Accessibility Checklist`](playbooks/accessibility-checklist.md)
- [`Localization Tone Guide`](playbooks/localization-tone-guide.md)
- [`Writing Error Messages`](playbooks/writing-error-messages.md)
