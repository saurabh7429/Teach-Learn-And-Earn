# Teach, Learn & Earn — End-to-End QA Audit Report

**Audit date:** 30 August 2026 (IST)  
**Environment:** Frontend `http://localhost:5173`; backend `http://localhost:5000`  
**Application type:** MERN-style peer-to-peer skill exchange with Groq/Teach Devta AI  
**Audit role:** Functional QA, UX, frontend, backend/API, accessibility, responsive, performance, and basic security review

## Executive verdict

The application is a promising functional prototype with a coherent learner/teacher concept and a working authenticated happy path. The main workflow was exercised successfully with a synthetic QA account: account creation, login, skill creation, AI-generated assessment, skill verification, AI tutor interaction, learning-request enhancement and posting, requests-feed review, profile/progress review, and logout.

It is **not production-ready yet**. The highest release risks are permissive credentialed CORS, a missing password-recovery flow, incomplete keyboard/screen-reader support for core controls and dialogs, malformed-JSON errors returning HTTP 500 with parser details, and several misleading or unfinished navigation/legal affordances. The application is best characterized as **feature-complete enough for controlled staging evaluation, but not ready for an unrestricted public release**.

**Overall rating: 6.0 / 10**

## Test boundary, account, and safety

- A synthetic QA account was created using an `example.test` address. The account identifier and password are intentionally not reproduced here.
- The account was logged out at the end of the authenticated pass.
- Synthetic records left in that account: one teaching skill (`QA Synthetic Algorithms 2026`) and one open learning request (`QA Algorithms`).
- No existing user records were deleted or modified.
- An existing student request was visible in the teaching feed; the `Offer to Teach` action was deliberately not submitted because it would affect another user.
- No real email or message was sent.
- No password, token, or secret is included in this report.

### Important limitations

1. No backend source repository was attached. The API inventory is based on the frontend client and safe black-box requests; hidden backend-only routes cannot be ruled out.
2. The browser tab API did not expose console logs, so this report does not claim that the console is error-free.
3. Direct viewport resizing was unavailable (`strawberry.setViewport` was not a supported function). Responsive results below combine source/CSS inspection with the observed desktop layouts; the exact 320/375/425/768/1366/1920 visual states still need device-level verification.
4. A valid chat session could not be created safely without submitting an offer to another user's request. Chat behavior was therefore source-confirmed and invalid-route tested, but not end-to-end live-tested.
5. Account deletion and complete test-data cleanup were not available as an observed UI workflow.

# 1. Application overview and complete structure map

## Route map

| Route | Access | Component/workflow | Observed result |
|---|---|---|---|
| `/` | Public/authenticated | Home or authenticated dashboard | Works; guest and authenticated states render |
| `/login` | Guest only | Login form | Works for validation and invalid credentials |
| `/signup` | Guest only | Account registration form | Synthetic registration succeeded |
| `/learn` | Authenticated | Search, AI tutor, learning requests, active sessions | Works in authenticated account |
| `/teach` | Authenticated | Teaching skills, assessment, student/request feed | Works; skill assessment verified synthetic skill |
| `/requests` | Authenticated | My Learning Requests / Open Teaching Feed tabs | Works; synthetic request appeared |
| `/progress` | Authenticated | Learning/teaching metrics and portfolio | Works after async data loads |
| `/profile` | Authenticated | Profile, statistics, portfolios, quick actions, logout | Works; logout succeeded |
| `/chat/:id` | Authenticated | Live session chat | Invalid ID redirects to `/learn`; valid session blocked by safe-test boundary |
| `/settings` | Not defined | Expected settings entry point | Falls through wildcard to `/`; no settings route observed |
| `*` | Any | Wildcard fallback | Redirects to `/` |

## Navigation structure

### Guest navigation

- Logo/brand block → `/`
- Home → `/`
- Learn → `/learn` and then protected-route redirect to `/login`
- Teach → `/teach` and then protected-route redirect to `/login`
- Login → `/login`
- Sign Up → `/signup`
- Hero `Get Started Free` → `/signup`
- Hero `Sign In to Workspace` → `/login`
- Learn/Teach pathway cards → `/signup`
- Popular-skill chips → `/signup`
- Teach Devta AI launcher → global AI drawer
- Theme toggle → dark/light mode; persistence was observed through local storage

