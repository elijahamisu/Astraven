# ASTRAVEN — Aviation Wealth Management Platform

## Production Deployment Checklist (Vercel)

1. **Environment Variables**:
   Configure these variables in your Vercel Project Settings (**Settings > Environment Variables**):
   - `VITE_SUPABASE_URL`: Your Supabase Project API URL (publicly safe).
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anonymous key (publicly safe).
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret service-role key (server-only).
   - `CRON_SECRET`: High-entropy token securing the automated income engine.

2. **Automated cPanel Cron Configuration**:
   To execute the investment income settlement engine every minute without exceeding Vercel Hobby limits:
   - Schedule: `* * * * *` (every minute)
   - Command:
     ```bash
     curl -s -X POST https://your-astraven-domain.vercel.app/api/cron/process-income \
          -H "Authorization: Bearer YOUR_SECURE_CRON_SECRET_HERE" > /dev/null 2>&1
     ```

3. **Supabase Database Preparation**:
   Run the SQL migrations located in `supabase/migrations/` sequentially in your Supabase SQL Editor.

## Payments (Afrstar Nigeria Payment API v2)

- **Deposits**: `deposit.html` → `POST /api/deposits/submit` creates an Afrstar collection order and redirects to the hosted checkout. The wallet is credited only by the verified webhook `POST /api/afrstar/collection-callback` (status `1`).
- **Referral commission**: paid only on gateway-confirmed deposits, inside the same database transaction as the credit (`confirm_gateway_deposit` → `process_referral_commission`). Rate: `site_settings.referral_config.commission_rate` (default 10%).
- **Withdrawals**: `withdraw.html` → `POST /api/withdrawals/request` reserves funds (status `pending`). An admin must **Approve & Pay** in `admin/withdrawals.html`, which calls the Afrstar payout API (status `processing`). `POST /api/afrstar/payout-callback` marks it `paid` (1) or `failed` + refunded (9). Admins can reject pending requests (refund).
- **Merchant portal callback URLs**: `https://<your-domain>/api/afrstar/collection-callback` and `https://<your-domain>/api/afrstar/payout-callback`.
- **Vercel env vars**: `AFRSTAR_MERCHANT_SN`, `AFRSTAR_MERCHANT_AK`, `AFRSTAR_MERCHANT_SK`, `SUPABASE_SERVICE_ROLE_KEY` (+ `VITE_SUPABASE_URL`/`SUPABASE_URL`).
- **Database**: `supabase/migrations/20261030_afrstar_gateway.sql`.
