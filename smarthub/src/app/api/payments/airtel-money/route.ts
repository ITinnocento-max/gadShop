import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AIRTEL_BASE =
  process.env.AIRTEL_MONEY_ENVIRONMENT === "production"
    ? "https://openapi.airtel.africa"
    : "https://openapiuat.airtel.africa";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.AIRTEL_MONEY_CLIENT_ID;
  const clientSecret = process.env.AIRTEL_MONEY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Airtel Money credentials not configured");
  }

  const res = await fetch(`${AIRTEL_BASE}/auth/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtel token request failed (${res.status}): ${body}`);
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
    const callbackUrl = process.env.AIRTEL_MONEY_CALLBACK_URL;
    const country = "RW";
    const currency = "RWF";

    const res = await fetch(
      `${AIRTEL_BASE}/merchant/v1/payments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          reference: orderId,
          transaction: {
            amount: String(amount),
            country,
            currency,
            customer: { phone: phone.replace(/\s/g, "") },
          },
          ...(callbackUrl ? { callbackUrl } : {}),
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("Airtel payment failed:", body);
      return NextResponse.json(
        { error: "Failed to initiate Airtel Money payment", details: body },
        { status: 502 }
      );
    }

    const data = await res.json();
    const transactionId = data.data?.transaction?.id || data.transaction?.id || orderId;

    await prisma.payment.update({
      where: { id: paymentId },
      data: { transactionId: String(transactionId), status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      transactionId,
      message: "Payment request sent. Please approve on your phone.",
    });
  } catch (error) {
    console.error("Airtel Money error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment gateway error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
    }

    const token = await getAccessToken();

    const res = await fetch(
      `${AIRTEL_BASE}/standard/v1/payments/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: "Failed to check status", details: body }, { status: 502 });
    }

    const data = await res.json();
    const gatewayStatus = data.data?.transaction?.status || data.transaction?.status || "";

    let status: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
    if (gatewayStatus === "SUCCESS") status = "COMPLETED";
    else if (gatewayStatus === "FAILED" || gatewayStatus === "REJECTED") status = "FAILED";

    const payment = await prisma.payment.findFirst({
      where: { transactionId },
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

    return NextResponse.json({ status, gatewayStatus });
  } catch (error) {
    console.error("Airtel Money status check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 500 }
    );
  }
}
