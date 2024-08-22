import { Router } from "express";
import { User } from "../../models/User";
import bcrycpt from "bcrypt";
import jwt from "jsonwebtoken";
import { userAuth } from "../../helpers/jwt_Auth";
import uploadFilesMiddleware, {
  uploadToCloudinary,
} from "../../helpers/upload_files";

const router = Router();

router.get(`/:id`, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name phone email");

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
      .json({ status: false, message: err.message, data: null });
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
      const salt = await bcrycpt.genSalt(10);
      const hashedPassword = await bcrycpt.hash(password, salt);

      const file = req?.file;
      let uploadedFileUrl = null;

      if (file) {
        uploadedFileUrl = await uploadToCloudinary(file, "users");
      }

      const user = new User({
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
      });

      const createdUser = await user.save();

      const payload = {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
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
        message: err,
        data: null,
      });
    }
  },
);

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const isMatch = await bcrycpt.compare(req.body.password, user.password);

      if (isMatch) {
        const payload = {
          userId: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
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
        res.json({
          status: false,
          message: "Wrong Password",
          data: null,
        });
      }
    } else {
      res.json({
        status: false,
        message: "User not found",
        data: null,
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, data: null });
  }
});

export default router;
