# Serategna_Final

Serategna (ሰራተኛ) mobile app — MVP and local development server.

## The MVP

The **[`mvp/`](mvp/)** folder contains the complete Phase 1 MVP — a
mobile-first app for finding and hiring trusted workers (cleaning, plumbing,
childcare, tutoring, and more). Phase 1 features all work; later-phase
features (chat, payments, verification, Amharic interface, …) are visible in
the UI marked **"Soon"** so the full product picture is on display.

- Run `npm start` and open **`http://localhost:3000/mvp/`** (or scan the QR
  code printed in the terminal, then tap "Open the Serategna MVP").
- Or open `mvp/index.html` directly — it's fully self-contained.
- See [`mvp/README.md`](mvp/README.md) for a guide aimed at both end users
  and technical reviewers, plus the roadmap.

## The dev server

This repo includes a zero-dependency Node.js localhost server that serves a
mobile-first app shell, reachable from your machine, emulators, and phones on
the same network. No `npm install` needed.

## Quick start

```bash
npm start          # serves on port 3000
# or pick a port:
node server.js 8080
```

The terminal prints every URL you can use, including your LAN address.

## Opening the app on a mobile device

| Where | URL / command |
| --- | --- |
| This machine | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Phone on the same Wi-Fi | `http://<your-LAN-IP>:3000` (printed in the terminal) |
| Phone via QR code | scan the QR in the terminal, or open `http://localhost:3000/qr` and scan |
| Android phone over USB | `adb reverse tcp:3000 tcp:3000`, then open `http://localhost:3000` |

Notes:

- On startup the terminal prints a QR code for your LAN URL — scan it with
  your phone's camera to open the app directly. `GET /qr` serves the same QR
  as a web page (handy if your terminal font renders block characters badly).
- The server binds to `0.0.0.0`, so any device that can reach your machine on
  the network can open the app. If a phone can't connect, check that your
  firewall allows inbound connections on the port and that both devices are on
  the same network.
- `GET /health` returns a JSON status — the app shell uses it to show a live
  "connected" badge, and you can use it from tooling or a mobile client to
  verify connectivity.
- Unknown routes fall back to `index.html` (SPA-style routing), so client-side
  routes keep working on refresh.

## Project layout

```
server.js                   # zero-dependency static server (binds 0.0.0.0)
qr.js                       # zero-dependency QR encoder (terminal + SVG)
mvp/                        # Phase 1 MVP app (see mvp/README.md)
  index.html                # app shell: tabs, sheets, toast
  styles.css                # mobile-first styles
  data.js                   # demo dataset + "Soon" feature registry
  app.js                    # tab router, renderers, search, event handling
public/
  index.html                # mobile-first app shell
  styles.css                # mobile-first styles (light/dark, safe areas)
  app.js                    # connectivity badge + device details
  manifest.webmanifest      # PWA manifest
```
