const express = require("express");
const router = express.Router();
const faker = require("faker");

const Review = require("../models/review-model");
const Product = require("../models/product-model");
const Category = require("../models/category-model");
const Department = require("../models/department-model");

const averageRating = reviews => {
  //???
  // ??? AVERAGE WITH $avg AND AGGREGATE ???
  //???
  let sum = 0;
  for (let i = 0; i < reviews.length; i++) {
    //console.log(reviews[i].rating);
    sum += reviews[i].rating;
  }
  let result = 0;
  if (reviews.length > 0) result = Math.round((sum / reviews.length) * 10) / 10;
  //console.log(" averageRating = " + result);
  return result;
};

router.post("/createDataset", async (req, res) => {
  const nbDepartment = 3;
  const nbCategory = 3;
  const nbProduct = 3;
  const nbReview = 3;

  faker.seed(123);

  for (let i = 0; i < nbDepartment; i++) {
    const department = new Department({
      title: faker.commerce.product()
    });
    await department.save();

    //faker.seed(124);

    for (let j = 0; j < nbCategory; j++) {
      const category = new Category({
        title: faker.commerce.product(),
        description: faker.commerce.productAdjective(),
        department: department._id
      });
      await category.save();

      //faker.seed(125);

      for (let k = 0; k < nbProduct; k++) {
        const product = new Product({
          title: faker.commerce.productName(),
          description: faker.commerce.productAdjective(),
          price: faker.commerce.price(),
          averageRating: 0,
          reviews: [],
          category: category._id
        });
        await product.save();

        for (let l = 0; l < nbReview; l++) {
          const review = new Review({
            rating: Math.floor(Math.random() * 5) + 1,
            comment: faker.hacker.phrase(),
            username: faker.name.firstName()
          });
          await review.save();

          product.reviews.push(review);

          product.averageRating = averageRating(product.reviews);

          await product.save();
        }
      }
    }
  }

  return res.json(
    nbDepartment +
      " departments created / " +
      nbCategory +
      " categories created / " +
      nbProduct +
      " products created / " +
      nbReview +
      " reviews created "
  );
});

router.post("/review/create", async (req, res) => {
  try {
    const product = await Product.findById(req.body.product).populate(
      "reviews"
    );
    if (product) {
      const review = new Review({
        rating: req.body.rating,
        comment: req.body.comment,
        username: req.body.username
      });

      if (product.reviews === undefined) {
        product.reviews = [];
      }
      product.reviews.push(review);

      product.averageRating = averageRating(product.reviews);

      await product.save();

      await review.save();

      return res.json(review);

      //???
      // ??? AVERAGE WITH $avg AND AGGREGATE ???
      //???

      // await Product.aggregate([
      //   {
      //     $group: { _id: product._id, averageRating: { $avg: "$rating" } }
      //   }
      // ]);
      // console.log(product.averageRating);

      // 1. Get the product's Comments array of comment ids.
      // 2. Filter Comments to just those in product.Comments and average the Rating
      // await Product.findOne(product._id, "Review", function(err, product) {
      //   Review.aggregate(
      //     [{ $group: { _id: product._id, averageRating: { $avg: "$rating" } } }],
      //     function(err, result) {
      //       if (err) {
      //         res.status(400).json({ errorAggregate: err.message });
      //       } else {
      //         res.json(result);
      //       }
      //     }
      //   );
      // });
    } else {
      return res.status(400).json({ error: "Product doesn't exist" });
    }
  } catch (e) {
    return res.status(400).json({ error: e.message });
    //return res.status(400).json({ error : "An error occured" });
  }
});

router.get("/review", async (req, res) => {
  try {
    const reviews = await Review.find();
    return res.json(reviews);
  } catch (e) {
    return res.status(400).json({ error: e.message });
    //return res.status(400).json({ error : "An error occured" });
  }
});

router.post("/review/update", async (req, res) => {
  try {
    const review = await Review.findById(req.query.id);
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    const product = await Product.findOne({
      reviews: { $in: [req.query.id] }
    }).populate("reviews");
    //???
    // ??? AVERAGE WITH $avg AND AGGREGATE ???
    //???
    product.averageRating = averageRating(product.reviews);
    await product.save();

    return res.json(review);
  } catch (e) {
    return res.status(400).json({ error: e.message });
    //return res.status(400).json({ error : "An error occured" });
  }
});

router.post("/review/delete", async (req, res) => {
  try {
    const review = await Review.findById(req.query.id);

    const product = await Product.findOne({
      reviews: req.query.id
    }).populate("reviews");

    // ???
    // ??? RETIRER UN REVIEW DANS UN PRODUIT GRACE A L'ID DU REVIEW ???
    // ???
    // ??? EST-CE QU'UN SPLICE SUR LE TABLEAU SUFFIT DANS MONGODB ???
    // ???
    //
    // ???
    //
    // await Product.updateOne(
    //   { _id: product._id },
    //   { $pull: { reviews: { _id: req.query.id } } }
    // );
    // console.log(
    //   "TENTATIVE DE DELETE : reviews.length " + product.reviews.length
    // );
    for (var i = 0; i < product.reviews.length; i++) {
      if (product.reviews[i]._id.equals(req.query.id)) {
        product.reviews.splice(i, 1);
        break;
      }
    }

    //???
    // ??? AVERAGE WITH $avg AND AGGREGATE ???
    //???
    product.averageRating = averageRating(product.reviews);
    await product.save();

    await review.remove();

    return res.json(product);
  } catch (e) {
    return res.status(400).json({ error: e.message });
    //return res.status(400).json({ error : "An error occured" });
  }
});

module.exports = router;
