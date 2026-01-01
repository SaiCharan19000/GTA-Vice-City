# GTA-Vice-City

Minimal web prototype built with Three.js.

## What I implemented ✅
- Simple 3D scene with ground and lighting
- **Player** (on-foot) movement with WASD
- **Vehicle** (box) with basic acceleration and steering
- Enter/exit vehicle with **E**, reset with **R**
- Camera follows the controlled object (player or vehicle)

## How to run 🔧
1. Serve the folder locally (recommended):
   - With Python: `python -m http.server 8080`
   - Or with npm: `npm run start` (uses `http-server` via npx)
2. Open `http://localhost:8080` in a browser.

## Controls 🎮
- WASD: move (player) / accelerate & steer (vehicle)
- E: enter/exit vehicle
- R: reset positions

## Next steps / suggestions 💡
- Add collision and physics (Cannon.js or Ammo)
- Replace primitive meshes with models and add textures
- Add NPCs, missions, pick-up items

---

If you'd like, I can now:
1. Add simple physics and collisions
2. Add a vehicle model and placeholder city block
3. Set up a GitHub Actions workflow to build/deploy the prototype to GitHub Pages

Tell me which of those you'd like next and I'll proceed.

## Deploying to GitHub Pages 🚀
This repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that will automatically publish the repository root to **GitHub Pages** whenever you push to the `main` branch.

How to trigger the first deployment:
1. Commit and push the current changes to the remote `main` branch (e.g. `git add . && git commit -m "Add GitHub Pages deploy" && git push origin main`).
2. After the push, open the repository **Actions** tab -> check the `Deploy to GitHub Pages` workflow run. If successful, the site will be published at:
   `https://<your-github-username>.github.io/<repository-name>`

Notes:
- GitHub will take the repository root files (including `index.html`) and publish them directly. No build step is required for the current static prototype.
- If you want me to push the commit and trigger the workflow for you, say so and I can commit & push from this workspace (you may need to authenticate when pushing).
