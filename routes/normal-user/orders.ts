import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../../helpers/jwt_Auth";

const router = Router();
const prisma = new PrismaClient();

router.get(`/`, userAuth, async (req: any, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      populate = [],
      sort = {},
      filters = {},
    } = req?.query;

    const orders = await prisma?.order.findMany({
      where: { ...filters, userId: req?.auth?.userId },
      include: {
        ...(populate.includes("orderItems") && {
          orderItems: {
            include: {
              product: { select: { name: true, image: true, price: true } },
            },
          },
        }),
        user: { select: { firstName: true, lastName: true } },
      },
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
      orderBy: { ...sort, createdAt: "desc" },
    });

    if (!orders) {
      return res
        .status(500)
        .json({ status: false, message: "No orders in your list", data: null });
    }

    const totalEntries = await prisma?.order?.count({
      where: {
        userId: req?.auth?.userId,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        page: +page,
        pageSize: +pageSize,
        totalResults: orders?.length,
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

router.get(`/:id`, userAuth, async (req: any, res) => {
  try {
    const { id } = req?.params;
    const { auth } = req;

    const order = await prisma?.order.findUnique({
      where: {
        ...req?.query?.filters,
        id: +id,
        userId: auth?.userId,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        orderItems: {
          include: {
            product: { select: { name: true, image: true, price: true } },
          },
        },
      },
    });

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

    const orderItemsProducts = Promise.all(
      orderItems.map(async (orderItem: any) => {
        const orderItemProduct = await prisma.product.findUnique({
          where: {
            id: +orderItem?.product,
          },
        });

        return { quantity: +orderItem?.quantity, product: orderItemProduct };
      }),
    );
    const orderItemsProductsResolved = await orderItemsProducts;

    const totalPrices = await Promise.all(
      orderItemsProductsResolved.map(async (item) => {
        const totalPrice = +item?.quantity * +item?.product?.price;

        return totalPrice;
      }),
    );

    const totalPrice = totalPrices?.reduce((a, b) => a + b, 0);

    const order = await prisma?.order.create({
      data: {
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        totalPrice: totalPrice,
        userId: userId,
        paymentStatus: "NOT_PAID",
      },
    });

    for (const item of orderItemsProductsResolved) {
      prisma?.orderItems
        .create({
          data: {
            quantity: item?.quantity,
            orderId: order?.id,
            productId: item?.product?.id,
          },
        })
        .catch((err) => {
          return res.status(500).json({
            status: false,
            message: err,
            data: null,
          });
        });
    }

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
    console.error(err);

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

    const order = await prisma?.order?.update({
      where: {
        id: +id,
      },
      data: {
        status,
      },
    });

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
    prisma.order
      .delete({
        where: {
          id: +id,
          userId: req?.auth?.userId,
        },
        include: {
          orderItems: true,
        },
      })
      .then(async (order) => {
        if (order) {
          await order.orderItems.map(async (orderItem) => {
            await prisma.orderItems.delete({ where: { id: orderItem?.id } });
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

router.get("/get/total-sales", userAuth, async (req: any, res) => {
  try {
    const totalSales = await prisma?.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        userId: req?.auth?.userId,
      },
    });

    if (!totalSales) {
      return res
        .status(500)
        .json({ status: false, message: "No Orders In Your List", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Total Sales Fetched Successfully",
      data: totalSales?._sum?.totalPrice,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.get("/get/count", userAuth, async (req: any, res) => {
  try {
    const orderCount = await prisma?.order?.count({
      where: {
        userId: req?.auth?.userId,
      },
    });

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
