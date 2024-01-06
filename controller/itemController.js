const fs = require("fs");
const Product = require("../models/item");
const createNewProduct = async (req, res, next) => {
  // Date And Time
  const currentTime = new Date();

  const currentOffset = currentTime.getTimezoneOffset();

  const ISTOffset = 330; // IST offset UTC +5:30

  const date = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hrs = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (hrs < 10) {
    hrs = "0" + hrs;
  }

  if (hrs < 10) {
    hrs = "0" + hrs;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  const fullDate = year + "-" + month + "-" + day;

  const time = hrs + ":" + min + ":" + sec;
  //

  const files = req.files;
  let imgPath = "";

  for (file of files) {
    imgPath += file.path + " ";
  }
  try {
    const {
      title,
      desc,
      category,
      price,
      fabric,
      size,
      stock,
      discount,
      slug,
      metaTitle,
      metaDesc,
      metaKeywords,
    } = req.body;
    const createdProduct = new Product({
      title,
      desc,
      category,
      price,
      fabric,
      size,
      stock,
      discount,
      slug,
      metaTitle,
      metaDesc,
      metaKeywords,
      date: fullDate,
      time: time,
      status: true,
      images: imgPath,
    });
    result = await createdProduct.save();
  } catch (err) {
    console.log(err);
    for (file of files) {
      fs.unlink(file.path, (err) => {});
    }
    return res.status(400).json({ message: "Unable to add product", err: err });
  }
  res.status(201).json({ message: "Product added successfully" });
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      products: products.map((product) => {
        return product.toObject({ getters: true });
      }),
    });
  } catch (error) {
    res.status(404).json({ message: "Products not Found" });
  }
};

const deleteItemById = async (req, res) => {
  const id = req.body.id;
  const product = await Product.findById(id);

  if (product) {
    product.status = false;
    try {
      await product.save();
    } catch (error) {
      res.status(400).json({ message: "Unable to delete product" });
    }
  } else {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ message: "Product deleted successfully" });
};

const editItemByItemId = async (req, res) => {
  const id = req.body.id;
  const item = await Item.findById(id);
};

exports.createNewProduct = createNewProduct;
exports.getAllProducts = getAllProducts;
exports.deleteItemById = deleteItemById;
