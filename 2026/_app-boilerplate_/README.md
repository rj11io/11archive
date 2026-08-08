# v0 app boilerplate

The reusable Next.js and shadcn/ui starter for v0 benchmark apps. It includes
TypeScript, Tailwind CSS, theming, path aliases, and the shared UI component
set.

## Local development

This app requires Node.js and npm. It does not currently use environment
variables.

```bash
npm install
npm run dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run format` | Format TypeScript and TSX files with Prettier |

## Adding components

The shadcn/ui configuration writes components to `components/ui/`:

```bash
npx shadcn@latest add <component>
```

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
