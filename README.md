# CattleSync 

## Project info

**URL**: https://lovable.dev/projects/ebbbc4cc-9cf5-4537-9cfa-684297ec4ded

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ebbbc4cc-9cf5-4537-9cfa-684297ec4ded) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Next.js
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Prisma
- PostgreSQL

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ebbbc4cc-9cf5-4537-9cfa-684297ec4ded) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Backend API & Database

The application now exposes a RESTful API powered by Next.js API routes and backed by a PostgreSQL database via Prisma. The primary endpoints are:

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/cows` | `GET`, `POST` | List cows or create a new cow record. |
| `/api/cows/[id]` | `GET`, `PUT`, `DELETE` | Retrieve, update, or remove a specific cow. |
| `/api/reminders` | `GET`, `POST` | Manage reminder collection. |
| `/api/reminders/[id]` | `GET`, `PATCH`, `PUT`, `DELETE` | Work with a single reminder, including completion updates. |
| `/api/sync-methods` | `GET`, `POST` | Manage synchronization protocol definitions. |
| `/api/sync-methods/[id]` | `GET`, `PUT`, `DELETE` | View or modify a specific synchronization method. |
| `/api/analytics` | `GET` | Returns dashboard analytics calculated from live data. |

### Local setup

1. Copy the example environment file and update the `DATABASE_URL` with your PostgreSQL connection string:

   ```sh
   cp .env.example .env
   ```

2. Install dependencies (once registry access is available) and generate the Prisma client:

   ```sh
   npm install
   npx prisma generate
   ```

3. Create the database schema and seed it with the sample herd data:

   ```sh
   npm run db:push
   npm run db:seed
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

The sample seed mirrors the original mock data so the UI continues to display meaningful analytics immediately.

### Deploying to Vercel

1. Provision a PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.) and copy the connection string.
2. In your Vercel project settings, add the `DATABASE_URL` environment variable.
3. Configure the build command to run Prisma before the Next.js build if you manage the deployment manually:

   ```sh
   npx prisma generate
   npx prisma migrate deploy
   ```

   When deploying via Vercel’s Git integration, you can add these commands to the **Build Command** or a [post-install script](https://vercel.com/docs/deployments/configure-a-build#install-command) as needed.
4. Trigger a redeploy. The API routes will automatically connect to the provisioned database at runtime using the `DATABASE_URL` secret.

For Vercel Postgres specifically, ensure `?sslmode=require` is appended to the URL and enable the "Prisma" integration to manage connection pooling automatically.
