# Deployment Guide

This guide covers deploying the CareerPilot Next.js application to Vercel and configuring a production PostgreSQL database.

## Vercel Deployment Steps

1. Create an account on [Vercel](https://vercel.com/) and connect your GitHub account.
2. Click **Add New... > Project**.
3. Import the `careerpilot` repository from your GitHub account.
4. Leave the Framework Preset as "Next.js".
5. In the "Environment Variables" section, you must add your production configurations before clicking Deploy.

## Environment Variables to Set in Vercel

Add the following keys and their corresponding production values:
- `DATABASE_URL`: (See Database Setup below)
- `AUTH_SECRET`: A strong, randomly generated string for production JWT signing.
- `AI_API_KEY`: (If applicable, your production API key for the AI service).

## Database Setup

For production, SQLite is not supported on serverless platforms like Vercel. You must use a hosted PostgreSQL provider. Recommended options include:
- **Neon** (Serverless Postgres)
- **Supabase**
- **Railway**

Once you have provisioned a PostgreSQL database on one of these platforms, obtain the **Connection String** (URI).

**Change DATABASE_URL**:
Update the `DATABASE_URL` environment variable in your Vercel project settings to be this PostgreSQL connection string.
Example: `postgresql://user:password@host.region.provider.com/db_name?sslmode=require`

## Database Migration

After deploying your code to Vercel and setting the environment variables, you must apply your database schema to the new production database.

Run the following command locally, ensuring your local `.env` has the **production** `DATABASE_URL` temporarily, or use a CI/CD pipeline:
```bash
npx prisma migrate deploy
```
*(Do not use `db push` in production; use `migrate deploy` to apply robust migrations.)*

## Post-deployment Verification Checklist

- [ ] Visit the deployed URL provided by Vercel.
- [ ] Attempt to register a new user account.
- [ ] Attempt to log in with the new account.
- [ ] Upload a test resume to verify file handling and analysis workflows.
- [ ] Check Vercel logs for any runtime errors or warnings.

## Custom Domain Setup

To use a custom domain (e.g., `careerpilot.com`):
1. Go to your project settings in Vercel.
2. Navigate to the **Domains** section.
3. Enter your custom domain and click **Add**.
4. Follow Vercel's instructions to configure the DNS records (A record or CNAME) with your domain registrar.
