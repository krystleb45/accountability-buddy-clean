# Accountability Buddy - Operations Guide

A quick reference for where to find and change things in production.

---

## 📍 Quick Reference: Where to Change Things

| What | Where | Type |
|------|-------|------|
| FAQ content | MongoDB Atlas → `faqs` collection | Database |
| Blog posts | MongoDB Atlas → `blogposts` collection | Database |
| Book recommendations | MongoDB Atlas → `books` collection | Database |
| Military resources | Code: `apps/frontend/src/data/default-military-resources.ts` | Code |
| Pricing plans | Code: `packages/shared/src/pricing.ts` | Code |
| Trial duration | Code: `apps/backend/src/api/controllers/auth-controller.ts` | Code |
| Scrolling quotes | Code: `apps/frontend/src/components/quotes.tsx` | Code |
| Stripe prices | Stripe Dashboard → Products | Stripe |
| Environment variables | Railway Dashboard | Railway |

---

## 🗄️ MongoDB Atlas Changes

**URL:** https://cloud.mongodb.com

### Collections You May Need to Edit:

#### `faqs` - Frequently Asked Questions
- **Fields:** `question`, `answer`
- **Example:** Change trial duration wording, update feature descriptions

#### `blogposts` - Blog Articles
- **Fields:** `title`, `content`, `excerpt`, `author`, `isPublished`, `tags`
- **Note:** Can also manage via Admin Dashboard → Blog Management

#### `books` - Book Recommendations
- **Fields:** `title`, `author`, `description`, `amazonLink`, `category`
- **Note:** Can also manage via Admin Dashboard → Books Management

#### `users` - User Accounts
- **Fields:** `email`, `username`, `role`, `subscription_status`, `subscriptionTier`
- **Common tasks:** 
  - Change user role to `admin` or `moderator`
  - Reset subscription status
  - Verify a user manually (`isVerified: true`)

#### `badges` / `badgetypes` - Gamification Badges
- **Fields:** `name`, `description`, `iconKey`, `criteria`
- **Note:** Badge types can be managed via Admin Dashboard

---

## 💻 Code Changes (Require Deploy)

### Pricing & Subscriptions
```
packages/shared/src/pricing.ts
```
- Plan names, prices, features list, trial days
- After changing, commit + push to deploy

### Trial Duration (Backend Logic)
```
apps/backend/src/api/controllers/auth-controller.ts
```
- Search for `addDays(new Date(), 7)` - this sets actual trial length
- Must match what's shown in pricing.ts

### Military Support Resources
```
apps/frontend/src/data/default-military-resources.ts
```
- External links to VA, crisis lines, benefits portals
- Update if any government sites change URLs

### Homepage Scrolling Quotes
```
apps/frontend/src/components/quotes.tsx
```
- `QUOTES` array at top of file
- Add/remove/edit motivational quotes

### Navigation Links
```
apps/frontend/src/components/navbar/index.tsx          # Public nav links
apps/frontend/src/components/navbar/navbar-dropdown.tsx # Account dropdown
```

### Subscription Validation (Plan IDs)
```
apps/backend/src/api/routes/subscription.ts
```
- `planId: z.enum(["free-trial", "pro"])` - valid plan options
- Update if adding/removing tiers

---

## 💳 Stripe Dashboard Changes

**Test Mode:** https://dashboard.stripe.com/test
**Live Mode:** https://dashboard.stripe.com

### Products & Pricing
- **Location:** Product Catalog → Products
- **Current Product:** "Pro" with monthly ($14.99) and yearly ($149) prices
- **Important:** Each price needs a `lookup_key`:
  - Monthly: `pro_monthly`
  - Yearly: `pro_yearly`

### Webhooks
- **Location:** Developers → Webhooks
- **Endpoint:** `https://api.accountabilitybuddys.com/api/subscription/webhook`
- **Events listened:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### Customer Management
- **Location:** Customers
- View subscription status, payment history, cancel subscriptions

---

