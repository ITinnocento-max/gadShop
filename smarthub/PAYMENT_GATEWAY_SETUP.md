===============================================
  SMARTHUB - PAYMENT GATEWAY SETUP GUIDE
  MTN Mobile Money (MoMo) & Airtel Money
===============================================

This guide walks you through obtaining and configuring
API credentials for MTN MoMo and Airtel Money payment
gateways in your SmartHub deployment.


-----------------------------------------------
  1. MTN MOBILE MONEY (MoMo) API
-----------------------------------------------

Step 1: Create a Developer Account
  - Go to https://momodeveloper.mtn.com
  - Click "Sign Up" and create an account
  - Verify your email address

Step 2: Create a Product/Subscription
  - After logging in, go to "Products"
  - Click "Create a Product" or "Subscribe"
  - Select "Collections" (for receiving payments)
  - Give your product a name (e.g., "SmartHub Shop")
  - Select your environment:
      * "Sandbox" for testing
      * "Production" for live payments
  - Submit and note your Subscription Key

Step 3: Get API User and API Key
  - Go to your product dashboard
  - Find "API User" and "API Key" credentials
  - Copy both values - you will need them

Step 4: Add to Render.com Environment
  - Go to your Render dashboard
  - Select your SmartHub service
  - Go to "Environment" tab
  - Add the following variables:

      MTN_MOMO_API_USER        = <your_api_user>
      MTN_MOMO_API_KEY          = <your_api_key>
      MTN_MOMO_SUBSCRIPTION_KEY = <your_subscription_key>
      MTN_MOMO_ENVIRONMENT      = production
      MTN_MOMO_CALLBACK_URL     = https://gadshop.onrender.com/api/payments/webhook/mtn-momo

Step 5: Configure Callback URL (Production Only)
  - In your MTN Developer Portal, go to your product settings
  - Set the "Callback URL" to:
      https://gadshop.onrender.com/api/payments/webhook/mtn-momo
  - This allows MTN to notify your server when a payment
    is confirmed (instead of relying on polling)

-----------------------------------------------
  2. AIRTEL MONEY API
-----------------------------------------------

Step 1: Create a Developer Account
  - Go to https://developer.airtel.africa
  - Click "Sign Up" and create an account
  - Verify your email address

Step 2: Create an Application
  - After logging in, go to "My Apps"
  - Click "Create App" or "New Application"
  - Give it a name (e.g., "SmartHub Shop")
  - Select the required API scopes:
      * "Airtel Money" (for collections/payments)
  - Select your environment:
      * "Sandbox" for testing
      * "Production" for live payments
  - Submit the application

Step 3: Get Client ID and Client Secret
  - Go to your application dashboard
  - Find "Client ID" and "Client Secret"
  - Copy both values - you will need them

Step 4: Add to Render.com Environment
  - Go to your Render dashboard
  - Select your SmartHub service
  - Go to "Environment" tab
  - Add the following variables:

      AIRTEL_MONEY_CLIENT_ID     = <your_client_id>
      AIRTEL_MONEY_CLIENT_SECRET = <your_client_secret>
      AIRTEL_MONEY_ENVIRONMENT   = production
      AIRTEL_MONEY_CALLBACK_URL  = https://gadshop.onrender.com/api/payments/webhook/airtel-money

Step 5: Configure Callback URL (Production Only)
  - In your Airtel Developer Portal, go to your app settings
  - Set the "Callback URL" to:
      https://gadshop.onrender.com/api/payments/webhook/airtel-money
  - This allows Airtel to notify your server when a payment
    is confirmed


-----------------------------------------------
  3. ENVIRONMENT VARIABLES REFERENCE
-----------------------------------------------

Full list of payment-related environment variables:

  # MTN MoMo
  MTN_MOMO_API_USER          Your MTN API username
  MTN_MOMO_API_KEY           Your MTN API key
  MTN_MOMO_SUBSCRIPTION_KEY  Your MTN product subscription key
  MTN_MOMO_ENVIRONMENT       "sandbox" or "production"
  MTN_MOMO_CALLBACK_URL      Webhook URL for payment confirmations

  # Airtel Money
  AIRTEL_MONEY_CLIENT_ID       Your Airtel app client ID
  AIRTEL_MONEY_CLIENT_SECRET   Your Airtel app client secret
  AIRTEL_MONEY_ENVIRONMENT     "sandbox" or "production"
  AIRTEL_MONEY_CALLBACK_URL    Webhook URL for payment confirmations


-----------------------------------------------
  4. TESTING IN SANDBOX
-----------------------------------------------

Before going live, test with sandbox credentials:

  1. Set environment to "sandbox" for both gateways
  2. Use sandbox test phone numbers provided by each gateway:
     - MTN MoMo Sandbox: Use test MSISDN from MTN docs
     - Airtel Sandbox: Use test MSISDN from Airtel docs
  3. Sandbox payments will not charge real money
  4. Verify orders are created with PENDING status
  5. Verify payments transition to COMPLETED after approval

Sandbox Credentials Locations:
  - MTN Sandbox: https://momodeveloper.mtn.com (after login)
  - Airtel Sandbox: https://openapiuat.airtel.africa


-----------------------------------------------
  5. GOING LIVE (PRODUCTION)
-----------------------------------------------

When ready for live payments:

  1. Switch MTN_MOMO_ENVIRONMENT to "production"
  2. Switch AIRTEL_MONEY_ENVIRONMENT to "production"
  3. Replace sandbox API keys with production keys
  4. Ensure callback URLs are configured in both portals
  5. Test with a small real transaction first
  6. Monitor logs on Render.com for any errors


-----------------------------------------------
  6. PAYMENT FLOW DIAGRAM
-----------------------------------------------

  Customer                    SmartHub                   Gateway
     |                           |                         |
     |-- Select MoMo/Airtel ---->|                         |
     |-- Enter phone number ---->|                         |
     |-- Click Pay ------------->|                         |
     |                           |-- Create Order -------->|
     |                           |-- POST /payments ------->|
     |                           |   (initiate payment)    |
     |                           |<-- Reference ID --------|
     |<-- USSD/Push Prompt ------|                         |
     |                           |                         |
     |-- Approve on Phone ------>|   (polls every 3s)      |
     |                           |-- GET /status --------->|
     |                           |<-- PENDING -------------|
     |                           |                         |
     |                           |   ... (phone approved) |
     |                           |-- GET /status --------->|
     |                           |<-- SUCCESSFUL ----------|
     |<-- "Payment Successful" --|                         |
     |                           |-- Update DB: COMPLETED  |


-----------------------------------------------
  7. TROUBLESHOOTING
-----------------------------------------------

  Problem: "MTN MoMo credentials not configured"
  Fix: Ensure MTN_MOMO_API_USER, MTN_MOMO_API_KEY, and
       MTN_MOMO_SUBSCRIPTION_KEY are set in environment

  Problem: "Airtel Money credentials not configured"
  Fix: Ensure AIRTEL_MONEY_CLIENT_ID and
       AIRTEL_MONEY_CLIENT_SECRET are set in environment

  Problem: Payment stuck on "Processing"
  Fix: Check if sandbox credentials are being used with
       production environment (or vice versa)

  Problem: Webhook not updating payment status
  Fix: Ensure callback URL is correctly set in the
       gateway portal and matches your deployed URL

  Problem: "Token request failed"
  Fix: API keys may be expired or incorrect. Regenerate
       them in the respective developer portals

  Problem: Payments always fail
  Fix: Check Render.com logs for detailed error messages.
       Ensure the user has sufficient balance on their
       mobile money account.

===============================================
  END OF GUIDE
===============================================
