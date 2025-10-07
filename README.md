# WarmWelcome.ai

WarmWelcome.ai helps e-commerce and SaaS teams send warmer onboarding emails by pairing an Express/Prisma API with a React/Tailwind dashboard.

## Email configuration

The backend now supports transactional delivery through SMTP providers like SendGrid. Set the following variables in `backend/.env` and restart the API:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid_api_key>
SMTP_SECURE=false
EMAIL_FROM="WarmWelcome.ai <verified-sender@example.com>"
```

If you need to smoke-test delivery without the UI you can trigger a reset manually:

```
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com"}'
```

## Password reset audit log

Every password-reset request is captured in the `password_reset_audit` table so you can monitor suspicious activity. To review the latest entries with Prisma, run:

```
npx prisma db pull
npx prisma studio
```

or query directly:

```
npx prisma db execute --script "SELECT email, status, request_ip, created_at FROM password_reset_audit ORDER BY created_at DESC LIMIT 20;"
```