### Authenticated navigation

- Home → `/`
- Learn → `/learn`
- Teach → `/teach`
- Progress → `/progress`
- Requests → `/requests`
- Notification bell → `/requests`
- Profile avatar/name → `/profile`
- Teach Devta AI launcher → global AI drawer
- Theme toggle → dark/light mode
- Logout from Profile → confirmation, token clearing, navigation to `/login`; successfully tested

## Component and interaction inventory

### Global/navbar components

- Logo/brand block
- Desktop navigation links
- Responsive hamburger/mobile navigation
- Teach Devta AI icon button
- Theme icon button
- Notifications icon button with badge
- Guest Login and Sign Up buttons
- Authenticated profile trigger

### Home

- Hero heading and supporting copy
- Primary and secondary CTA buttons
- Popular-skill chip buttons
- Learn pathway card and CTA
- Teach pathway card and CTA
- Teach Devta explainer and AI CTA
- Authenticated dashboard cards for learning, teaching, requests, and active sessions

### Login

- Username-or-email input
- Password input
- Remember-me checkbox
- Submit button
- Create Account link
- Forgot password link
- Inline authentication error state

### Signup

- Full Name input
- Username input
- Email Address input
- Password input
- Confirm Password input
- Terms/Privacy checkbox
- Terms of Service link
- Registration submit button
- Sign In link

### Learn

- Search field
- Ask Teach Devta / Ask Now actions
- AI tutor modal, required question field, loading/answer state, Copy Text control
- Create Learning Request actions
- Learning-request modal: question, related skill, details, AI Enhance Request, Post Learning Request
- Request cards, active-session cards, detail/offer navigation, Open Learning Chat when a valid session exists

### Teach

- Add Teaching Skill / Add New Skill / first-skill actions
- Add-skill modal with skill name and experience/description
- Verification Guide action
- Skill cards
- Take Quiz flow with dynamic questions, answer options, next/submit, pass/fail result
- Skill removal control and confirmation prompt
- Student/request modal with Open Chat, Offer to Teach, Browse All Requests

### Requests

- My Learning Requests tab
- Open Teaching Feed tab
- Request status/details/teacher response presentation
- Accept-offer action when offers exist
- Go to Session action for accepted requests
- Add More Teaching Skills empty-state action

### Progress

- Skills Learning metric
- Skills Teaching metric
- Active Students metric
- Messages Exchanged metric
- Learning journey section
- Teaching portfolio section
- New Learning Request and Manage Skills actions

### Profile

- Identity/username display
- Membership and Teach Devta certification badges
- Statistics
- Learning and teaching portfolios
- Manage Skills, New Request, My Requests, Find a Teacher, Teach a Skill actions
- Logout confirmation flow

### Chat (source-confirmed; live valid session blocked)

- Back button
- Message textarea
- Send control
- Enter to send / Shift+Enter for newline behavior
- Mark Session Complete action with confirmation
- Locked/closed-session messaging state
- Socket.IO events: `join_chat`, `leave_chat`, `new_message`, `session_completed`

# 2. Testing summary and pass/fail matrix

