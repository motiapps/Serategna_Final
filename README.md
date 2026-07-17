# Serategna_Final

Serategna (ሰራተኛ) mobile app — local development server.

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
| Android phone over USB | `adb reverse tcp:3000 tcp:3000`, then open `http://localhost:3000` |

Notes:

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
public/
  index.html                # mobile-first app shell
  styles.css                # mobile-first styles (light/dark, safe areas)
  app.js                    # connectivity badge + device details
  manifest.webmanifest      # PWA manifest
```
