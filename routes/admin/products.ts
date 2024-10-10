import { Router } from "express";
import { PrismaClient } from "@prisma/client";
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
  uploadFilesMiddleware().single("image"),
  async (req: any, res) => {
    try {
      const {
        name,
        countInStock,
        description,
        richDescription,
        brand,
        price,
        categoryId,
        rating,
        numReviews,
        isFeatured,
      } = req?.body;

      const category = await prisma?.category?.findUnique({
        where: {
          id: +categoryId,
        },
      });

      if (!category) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid Category", data: null });
      }

      const file = req?.file;

      if (!file) {
        return res
          .status(400)
          .json({ status: false, message: "No File Uploaded.", data: null });
      }

      const uploadedFileUrl = await uploadToCloudinary(req?.file, "products");

      const createdProduct = await prisma?.product?.create({
        data: {
          name: name,
          image: uploadedFileUrl,
          countInStock: +countInStock,
          description: description,
          richDescription: richDescription,
          brand: brand,
          price: +price,
          categoryId: category.id,
          rating: +rating,
          numReviews: +numReviews,
          isFeatured: isFeatured,
        },
      });

      if (!createdProduct) {
        return res.status(403).json({
          status: false,
          message: "The product cannot be created!",
          data: null,
        });
      }

      return res.status(200).json({
        status: true,
        message: "The product created successfully",
        data: createdProduct,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: err?.message,
        data: null,
      });
    }
  },
);

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req?.params;
    const {
      name,
      countInStock,
      description,
      richDescription,
      brand,
      price,
      category,
      rating,
      numReviews,
      isFeatured,
    } = req.body;
    const product = await prisma?.product?.update({
      where: {
        id: +id,
      },
      data: {
        name: name,
        countInStock: countInStock,
        description: description,
        richDescription: richDescription,
        brand: brand,
        price: price,
        category: category,
        rating: rating,
        numReviews: numReviews,
        isFeatured: isFeatured,
      },
    });

    if (!product) {
      return res
        .status(403)
        .json({ status: false, message: "Product not found", data: null });
    }

    return res
      .status(200)
      .json({ status: true, message: "Product Updated", data: product });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req?.params;
    const product = await prisma?.product?.delete({
      where: {
        id: +id,
      },
    });

    if (!product) {
      return res
        .status(403)
        .json({ status: false, message: "Product not found", data: null });
    }

    return res
      .status(200)
      .json({ status: true, message: "Product Deleted", data: null });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.put(
  "/upload/:id",
  adminAuth,
  uploadFilesMiddleware().array("images", 10),
  async (req: any, res) => {
    try {
      const { id } = req?.params;

      const productById = await prisma?.product?.findUnique({
        where: {
          id: +id,
        },
      });

      if (!productById) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid Product Id", data: null });
      }

      const files = req.files;
      const imagesPaths = [];

      if (files) {
        for (const file of files) {
          const uploadedFileUrl = await uploadToCloudinary(file, "products");
          imagesPaths.push(uploadedFileUrl);
        }
      }
      const product = await prisma?.product?.update({
        where: {
          id: +id,
        },
        data: {
          images: imagesPaths,
        },
      });

      if (!product) {
        return res
          .status(403)
          .json({ status: false, message: "Product not found", data: null });
      }

      res.json({
        status: true,
        message: "Product updated successfully.",
        data: product,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: err?.message, data: null });
    }
  },
);

export default router;
