const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const { Category } = require("../models/Category");
const Product = require("../models/Product");
const multer = require("multer");
const authJwt = require("../helpers/JWT_Auth");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router
  .get("/", async (req, res) => {
    let filter = {};

    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }

    const products = await Product.find(filter).populate("category");

    if (!products) {
      return res.status(500).json("No Products In Your List");
    }

    res.status(200).json(products);
  })
  .get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      res.status(500).json("No Product In Your List");
    }

    res.status(200).json(product);
  })
  .post("/",authJwt, uploadOptions.single("image"), async (req, res) => {
    const category = await Category.findById(req.body.category);

    if (!category) {
      return res.status(400).json("Invalid Category !!!");
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json("No File Uploaded !!!");
    }

    const filename = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;

    const product = new Product({
      name: req.body.name,
      image: `${basePath}/${filename}`,
      countInStock: req.body.countInStock,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    product

      .save()

      .then((createdProduct) => {
        res.status(200).json(createdProduct);
      })

      .catch((err) => {
        res.status(403).json(err);
      });
  })
  .put("/:id",authJwt, async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );

    if (!product) {
      res.status(403).json("Product Not Found !!!");
    }

    res.status(200).json(product);
  })
  .delete("/:id",authJwt, async (req, res) => {
    Product.findByIdAndRemove(req.params.id)
      .then((product) => {
        if (product) {
          return res.status(200).json("Deleted Successfully !!");
        } else {
          return res.status(403).json("Product Not Found !!!");
        }
      })

      .catch((err) => {
        return res.status(500).json(err);
      });
  })
  .get("/get/count", async (req, res) => {
    const count = await Product.countDocuments();

    if (!count) {
      return res.status(500).json("No Products In Your List");
    }

    res.status(200).json({ count: count });
  })
  .get("/get/featured/:count", async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(count);

    if (!products) {
      return res.status(500).json("No Products In Your List");
    }
    res.status(200).json(products);
  })
  .put("/upload/:id",authJwt, uploadOptions.array("images", 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json("Invalid Product Id !!!");
    }

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;

    const files = req.files;
    let imagesPaths = [];
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}/${file.filename}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) {
      return res.status(403).json("Product Not Found !!!");
    }

    res.send({ product: product });
  });
module.exports = router;
