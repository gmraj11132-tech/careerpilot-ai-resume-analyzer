# Setup Guide

## Prerequisites

Before setting up CareerPilot, ensure you have the following installed on your machine:
- **Node.js**: Version 18.0 or higher
- **npm**: Node Package Manager (comes with Node.js)
- **Git**: For version control

## Step-by-Step Installation

1. **Clone the Repository**
   Open your terminal and run:
   ```bash
   git clone https://github.com/gmraj11132-tech/careerpilot-ai-resume-analyzer.git
   cd careerpilot-ai-resume-analyzer
   ```

2. **Install Dependencies**
   Install all required Node.js packages:
   ```bash
   npm install
   ```

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in your text editor and configure the variables:
   - `DATABASE_URL`: By default, this might point to a local SQLite database (`file:./dev.db`). For production, replace this with a PostgreSQL connection string.
   - `AUTH_SECRET`: Generate a random string for JWT signing (e.g., using `openssl rand -base64 32`).

## Database Setup with Prisma

Initialize the database schema using Prisma ORM:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
2. **Push Schema to Database**:
   *(This creates the tables in your SQLite dev database)*
   ```bash
   npx prisma db push
   ```
3. **Seed the Database** (Optional but recommended):
   *(This populates the database with initial required data, if a seed script exists)*
   ```bash
   npx prisma db seed
   ```

## Running Development Server

Start the Next.js development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Production Build

To test the production build locally:

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Common Issues and Solutions

- **Prisma Client not found**: Run `npx prisma generate` again and restart your server.
- **Port 3000 is in use**: Either kill the process using port 3000 or start Next.js on a different port using `npm run dev -- -p 3001`.
- **Database connection errors**: Ensure your `DATABASE_URL` in `.env` is correctly formatted and the database server is running (if using PostgreSQL). For SQLite, ensure you have write permissions in the directory.
