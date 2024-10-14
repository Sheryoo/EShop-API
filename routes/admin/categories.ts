import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { adminAuth } from "../../helpers/jwt_Auth";
import {
  uploadToCloudinary,
  uploadFilesMiddleware,
} from "../../helpers/upload_files";

const router = Router();
const prisma = new PrismaClient();

router.post(
  "/",
  adminAuth,
  uploadFilesMiddleware().single("icon"),
  async (req: any, res) => {
    try {
      const { name, labelColor } = req?.body;

      const file = req?.file;

      if (!file) {
        return res
          .status(400)
          .json({ status: false, message: "No File Uploaded .", data: null });
      }

      const uploadedFileUrl = await uploadToCloudinary(req?.file, "icons");

      const newCategory = await prisma?.category?.create({
        data: {
          name,
          icon: uploadedFileUrl,
          labelColor,
        },
      });

      if (!newCategory) {
        return res.status(400).json({
          status: false,
          message: "Category not created.",
          data: null,
        });
      }

      return res.status(200).json({
        status: true,
        message: "Category Created Successfully",
        data: newCategory,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: err?.message, data: null });
    }
  },
);

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req?.params;
    const category = await prisma?.category?.delete({
      where: {
        id: +id,
      },
    });

    if (!category) {
      return res
        .status(403)
        .json({ status: false, message: "Category not found", data: null });
    }

    return res
      .status(200)
      .json({ status: true, message: "Category Deleted", data: null });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.put(
  "/:id",
  adminAuth,
  uploadFilesMiddleware().single("icon"),
  async (req: any, res) => {
    try {
      const { id } = req?.params;
      const { name, labelColor } = req?.body;
      const file = req?.file;
      let uploadedFileUrl = null;

      if (file) {
        uploadedFileUrl = await uploadToCloudinary(req?.file, "icons");
      }

      const category = await prisma?.category?.update({
        where: {
          id: +id,
        },
        data: {
          name,
          ...(uploadedFileUrl && { icon: uploadedFileUrl }),
          labelColor,
        },
      });

      if (!category) {
        return res
          .status(403)
          .json({ status: false, message: "Category not found", data: null });
      }

      return res
        .status(200)
        .json({ status: true, message: "Category Updated", data: category });
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: err?.message, data: null });
    }
  },
);

export default router;
