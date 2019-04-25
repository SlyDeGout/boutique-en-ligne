const categories = [{ _id: 1 }, { _id: 2 }, { _id: 3 }];
let categoriesId = [];

// for (let i = 0; i < categories.length; i++) {
//   // await Product.deleteMany({ category: categories[i]._id });
//   categoriesId.push(categories[i]._id);
// }

categoriesId = categories.map(obj => {
  return obj._id;
});

console.log(categoriesId);
