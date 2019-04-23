/*

    Boutique En Ligne

*/

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/boutique-en-ligne", {
  useNewUrlParser: true
});

const Department = mongoose.model("Department", {
  title: String
});

const Category = mongoose.model("Category", {
  title: String,
  description: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  }
});

const Product = mongoose.model("Product", {
  title: String,
  description: String,
  price: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
});

// ** CREATE **
app.post("/department/create", async (req, res) => {
  try {
    const department = new Department({ title: req.body.title });
    await department.save();
    return res.json("Department created");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/category/create", async (req, res) => {
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

app.post("/product/create", async (req, res) => {
  try {
    const product = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    });
    await product.save();
    return res.json("Product created");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ** READ **
app.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    return res.json(departments);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/category", async (req, res) => {
  try {
    const categories = await Category.find().populate("department");
    return res.json(categories);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/product", async (req, res) => {
  try {
    const findQuery = { $and: [] };
    if (req.query.priceMin) {
      findQuery.$and.push({ price: { $gte: req.query.priceMin } });
    }
    if (req.query.priceMax) {
      findQuery.$and.push({ price: { $lte: req.query.priceMax } });
    }
    if (req.query.category) {
      findQuery.$and.push({ category: req.query.category });
    }
    if (req.query.title) {
      findQuery.$and.push({
        title: { $regex: new RegExp(req.query.title, "i") }
      });
    }

    const search = Product.find(findQuery).populate({
      path: "category",
      populate: { path: "department" }
    });

    if (req.query.sort) {
      if (req.query.sort !== "price-asc" && req.query.sort !== "price-desc") {
        return res.status(400).json("Invalid parameter sort");
      }
      search.sort({ price: req.query.sort === "price-asc" ? 1 : -1 });
    }

    const products = await search;

    return res.json(products);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ** UPDATE **
app.post("/department/update", async (req, res) => {
  try {
    const department = await Department.findById(req.query.id);
    department.title = req.body.title;
    await department.save();
    return res.json("Department updated");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/category/update", async (req, res) => {
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

app.post("/product/update", async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    if (req.body.title) product.title = req.body.title;
    if (req.body.description) product.description = req.body.description;
    if (req.body.description) product.price = req.body.price;
    if (req.body.category) product.category = req.body.category;

    await product.save();
    return res.json("Product updated");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ** DELETE **

app.post("/department/delete", async (req, res) => {
  try {
    // const department = await Department.findById(req.query.id);
    // await department.remove();

    const categories = await Category.find({ department: req.query.id });
    for (let i = 0; i < categories.length; i++) {
      await Product.deleteMany({ category: categories[i]._id });
    }
    await Category.deleteMany({ department: req.query.id });

    await Department.deleteOne({ _id: req.query.id });
    //
    // !!!!! IL RESTE ENCORE LES PRODUITS DES CATEGORIES A SUPPRIMER
    //
    //

    return res.json("Department deleted");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/category/delete", async (req, res) => {
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

app.post("/product/delete", async (req, res) => {
  try {
    // const product = await Product.findById(req.query.id);
    // await product.delete();
    await Product.deleteOne({ _id: req.query.id });
    return res.json("Product deleted");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/category/delete", async (req, res) => {});

app.post("/product/delete", async (req, res) => {});

app.listen(3000, () => {
  console.log(`Welcome to "Boutique En Ligne" ! ... server started ...`);
});