## 🚂 Railway Environment Variables

**URL:** https://railway.app

### Critical Variables:
| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API (use `sk_test_` for test, `sk_live_` for prod) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Authentication tokens |
| `MAILCHIMP_API_KEY` | Newsletter subscriptions |
| `MAILCHIMP_AUDIENCE_ID` | Newsletter list ID |
| `MAILCHIMP_SERVER_PREFIX` | e.g., `us14` |

### Switching to Production:
1. Change `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...`
2. Change `STRIPE_WEBHOOK_SECRET` to live webhook secret
3. Verify `MONGO_URI` points to production database

---

## 📧 Mailchimp (Newsletters)

**URL:** https://mailchimp.com

### Sending Newsletters:
1. Go to Campaigns → Create Campaign
2. Select Email → Regular
3. Choose your audience
4. Design email with drag-and-drop editor
5. Send or schedule

### Managing Subscribers:
- Location: Audience → All Contacts
- Subscribers are auto-tagged with `website-signup`

---

## 🔍 Sentry (Error Monitoring)

**URL:** https://sentry.io

- View production errors in real-time
- Check stack traces to find bug locations
- Set up alerts for critical errors

---

## 📁 Important File Locations

### Frontend (`apps/frontend/src/`)
```
components/
  navbar/index.tsx           # Navigation bar
  navbar/navbar-dropdown.tsx # Account dropdown menu
  pricing.tsx                # Pricing cards component
  quotes.tsx                 # Scrolling quotes

app/
  home.tsx                   # Homepage
  faq/                       # FAQ page
  military-support/          # Military support pages
  (authenticated)/admin/     # Admin dashboard pages

data/
  default-military-resources.ts  # Military support links
```

### Backend (`apps/backend/src/`)
```
api/
  controllers/
    auth-controller.ts       # Login, register, trial setup
    subscription-controller.ts # Stripe checkout, webhooks
  
  routes/
    subscription.ts          # Subscription endpoints
    newsletter.ts            # Mailchimp integration
  
  services/
    stripe-service.ts        # Stripe webhook handlers
    email-service.ts         # Transactional emails
    badge-service.ts         # Gamification badges

  models/
    User.ts                  # User schema & methods
    Faq.ts                   # FAQ schema
```

### Shared (`packages/shared/src/`)
```
pricing.ts                   # Pricing tiers & features
military-chat-rooms.ts       # Chat room definitions
```

---

## 🚀 Deployment Checklist

### After Code Changes:
1. `git add .`
2. `git commit -m "description"`
3. `git push`
4. Railway auto-deploys from GitHub
5. Vercel auto-deploys frontend

### After Database Changes:
- Changes are immediate, no deploy needed

### After Stripe Changes:
- Changes are immediate, no deploy needed
- Test with Stripe test mode first!

---

## 🆘 Common Issues & Fixes

### "User can't log in"
- Check MongoDB → `users` → find by email
- Verify `isVerified: true`
- Check `subscription_status` isn't `expired`

### "Subscription not working"
- Check Stripe Dashboard → Customers → find user
- Verify webhook is receiving events (Developers → Webhooks → check for failures)
- Check Railway logs for errors

### "FAQ/Blog not showing"
- Check MongoDB collection has documents
- Verify `isPublished: true` for blog posts
- Check `isActive: true` for resources

### "Newsletter signup failing"
- Check Railway has all 3 Mailchimp env vars
- Verify API key is valid in Mailchimp
- Check Mailchimp audience exists

---

## 📞 Quick Links

| Service | URL |
|---------|-----|
| MongoDB Atlas | https://cloud.mongodb.com |
| Stripe (Test) | https://dashboard.stripe.com/test |
| Stripe (Live) | https://dashboard.stripe.com |
| Railway | https://railway.app |
| Vercel | https://vercel.com |
| Mailchimp | https://mailchimp.com |
| Sentry | https://sentry.io |
| GitHub Repo | (your repo URL) |

---

*Last updated: January 2026*