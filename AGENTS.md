# Project notes

- React + Vite frontend; application logic is in `src/App.jsx`.
- Events and tasks are initialized from seed data and stored in React state. Reloading resets changes; there is no backend integration or persistent storage in the current source.
- Start locally: `npm run dev -- --host 127.0.0.1`.
- Verification: `npm run build` and `npm run lint`. No test script is configured.
- On Windows, copied `node_modules` may lack `.cmd` launchers in `node_modules/.bin`; install dependencies locally if npm scripts cannot find Vite or ESLint.