| Area | Result | Evidence/notes |
|---|---|---|
| Public route reachability | Pass with defects | All declared public routes reached; wildcard behavior observed |
| Guest-to-auth entry | Pass | Login/signup CTAs route correctly |
| Required-field validation | Pass | Native browser validation triggered on empty login/signup fields |
| Invalid email validation | Pass | Signup rejected malformed email client-side |
| Invalid credentials | Pass | Inline `Invalid email or password`; remained on login |
| Synthetic signup/login | Pass | QA account created and authenticated |
| Logout | Pass | Token cleared and app navigated to `/login` |
| Theme toggle | Pass | Dark/light toggle worked and persisted |
| Skill creation | Pass | Synthetic teaching skill created |
| Teach Devta quiz | Pass | Three-question assessment completed; result `2/3`, marked passed, skill verified |
| AI tutor | Pass | Synthetic question submitted and answer rendered |
| Learning-request validation | Pass | Empty question gated submission; AI enhancement worked |
| Learning-request creation | Pass | Synthetic request posted and appeared in `/requests` |
| Requests tabs/feed | Pass with safety block | Own request visible; existing student request visible; offer deliberately not submitted |
| Profile/progress | Pass with async UX concern | Correct data appeared after initial loading delay |
| Valid chat | Blocked | No safe way to establish a valid session without affecting another user |
| Password recovery | Fail | Link is `href="#"`; no recovery page or visible recovery state |
| Terms/Privacy access | Fail | Terms link is `href="#"`; no legal content or separate privacy link |
| Settings | Fail/absent | `/settings` is not a defined route |
| Responsive visual verification | Partial | CSS/source inspected; exact viewport emulation unavailable |
| Console errors | Not verifiable | Console capture unavailable |
| API authentication gates | Pass | Protected endpoints returned 401 without/with invalid token |
| API malformed JSON handling | Fail | Returned 500 and parser internals |
| API CORS policy | Fail/high risk | Arbitrary origin reflected with credentials enabled |

# 3. Critical and high-priority bugs

## H-01 — Credentialed CORS accepts arbitrary origins

**Severity:** High / security release blocker  
**Area:** Backend/API security  
**Observed:** Requests from `http://localhost:5173` and a foreign origin such as `http://evil.example` both received a reflected `access-control-allow-origin` value and `access-control-allow-credentials: true`. A foreign preflight allowed common methods and `authorization`/`content-type` headers.

**Why it matters:** If authentication or other sensitive browser-managed credentials use cookies in the future—or if deployment configuration differs from the local Bearer-token path—an arbitrary origin may be able to make credentialed cross-origin requests. Even with the current token model, the policy is broader than necessary and creates a dangerous production default.

**Reproduction:** Send an OPTIONS or authenticated-capable CORS request to `http://localhost:5000` with `Origin: http://evil.example` and inspect the response headers.

**Recommended fix:** Replace reflective `origin: true` behavior with an explicit allowlist of trusted frontend origins per environment. Keep credentials disabled unless required. Add automated tests for approved and rejected origins, including preflight behavior.

## H-02 — Password recovery is not implemented

**Severity:** High  
**Area:** Authentication / account recovery  
**Location:** `/login`, `Forgot password?`

**Observed:** Clicking `Forgot password?` did not open a recovery form or route. The anchor uses `href="#"`; the observed navigation returned to the home context rather than starting recovery.

**Impact:** Users who forget credentials have no supported recovery path. This is a core account-lifecycle gap and can cause avoidable support burden or account lockout.

**Recommended fix:** Implement `/forgot-password` and reset-token flows, or remove the affordance until the feature exists. Add tests for unknown email, rate limiting, expired token, used token, password confirmation, and successful login with the new password. Never reveal whether an email exists.

## H-03 — Core modals are not keyboard- or screen-reader-safe

**Severity:** High accessibility  
**Area:** AI tutor and learning-request modals; shared Modal component

**Observed:** Modal containers lacked `role="dialog"`, `aria-modal="true"`, and an accessible label reference. Focus stayed on the triggering background button instead of moving into the dialog. Background controls were not made inert and no focus trap was observed. Escape did not close the learning-request modal; only the visible close control worked.

**Impact:** Keyboard and assistive-technology users can lose context, interact with hidden background controls, or become trapped outside the active task.

**Recommended fix:** Add dialog semantics and `aria-labelledby`/`aria-describedby`, move focus to the first meaningful control, trap focus within the modal, close on Escape, restore focus to the trigger, and make the background inert while open. Add automated keyboard tests.

## H-04 — Primary controls are implemented as non-semantic clickable divs

**Severity:** High accessibility  
**Area:** Navbar logo and authenticated profile trigger

**Observed:** `.navbar-logo` and `.profile-btn` are clickable `<div>` elements without `role`, `tabindex`, or keyboard handlers.

**Impact:** Mouse users can navigate, but keyboard users may not reach or activate these controls. This is a core global-navigation defect.

