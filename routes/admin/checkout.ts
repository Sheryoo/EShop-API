import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", adminAuth, async (req: any, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      populate = [],
      sort = {},
      filters = {},
    } = req?.query;
    const checkouts = await prisma?.checkout?.findMany({
      where: {
        ...filters,
        userId: req?.user?.id,
      },
      include: {
        ...(populate.includes("user") && {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        }),
        ...(populate.includes("order") && {
          order: {
            include: {
              orderItems: true,
            },
          },
        }),
      },
      take: +pageSize,
      skip: (+page - 1) * +pageSize,
      orderBy: {
        ...sort,
      },
    });

    if (!checkouts) {
      return res
        .status(404)
        .json({ status: false, message: "No checkouts found", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Checkouts fetched successfully",
      data: checkouts,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req?.params;
    const checkout = await prisma?.checkout?.findUnique({
      where: {
        id: +id,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!checkout) {
      return res
        .status(404)
        .json({ status: false, message: "Checkout not found", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Checkout fetched successfully",
      data: checkout,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
