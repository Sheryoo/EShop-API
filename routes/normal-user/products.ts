import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../../helpers/jwt_Auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", userAuth, async (req: any, res) => {
  try {
    const { page = 1, pageSize = 10, sort = {}, filters = {} } = req?.query;

    const products = await prisma?.product?.findMany({
      where: filters,
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
      orderBy: { ...sort, createdAt: "desc" },
      include: {
        category: true,
      },
    });

    if (!products) {
      return res.status(500).json({
        status: false,
        message: "No Products In Your List",
        data: null,
      });
    }

    const totalEntries = await prisma?.product?.count({ where: filters });

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

router.get("/:id", userAuth, async (req: any, res) => {
  try {
    const product = await prisma?.product?.findUnique({
      where: { ...req?.query?.filters, id: +req.params.id },
      include: { category: true },
    });

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

router.get("/get/count", userAuth, async (req: any, res) => {
  try {
    const count = await prisma?.product?.count({
      where: { ...req?.query?.filters },
    });

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

router.get("/get/featured/:count", userAuth, async (req: any, res) => {
  try {
    const count = req?.params?.count ? parseInt(req?.params?.count) : 0;
    const products = await prisma?.product?.findMany({
      where: { ...req?.query?.filters, isFeatured: true },
      take: count,
    });

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
