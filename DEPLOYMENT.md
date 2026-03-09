# Abancool Technology — Complete Deployment Guide

## Architecture

```
[React Frontend]  →  https://abancool.com  (Lovable published)
        ↓ (JWT Bearer tokens from Supabase Auth)
[PHP Backend API] →  https://abancool.com/backend/
        ↓
[MySQL Database]  →  abancoo1_webdb (cPanel MySQL)
        ↓
[WHM/cPanel API]  →  server.abancool.com:2087
[M-Pesa API]      →  api.safaricom.co.ke (PRODUCTION)
[Stripe API]      →  api.stripe.com
[SMTP Email]      →  mail.abancool.com
```

---

## Step 1: Database Setup

### 1.1 Create MySQL Database in cPanel
1. Log in to cPanel → **MySQL Databases**
2. Database should be: `abancoo1_webdb`
3. User should be: `abancoo1_labo`
4. Add user to database with **ALL PRIVILEGES**

### 1.2 Import Schema
Go to cPanel → **phpMyAdmin** → Select `abancoo1_webdb` → **Import** → Upload `backend/database/schema.sql`

This creates ALL tables and seeds 4 hosting plans automatically.

---

## Step 2: Upload PHP Backend

### 2.1 Upload Files
Upload the `backend/` folder contents to:
```
/home/abancoo1/public_html/backend/
```

### 2.2 Final Structure on Server
```
public_html/
└── backend/
    ├── .htaccess
    ├── index.php
    ├── config/
    │   ├── bootstrap.php
    │   ├── env.php          ← CREATE THIS (copy from env.example.php)
    │   └── env.example.php
    ├── api/
    │   ├── health.php
    │   ├── auth/profile.php, update-profile.php
    │   ├── cpanel/sso.php, stats.php, status.php
    │   ├── contact/submit.php
    │   ├── domains/list.php
    │   ├── hosting/plans.php, order.php
    │   ├── invoices/list.php
    │   ├── payments/mpesa-stk.php, mpesa-callback.php, stripe-intent.php, stripe-webhook.php, validation_url.php, confirmation_url.php
    │   ├── provisioning/provision.php
    │   └── support/tickets.php, replies.php
    ├── services/
    │   ├── WHMService.php
    │   ├── DirectAdminService.php
    │   ├── WHMCSService.php
    │   └── EmailService.php
    ├── database/
    │   └── schema.sql
    └── logs/                ← Auto-created
```

### 2.3 Create env.php
```bash
cd /home/abancoo1/public_html/backend/config/
cp env.example.php env.php
```
Then edit `env.php` with your real credentials (DB password, M-Pesa keys, JWT secret, etc.)

### 2.4 Set Permissions
```bash
chmod 644 config/env.php
chmod 755 .htaccess
mkdir -p logs
chmod 755 logs
```

---

## Step 3: Test Backend

```bash
# Health check (no auth needed)
curl https://abancool.com/backend/api/health

# Expected: {"status":"ok","database":"connected",...}

# Public endpoint
curl https://abancool.com/backend/api/hosting/plans

# Authenticated endpoint
curl https://abancool.com/backend/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Step 4: M-Pesa Configuration (Daraja Portal)

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
2. Set **Validation URL**: `https://abancool.com/backend/api/payments/validation_url`
3. Set **Confirmation URL**: `https://abancool.com/backend/api/payments/confirmation_url`
4. STK Push **Callback URL**: `https://abancool.com/backend/api/payments/mpesa/callback`
5. Whitelist your server IP

---

## Step 5: Stripe (Optional)

1. Stripe Dashboard → Webhooks → Add: `https://abancool.com/backend/api/payments/stripe/webhook`
2. Event: `payment_intent.succeeded`
3. Copy signing secret to `env.php` → `STRIPE_WEBHOOK_SECRET`

---

## API Endpoints (22 total)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| GET | /api/hosting/plans | No | List plans |
| POST | /api/contact/submit | No | Contact form |
| GET | /api/auth/profile | JWT | User profile |
| POST | /api/auth/update-profile | JWT | Update profile |
| GET | /api/cpanel/status | JWT | Hosting status |
| GET | /api/cpanel/stats | JWT | Resource usage |
| GET | /api/cpanel/sso | JWT | SSO auto-login URL |
| GET | /api/invoices/list | JWT | User invoices |
| GET | /api/domains/list | JWT | User domains |
| POST | /api/hosting/order | JWT | Create order + invoice |
| POST | /api/payments/mpesa | JWT | STK Push |
| POST | /api/payments/mpesa/callback | IP | Safaricom callback |
| POST | /api/payments/validation_url | IP | M-Pesa C2B validation |
| POST | /api/payments/confirmation_url | IP | M-Pesa C2B confirmation |
| POST | /api/payments/stripe/intent | JWT | Create PaymentIntent |
| POST | /api/payments/stripe/webhook | Sig | Stripe webhook |
| GET/POST | /api/support/tickets | JWT | Support tickets |
| GET/POST | /api/support/replies | JWT | Ticket replies |
| POST | /api/provisioning/provision | Internal | Auto-provision |
| POST | /api/whmcs/sync | Internal | WHMCS sync |

---

## Payment Flow

```
User → Purchase Plan → hosting_order (pending) + invoice (unpaid)
  → Pay Now → M-Pesa STK Push → User approves on phone
  → Safaricom callback → payment=completed, invoice=paid
  → Auto-provision → cPanel account created → hosting_order=active
  → Email notification sent to user
  → Dashboard shows real cPanel stats + SSO login
```

---

## GitHub Copilot Rules

1. **Never commit `config/env.php`** — contains secrets
2. All API calls go through `src/lib/api.ts` — never use `fetch()` in components
3. All PHP endpoints use `authenticate()` for protected routes
4. All SQL uses prepared statements — no string concatenation
5. Every `api.ts` function has a Supabase fallback
6. Never edit `src/integrations/supabase/client.ts` or `types.ts`
7. Use `appLog()` for PHP logging, never `echo`/`print`
8. Use `EmailService` for notifications
9. M-Pesa callbacks verify by IP, Stripe by signature
10. Add new endpoints: create PHP file → add to `index.php` router → add to `api.ts`

---

## Security Checklist

- [ ] `env.php` permissions set to 644
- [ ] `.htaccess` blocks `/config/`, `/logs/`, `/services/`
- [ ] CORS restricted to `abancool.com` origins
- [ ] JWT verification active on all authenticated endpoints
- [ ] Rate limiting on STK Push (1/minute per user)
- [ ] Prepared statements everywhere
- [ ] No secrets in frontend code
- [ ] SSL active on domain
