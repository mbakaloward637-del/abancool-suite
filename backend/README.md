# Abancool Technology — PHP Backend API

## Deployment on cPanel

### 1. Upload Files
Upload the entire `backend/` folder to your cPanel server. Recommended path:
```
/home/username/public_html/api/
```
Or as a subdomain: `api.abancool.com` → `/home/username/api.abancool.com/`

### 2. Configure Environment
```bash
cp config/env.example.php config/env.php
```
Edit `config/env.php` with your actual credentials:
- Database connection (PostgreSQL or MySQL)
- WHM API token
- DirectAdmin credentials
- WHMCS API keys
- M-Pesa consumer key/secret
- Stripe secret key

### 3. Create Logs Directory
```bash
mkdir -p logs
chmod 755 logs
```

### 4. Set Permissions
```bash
chmod 644 config/env.php
chmod 755 .htaccess
```

### 5. Test Endpoints
```bash
# Health check
curl https://api.abancool.com/api/cpanel/status \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT"

# M-Pesa STK Push
curl -X POST https://api.abancool.com/api/payments/mpesa \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"invoice_id": "xxx", "phone": "0712345678"}'
```

### 6. M-Pesa Callback URL
Set your callback URL in the Safaricom Daraja portal:
```
https://api.abancool.com/api/payments/mpesa/callback
```

### 7. Stripe Webhook
Add webhook in Stripe Dashboard pointing to:
```
https://api.abancool.com/api/payments/stripe/webhook
```
Events to listen for: `payment_intent.succeeded`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/cpanel/sso | JWT | Generate SSO auto-login URL |
| GET | /api/cpanel/stats | JWT | Real usage stats from panel |
| GET | /api/cpanel/status | JWT | Check if user has active hosting |
| POST | /api/provisioning/provision | Internal | Auto-provision after payment |
| POST | /api/payments/mpesa | JWT | Initiate M-Pesa STK Push |
| POST | /api/payments/mpesa/callback | None* | Safaricom callback |
| POST | /api/payments/stripe/intent | JWT | Create Stripe PaymentIntent |
| POST | /api/payments/stripe/webhook | None* | Stripe webhook |
| POST | /api/whmcs/sync | Internal | Sync to WHMCS billing |

\* Verified via IP whitelist (M-Pesa) or signature (Stripe)

## Database Changes Required

Run these SQL migrations on your database:

```sql
-- Add panel_type to hosting_plans
ALTER TABLE hosting_plans ADD COLUMN IF NOT EXISTS panel_type VARCHAR(20) DEFAULT 'cpanel';
ALTER TABLE hosting_plans ADD COLUMN IF NOT EXISTS whmcs_product_id INT NULL;

-- Add panel_type to hosting_orders
ALTER TABLE hosting_orders ADD COLUMN IF NOT EXISTS panel_type VARCHAR(20) DEFAULT 'cpanel';

-- Add checkout_request_id to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(100) NULL;

-- Add whmcs_client_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whmcs_client_id INT NULL;
```
