# SquidCrawl Open-Source SaaS Starter

<img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjh4N3VwdGw2YXg2ZXpvMHBlNDFlejd1MjBpZXBxNHZ5YXJxOGk5OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/x2sTqbCW5m7z0qaNJM/giphy.gif" alt="SquidCrawl Demo" width="100%" />

Get your SaaS running in minutes with authentication, billing, AI chat, and brand monitoring. Zero-config setup with Next.js 15, TypeScript, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15.3, React 19, TypeScript 5.7 |
| **Styling** | Tailwind CSS v4, shadcn/ui, Lucide Icons |
| **Web Scraping** | Firecrawl |
| **Database** | PostgreSQL, Drizzle ORM |
| **Authentication** | Better Auth |
| **Payments** | Autumn (with Stripe integration) |
| **AI Providers** | OpenAI, Anthropic, Google Gemini, Perplexity |
| **Email** | Resend |

## Project Structure

```
squidcrawl/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Better Auth endpoints
│   │   ├── autumn/       # Billing endpoints (handled by Autumn)
│   │   ├── brand-monitor/# Brand analysis APIs
│   │   └── chat/         # AI chat endpoints
│   ├── (auth)/           # Auth pages (login, register, reset)
│   ├── dashboard/        # User dashboard
│   ├── chat/             # AI chat interface
│   ├── brand-monitor/    # Brand monitoring tool
│   └── pricing/          # Subscription plans
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── autumn/           # Billing components
│   └── brand-monitor/    # Brand monitor UI
├── lib/                   # Utility functions
│   ├── auth.ts           # Auth configuration
│   ├── db/               # Database schema & client
│   ├── providers/        # AI provider configs
│   └── api-wrapper.ts    # API middleware
├── config/                # Configuration files
├── public/                # Static assets
└── better-auth/           # Auth migrations
```

## Resources

- [Firecrawl API](https://docs.firecrawl.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Docs](https://better-auth.com)
- [Autumn Documentation](https://docs.useautumn.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)

## License

MIT License
# squidcrawl
