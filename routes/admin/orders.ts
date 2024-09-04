import { Router } from "express";
import { Order } from "../../models/Order";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();

router.get("/get/user-orders/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req?.params;
    const userOrders = await Order.find({ user: userId })
      .populate("user", "name")
      .sort("dateOrdered");

    if (!userOrders) {
      return res
        .status(500)
        .json({ status: false, message: "No orders in your list", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: userOrders,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
