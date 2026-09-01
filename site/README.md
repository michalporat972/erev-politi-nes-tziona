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
- Fields collected: `name`, `phone`, `question`, `mood`.
- A hidden honeypot field (`bot-field`) filters basic spam. If bots get
  through, enable reCAPTCHA in the Netlify form settings.

## Before going live — two things to fill in

1. **The Bit payment link.** Still the placeholder from the design
   (`https://www.bitpay.co.il/app/me`). It appears in **three** places, each
   marked with a `TODO` comment:
   - `index.html` — the payment block inside the form
   - `index.html` — the confirmation card
   - `success.html` — the confirmation card
2. **A share image.** There's no `og:image`, so links shared on WhatsApp and
   Facebook will show text only. Export one of the poster/story designs from
   `project/ערב פוליטי - מודעות v2.dc.html` as a PNG, drop it in `assets/`, and
   add `<meta property="og:image" content="https://<domain>/assets/<file>.png">`
   to `index.html`.

## Notes on the implementation

- **Event time.** The design carried date and venue but no time. 20:00 is now in
  the dateline rail, under the big `5.10` numeral, and in both confirmation
  cards.
- **Payment link on the confirmation card.** In the prototype the confirmation
  replaced the whole form, payment link included — so anyone who registered
  before paying lost the link. The card now carries it too.
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
