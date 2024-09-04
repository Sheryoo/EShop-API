import { Router } from "express";
import { Order } from "../../models/Order";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();

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
    const userOrders = await Order?.find({ ...filters, user: userId })
      ?.limit(+pageSize)
      ?.skip((+page - 1) * +pageSize)
      ?.populate([
        ...populate,
        ...(populate?.includes("user")
          ? [{ path: "user", select: "name" }]
          : []),
      ])
      ?.sort({ ...sort, dateOrdered: -1 });

    if (!userOrders) {
      return res
        .status(500)
        .json({ status: false, message: "No orders in your list", data: null });
    }

    const totalEntries = await Order?.countDocuments({ user: userId });

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
