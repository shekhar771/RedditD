# Reddit Clone - Full Stack Application

![Project Screenshot](/screenshot.png) <!-- Add your screenshot path here -->

A feature-rich Reddit clone built with modern web technologies, implementing core social media functionalities with custom authentication.

## 🔥 Features

- **Authentication System**
  - Custom implementation using Lucia Auth
  - Multiple login methods: Google, GitHub, Email/Password
  - Session-based authentication with secure cookies
  - Protected routes and role-based access

- **Core Functionalities**
  - Create, view, and interact with posts (Text/Image/Link)
  - Vote (upvote/downvote) system
  - Nested comment threads
  - Subreddit communities with subscription model
  - Post sorting (Hot, New, Top, Controversial)
  - Post filtering by type (Text, Image, Link)

- **Performance Optimized**
  - Database query optimization
  - Infinite scroll with React Query
  - Optimistic UI updates
  - Server-side rendering for critical pages

## 🛠 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- shadcn/ui (Radix + Tailwind CSS)
- React Query (Data fetching)
- Zod (Validation)

**Backend:**
- Next.js API Routes
- PostgreSQL (Database)
- Prisma (ORM)
-  (Authentication)
- OAuth integrations (Google, GitHub)

**Infrastructure:**
- Vercel (Hosting)
- Supabase (PostgreSQL hosting)
- Cloudinary (Image storage - if used)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google/GitHub OAuth credentials

### Installation
1. Clone the repository
2. npm run dev