Here’s an improved and professional version of your GitHub README for your Reddit Clone:

---

# 🚀 Reddit Clone – Full Stack Social Platform

[🌐 Live Demo](https://reddit2-beta.vercel.app/)* https://reddit2-beta.vercel.app/


A fully-featured Reddit-style application built using modern web technologies. This project replicates core social functionalities like post sharing, voting, commenting, and community management with a custom authentication system powered by Lucia Auth.

---

## 🔥 Features

### 🛡️ Authentication

* Custom auth system built with **Lucia Auth**
* Supports **Google**, **GitHub**, and **Email/Password** logins
* **Secure session management** using HTTP-only cookies
* Role-based route protection and access control

### 📝 Posts & Interactions

* Create and browse posts (Text, Image, Link)
* **Vote system**: upvotes, downvotes, and real-time updates
* **Nested comments** with reply threading
* **Post sorting**: Hot, New, Top, Controversial
* **Post filtering**: View posts by type

### 🌐 Subreddits

* Create and manage subreddit communities
* Subscribe/unsubscribe to communities
* Community-specific post feeds

### ⚡ Performance

* **Optimized Prisma queries**
* **Infinite scrolling** powered by React Query
* **Optimistic UI** updates for seamless interactions
* **Server-side rendering (SSR)** for improved performance and SEO

---

## 🛠 Tech Stack

### 🧩 Frontend

* [Next.js 14](https://nextjs.org/) (App Router)
* [TypeScript](https://www.typescriptlang.org/)
* [shadcn/ui](https://ui.shadcn.com/) (Tailwind + Radix UI)
* [React Query](https://tanstack.com/query/latest) for data fetching
* [Zod](https://zod.dev/) for schema validation

### ⚙️ Backend

* Next.js API Routes
* [PostgreSQL](https://www.postgresql.org/)
* [Prisma](https://www.prisma.io/) ORM
* [Lucia Auth](https://lucia-auth.com/) for authentication
* OAuth via Google & GitHub

### ☁️ Infrastructure

* [Vercel](https://vercel.com/) for hosting
* [Supabase](https://supabase.com/) for PostgreSQL DB

---

## 🚀 Getting Started

### ✅ Prerequisites

* **Node.js** v18 or higher
* Access to a **PostgreSQL** database
* Google/GitHub OAuth credentials (for social login)

### 🧰 Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/reddit-clone.git
cd reddit-clone

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add DB credentials and OAuth keys in .env

# 4. Run local dev server
npm run dev
```

---

## Screenshots 🖼️

### Post Creation
![Create Post](./public/cr4reate%20post.png)

### Comment Section
![Nested Comments](./public/nested%20comments.PNG)

### Homepage
![Subreddit View](./subreddit.PNG)
---

## 📌 Roadmap / To-Do *(Optional)*

* Moderation tools (ban users, remove posts)
* Real-time updates ( WebSockets )



