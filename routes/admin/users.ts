import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();
const prisma = new PrismaClient();

router.get(`/get-all-users`, adminAuth, async (req: any, res: Response) => {
  try {
    const { page = 1, pageSize = 10, sort = {}, filters = {} } = req?.query;

    const users = await prisma?.user?.findMany({
      where: { ...filters },
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
      select: { firstName: true, lastName: true, phone: true, email: true },
      orderBy: { ...sort, createdAt: "desc" },
    });

    if (!users) {
      res.json({ status: false, message: "No users in your list", data: null });
    }

    const totalEntries = await prisma?.user?.count();

    res.json({
      status: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        page: +page,
        pageSize: +pageSize,
        resultsCount: users?.length,
        totalEntries,
        totalPages: Math.ceil(totalEntries / +pageSize),
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err?.message,
      data: null,
    });
  }
});

router.get("/get/count", adminAuth, async (req, res) => {
  try {
    const count = await prisma?.user?.count();

    if (!count) {
      res.json({ status: false, message: "No users in your list", data: 0 });
    }
    res.json({
      status: true,
      message: "Users fetched successfully",
      data: count,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
