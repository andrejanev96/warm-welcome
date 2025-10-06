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
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

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
