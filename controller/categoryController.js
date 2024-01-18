const Category = require("../models/category");
const fs = require("fs");
const addNewCategory = async (req, res) => {
  const { title } = req.body;
  const image = req.file.path;
  let categories;

  categories = await Category.find({ title: title });

  if (categories.length > 0) {
    fs.unlink(req.file.path, (err) => {});
    return res.status(400).json({ message: "category already added" });
  }
  const createdCategory = new Category({
    title,
    image,
  });
  try {
    await createdCategory.save();
  } catch (error) {
    fs.unlink(req.file.path, (err) => {});
    return res.status(400).json({ message: "Unable to add category" });
  }
  return res.status(200).json({ message: "Category added", createdCategory });
};

const getAllCategory = async (req, res) => {
  let categories;
  try {
    categories = await Category.find({});
    if (categories.length < 1) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No category found" });
  }
  return res.status(200).json({
    categories: categories.map((c) => {
      return c.toObject({ getters: true });
    }),
  });
};
exports.addNewCategory = addNewCategory;
exports.getAllCategory = getAllCategory;
