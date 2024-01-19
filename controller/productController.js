const fs = require("fs");
const Product = require("../models/item");
const { v4: uuidv4 } = require("uuid");

const dateFetcher = () => {
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

  return { date: fullDate, time: time };
};

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
      color,
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
      color,
    });
    result = await createdProduct.save();
  } catch (err) {
    for (file of files) {
      fs.unlink(file.path, (err) => {});
    }
    return res.status(400).json({ message: "Unable to add product", err: err });
  }
  return res.status(201).json({ message: "Product added successfully" });
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products) {
      throw new Error();
    }
    return res.status(200).json({
      products: products.map((product) => {
        return product.toObject({ getters: true });
      }),
    });
  } catch (error) {
    return res.status(404).json({ message: "Products not Found" });
  }
};
const getProductById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (product) {
      return res.status(200).json({
        product.toObject({ getters: true })
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "Product not Found" });
  }
};

const deleteProductById = async (req, res) => {
  const id = req.body.id;
  const product = await Product.findById(id);

  if (product) {
    product.status = false;
    try {
      await product.save();
    } catch (error) {
      return res.status(400).json({ message: "Unable to delete product" });
    }
  } else {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ message: "Product deleted successfully" });
};

const editItemByItemId = async (req, res) => {
  const files = req.files;
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
    id,
  } = req.body;
  let imgPath = "";
  for (file of files) {
    imgPath += file.path + " ";
  }
  let product;
  try {
    product = await Product.findById(id);
    if (!product) {
      throw new Error();
    }
  } catch (error) {
    for (file of files) {
      fs.unlink(file.path, (err) => {});
    }
    return res.status(404).json({ message: "product not found" });
  }
  if (product) {
    product.title = title;
    product.desc = desc;
    product.category = category;
    product.price = price;
    product.fabric = fabric;
    product.size = size;
    product.stock = stock;
    product.discount = discount;
    product.slug = slug;
    product.metaTitle = metaTitle;
    product.metaDesc = metaDesc;
    product.metaKeywords = metaKeywords;
    if (files.length > 0) {
      const img = product.images.split(" ");

      for (let i = 0; i < img.length - 1; i++) {
        fs.unlink(img[i], (err) => {});
      }
      product.images = imgPath;
    }
    try {
      await product.save();
    } catch (error) {
      for (file of files) {
        fs.unlink(file.path, (err) => {});
      }
      return res.status(404).json({ message: "Unable to update product" });
    }
  } else {
    for (file of files) {
      fs.unlink(file.path, (err) => {});
    }
    return res.status(404).json({ message: "product not found" });
  }

  return res
    .status(200)
    .json({ message: "product updated successfully", product });
};

const productReviewHandler = async (req, res) => {
  const { productId, userId, review, action, stars, reviewId } = req.body;
  const dateAndTime = dateFetcher();
  let product;
  let message;
  try {
    product = await Product.findById(productId);

    if (product) {
      if (action === "add") {
        let updatedReviews = product.reviews;
        const obj = {
          userId,
          review,
          date: dateAndTime.date,
          time: dateAndTime.time,
          stars,
          status: true,
          reviewId: uuidv4(),
        };
        updatedReviews.unshift(obj);
        product.reviews = updatedReviews;
        message = "Review Added successfully";
      }

      if (action === "delete") {
        product = await Product.findById(productId);
        let updatedReviews = product.reviews;
        let targetedReview = updatedReviews.map((review) => {
          if (userId === review.userId) {
            if (reviewId === review.reviewId) {
              review.status = false;
            }
          }
          return review;
        });
        // return res.json({ targetedReview });
        product.reviews = targetedReview;

        product.markModified("reviews");

        message = "Review deleted successfully";
      }

      if (action === "edit") {
        product = await Product.findById(productId);
        let updatedReviews = product.reviews;
        let targetedReview = updatedReviews.map((rev) => {
          if (userId === rev.userId) {
            if (reviewId === rev.reviewId) {
              rev.review = review;
              rev.stars = stars;
            }
          }
          return rev;
        });
        product.reviews = targetedReview;
        product.markModified("reviews");
        message = "Edited";
      }
    } else {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "Product not Found" });
  }
  try {
    await product.save();
  } catch (error) {
    return res.status(404).json({ message: "Unable to add review" });
  }
  return res.status(200).json({ message: message });
};

exports.createNewProduct = createNewProduct;
exports.getAllProducts = getAllProducts;
exports.deleteProductById = deleteProductById;
exports.editItemByItemId = editItemByItemId;
exports.getProductById = getProductById;
exports.productReviewHandler = productReviewHandler;
