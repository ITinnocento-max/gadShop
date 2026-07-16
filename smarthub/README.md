# SmartHub Shop

Multi-vendor e-commerce platform built with Next.js 16, Prisma ORM, and MariaDB.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Prisma ORM + MariaDB (Aiven)
- **Auth:** Custom (Zustand + bcrypt)
- **Payments:** MTN Mobile Money (MoMo) + Airtel Money
- **Storage:** Cloudinary (images)
- **Deployment:** Render.com

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="mysql://..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# MTN Mobile Money
MTN_MOMO_API_USER="..."
MTN_MOMO_API_KEY="..."
MTN_MOMO_SUBSCRIPTION_KEY="..."
MTN_MOMO_ENVIRONMENT="sandbox"
MTN_MOMO_CALLBACK_URL="https://your-domain.com/api/payments/webhook/mtn-momo"

# Airtel Money
AIRTEL_MONEY_CLIENT_ID="..."
AIRTEL_MONEY_CLIENT_SECRET="..."
AIRTEL_MONEY_ENVIRONMENT="sandbox"
AIRTEL_MONEY_CALLBACK_URL="https://your-domain.com/api/payments/webhook/airtel-money"
```

## Payment Gateway Setup

### MTN Mobile Money (MoMo)

**Step 1:** Create a developer account at [momodeveloper.mtn.com](https://momodeveloper.mtn.com)

**Step 2:** Create a product and select "Collections" (for receiving payments)

**Step 3:** Choose environment:
- **Sandbox** for testing
- **Production** for live payments

**Step 4:** Copy your credentials:
- API User
- API Key
- Subscription Key

**Step 5:** Add to Render.com environment variables:

```
MTN_MOMO_API_USER        = your_api_user
MTN_MOMO_API_KEY          = your_api_key
MTN_MOMO_SUBSCRIPTION_KEY = your_subscription_key
MTN_MOMO_ENVIRONMENT      = production
MTN_MOMO_CALLBACK_URL     = https://gadshop.onrender.com/api/payments/webhook/mtn-momo
```

**Step 6:** Set callback URL in MTN portal to:
```
https://gadshop.onrender.com/api/payments/webhook/mtn-momo
```

---

### Airtel Money

**Step 1:** Create a developer account at [developer.airtel.africa](https://developer.airtel.africa)

**Step 2:** Create an application and select "Airtel Money" scope

**Step 3:** Choose environment:
- **Sandbox** for testing
- **Production** for live payments

**Step 4:** Copy your credentials:
- Client ID
- Client Secret

**Step 5:** Add to Render.com environment variables:

```
AIRTEL_MONEY_CLIENT_ID       = your_client_id
AIRTEL_MONEY_CLIENT_SECRET   = your_client_secret
AIRTEL_MONEY_ENVIRONMENT     = production
AIRTEL_MONEY_CALLBACK_URL    = https://gadshop.onrender.com/api/payments/webhook/airtel-money
```

**Step 6:** Set callback URL in Airtel portal to:
```
https://gadshop.onrender.com/api/payments/webhook/airtel-money
```

---

### Payment Flow

```
Customer selects MoMo/Airtel → Enters phone → Clicks Pay
        ↓
Order created (PENDING payment)
        ↓
Gateway API called → USSD/Push sent to phone
        ↓
Customer approves on phone
        ↓
Payment confirmed → Status: COMPLETED → Order: PROCESSING
```

### Testing

1. Set both gateways to `sandbox`
2. Use sandbox test phone numbers from each gateway's docs
3. Verify orders show PENDING until payment is approved
4. Verify status updates to COMPLETED after approval

### Troubleshooting

| Error | Fix |
|-------|-----|
| "credentials not configured" | Add the env vars in Render.com |
| Payment stuck on "Processing" | Check sandbox/production mismatch |
| "Token request failed" | Regenerate API keys in portal |
| Webhook not updating status | Verify callback URL in gateway portal |

Full setup guide: [`PAYMENT_GATEWAY_SETUP.md`](./PAYMENT_GATEWAY_SETUP.md)

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin panel (protected)
│   ├── (shop)/           # Customer-facing pages
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin UI components
│   ├── customer/         # Customer guard
│   ├── store/            # Store UI components
│   └── ui/               # Shared UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, permissions, translations
├── stores/               # Zustand state stores
└── i18n/                 # Translation files (EN, FR, SW, RW)
```

## License

Proprietary - All rights reserved.
