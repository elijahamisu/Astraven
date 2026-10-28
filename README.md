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
