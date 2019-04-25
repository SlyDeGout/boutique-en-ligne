const express = require("express");
const router = express.Router();

const Category = require("../models/category-model");

router.post("/category/create", async (req, res) => {
  try {
    const category = new Category({
      title: req.body.title,
      description: req.body.description,
      department: req.body.department
    });
    await category.save();
    return res.json("Category created");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/category", async (req, res) => {
  try {
    const categories = await Category.find().populate("department");
    return res.json(categories);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/category/update", async (req, res) => {
  try {
    const category = await Category.findById(req.query.id);
    if (req.body.title) category.title = req.body.title;
    if (req.body.description) category.description = req.body.description;
    if (req.body.department) category.department = req.body.department;

    await category.save();
    return res.json("Category updated");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/category/delete", async (req, res) => {
  try {
    // const category = await Category.findById(req.query.id);
    // await category.remove();

    await Category.deleteOne({ _id: req.query.id });
    await Product.deleteMany({ category: req.query.id });

    return res.json("Category deleted");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
