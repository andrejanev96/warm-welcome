# WarmWelcome.ai

An AI-powered SaaS platform that transforms robotic onboarding emails into warm, personalized experiences for e-commerce and SaaS businesses.

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma
- JWT Authentication
- OpenAI API
- SendGrid/Mailgun

### Frontend
- React + Vite
- Tailwind CSS
- React Query
- React Router

## Getting Started

### Prerequisites
- Node.js 20.19.0 (run `nvm use` to align with the repo's `.nvmrc`)
- npm 10+ (bundled with the Node release above) or Yarn

> ℹ️ The development environment uses SQLite via Prisma by default. PostgreSQL is only required once you connect a real database.

### Backend Setup
```bash
nvm use # or `nvm install` the first time
cd backend
npm install
cp .env.example .env
# Configure your .env file
#  - Set SHOPIFY_API_KEY / SHOPIFY_API_SECRET from your Partner dashboard
#  - Set SHOPIFY_REDIRECT_URI to your tunnel URL (e.g., https://xxxx.ngrok.io/api/shopify/callback)
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
nvm use # ensure you're on Node 20.19.0+
cd frontend
npm install
npm run dev -- --host
```

### Connecting a Shopify test store
1. Create a free Shopify Partner account and spin up a **development store**.
2. Inside that store, enable custom app development and create a custom app (WarmWelcome).
3. Copy the app’s **API key** and **API secret** into `backend/.env` (`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`).
4. Configure an **Allowed redirect URL** in Shopify to match your tunnel (e.g., `https://xxxx.ngrok.io/api/shopify/callback`) and set the same value in `SHOPIFY_REDIRECT_URI`.
5. Run a tunnel such as `ngrok http 5001` so Shopify can reach your local backend.
6. Call `POST /api/shopify/install` with your store domain while authenticated to generate the install URL, then follow the prompt to approve the app.

## Project Structure

```
backend/
â"œâ"€â"€ src/
â"‚   â"œâ"€â"€ controllers/   # API handlers
â"‚   â"œâ"€â"€ routes/        # Express routes
â"‚   â"œâ"€â"€ middleware/    # Auth, validation
â"‚   â"œâ"€â"€ services/      # Business logic
â"‚   â""â"€â"€ utils/         # Helpers
â"œâ"€â"€ prisma/           # Database schema
â""â"€â"€ server.js         # Entry point

frontend/
â"œâ"€â"€ src/
â"‚   â"œâ"€â"€ components/   # React components
â"‚   â"œâ"€â"€ pages/        # Page components
â"‚   â"œâ"€â"€ hooks/        # Custom hooks
â"‚   â""â"€â"€ utils/        # Helper functions
â""â"€â"€ index.html
```

## Development Roadmap

- [x] Project setup
- [ ] Authentication system
- [ ] Shopify integration
- [ ] Campaign management
- [ ] AI email generation
- [ ] Analytics dashboard

## License

MIT
