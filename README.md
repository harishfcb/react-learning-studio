# React Learning Studio

An interactive five-day React course for developers coming from Java/Spring.

## Run locally

```bash
npm install
npm run dev
```

On the current PowerShell policy, use `npm.cmd` in place of `npm` if `npm.ps1` is blocked.

Then open the local Vite URL shown in the terminal.

## Verify

```bash
npm run lint
npm test
npm run build
```

The app is frontend-only. The Customer Management project uses a deterministic local mock API and stores course progress in `localStorage` under `react-learning-studio:v1`.
