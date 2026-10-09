# ManzilIQ — Prototype v1

First prototype: a clean login form connected to the Supabase database.
This lives on the `prototype-v1` branch (tag `v1-prototype`) so the main
project stays untouched.

## What's inside

- Login form (email + password) with sign-in and sign-up modes
- Supabase Auth for authentication (backed by the Supabase Postgres database)
- Session persistence — stays logged in on refresh
- "Database connected" state after successful sign-in

## Run it

```bash
npm install
cp .env.example .env   # then add your Supabase URL + anon key
npm run dev
```

Open http://localhost:5173

## Versions

| Version | Branch / Tag | Description |
| ------- | ------------ | ----------- |
| v1-prototype | `prototype-v1` / `v1-prototype` | Login form + Supabase database connection |
