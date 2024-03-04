const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploadedImages/categoryImg");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploadedImages/productImg");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const categoryStg = multer({ storage: storage });
const productStg = multer({ storage: productStorage });

module.exports = {
  categoryStg,
  productStg,
};
