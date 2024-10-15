import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrycpt from "bcrypt";
import jwt from "jsonwebtoken";
import { userAuth } from "../../helpers/jwt_Auth";
import uploadFilesMiddleware, {
  uploadToCloudinary,
} from "../../helpers/upload_files";

const router = Router();
const prisma = new PrismaClient();

router.get(`/:id`, userAuth, async (req, res) => {
  try {
    const user = await prisma?.user?.findUnique({
      where: { id: +req?.params?.id },
      select: { firstName: true, lastName: true, phone: true, email: true },
    });

    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
        data: null,
      });
    }

    return res.json({
      status: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

router.post(
  "/register",
  uploadFilesMiddleware().single("image"),
  async (req: any, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        gender,
        isAdmin,
        street,
        apartment,
        city,
        zip,
        country,
      } = req?.body;

      const salt = await bcrycpt?.genSalt(10);
      const hashedPassword = await bcrycpt?.hash(password, salt);

      const file = req?.file;
      let uploadedFileUrl = null;

      if (file) {
        uploadedFileUrl = await uploadToCloudinary(file, "users");
      }

      const createdUser = await prisma?.user?.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          gender,
          isAdmin,
          street,
          apartment,
          city,
          zip,
          country,
          image: uploadedFileUrl,
        },
      });

      const payload = {
        userId: createdUser?.id,
        email: createdUser?.email,
        isAdmin: createdUser?.isAdmin,
      };
      const token = jwt?.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      return res.json({
        status: true,
        message: "User created successfully",
        data: { token: token, user: createdUser },
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

router.post("/login", async (req, res) => {
  try {
    const user = await prisma?.user?.findUnique({
      where: { email: req?.body?.email },
    });

    if (user) {
      const isMatch = await bcrycpt.compare(
        req?.body?.password,
        user?.password,
      );

      if (isMatch) {
        const payload = {
          userId: user?.id,
          email: user?.email,
          isAdmin: user?.isAdmin,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        res.json({
          status: true,
          message: "User logged in successfully",
          data: token,
        });
      } else {
        res.status(400).json({
          status: false,
          message: "Wrong Password",
          data: null,
        });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "User not found",
        data: null,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err?.message, data: null });
  }
});

export default router;
