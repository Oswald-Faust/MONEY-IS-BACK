This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google OAuth (Inscription / Connexion)

Le projet supporte maintenant la création/connexion via Google avec le flux OAuth2 côté serveur.

Variables d'environnement requises:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=...
MONGODB_URI=...
```

Configuration Google Cloud Console:

1. Créer un identifiant OAuth 2.0 (Web Application).
2. Ajouter l'URI de redirection autorisée:
   - `http://localhost:3000/api/auth/google/callback` (local)
   - `https://votre-domaine.com/api/auth/google/callback` (production)
3. Ajouter les origines JavaScript autorisées correspondantes.

Flux utilisé:

- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `GET /api/auth/google/session`

Les pages `/login` et `/register` proposent le bouton `Continuer avec Google`.
