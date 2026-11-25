# wisdo

## Git and deployment workflow

`main` is production: every push to `main` deploys wisdo.io on Vercel. Never commit or push to `main` directly, and never merge a pull request into `main`; only a person does that.

1. Start every change on a new branch created from `dev` (for example `feat/...` or `fix/...`).
2. Open a pull request into `dev`. Vercel builds a preview for it; check the change there.
3. When `dev` is verified, a person opens and merges a pull request from `dev` into `main`.

Before opening a pull request, run `npx astro check` and `npm run build`; both must pass.