**Recommended fix:** Use `<a href="/">` for the logo and a semantic `<button>` or link for the profile trigger. Preserve visible focus and test activation with Enter and Space.

## H-05 — Forms rely on placeholders instead of associated labels

**Severity:** High accessibility  
**Area:** `/login`, `/signup`, `/learn`, AI modal, Chat

**Observed:** Username/email, password, registration fields, Learn search, AI question, and chat message controls lacked explicit associated `<label>` elements. Placeholder text was doing the labeling work.

**Impact:** Screen readers may announce controls without reliable names; placeholder text disappears while typing and is insufficient as a durable label.

**Recommended fix:** Add visible labels or visually-hidden labels with `for`/`id` associations. Use `aria-describedby` for field guidance and error text. Add accessible-name assertions to the test suite.

## H-06 — Malformed JSON produces HTTP 500 and leaks parser details

**Severity:** High/Major  
**Area:** Express error handling

**Observed:** Sending malformed JSON such as `{bad json` to auth/request endpoints returned HTTP 500 with a response containing the parser message: `Expected property name or '}' in JSON...`.

**Impact:** Client syntax errors are reported as server failures, monitoring becomes noisy, and implementation details are exposed to callers.

**Recommended fix:** Add JSON parse-error middleware that returns a sanitized HTTP 400 response with a stable error code/message. Keep stack/parser details server-side only. Add malformed-body tests for every JSON endpoint.

# 4. Functional issues and incomplete workflows

## Medium — Signup agreement may not be enforced

The Terms checkbox was checked by default and did not expose a native `required` indicator. A fully valid submission with the box unchecked was not completed because it could create an additional account; therefore this is a confirmed implementation risk, not a fully reproduced bypass. The product must either require an explicit unchecked-to-checked consent action or clearly document the intended default.

**Fix:** Add `required`, reject unchecked submission server-side, and persist consent version/timestamp. Test both client and API enforcement.

## Medium — Terms of Service and Privacy Policy are non-functional

On `/signup`, Terms of Service uses `href="#"`, and Privacy Policy is plain text rather than a separate link. There is no accessible legal-content route.

**Fix:** Provide versioned `/terms` and `/privacy` pages, open them without losing form state, and record the consent version at registration.

## Medium — API failures can look like empty data

Several pages convert failed fetches into empty arrays or silently catch errors. A temporary API failure can therefore appear as “0 skills,” “no requests,” or an empty feed. During the audit, profile/teach/progress initially displayed zero-like values before asynchronous data populated.

**Fix:** Distinguish loading, empty, error, and retry states. Show a non-destructive error banner and preserve the last known data where appropriate. Add tests for 401, 403, 404, 429, 500, timeout, and malformed response cases.

## Low/Medium — Notifications are misleading

The notification badge is hard-coded to `3`. The bell routes to `/requests` rather than opening a notification list, and the displayed count did not correspond to a populated notification view.

**Fix:** Either implement a real notification model/read state or remove the badge until data exists. Do not display a fabricated unread count.

## Low — Settings is absent

`/settings` falls through to the wildcard route and returns to `/`. No settings workflow was observed.

**Fix:** Add settings only when supported, or remove/avoid implying a settings destination. At minimum, provide account/security preferences, theme, and session controls if the product intends to expose them.

## Low — Auth pages have no home/back affordance

The navbar is intentionally hidden on auth pages, but there is no obvious home/back control. Users who arrive directly at `/login` or `/signup` must rely on browser navigation or submit-flow links.

**Fix:** Add a compact brand link or back-to-home action with accessible name.

## Blocked — Offer/accept/chat lifecycle not completed

The teaching feed exposed an existing student request and an offer action. It was not clicked because it would create a real cross-user state change. Consequently offer submission, selection, session creation, live Socket.IO messaging, and completion remain unverified in a safe single-account run.

**Recommended test setup:** Seed two dedicated QA accounts and deterministic fixtures in staging. Verify offer creation, student selection, chat creation, messaging, session completion, authorization boundaries, duplicate submission behavior, and cleanup.

# 5. UI issues

