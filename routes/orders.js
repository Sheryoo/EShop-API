const router = require("express").Router();
const { Order } = require("../models/Order");
const { OrderItem } = require("../models/Order-Items");
const authJwt = require("../helpers/JWT_Auth");


router
  .get(`/`,authJwt, async (req, res) => {
    const orders = await Order.find()
      .populate("user", "name")
      .sort("dateOrdered");
    if (!orders) {
      res.status(500).json("No orders In Your List");
    }
    res.status(200).json(orders);
  })
  .get(`/:id`,authJwt, async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort("dateOrdered");
    if (!order) {
      res.status(500).json("order Not Found !!!");
    }
    res.status(200).json(order);
  })
  .post("/",authJwt, async (req, res) => {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product",
          "price"
        );
        const totalPrice = +orderItem.quantity * +orderItem.product.price;
        return totalPrice;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    const order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });

    await order.save();

    if (!order) return res.status(400).send("the order cannot be created!");

    res.send(order);
  })
  .put("/update/:id",authJwt, async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!order) return res.status(400).send("the order cannot be created!");
    res.status(200).send(order);
  })
  .delete("/:id",authJwt, async (req, res) => {
    Order.findByIdAndDelete(req.params.id).then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });
        return res.status(200).json("Deleted Successfully !!");
      } else {
        return res.status(403).json("Order Not Found !!!");
      }
    });
  })
  .get("/get/totalsales",authJwt, async (req, res) => {
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    if (!totalSales) {
      return res.status(500).json("No Sales In Your List");
    }
    res.status(200).json({ totalSales: totalSales.pop().totalSales });
  })
  .get("/get/count",authJwt, async (req, res) => {
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
      return res.status(500).json("No Orders In Your List");
    }
    res.status(200).json({ "orders Count": orderCount });
  })
  .get("/get/userorders/:userId",authJwt, async (req, res) => {
    const userOrders = await Order.find({ user: req.params.userId })
      .populate("user", "name")
      .sort("dateOrdered");
    if (!userOrders) {
      return res.status(500).json("No Orders In Your List");
    }
    res.status(200).json(userOrders);
  });

module.exports = router;
