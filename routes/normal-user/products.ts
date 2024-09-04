import { Router } from "express";
import Product from "../../models/Product";
import { userAuth } from "../../helpers/jwt_Auth";

const router = Router();

router.get("/", userAuth, async (req: any, res) => {
  try {
    let filter = {};
    const { categories } = req?.query;
    const { page = 1, pageSize = 10, sort = {} } = req?.query;

    if (categories) {
      filter = { category: categories?.toString()?.split(",") };
    }

    const products = await Product.find(filter)
      ?.populate("category")
      .limit(+pageSize)
      .skip((+page - 1) * +pageSize)
      .sort({ ...sort, dateCreated: -1 });

    if (!products) {
      return res.status(500).json({
        status: false,
        message: "No Products In Your List",
        data: null,
      });
    }

    const totalEntries = await Product.countDocuments(filter);

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        page: +page,
        pageSize: +pageSize,
        totalResults: products?.length,
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

router.get("/:id", userAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(500).json({
        status: false,
        message: "No Products In Your List",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: product,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.get("/get/count", userAuth, async (req, res) => {
  try {
    const count = await Product?.countDocuments();

    if (!count) {
      return res.status(500).json({
        status: false,
        message: "No Products In Your List",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: count,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.get("/get/featured/:count", userAuth, async (req, res) => {
  try {
    const count = req?.params?.count ? parseInt(req?.params?.count) : 0;
    const products = await Product?.find({ isFeatured: true })?.limit(count);

    if (!products) {
      return res.status(500).json({
        status: false,
        message: "No Products In Your List",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
