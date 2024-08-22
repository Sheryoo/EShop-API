import { Router, Request, Response } from "express";
import { User } from "../../models/User";
import { adminAuth } from "../../helpers/jwt_Auth";

const router = Router();

router.get(`/search`, adminAuth, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("name phone email");

    if (!users) {
      res.json({ status: false, message: "No users in your list", data: null });
    }
    res.json({
      status: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    return res.status(500).json();
  }
});

router.get("/get/count", adminAuth, async (req, res) => {
  try {
    const count = await User.countDocuments();

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
      .json({ status: false, message: err.message, data: null });
  }
});

export default router;
