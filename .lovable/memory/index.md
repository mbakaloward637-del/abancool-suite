# Memory: index.md
Updated: just now

# Abancool Technology Project

## Design System
- Primary: Blue (HSL 214 80% 45%)
- Accent: Orange (HSL 28 90% 52%) — used for labels, CTAs, hover effects
- Hero BG: Dark navy (HSL 220 20% 10%)
- Fonts: Plus Jakarta Sans (headings), Inter (body)
- Style: XtraTheme Factory 2 inspired — industrial corporate
- Section labels: uppercase, orange, with left bar (`.section-label`)
- Cards: `.service-card` with bottom-line hover, `.project-card` with overlay
- Rounded: `rounded-sm` throughout (sharp, industrial feel)
- No dark mode toggle

## Structure
- Public site with Layout (Header + Footer)
- Client portal at /client/* — wide hosting-style layout with horizontal tabs (NO sidebar)
- Uses WHMCS backend via edge function proxy (whmcs-proxy)
- Login/register/logout redirect to WHMCS pages directly
- Admin panel at /admin (no layout wrapper)
- Currency: KES primary, USD/EUR/GBP switcher in header top bar

## WHMCS Integration
- Secret names: WHMCS_IDENTFIER (typo, missing I), WHMCS_SECRET
- Edge function: whmcs-proxy — maps Supabase JWT user email to WHMCS client ID
- All manage/pay actions open WHMCS client area URLs in new tabs
- Login form POSTs to https://abancool.com/clients/dologin.php

## Company
- Abancool Technology, Garissa Kenya
- Phone: 0728825152, Email: info@abancool.com
