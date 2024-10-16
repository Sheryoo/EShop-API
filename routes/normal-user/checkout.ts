import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../../helpers/jwt_Auth";
import Stripe from "stripe";

const router = Router();
const prisma = new PrismaClient();

router.post("/pay/:orderId", userAuth, async (req: any, res) => {
  try {
    const { orderId } = req?.params;
    const { paymentMethod, successUrl, cancelUrl } = req?.body;

    const order = await prisma?.order?.findUnique({
      where: {
        id: +orderId,
        status: {
          in: ["PENDING", "NEW"],
        },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found", data: null });
    }

    const checkout = await prisma?.checkout?.create({
      data: {
        totalPrice: order?.totalPrice,
        orderId: order?.id,
        paymentMethod: paymentMethod, //must be one of card
        userId: order?.userId,
        paymentStatus: "NOT_PAID",
        status: "NEW",
      },
    });

    const lineItems: any = order?.orderItems?.map((item) => {
      return {
        price_data: {
          currency: "egp",
          product_data: {
            name: item?.product?.name,
            images: [item?.product?.image],
          },
          unit_amount: item?.product?.price * 100,
        },
        quantity: item?.quantity,
      };
    });

    const stripe = new Stripe(process.env?.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      customer_creation: "if_required",
      currency: "egp",
      mode: "payment",
      line_items: lineItems,
      payment_method_types: [paymentMethod],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: order?.user?.email,
      metadata: {
        orderId: order?.id,
        userId: order?.user?.id,
        checkoutId: checkout?.id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Order created successfully",
      data: session.url,
    });

    // return res.status(200).redirect(session.url);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: false,
      message: err?.message,
      data: null,
    });
  }
});

router.post("/confirm-checkout", async (req: any, res) => {
  try {
    const { data } = req?.body;
    const { object } = data;

    if (object?.payment_status === "paid") {
      if (object?.metadata?.orderId) {
        const order = await prisma?.order.update({
          where: {
            id: +object?.metadata?.orderId,
          },
          data: {
            status: "SHIPPED",
            paymentMethod: object?.payment_method_types[0]?.toUpperCase(),
            paymentStatus: "PAID",
          },
        });

        await prisma?.checkout.update({
          where: {
            id: +object?.metadata?.checkoutId,
          },
          data: {
            status: "COMPLETED",
            paymentMethod: object?.payment_method_types[0]?.toUpperCase(),
            paymentStatus: "PAID",
          },
        });

        if (!order) {
          return res
            .status(500)
            .json({ status: false, message: "Order not found", data: null });
        }

        return res.status(200).send("Ok!");
      }
    } else {
      await prisma?.checkout.update({
        where: {
          id: +object?.metadata?.checkoutId,
        },
        data: {
          paymentStatus: "NOT_PAID",
        },
      });

      await prisma?.order.update({
        where: {
          id: +object?.metadata?.orderId,
        },
        data: {
          paymentStatus: "NOT_PAID",
          status: "PENDING",
        },
      });

      return res.status(400).send("Payment failed!");
    }
  } catch (err) {
    console.error(err);
  }
});

router.get("/", userAuth, async (req: any, res) => {
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

export default router;
