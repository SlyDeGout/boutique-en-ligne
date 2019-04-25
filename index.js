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

const Department = require("./models/department-model");
const Category = require("./models/category-model");
const Product = require("./models/product-model");
const Review = require("./models/review-model");

const departmentRoutes = require("./routes/department-routes");
app.use(departmentRoutes);

const categoryRoutes = require("./routes/category-routes");
app.use(categoryRoutes);

const productRoutes = require("./routes/product-routes");
app.use(productRoutes);

const reviewRoutes = require("./routes/review-routes");
app.use(reviewRoutes);

app.listen(3000, () => {
  console.log(`Welcome to "Boutique En Ligne" ! ... server started ...`);
});
