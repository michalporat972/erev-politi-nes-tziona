# ערב פוליטי — דף נחיתה

Static implementation of `project/ערב פוליטי - דף נחיתה.dc.html` from the Claude
Design handoff bundle. No build step, no dependencies — plain HTML, CSS and two
small scripts.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The landing page: event details + registration form + payment |
| `success.html` | Where Netlify redirects after a native (JS-off) form post |
| `broadsheet.css` | The Broadsheet design system stylesheet, copied verbatim from the bundle — the source of truth for tokens |
| `page.css` | Page layer: Hebrew type (Frank Ruhl Libre) and this page's layout |
| `press-lean.js` | The system's pointer lean — the CMYK plates drift a breath toward the cursor |
| `form.js` | Submits the form over fetch so the confirmation card appears in place |
| `netlify.toml` | Publish dir and cache headers |
| `assets/` | The two portraits |

## Running it locally

The form posts to `/`, so it needs a server (and Netlify, to actually record
anything). For a look at the page:

```
cd site && python3 -m http.server 8000
```

Then open <http://localhost:8000>. Submitting locally will show the error
message — that's expected, there's no form backend outside Netlify.

## Deploying

Drag `site/` into Netlify, or connect the repo with `site` as the base
directory. Nothing to build.

## Registrations

The form uses **Netlify Forms**. On deploy, Netlify's bot parses `index.html`,
finds `<form name="registration" data-netlify="true">`, and starts collecting.

- Submissions appear under **Forms → registration** in the Netlify dashboard.
- Turn on email notifications: **Site configuration → Forms → Form
  notifications → Add notification → Email notification**.
- Fields collected: `name`, `phone`, `question`, `mood`, `paid`.
- A hidden honeypot field (`bot-field`) filters basic spam. If bots get
  through, enable reCAPTCHA in the Netlify form settings.

## Payment

15 ₪ through the PayBox group **"ערב לא פוליטי - נס ציונה"**
(`https://links.payboxapp.com/JNT7A1yJ45b`).

Payment gates the registration: the form will not submit until the visitor ticks
**שילמתי 15 ₪ בפייבוקס**. Submitting without it shows an error, flashes the
payment block and scrolls to it.

**This is an attestation, not a verified payment.** A static page has no way to
confirm a PayBox transfer — there's no callback and no API to check against. The
tick is the registrant's own word, and it rides along in the submission as the
`paid` field so you can reconcile the Netlify form list against who's actually in
the PayBox group. Anyone determined to register without paying still can.

If you'd rather this were enforced rather than declared, the two real options are
a payment provider with a redirect-back (Grow/Meshulam or Cardcom, which return
to a success URL you control) or a small serverless function that reconciles
against PayBox. Both mean giving up the pure-static setup — say the word.

## Before going live — one thing to fill in

1. **A share image.** There's no `og:image`, so links shared on WhatsApp and
   Facebook will show text only. Export one of the poster/story designs from
   `project/ערב פוליטי - מודעות v2.dc.html` as a PNG, drop it in `assets/`, and
   add `<meta property="og:image" content="https://<domain>/assets/<file>.png">`
   to `index.html`.

## Notes on the implementation

- **Event time.** The design carried date and venue but no time. 20:00 is now in
  the dateline rail, under the big `5.10` numeral, and in both confirmation
  cards.
- **Payment moved ahead of the confirmation.** In the prototype the confirmation
  replaced the whole form, payment link included, and nothing required payment.
  Payment is now a gate before the registration goes through, and the
  confirmation card keeps a quiet link back to the PayBox group for anyone who
  ticked the box ahead of themselves.
- **The mood picker** is a radio group styled to look like the design's buttons,
  rather than JS-driven buttons. Same appearance, but it keyboard-navigates and
  submits its value natively.
- **Plate registration.** The design system trims its absolute C/M/Y plates to
  the cap box, for hosts that trim their own line the same way. These hosts
  don't, so `page.css` sets `text-box: normal` on the plates — otherwise they'd
  sit a cap-height above the paper union on engines that support `text-box`, and
  the misregistration would read as a broken overlay.
- **Images.** The portraits are the original PNGs (~480 KB each) — no image
  tooling was available in this environment. Converting them to WebP at ~730×600
  would cut roughly 900 KB off the page; the halftone treatment hides any loss.
- **Responsive.** Fixed pixel sizes from the prototype became `clamp()` ranges
  whose maximum is the prototype's value, so the desktop rendering matches the
  design and small screens scale down.
