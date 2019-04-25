const express = require("express");
const router = express.Router();

const Department = require("../models/department-model");

router.post("/department/create", async (req, res) => {
  try {
    const department = new Department({ title: req.body.title });
    await department.save();
    return res.json("Department created");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    return res.json(departments);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/department/update", async (req, res) => {
  try {
    const department = await Department.findById(req.query.id);
    department.title = req.body.title;
    await department.save();
    return res.json("Department updated");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/department/delete", async (req, res) => {
  try {
    const categories = await Category.find({
      department: req.query.id
    });
    const categoriesId = categories.map(obj => {
      return obj._id;
    });
    await Product.deleteMany({ category: { $in: categoriesId } });

    await Category.deleteMany({ department: req.query.id });
    // const categories = await Category.find({ department: req.query.id });
    // await categories.remove();

    await Department.deleteOne({ _id: req.query.id });
    // const department = await Department.findById(req.query.id);
    // await department.remove();

    return res.json("Department deleted");
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
