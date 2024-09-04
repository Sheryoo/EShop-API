import { Router } from "express";
import { Category } from "../../models/Category";
import { userAuth } from "../../helpers/jwt_Auth";

const router = Router();

router.get(`/all`, userAuth, async (req: any, res) => {
  try {
    const { page = 1, pageSize = 10, sort = {}, filters = {} } = req?.query;

    const categories = await Category?.find({ ...filters })
      .limit(+pageSize)
      .skip((+page - 1) * +pageSize)
      .sort({ ...sort, dateCreated: -1 });

    if (!categories) {
      return res.status(403).json({
        status: false,
        message: "No categories in your list",
        data: null,
      });
    }

    const totalEntries = await Category?.countDocuments();

    return res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      data: categories,
      pagination: {
        page: +page,
        pageSize: +pageSize,
        totalResults: categories?.length,
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

router.get(`/:id`, userAuth, async (req, res) => {
  try {
    const { id } = req?.params;
    const category = await Category?.findById(id);

    if (!category) {
      return res.status(403).json({
        status: false,
        message: "No category in your list",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
