const express = require("express");
const router = express.Router();

const Product = require("../models/product-model");

router.post("/product/create", async (req, res) => {
  try {
    const product = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      averageRating: 0,
      category: req.body.category
    });
    await product.save();
    return res.json("Product created");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/product", async (req, res) => {
  try {
    const filters = {};
    if (req.query.priceMin || req.query.priceMax) {
      filters.price = {};
    }
    if (req.query.priceMin) {
      filters.price.$gte = req.query.priceMin;
    }
    if (req.query.priceMax) {
      filters.price.$lte = req.query.priceMax;
    }
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }

    // const findQuery = { $and: [{}] };
    // if (req.query.priceMin) {
    //   findQuery.$and.push({ price: { $gte: req.query.priceMin } });
    // }
    // if (req.query.priceMax) {
    //   findQuery.$and.push({ price: { $lte: req.query.priceMax } });
    // }
    // if (req.query.category) {
    //   findQuery.$and.push({ category: req.query.category });
    // }
    // if (req.query.title) {
    //   findQuery.$and.push({
    //     title: { $regex: new RegExp(req.query.title, "i") }
    //   });
    // }

    const search = Product.find(filters)
      .populate({
        path: "category",
        populate: { path: "department" }
      })
      .populate("reviews");

    if (req.query.page) {
      const nbItemsPerPage = 2;
      search.skip((req.query.page - 1) * nbItemsPerPage).limit(nbItemsPerPage);
    }

    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      search.sort({ price: -1 });
    } else if (req.query.sort === "rating-asc") {
      search.sort({ averageRating: 1 });
    } else if (req.query.sort === "rating-desc") {
      search.sort({ averageRating: -1 });
    }

    const products = await search;

    return res.json(products);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/product/update", async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    if (req.body.title) product.title = req.body.title;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = req.body.price;
    if (req.body.category) product.category = req.body.category;

    await product.save();
    return res.json("Product updated");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/product/delete", async (req, res) => {
  try {
    // const product = await Product.findById(req.query.id);
    // await product.delete();
    await Product.deleteOne({ _id: req.query.id });
    return res.json("Product deleted");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
