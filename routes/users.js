const router = require("express").Router();
const { User } = require("../models/User");
const bcrycpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminAuth = require("../helpers/JWT_Admin_Auth");
const userAuth = require("../helpers/jwt_User_Auth");

router
  .get(`/`, adminAuth, async (req, res) => {
    const users = await User.find().select("name phone email");
    if (!users) {
      res.json({ status: false, message: "No users in your list", data: null });
    }
    res.json({
      status: true,
      message: "Users fetched successfully",
      data: users,
    });
  })
  .get(`/:id`, userAuth, async (req, res) => {
    const user = await User.findById(req.params.id).select("name phone email");
    if (!user) {
      return res.json({
        status: false,
        message: "User Not Found",
        data: null,
      });
    }
    return res.json({
      status: true,
      message: "User fetched successfully",
      data: user,
    });
  })
  .post("/register", async (req, res) => {
    const salt = await bcrycpt.genSalt(10);
    const hashedPassword = await bcrycpt.hash(req.body.password, salt);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
    });
    user
      .save()
      .then((createdUser) => {
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
          message: "User created successfully",
          data: { token: token, user: createdUser },
        });
      })
      .catch((err) => {
        res.json({
          status: false,
          message: "Something went wrong",
          data: null,
        });
      });
  })
  .post("/login", async (req, res) => {
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
        message: "User Not Found",
        data: null,
      });
    }
  })
  .get("/get/count", adminAuth, async (req, res) => {
    const count = await User.countDocuments();
    if (!count) {
      res.json({ "Users Count": 0 });
    }
    res.json({ "Users Count": count });
  });

module.exports = router;