1. The hard-coded notification count undermines trust.
2. Standalone auth screens visually match the brand but sacrifice global navigation and recovery discoverability.
3. Child actions inside some dashboard cards rely on click bubbling from a clickable parent. They route in the observed path, but semantic independent controls are more robust and easier to test.
4. Loading states are not consistently visible; initial zero values can be mistaken for real empty metrics.
5. Error feedback is not consistently announced or visually standardized across authentication, AI, request, and data-loading states.
6. No full empty/error/loading matrix was available for every data card because some states require backend failures or second-user fixtures.

# 6. UX improvements

## Make account recovery and legal consent trustworthy

**Current issue:** Recovery and legal links appear interactive but do nothing.  
**Why it matters:** Users interpret these as promises of support and legal transparency. Broken affordances are worse than absent affordances.  
**Recommended change:** Add real recovery and legal routes, preserve registration form state when opening legal pages, and state the consent version near the checkbox.

## Clarify the learner/teacher starting choice

**Current issue:** The landing page offers multiple CTAs, popular-skill chips, and two pathway cards that all converge on signup for guests.  
**Why it matters:** A new user may not know whether to learn first, teach first, or create a general account.  
**Recommended change:** Keep one primary “Create account” action and make “Learn” and “Teach” secondary intent paths that carry the selected interest into onboarding.

## Replace fabricated notifications with meaningful activity

**Current issue:** Badge `3` does not map to an observable notification list.  
**Why it matters:** It creates false urgency and makes the app feel unfinished.  
**Recommended change:** Show real unread events such as offer received, offer accepted, session message, or assessment result; support read/unread state and empty state.

## Make data loading explicit

**Current issue:** Async metrics and lists can briefly show zero/empty values.  
**Why it matters:** Users may conclude their data was deleted or never saved.  
**Recommended change:** Use skeletons or “Loading…” labels, then clearly distinguish “No requests yet” from “Couldn’t load requests — Retry.”

## Make AI actions explain state and limits

**Current issue:** AI tutor and AI enhancement work, but the interaction should clarify loading, failure, copy success, and any usage limits.  
**Why it matters:** AI responses are asynchronous and users need confidence that a request was accepted and completed.  
**Recommended change:** Add a live status message, retry action, copied confirmation, and an explicit note that AI-generated content should be reviewed.

# 7. Responsive-design audit

## Observed/source-confirmed responsive behavior

- At widths up to the observed desktop sizes, no page-level horizontal overflow was observed on Home, Learn, Teach, Requests, Progress, or Profile.
- At `≤1024px`, logo text hides, navigation spacing contracts, and card minimum widths reduce.
- At `≤768px`, desktop nav is replaced by a mobile menu, cards become single-column, page headers stack, tabs wrap, the AI drawer becomes full-width, and chat/profile layouts stack.
- At `≤480px`, theme/notification controls shrink to approximately 34px, modal padding reduces, the AI launcher is hidden, and chat/profile layouts become tighter.
- Chat CSS stacks its header and exposes a full-width mobile session-completion action.

## Responsive risks needing direct device verification

1. Exact 320/375/425/768 behavior was not visually emulated because viewport resizing was unavailable.
2. At very narrow widths the navbar AI launcher is hidden, while the mobile drawer contains Home/Learn/Teach/Progress/Requests. Users may lose access to the global AI entry point on Learn, Teach, Requests, Progress, and Profile.
3. Several controls are approximately 33–42px high, below the preferred 44px touch target. This is especially relevant in the mobile navbar, tabs, small buttons, and chat back control.
4. Wrapped tabs and modal content should be checked for awkward multi-line labels, clipped close controls, and keyboard order at 320px.

## Recommended responsive test matrix

Run Playwright/Cypress or real-device checks at exactly 320, 375, 425, 768, 1366, and 1920px, asserting `scrollWidth <= clientWidth`, no clipped text, no overlap, visible focus, reachable menu items, and touch targets. Include landscape mobile and browser zoom at 200%.

# 8. Accessibility findings

## Confirmed issues

