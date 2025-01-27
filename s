/your-project-root
├── /pages
│   ├── /api
│   │   ├── /auth
│   │   │   ├── signup.ts        # Sign up API
│   │   │   ├── signin.ts        # Sign in API
│   │   │   └── signout.ts       # Sign out API
│   ├── /dashboard
│   │   └── index.tsx            # Protected page (e.g., Dashboard)
│   ├── /login.tsx               # Sign in page
│   ├── /signup.tsx              # Sign up page
│   └── index.tsx                # Home page
├── /src
│   ├── /auth
│   │   ├── cookie.ts            # Cookie handling
│   │   ├── password.ts          # Password hashing and verification
│   │   └── session.ts           # Session creation, validation, and invalidation
│   ├── /lib
│   │   └── prisma.ts            # Prisma client instance
│   ├── /components
│   │   └── AuthForm.tsx         # Reusable form component (e.g., for sign up or sign in)
├── /prisma
│   ├── schema.prisma            # Prisma schema
│   └── migrations               # Prisma migration folder
├── .env                         # Environment variables (e.g., DATABASE_URL)
├── next.config.js               # Next.js configuration
├── package.json                 # Project dependencies
└── tsconfig.json                # TypeScript configuration
