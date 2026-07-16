import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MTN_BASE =
  process.env.MTN_MOMO_ENVIRONMENT === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

async function getAccessToken(): Promise<string> {
  const apiUser = process.env.MTN_MOMO_API_USER;
  const apiKey = process.env.MTN_MOMO_API_KEY;
  const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;

  if (!apiUser || !apiKey || !subscriptionKey) {
    throw new Error("MTN MoMo credentials not configured");
  }

  const credentials = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  const res = await fetch(`${MTN_BASE}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MTN token request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { phone, amount, orderId, paymentId } = await request.json();

    if (!phone || !amount || !orderId || !paymentId) {
      return NextResponse.json(
        { error: "Missing required fields: phone, amount, orderId, paymentId" },
        { status: 400 }
      );
    }

    const token = await getAccessToken();
    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
    const callbackUrl = process.env.MTN_MOMO_CALLBACK_URL;

    const referenceId = crypto.randomUUID();

    const res = await fetch(
      `${MTN_BASE}/collection/v1_0/requesttopay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": process.env.MTN_MOMO_ENVIRONMENT || "sandbox",
          "Ocp-Apim-Subscription-Key": subscriptionKey!,
          "Content-Type": "application/json",
          ...(callbackUrl ? { "X-Callback-Url": callbackUrl } : {}),
        },
        body: JSON.stringify({
          amount: String(amount),
          currency: "RWF",
          externalId: orderId,
          payer: { partyIdType: "MSISDN", partyId: phone.replace(/\s/g, "") },
          payerMessage: "Pay for your SmartHub order",
          payeeNote: "SmartHub payment",
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("MTN requestToPay failed:", body);
      return NextResponse.json(
        { error: "Failed to initiate MTN MoMo payment", details: body },
        { status: 502 }
      );
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: { transactionId: referenceId, status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      referenceId,
      message: "Payment request sent. Please approve on your phone.",
    });
  } catch (error) {
    console.error("MTN MoMo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment gateway error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get("referenceId");

    if (!referenceId) {
      return NextResponse.json({ error: "referenceId is required" }, { status: 400 });
    }

    const token = await getAccessToken();
    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;

    const res = await fetch(
      `${MTN_BASE}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": process.env.MTN_MOMO_ENVIRONMENT || "sandbox",
          "Ocp-Apim-Subscription-Key": subscriptionKey!,
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: "Failed to check status", details: body }, { status: 502 });
    }

    const data = await res.json();

    let status: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
    if (data.status === "SUCCESSFUL") status = "COMPLETED";
    else if (data.status === "FAILED") status = "FAILED";

    const payment = await prisma.payment.findFirst({
      where: { transactionId: referenceId },
    });

    if (payment && status !== "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          ...(status === "COMPLETED" ? { order: { update: { status: "PROCESSING", paidAt: new Date() } } } : {}),
        },
      });
    }

    return NextResponse.json({ status, gatewayStatus: data.status, reason: data.reason });
  } catch (error) {
    console.error("MTN MoMo status check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 500 }
    );
  }
}
