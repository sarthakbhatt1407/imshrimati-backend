const fs = require("fs");
const Item = require("../models/item");
const createNewItem = async (req, res, next) => {
  let result;
  const image = req.file.path;
  try {
    const { desc, creator } = req.body;
    const createdItem = new Post({
      desc,
      image,
      comments: [],
      likes: [],
      creator,
      category: [],
      time: fullDate,
    });
    result = await createdItem.save();
  } catch (err) {
    fs.unlink(req.file.path, (err) => {});
    return res.status(400).json({ message: "Unable to add item" });
  }
  res.status(201).json(result);
};
exports.createNewItem = createNewItem;
