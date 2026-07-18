# Serategna MVP — Phase 1

**Serategna (ሰራተኛ)** connects people who need everyday work done — cleaning,
plumbing, childcare, tutoring, moving and more — with trusted workers nearby.

This folder is the complete MVP: everything in **Phase 1 works today**, and
everything planned for later phases is **visible in the app marked "Soon"**,
so you can see the full picture of where the product is going.

---

## For end users — how to try it

1. Open the app (ask whoever sent you this for the link, or see "Run it"
   below).
2. Pick why you're here: **hire**, **find work**, or **just browse**.
3. Try it out — everything below works right now:

| You can… | How |
| --- | --- |
| Browse workers | **Workers** tab, or tap a category on Home |
| Search | By name, skill, or neighborhood |
| View a worker's profile | Tap any worker — rating, experience, rate, bio |
| Call a worker | **📞 Call** button on their profile |
| Browse open jobs | **Jobs** tab |
| Post a job | **＋ Post a job** — it appears in the list instantly |
| Set up your profile | **Profile** tab |

Anything with a **`SOON`** pill isn't live yet — tap it anyway! A card
explains what it will do and which phase it ships in:
in-app chat, secure payments (Telebirr / CBE Birr), ID verification,
ratings & reviews, the Amharic interface, map view, notifications, and
saved workers.

> **Note:** this is a demo. Workers and jobs shown are sample data, and the
> phone numbers are placeholders. Jobs you post are saved only on your own
> device.

---

## For technical people

### Run it

```bash
# from the repository root — no dependencies, no build step
npm start
# → http://localhost:3000/mvp/   (QR code for phones prints in the terminal)
```

Or open `mvp/index.html` directly in a browser — the MVP is fully
self-contained and works from the file system too.

### Architecture

| File | Role |
| --- | --- |
| `index.html` | Static shell: app bar, four views, tab bar, bottom sheet, toast |
| `styles.css` | Mobile-first CSS: design tokens, dark mode, safe-area insets |
| `data.js` | Demo dataset: categories, workers, jobs, and the "Soon" feature registry |
| `app.js` | All logic: tab router, renderers, search/filter, bottom sheets, event delegation |

Deliberate constraints for this phase:

- **No framework, no build step** — plain HTML/CSS/JS so anyone can read,
  run, and review it in minutes. Rendering is template strings with a
  single `esc()` helper applied to all user-entered content.
- **No backend yet** — the dataset is mock data in `data.js`; user state
  (role, profile, posted jobs) persists in `localStorage` under the
  `serategna-mvp` key. Swapping `data.js` for API calls is the intended
  Phase 2 seam.
- **"Soon" is a registry, not dead buttons** — every future feature is an
  entry in `SOON_FEATURES` (id, phase, description). UI elements reference
  it via `data-action="soon"`, so the roadmap shown to users lives in one
  place and gating a feature "on" later means wiring one action.

### Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| **1 — this MVP** | Browse/search workers, worker profiles, call to hire, browse/post jobs, local profile | ✅ Working |
| **2** | Backend + accounts, in-app chat, payments (Telebirr / CBE Birr) with escrow, Fayda ID verification, real ratings & reviews, Amharic interface | 🔜 Soon |
| **3** | Map view, push notifications, saved workers, more cities & languages | 🔜 Soon |

### Feedback

Send thoughts to the project owner, or open an issue on the repository.
The most useful feedback right now: *Is the Phase 1 flow enough for a first
real hire? Which "Soon" feature would you need first?*