- No `<main>` landmark was observed on Home, Learn, Teach, Requests, Progress, Profile, Login, or Signup.
- Logo and profile trigger are non-semantic clickable divs.
- Modals lack dialog semantics, focus transfer, focus trap, Escape close, and background inertness.
- Core fields lack explicit labels: login, signup, Learn search, AI modal, and chat.
- Auth errors are plain divs without `role="alert"`/`aria-live`.
- AI dynamic messages and loading state lack live-region semantics.
- Notification, chat back, and chat send controls depend on title/glyphs instead of explicit accessible labels; theme and AI buttons did have explicit labels.
- Many small controls are below 44×44px.

## Positive observations

- Native focus outlines were visible on sampled navigation/buttons.
- The Remember me and terms checkboxes had associated labels.
- No `<img>` elements were observed in the sampled pages, so no missing image-alt defect was identified in this pass.
- Sampled dark/light text combinations appeared to have strong contrast, but every gradient, badge, hover, disabled, and error state still needs systematic contrast testing.

## Recommended acceptance criteria

Use axe-core plus keyboard-only tests. Require one main landmark, a unique page heading, accessible names for every control, no placeholder-only labels, correct dialog behavior, announced async states, visible focus at 200% zoom, and contrast checks for normal text, large text, borders, badges, hover, disabled, and error states.

# 9. Performance observations and suggestions

## Observed

- Local unauthenticated API calls were generally fast after warm-up. Example safe samples: protected GET endpoints had sub-10ms median latency locally; first root/API or Socket.IO handshake calls were slower, approximately 150ms in cold-start samples.
- Profile/Teach/Progress showed a short asynchronous gap before seeded data appeared.
- No bundle-size report, production build profile, Core Web Vitals run, database explain plan, or sustained-load test was available from the black-box environment.

## Recommendations

1. Measure production builds with Lighthouse and React Profiler; record LCP, INP, CLS, JS transfer, hydration, and long tasks.
2. Lazy-load authenticated route bundles and the AI drawer/quiz modal if not needed on first paint.
3. Cache or deduplicate repeated profile/skills/progress requests; cancel stale fetches on unmount.
4. Add pagination or cursor-based loading for requests, skills, chats, and messages rather than assuming small collections.
5. Add indexes for user ownership/status/skill matching and inspect MongoDB query plans for `/api/requests/*`, `/api/skills/*`, and chat history.
6. Enforce request body limits, rate limits, timeouts, and retry/backoff for AI endpoints.
7. Use consistent loading skeletons so the initial data gap is intentional rather than visually empty.
8. Optimize any future avatars/attachments with size limits, responsive formats, lazy loading, and server-side validation.

# 10. Security basic audit

## Confirmed or strongly evidenced concerns

### CORS policy — High
See H-01. Explicit allowlist required; credentialed arbitrary-origin reflection is unsafe.

### Security headers — Medium
Sampled JSON responses exposed `X-Powered-By: Express` and did not consistently include CSP, `X-Content-Type-Options`, HSTS, `X-Frame-Options`, or `Referrer-Policy`. Some 404 HTML responses did include CSP and `nosniff`, so header behavior is inconsistent.

**Fix:** Add Helmet or equivalent deliberate headers at the backend edge, remove `X-Powered-By`, configure CSP for the actual frontend/Socket.IO/AI needs, set `Referrer-Policy`, `frame-ancestors`/frame protection, `nosniff`, and HSTS only when served over HTTPS.

### Error information disclosure — High
Malformed JSON exposed parser details and returned 500. Sanitize errors and centralize error handling.

### Authentication boundary — Pass for tested cases
Protected routes returned 401 without a token and with an invalid Bearer token. This confirms a basic gate, not complete authorization correctness.

## Not fully verified and should be tested before release

- Per-resource authorization: users must not read or mutate another user’s skills, requests, chats, progress, or offers by changing an ID.
- JWT expiry, rotation, revocation, refresh behavior, and session invalidation after logout.
- Rate limiting and brute-force protection on login/register/AI endpoints.
- Password hashing and password policy from backend configuration.
- NoSQL injection resistance in search/filter/identifier inputs.
- Stored/reflected XSS in skill names, request questions/details, chat messages, profile values, and AI output.
- Upload MIME/content validation, size limits, filename handling, and storage isolation if files are enabled later.
- CSRF protection if cookies are introduced.
- Secret management and production CORS/Socket.IO origin configuration.
- Duplicate registration and race conditions for username/email/skills/requests.

