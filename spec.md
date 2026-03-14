# Renqo

## Current State
Property management app (previously RentEase) with owner/tenant login, dashboard, tenants, payments, bills, reminders.

## Requested Changes (Diff)

### Add
- Attractive landing page before login: Renqo brand, tagline, feature highlights, CTA.

### Modify
- App.tsx: add landing state, rename RentEase to Renqo.
- Login.tsx: rename RentEase to Renqo.

### Remove
- Nothing.

## Implementation Plan
1. Create Landing.tsx with hero section, tagline, 3 feature cards, Get Started CTA.
2. Update App.tsx: landing state shown first, transitions to login on CTA click.
3. Replace all RentEase text with Renqo.
