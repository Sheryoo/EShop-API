import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/get/user-orders/:userId", adminAuth, async (req: any, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      populate = [],
      sort = {},
      filters = {},
    } = req?.query;
    const { userId } = req?.params;
    const userOrders = await prisma?.order.findMany({
      where: { ...filters, user: userId },
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
      orderBy: { ...sort, createdAt: "desc" },
      include: {
        ...(populate?.includes("orderItems") && {
          orderItems: {
            include: {
              product: { select: { name: true, image: true, price: true } },
            },
          },
        }),
        ...(populate?.includes("user")
          ? { user: { select: { firstName: true } } }
          : {}),
      },
    });

    if (!userOrders) {
      return res
        .status(500)
        .json({ status: false, message: "No orders in your list", data: null });
    }

    const totalEntries = await prisma?.order?.count({
      where: { ...filters, user: userId },
    });

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: userOrders,
      pagination: {
        page: +page,
        pageSize: +pageSize,
        totalResults: userOrders?.length,
        totalEntries,
        totalPages: Math.ceil(totalEntries / +pageSize),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
