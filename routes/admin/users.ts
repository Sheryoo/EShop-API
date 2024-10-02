import { Router, Response } from "express";
import { User } from "../../models/User";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();

router.get(`/get-all-users`, adminAuth, async (req: any, res: Response) => {
  try {
    const { page = 1, pageSize = 10, sort = {}, filters = {} } = req?.query;

    const users = await User?.find({ ...filters })
      .limit(+pageSize)
      .skip((+page - 1) * +pageSize)
      .select("name phone email")
      .sort({ ...sort, dateCreated: -1 });

    if (!users) {
      res.json({ status: false, message: "No users in your list", data: null });
    }

    const totalEntries = await User.countDocuments();

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
    const count = await User?.countDocuments();

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
