# PAYGO RedotPay Guide — Acquisition v1

## Project
Static HTML site deployed on Vercel with Supabase analytics and a passwordless admin dashboard.

## Supabase
Project ref: yikjmrnyspoaktzxecli
URL: https://yikjmrnyspoaktzxecli.supabase.co

Tables:
- acquisition_events: public, limited event ingestion; admin-only read.
- acquisition_conversions: admin-only conversion records.
- acquisition_campaigns: admin-only campaign management.

The browser uses only the Supabase publishable key. Never put a service_role/secret key in frontend code.

## Admin
Open /admin.html and request a magic link for jrsamadh@gmail.com.
In Supabase Auth URL Configuration, add the production site URL and the preview URL to allowed redirect URLs. Configure SMTP for reliable email delivery.

## Tracking
Supported events: page_view, invite_click, promo_copy, whatsapp_click, signup_start, signup_confirmed, kyc_verified, card_requested.
The public site automatically records page_view, invite_click, promo_copy and whatsapp_click.
Signup/KYC/card conversion events must only be inserted after trusted confirmation from RedotPay or an authorized manual admin process. A link click is not a signup.

UTM example:
https://redotpay-guide.vercel.app/?utm_source=tiktok&utm_medium=organic&utm_campaign=launch_mz&utm_content=video_01

## Campaign facts
Referral code: jt6mg
Referral URL: https://url.hk/i/pt/jt6mg
Promotional codes supplied by owner: PAYGOP20 and PAUGOV20.
Their eligibility and card mapping must be confirmed in the official checkout before advertising a specific discount.
WhatsApp contact retained from existing site: +258 871 002 255.

## Deployment
Vercel can deploy this static site from the repository root. The existing production branch is not changed by this feature branch.
