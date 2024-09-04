import { Router } from "express";
import { Order } from "../../models/Order";
import { OrderItem } from "../../models/Order-Items";
import { userAuth } from "../../helpers/jwt_Auth";

const router = Router();

router.get(`/`, userAuth, async (req: any, res) => {
  try {
    const orders = await Order.find()
      .where("user", req?.auth?.userId)
      .populate("user", "name")
      .sort("dateOrdered");

    if (!orders) {
      return res
        .status(500)
        .json({ status: false, message: "No orders in your list", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, data: null });
  }
});

router.get(`/:id`, userAuth, async (req: any, res) => {
  try {
    const { id } = req?.params;
    const { auth } = req;

    const order = await Order.findById(id)
      .where("user", auth?.userId)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort("dateOrdered");

    if (!order) {
      return res
        .status(500)
        .json({ status: false, message: "No order in your list", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.post("/", userAuth, async (req: any, res) => {
  try {
    const { userId } = req?.auth;
    const {
      orderItems,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      status,
    } = req?.body;

    const orderItemsIds = Promise.all(
      orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem?.quantity,
          product: orderItem?.product,
        });

        newOrderItem = await newOrderItem?.save();

        return newOrderItem?._id;
      }),
    );
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem: any = await OrderItem?.findById(orderItemId).populate(
          "product",
          "price",
        );
        const totalPrice = +orderItem?.quantity * +orderItem?.product?.price;

        return totalPrice;
      }),
    );

    const totalPrice = totalPrices?.reduce((a, b) => a + b, 0);

    const order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      status,
      totalPrice: totalPrice,
      user: userId,
    });

    await order.save();

    if (!order)
      return res.status(400).json({
        status: false,
        message: "The order cannot be created!",
        data: null,
      });

    return res.json({
      status: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err,
      data: null,
    });
  }
});

router.put("/update/:id", userAuth, async (req, res) => {
  try {
    const { id } = req?.params;
    const { status } = req?.body;

    const order = await Order?.findByIdAndUpdate(
      id,
      {
        status,
      },
      { new: true },
    );

    if (!order)
      return res
        .status(400)
        .json({ status: false, message: "Order not found", data: null });

    return res.status(200).json({
      status: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.delete("/:id", userAuth, async (req: any, res) => {
  try {
    const { id } = req?.params;
    Order.findByIdAndDelete(id)
      .where("user", req?.auth?.userId)
      .then(async (order) => {
        if (order) {
          await order.orderItems.map(async (orderItem) => {
            await OrderItem.findByIdAndDelete(orderItem);
          });

          return res.status(200).json({
            status: true,
            message: "Order deleted successfully",
            data: null,
          });
        } else {
          return res
            .status(403)
            .json({ status: false, message: "Order not found", data: null });
        }
      });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.get("/get/total-sales", userAuth, async (req, res) => {
  try {
    const totalSales = await Order?.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    if (!totalSales) {
      return res
        .status(500)
        .json({ status: false, message: "No Orders In Your List", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Total Sales Fetched Successfully",
      data: totalSales?.pop()?.totalSales,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.get("/get/count", userAuth, async (req: any, res) => {
  try {
    const orderCount = await Order?.countDocuments()?.where(
      "user",
      req?.auth?.userId,
    );

    if (!orderCount) {
      return res
        .status(500)
        .json({ status: false, message: "No Orders In Your List", data: 0 });
    }

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: orderCount,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
