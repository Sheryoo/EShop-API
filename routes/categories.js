const router = require("express").Router();
const { Category } = require("../models/Category");
const authJwt = require("../helpers/JWT_Auth");

router
  .get(`/all`, async (req, res) => {
    const categories = await Category.find();
    if (!categories) {
      res.status(403).json("No categories In Your List");
    }
    res.status(200).json(categories);
  })
  .get(`/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(403).json("Category Not Found !!!");
    }
    res.status(200).json(category);
  })
  .post("/", async (req, res) => {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    let newCategory = await category.save();
    if (!newCategory) {
      return res.status(403).json(err);
    }
    res.status(200).json(newCategory);
  })
  .delete("/:id", async (req, res) => {
    Category.findByIdAndDelete(req.params.id)
      .then((category) => {
        if (category) {
          return res.status(200).json("Deleted Successfully !!");
        } else {
          return res.status(403).json("Category Not Found !!!");
        }
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  })
  .put("/:id", async (req, res) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    );
    if (!category) {
      res.status(403).json("Category Not Found !!!");
    }
    res.status(200).json(category);
  });

module.exports = router;