The current audit did not exploit any vulnerability; these are release verification items and not claims that each untested issue exists.

# 11. Backend/API inventory observed from the frontend client

| Method | Endpoint |
|---|---|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |
| GET | `/api/skills` |
| GET | `/api/skills/mine` |
| POST | `/api/skills` |
| PUT | `/api/skills/:id/verify` |
| DELETE | `/api/skills/:id` |
| POST | `/api/requests` |
| GET | `/api/requests/my` |
| GET | `/api/requests/teaching` |
| GET | `/api/requests/by-skill/:skill` |
| POST | `/api/requests/:id/offer` |
| POST | `/api/requests/:id/select` |
| DELETE | `/api/requests/clear-all` |
| GET | `/api/chats` |
| GET | `/api/chats/:id` |
| POST | `/api/chats/:id/message` |
| PATCH | `/api/chats/:id/complete` |
| GET | `/api/progress` |
| POST | `/api/ai/ask` |
| POST | `/api/ai/generate-quiz` |
| POST | `/api/ai/enhance-request` |

Safe probes showed protected routes consistently returned 401 before a valid token, unknown/method-mismatched routes returned Express 404 HTML, and `/` returned a simple API-running JSON response. No health/docs route was exposed.

# 12. Recommended fix priority

## Before any public production release

1. Restrict CORS and add automated origin-policy tests.
2. Implement or remove password recovery; test reset-token security.
3. Sanitize malformed JSON and all unhandled API errors.
4. Fix dialog semantics/focus/Escape behavior.
5. Add semantic controls and explicit labels to all forms and global navigation.
6. Implement real legal pages and enforce consent server-side.
7. Replace fabricated notification count and make loading/error/empty states distinct.
8. Add security headers and remove Express fingerprinting.
9. Establish two-account staging fixtures to test offers, selection, chat, authorization, and completion.

## Next release

1. Add resource-level authorization tests for every ID-based endpoint.
2. Add rate limiting, body-size limits, AI timeouts, and abuse monitoring.
3. Add automated responsive tests at the required widths and 200% zoom.
4. Run axe-core and keyboard acceptance tests in CI.
5. Add pagination/indexes and production performance budgets.
6. Add structured API error codes and consistent client retry/error handling.

## Later polish

1. Add settings or remove the implied route.
2. Improve auth-page navigation and onboarding intent selection.
3. Increase small touch targets to at least 44px where practical.
4. Add copy-success feedback and clearer AI response states.
5. Add visual regression coverage for light/dark themes and modal/mobile states.

# 13. Production-readiness checklist

- [ ] CORS allowlist verified in staging and production
- [ ] HTTPS, HSTS, CSP, frame protection, `nosniff`, and referrer policy configured
- [ ] Password recovery implemented and abuse-tested
- [ ] Password/username/email server-side validation and uniqueness tested
- [ ] Malformed JSON returns sanitized 400
- [ ] All auth and resource authorization cases covered
- [ ] Rate limiting and request-size limits enabled
- [ ] Legal pages live; consent required and versioned
- [ ] Main landmarks, labels, dialog semantics, live regions, keyboard flows pass
- [ ] Responsive tests pass at 320/375/425/768/1366/1920 and 200% zoom
- [ ] Loading/error/empty states are distinct across every data surface
- [ ] Two-account offer → select → chat → complete flow passes in staging
- [ ] MongoDB indexes/query plans reviewed
- [ ] Production bundle/Core Web Vitals budgets established
- [ ] Test fixture cleanup/account deletion procedure documented

## Final recommendation

Keep the current feature set in staging and continue iterating; do not expose it broadly to public users until the security and account-lifecycle blockers are resolved. The fastest path to a credible release candidate is: fix CORS and API error handling, implement recovery/legal consent, complete the shared accessibility primitives, then run a deterministic two-account staging suite for offers and chat. After that, run device-level responsive and performance checks and repeat this audit against a production build.
