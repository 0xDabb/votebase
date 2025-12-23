# Bote App 🚀

A Farcaster Mini App for discovering, upvoting, and sharing projects. Built with Next.js, TypeScript, Tailwind CSS, and Vercel Postgres.

## Features

- 🔐 **Farcaster Sign-In** - Authenticate with your Farcaster account
- 📱 **Project Discovery** - Browse and search projects by category
- ⬆️ **Upvoting System** - Vote for your favorite projects (sorted by votes)
- 💬 **Comments** - Discuss projects with the community
- 🔖 **Bookmarks** - Save projects for later
- 🔔 **Notifications** - Get notified about upvotes and comments
- 👤 **User Profiles** - View your projects, upvotes, and saved items

## Tech Stack

- **Frontend**: Next.js 14+, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Vercel Postgres (Prisma ORM)
- **Auth**: Farcaster Frame SDK
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for Postgres database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bote-app.git
   cd bote-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Vercel Postgres credentials

4. Set up the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

### Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create → Postgres
3. Copy the connection strings to your `.env` file:
   - `DATABASE_URL` - Pooled connection
   - `DIRECT_URL` - Direct connection

### Prisma Commands

```bash
# Push schema changes to database
npm run db:push

# Seed the database with initial data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel Dashboard
4. Deploy!

The build command will automatically run `prisma generate`.

## Farcaster Mini App

This app is designed to run as a Farcaster Frame/Mini App. When opened in Warpcast, it will:

1. Automatically detect the Farcaster context
2. Sign in the user using their Farcaster account
3. Provide a native-like experience within Warpcast

### Testing in Warpcast

1. Deploy to Vercel
2. Open Warpcast on mobile
3. Navigate to your deployed URL
4. The app will automatically authenticate

## Project Structure

```
src/
├── app/
│   ├── (main)/           # Main app pages with bottom nav
│   │   ├── page.tsx      # Home feed
│   │   ├── explore/      # Explore/discover
│   │   ├── create/       # Create project
│   │   ├── notifications/# Notifications
│   │   ├── profile/      # User profile
│   │   └── projects/[id] # Project details
│   ├── api/              # API routes
│   │   ├── auth/         # Farcaster auth
│   │   ├── projects/     # Project CRUD & upvotes
│   │   ├── categories/   # Categories
│   │   └── users/        # User data
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utilities (Prisma, Farcaster SDK)
└── types/                # TypeScript types
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/farcaster` | Authenticate with Farcaster |
| GET | `/api/projects` | List projects (sorted by upvotes) |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/[id]` | Get project details |
| POST | `/api/projects/[id]/upvote` | Toggle upvote |
| POST | `/api/projects/[id]/save` | Toggle bookmark |
| GET/POST | `/api/projects/[id]/comments` | Get/add comments |
| GET | `/api/categories` | List categories |
| GET | `/api/users/[id]` | Get user profile |
| GET | `/api/users/[id]/notifications` | Get notifications |
| GET | `/api/users/[id]/saved` | Get saved projects |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
