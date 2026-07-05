# Shubh Samay — Environment Setup

## Prerequisites
- Node.js >= 18
- npm (comes with Node.js)

## Setup
```bash
npm install
```

## Environment variables
Create `.env` in project root:
```
DATABASE_URL="file:./dev.db"
```

## Database
```bash
npx prisma generate
npx prisma db push
```

The app calculates everything live from astronomy data — Prisma is a scaffold and not used for app functionality.

## Run locally
```bash
# Development server (port 3000)
npm run dev

# Build for production (standalone output)
npm run build

# Run production build
npm run start
```

## Browser testing
- `npm run dev` — open http://localhost:3000
- Dev server logs to `dev.log`
- All app features work in browser (no native-only plugins)

## Emulator / physical device testing
PWA testing on Android:
1. Build with `npm run build && npm run start`
2. Open Chrome on Android → navigate to `http://<your-ip>:3000`
3. Add to home screen

## Lint
```bash
npm run lint       # ESLint
```

## Key versions
| Tool | Version |
|------|---------|
| Next.js | 16.1.1 |
| React | 19.0.0 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Prisma | 6.11.1 |
| astronomy-engine | 2.1.19 |
| Node.js | >= 18 |
