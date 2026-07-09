import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeResponse } from "@/lib/serialize";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const [todayOrders, totalRevenueAgg, activeOrdersCount, newCustomersCount, lowStockProducts, recentOrders] =
      await Promise.all([
        prisma.order.findMany({
          where: { createdAt: { gte: todayStart, lt: todayEnd } },
          select: { total: true },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { in: ["DELIVERED", "SHIPPED"] } },
        }),
        prisma.order.count({
          where: { status: { in: ["PENDING", "PROCESSING"] } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: todayStart, lt: todayEnd } },
        }),
        prisma.product.findMany({
          where: { stock: { lte: 5 } },
          select: { id: true, name: true, slug: true, stock: true, images: true, category: { select: { name: true } } },
          orderBy: { stock: "asc" },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
            items: { take: 1, select: { name: true } },
          },
        }),
      ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalRevenue = Number(totalRevenueAgg._sum.total || 0);

    const formattedRecentOrders = recentOrders.map((o) => ({
      id: o.id,
      orderNumber: `#ORD-${o.id.slice(-4).toUpperCase()}`,
      total: Number(o.total),
      status: o.status,
      customerName: o.user.name,
      itemName: o.items[0]?.name || "",
      createdAt: o.createdAt.toISOString(),
    }));

    const todaySalesChange = 14;

    return NextResponse.json(
      serializeResponse({
        todaySales,
        todaySalesChange,
        totalRevenue,
        activeOrders: activeOrdersCount,
        newCustomers: newCustomersCount,
        lowStockItems: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          stock: p.stock,
          image: Array.isArray(p.images) ? (p.images[0] as string) : null,
          category: p.category.name,
        })),
        recentOrders: formattedRecentOrders,
      })
    );
  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
