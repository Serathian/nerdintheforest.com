# AGENTS.md — nerdintheforest.com

Operational guidelines and contracts for AI agents working in `nerdintheforest.com`.

---

## Technical Stack & Constraints

| Item | Details |
| :--- | :--- |
| Framework | Nuxt 3 (SSR + Nitro Server) |
| Mapping Engine | MapLibre GL JS |
| Styling | Tailwind CSS + Custom Nordic Forest Design System |
| Local Port | `http://localhost:3003` |
| Production Container | `ghcr.io/Serathian/nerdintheforest.com:latest` |
| CMS Source | `basecamp-cms` (`CMS_API_INTERNAL` or `http://localhost:3000/api`) |

---

## Agent Rules

1. **MapLibre Client-Only**: Map components must always be wrapped in `<ClientOnly>` or mounted inside `onMounted` hooks to prevent SSR hydration errors with WebGL.
2. **Coordinate Standard**: Coordinates in GeoJSON LineStrings and MapLibre standard are `[longitude, latitude]` (or `[lng, lat, ele]`). Never invert lat and lng.
3. **Dispatch Inspection Mode**: The active dispatch inspection state in `useState('activeDispatchInspection')` coordinates map zooming, elevation profile contours, and the dispatch reader drawer. Keep state cleanup in route watchers.
4. **CI/CD Compliance**: Every commit pushed to `main` triggers `.github/workflows/docker-publish.yml` to build the Docker image and trigger Watchtower on the droplet.

---

## Agent skills

### Issue tracker

Issues are tracked centrally in GitHub Issues (`Serathian/website-stack` via `gh --repo Serathian/website-stack`). See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five-role triage label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at the repo root). See `docs/agents/domain.md`.
