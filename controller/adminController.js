const { ObjectId } = require("mongodb");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const flash = require("connect-flash");
const fs = require("fs");
const adminModel = require("../models/adminModel");
const orderModel = require("../models/orderModel");
const walletModel = require("../models/walletModel");
const couponModel = require("../models/couponModel");
const offerModel = require("../models/offerModel")
const cahrt = require("chart.js");
const PDF = require("pdfkit");
const exceljs = require("exceljs");
// const { default: products } = require("razorpay/dist/types/products");

module.exports = {
  //get category page
  getCategoryPage: async (req, res) => {
    const admin = await adminModel.findOne();
    req.session.adminName = admin.name;
    const data = await categoryModel.find({ isDeleted: false });
    res.render("admin/categoryPage", {
      title: "Admin Category",
      data: data,
      success: req.flash("success"),
      adminName: req.session.adminName,
    });
  },

  //post category page
  doAddCategoryPage: async (req, res) => {
    const catName = req.body.name.toLowerCase();
    const categoryExists = await categoryModel.findOne({
      categoryName: catName,
    });
    if (categoryExists) {
      if (categoryExists.isDeleted === true) {
        await categoryExists.collection.updateOne(
          { categoryName: catName },
          { $set: { isDeleted: false } }
        );
        res.redirect("/adminCategory");
      } else {
        if (catName === categoryExists.categoryName) {
          req.flash("error", "Category Already Exists");
          fs.unlink(
            `uploadedImages/categoryImg/${req.file.filename}`,
            (error) => {
              if (error) {
                console.log(error);
              } else {
                console.log("deleted");
              }
            }
          );
          res.redirect("/addCategory");
        }
      }
    } else {
      await categoryModel.collection.insertOne({
        categoryName: catName,
        image: req.file.filename,
        isDeleted: false,
      });
      res.redirect("/adminCategory");
    }
  },

  //get add category page.
  getAddCategoryPage: (req, res) => {
    res.render("admin/addCategory", {
      title: "Add Category",
      error: req.flash("error"),
      adminName: req.flash("adminName"),
    });
  },

  //get edit category page
  getEditCategoryPage: async (req, res) => {
    try {
      if (!req.cookies.token) {
        res.redirect("/admin");
      }
      const id = req.params.id;
      // console.log(id);
      const data = await categoryModel.findOne({ _id: id });
      res.render("admin/editCategory", {
        title: "Edit Category",
        data: data,
        error: req.flash("error"),
        adminName: req.session.adminName,
      });
    } catch (error) {
      console.log(error);
    }
  },

  //edit category
  patchEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      // console.log(id);
      // console.log(req.body);
      const newName = req.body.name.toLowerCase();
      console.log(newName);
      const exists = await categoryModel.findOne({ categoryName: newName });
      const data = await categoryModel.findOne({ _id: id });
      if (exists && newName !== data.categoryName) {
        if (exists.isDeleted === true) {
          await categoryModel.deleteOne({ categoryName: newName });
          await categoryModel.updateOne(
            { _id: id },
            { $set: { categoryName: newName } }
          );
          fs.unlink(`uploadedImages/categoryImg/${exists.image}`, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("fileDeleted");
            }
          });
          res.redirect(`/adminCategory`);
        } else {
          req.flash("error", "Category Already Exists");
          res.redirect(`/editCategory/${id}`);
        }
      } else {
        const objId = new ObjectId(id);
        console.log(req.body.name);
        if (!req.body.name && req.file) {
          await categoryModel.collection.updateOne(
            { _id: objId },
            { $set: { image: req.file.filename } }
          );
          req.flash("success", true);
          fs.unlink(`uploadedImages/categoryImg/${data.image}`, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("fileDeleted");
            }
          });
          res.redirect("/adminCategory");
        } else if (!req.file && req.body.name) {
          await categoryModel.collection.updateOne(
            { _id: objId },
            { $set: { categoryName: req.body.name } }
          );

          req.flash("success", true);

          res.redirect("/adminCategory");
        } else if (req.body.name && req.file) {
          await categoryModel.collection.updateOne(
            { _id: objId },
            { $set: { categoryName: req.body.name, image: req.file.filename } }
          );

          req.flash("success", true);

          fs.unlink(`uploadedImages/categoryImg/${data.image}`, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("fileDeleted");
            }
          });
          res.redirect("/adminCategory");
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  //delete category
  deleteCategory: async (req, res) => {
    const id = req.params.id;
    const data = await categoryModel.findOne({ _id: id });
    await categoryModel.updateOne({ _id: id }, { $set: { isDeleted: true } });
    res.redirect("/adminCategory");
  },

  // delete the image from the
  patchDeleteCatImg: async (req, res) => {
    try {
      const id = req.params.id;
      const categoryInfo = await categoryModel.findOne({ _id: id });
      await categoryModel.updateOne({ _id: id }, { $unset: { image: " " } });
      console.log(req.body);
      res.redirect(`/editCategory/${id}`);
    } catch (error) {
      res.send(error);
    }
  },

  //get productpage.
  getProductPage: async (req, res) => {
    // const productsData = await productModel.find({isDeleted : false});
    const productsData = await productModel.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
    ]);
    // console.log(productsData);
    res.render("admin/adminproduct", {
      title: "Admin Product",
      products: productsData,
      adminName: req.session.adminName,
    });
  },

  //get add product page.
  getAddProductPage: async (req, res) => {
    const catData = await categoryModel.find({ isDeleted: false });
    res.render("admin/addProduct", {
      title: "Add Product",
      catData: catData,
      error: req.flash("error"),
      adminName: req.session.adminName,
    });
  },

  // get edit product page.
  getEditProductPage: async (req, res) => {
    if (!req.cookies.token) {
      res.redirect("/admin");
    }
    const catData = await categoryModel.find({ isDeleted: false });
    const paramId = req.params.id;
    const productData = await productModel.findOne({ _id: paramId });
    res.render("admin/editProduct", {
      title: "Edit Product",
      catData: catData,
      data: productData,
      error: req.flash("error"),
      adminName: req.session.adminName,
    });
  },

  //post product form(add product)
  doAddProduct: async (req, res) => {
    try {
      const data = req.body;
      const pName = data.productName.toLowerCase();
      const color = req.body.color.toLowerCase();
      const images = [];
      for (let image of req.files) {
        images.push(image.filename);
      }
    
      console.log(data);
      const category = await categoryModel.findOne({
        categoryName: data.category,
      });
      const isExists = await productModel.findOne({
        productName: data.productName,
        color: color,
      });
      if (isExists) {
        if (isExists.isDeleted === true) {
          await productModel.updateOne(
            { productName: pName, color: data.color },
            {
              $set: {
                isDeleted: false,
                productName: pName,
                productPrice: data.productPrice,
                category: category._id,
                userType: data.userType,
                description: data.productDescription,
                color: data.color,
                sizes: data.Sizes,
                quantity: Number(data.Quantity),
                image: images,
              },
            }
          );
          //deleting the existing image.
          for (let image of isExists.image) {
            fs.unlink(`uploadedImages/productImg/${image}`, (error) => {
              if (error) {
                console.log(error);
              } else {
                console.log("file deleted");
              }
            });
          }

          res.redirect("/adminProduct");
        } else {
          req.flash("error", "Product already exists.");
          res.redirect("/addProduct");
        }
      } else {
        await productModel.collection.insertOne({
          productName: pName,
          productPrice: data.productPrice,
          category: category._id,
          userType: data.userType,
          description: data.productDescription,
          color: data.color,
          sizes: data.Sizes,
          quantity: Number(data.Quantity),
          image: images,
          isDeleted: false,
        });
        res.redirect("/adminProduct");
      }
    } catch (error) {
      console.log(error);
    }
  },

  DeleteProduct: async (req, res) => {
    try {
      const id = req.params.id;
      const productData = await productModel.findOne({ _id: id });
      console.log(productData);
      await productModel.updateOne(
        { _id: productData._id },
        { $set: { isDeleted: true } }
      );
      res.redirect("/adminProduct");
    } catch (error) {
      console.log(error);
    }
  },

  doEditProduct: async (req, res) => {
    try {
      if (!req.cookies.token) {
        res.redirect("/admin");
      }
      const editData = req.body;
      console.log(editData);
      const id = req.params.id;
      const product = await productModel.findOne({ _id: id });
      const productName = req.body.productName.toLowerCase();
      const pColor = req.body.color.toLowerCase();
      const exists = await productModel.findOne({
        productName: productName,
        color: pColor,
      });
      if (exists && product.productName !== productName) {
        if (exists.isDeleted === true) {
          for (let image of exists.image) {
            fs.unlink(`uploadedImages/productImg/${image}`, (error) => {
              if (error) {
                console.log(error);
              } else {
                console.log("file deleted");
              }
            });
          }
          const images = [];
          req.files.forEach((element) => {
            images.push(element.filename);
          });
          await productModel.deleteOne({
            productName: exists.productName,
            color: pColor,
          });
          await productModel.updateOne(
            { _id: id },
            {
              $set: {
                productName:
                  editData.productName !== ""
                    ? editData.productName.toLowerCase()
                    : undefined,
                description:
                  editData.productDescription !== ""
                    ? editData.productDescription
                    : undefined,
                category:
                  editData.category !== ""
                    ? editData.category
                    : new ObjectId(product.category),
                color:
                  editData.color !== ""
                    ? editData.color.toLowerCase()
                    : undefined,
                sizes: editData.Sizes !== "" ? editData.Sizes : undefined,
                quantity:
                  editData.Quantity !== ""
                    ? Number(editData.Quantity)
                    : undefined,
                productPrice:
                  editData.Quantity !== "" ? editData.productPrice : undefined,
                userType:
                  editData.userType !== "" ? editData.userType : undefined,
              },
              $addToSet: {
                image: { $each: images.length !== 0 ? images : [] },
              },
            }
          );
        } else {
          req.flash("error", "Product already Exists");
          res.redirect(`/editProduct/${id}`);
        }
      } else {
        console.log(id);

        const images = [];
        req.files.forEach((element) => {
          images.push(element.filename);
        });

        await productModel.updateOne(
          { _id: id },
          {
            $set: {
              productName:
                editData.productName !== ""
                  ? editData.productName.toLowerCase()
                  : undefined,
              description:
                editData.productDescription !== ""
                  ? editData.productDescription
                  : undefined,
              category:
                editData.category !== "" ? editData.category : undefined,
              color: editData.color !== "" ? editData.color : undefined,
              sizes: editData.Sizes !== "" ? editData.Sizes : undefined,
              quantity:
                editData.Quantity !== ""
                  ? Number(editData.Quantity)
                  : undefined,
              productPrice:
                editData.Quantity !== "" ? editData.productPrice : undefined,
              userType:
                editData.userType !== "" ? editData.userType : undefined,
            },
            $addToSet: { image: { $each: images.length !== 0 ? images : [] } },
          }
        );

        res.redirect("/adminProduct");
      }
    } catch (error) {
      console.log(error);
    }
  },

  //deleting the images from edit product page
  deleteImageEditProduct: async (req, res) => {
    try {
      if (!req.cookies.token) {
        res.redirect("/admin");
      }
      const filename = req.body.filename;
      console.log(filename);
      const id = req.params.id;
      console.log(id);
      const productCollection = await productModel.findOne({ _id: id });
      if (productCollection && productCollection.image !== "") {
        await productModel.updateOne(
          { _id: id },
          { $pull: { image: filename } }
        );
      } else {
        console.log("no data found");
      }
    } catch (error) {
      console.log(error);
    }
  },

  getAdminUsersPage: async (req, res) => {
    try {
      const users = await userModel.find();
      res.render("admin/adminUsers", {
        title: "Admin Users",
        data: users,
        adminName: req.session.adminName,
      });
    } catch (error) {
      console.log(error);
    }
  },

  doBlockUsers: async (req, res) => {
    try {
      if (!req.cookies.token) {
        res.redirect("/admin");
      }
      const id = req.params.id;
      console.log(req.body);
      const data = await userModel.findOne({ _id: id });
      if (data.is_blocked === false) {
        await userModel.updateOne({ _id: id }, { $set: { is_blocked: true } });
        res.json({
          message: "blocked",
        });
      } else {
        await userModel.updateOne({ _id: id }, { $set: { is_blocked: false } });
        res.json({
          message: "unblocked",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getAdminOrders: async (req, res) => {
    try {
      const orders = await orderModel.aggregate([
        {
          $lookup: {
            from: "users",
            let: { userId: { $toObjectId: "$userId" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "addresses",
            localField: "deliveryAddress",
            foreignField: "_id",
            as: "address",
          },
        },
        { $unwind: "$address" },
      ]);
      // console.log(orders);

      let productCount = 0;

      orders.reduce((total, current) => {
        productCount = current.productsDetails.reduce(
          (subtotal, subcurrent) => {
            return (subtotal += subcurrent.quantity);
          },
          0
        );
        return 0;
      }, 0);

      orders.productCount = productCount;
      // console.log(orders);
      res.render("admin/adminOrders", {
        title: "Admin Orders",
        orders: orders ? orders : false,
        adminName: req.session.adminName,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getAdminOrderDetailpage: async (req, res) => {
    try {
      const Id = new ObjectId(req.params.id);
      const order = await orderModel.aggregate([
        {
          $match: {
            _id: Id,
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "deliveryAddress",
            foreignField: "_id",
            as: "address",
          },
        },
        { $unwind: "$address" },
        { $unwind: "$productsDetails" },
        {
          $lookup: {
            from: "products",
            let: { productId: { $toObjectId: "$productsDetails.productId" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$productId"] },
                },
              },
            ],
            as: "productInfo",
          },
        },
      ]);
      console.log(order);
      res.render("admin/orderDetails", {
        title: "Order Details",
        adminName: req.session.adminName,
        order,
      });
    } catch (error) {
      console.log(error);
    }
  },

  acceptCancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      console.log(orderId);

      //finding the order
      const order = await orderModel.findOne({ _id: orderId });
      console.log("fetched order", order);

      if (order && order.productsDetails) {
        const productDetails = order.productsDetails;
        console.log(productDetails);

        // Increment the quantity of each product back to the product collection
        const bulkOperations = productDetails.map((product) => ({
          updateOne: {
            filter: { _id: product.productId },
            update: { $inc: { quantity: product.quantity } },
          },
        }));

        await productModel.bulkWrite(bulkOperations);

        await orderModel.updateOne(
          { _id: orderId },
          {
            cancelRequested: false,
            isCanceled: true,
            orderStatus: "canceled",
          }
        );

        if (order.paymentDetails.method === "razorpay") {
          const price = Number(order.grandTotal) + Number(order.walletMoney);
          await walletModel.updateOne(
            {
              userId: new ObjectId(order.userId),
            },
            {
              $inc: { balance: Number(price) },
              $push: {
                transactionDetails: {
                  paymentType: "credited",
                  date: new Date(),
                  amount: Number(price),
                },
              },
            },
            { upsert: true }
          );
        } else if (order.paymentDetails.method === "COD") {
          if (order.walletMoney) {
            await walletModel.updateOne(
              {
                userId: new ObjectId(order.userId),
              },
              {
                $inc: { balance: order.walletMoney },
                $push: {
                  transactionDetails: {
                    paymentType: "credited",
                    date: new Date(),
                    amount: Number(order.walletMoney),
                  },
                },
              },
              { upsert: true }
            );
          }
        }

        res.json("success");
      } else {
        console.log("cannot found data");
      }
    } catch (error) {
      console.log(error);
    }
  },

  declineCancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      await orderModel.updateOne(
        { _id: orderId },
        {
          cancelRequested: false,
          orderStatus: "confirmed",
          cancelRequestDeclined: true,
          declineRequestReason: req.body.reason,
        }
      );

      res.json("success");
    } catch (error) {
      console.log(error);
    }
  },

  getAdminCouponPage: async (req, res) => {
    try {
      const coupons = await couponModel.find({ isDeleted: false });
      console.log(req.session.success);
      res.render("admin/adminCoupon", {
        title: "Admin Coupon",
        adminName: req.session.adminName,
        coupons,
        success: req.session.success ? true : false,
      });
      delete req.session.success;
    } catch (error) {
      console.log(error);
    }
  },
  getAddCouponForm: async (req, res) => {
    try {
      const category = await categoryModel.find({ isDeleted: false });

      res.render("admin/addCoupon", {
        title: "Add Coupon",
        adminName: req.session.adminName,
        category,
      });
    } catch (error) {
      console.log(error);
    }
  },

  doAddCouponForm: async (req, res) => {
    try {
      const databody = req.body;
      // console.log(databody);
      if (!Array.isArray(databody.categoryId)) {
        databody.categoryId = [databody.categoryId];
      }
      const catId = databody.categoryId.map((item) => {
        return new ObjectId(item);
      });

      await couponModel.collection.insertOne({
        code: databody.couponCode.toLowerCase(),
        value: Number(databody.couponPercent),
        expiresAt: new Date(databody.ExpiryDate),
        eligibleCategory: catId,
        isDeleted: false,
      });

      req.session.success = true;
      res.redirect("/adminCoupon");
    } catch (error) {
      console.log(error);
    }
  },

  deleteCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      await couponModel.updateOne(
        { _id: couponId },
        {
          isDeleted: true,
        }
      );
      res.json("success");
    } catch (error) {
      console.log(error);
    }
  },

  getEditCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      const coupon = await couponModel.findOne({_id : couponId});
      const category = await categoryModel.find({ isDeleted: false });
      console.log(coupon);
      console.log(category);
      res.render("admin/editCoupon", {
        title: "Edit Coupon",
        coupon,
        adminName: req.session.adminName,
        category,
      });
    } catch (error) {
      console.log(error);
    }
  },
  doEditCoupon: async (req, res) => {
    try {
      const couponId = req.params.id;
      const dataBody = req.body;
      // console.log(couponId);
      // console.log(dataBody);
      const categories = dataBody.category.map((cat) => {
        return new ObjectId(cat);
      });

      // console.log(typeof dataBody.date);
      const dateValue = new Date(dataBody.date);
      const result = await couponModel.updateOne(
        { _id: couponId },
        {
          code: dataBody.couponCode,
          value: Number(dataBody.couponPerctg),
          expiresAt: dateValue,
          eligibleCategory: categories,
        }
      );
      // console.log(result);
      res.json("success");
    } catch (error) {
      console.log(error);
    }
  },

  getAdminDashboard: async (req, res) => {
    try {
      const sales = await orderModel.aggregate([
        {
          $match: {
            orderStatus: "confirmed",
            isCanceled: false,
          },
        },
        {
          $group: {
            _id: "$orderedAt",
            total: {
              $sum: { $add: ["$grandTotal", { $ifNull: ["$walletMoney", 0] }] },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);


      //finding the number of products
      const products = await productModel.aggregate([{
        $match : {
          isDeleted : false
        }
      },
      {
        $group :{
          _id : null,
          count : {$sum : 1}
        },
        
      }
    ]);

    // console.log(products);

    //finding the number of categories
    const categories = await categoryModel.aggregate([{
      $match:{
        isDeleted : false
      }
    },{
      $group :{
        _id : null,
        count : {$sum : 1}
      }
    }
  ]);

  //finding total number of blocked users
  const blockedUsers = await userModel.aggregate([
   {
    $match:{
      is_blocked : true
    }
   },{
    $group : {
      _id : null,
      count : {$sum : 1}
    }
   }
])

//finding unblocked users
const unBlockedUsers = await userModel.aggregate([
  {
   $match:{
     is_blocked : false
   }
  },{
   $group : {
     _id : null,
     count : {$sum : 1}
   }
  }
])
  // console.log(blockedUsers);

      // console.log(sales);
      res.render("admin/adminDashboard", {
        title: "Admin Dashboard",
        adminName: req.session.adminName,
        sales: JSON.stringify(sales),
        category : categories ? categories :'',
        products : products ? products :'',
        blockedUsers : blockedUsers? blockedUsers : '',
        unBlockedUsers : unBlockedUsers ? unBlockedUsers : '',
      });
    } catch (error) {
      console.log(error);
    }
  },

  createChartSalesReport: async (req, res) => {
    try {
      const reportOn = req.body.salesValue;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      if (reportOn === "daily") {
        let days = [];
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        while (currentDate <= endDateObj) {
          // Format the current date to 'YYYY-MM-DD' string format
          let year = currentDate.getFullYear();
          let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          let day = String(currentDate.getDate()).padStart(2, "0");

          let currentDateStr = `${year}-${month}-${day}`;

          days.push({
            _id: currentDateStr,
            total: 0,
          });

          currentDate.setDate(currentDate.getDate() + 1); // Increment the date by 1 day
        }
        const sales = await orderModel.aggregate([
          {
            $match: {
              orderedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
              isCanceled: false,
              orderStatus: "confirmed",
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  date: "$orderedAt",
                  format: "%Y-%m-%d",
                },
              },
              total: {
                $sum: {
                  $add: ["$grandTotal", { $ifNull: ["$walletMoney", 0] }],
                },
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);
        // console.log(sales);
        days.forEach((item) => {
          sales.forEach((sale) => {
            if (item._id === sale._id) {
              item.total = sale.total;
            }
          });
        });
        // console.log(days);

        res.json(days);

        //weekly
      } else if (reportOn === "weekly") {
        let weeks = [];
        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        // Iterate through weeks until reaching endDate
        while (currentDate <= endDateObj) {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          const weekNumber = Math.ceil((currentDate.getDate() - 1 + currentDate.getDay()) / 7);
      
          // Create and add a week object to the weeks array
          const format = `${year}-${month}-${weekNumber.toString().padStart(2, "0")}`
          weeks.push({
            _id: format, 
            total: 0,
          });
      
          // Move to the next week
          currentDate.setDate(currentDate.getDate() + 7);
        }
      console.log('weeks : ',weeks);
        // Efficiently aggregate sales data using MongoDB aggregation
        const sales = await orderModel.aggregate([
          {
            $match: {
              orderedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
              isCanceled: false,
              orderStatus: "confirmed",
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$orderedAt" },
                month: { $month: "$orderedAt" },
                day: { $dayOfMonth: "$orderedAt" }
              },
              total: {
                $sum: {
                  $add: ["$grandTotal", { $ifNull: ["$walletMoney", 0] }],
                },
              },
            },
          },
          {
            $group: {
              _id: {
                year: "$_id.year",
                month: "$_id.month",
                week: {
                  $ceil: {
                    $divide: [
                      { $subtract: ["$_id.day", { $subtract: [{ $dayOfWeek: { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 1 } } }, 1] }] },
                      7
                    ]
                  }
                }
              },
              total: { $sum: "$total" }
            }
          },
          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
              "_id.week": 1,
            },
          },
        ]);
      
       
        weeks.forEach((week) => {
          sales.forEach((sale) => {
            const saleYear = sale._id.year.toString();
            const saleMonth = sale._id.month.toString().padStart(2, "0");
            const saleWeek = sale._id.week.toString().padStart(2, "0");
      
            if (week._id === `${saleYear}-${saleMonth}-${saleWeek}`) {
              week.total = sale.total;
            }
          });
        });
        res.json(weeks); // Return the combined results

      } else if (reportOn === "monthly") {
        let months = [];
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
          // Format the current date to 'YYYY-MM' string format
          let year = currentDate.getFullYear();
          let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based

          let currentMonthStr = `${year}-${month}`;

          months.push({
            _id: currentMonthStr,
            total: 0,
          });

          // Set the date to the first day of the next month
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(1);
        }

        const sales = await orderModel.aggregate([
          {
            $match: {
              orderedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
              isCanceled: false,
              orderStatus: "confirmed",
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  date: "$orderedAt",
                  format: "%Y-%m",
                },
              },
              total: {
                $sum: {
                  $add: ["$grandTotal", { $ifNull: ["$walletMoney", 0] }],
                },
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);

        months.forEach((item) => {
          sales.forEach((sale) => {
            if (item._id === sale._id) {
              item.total = sale.total;
            }
          });
        });

        res.json(months);
      } else {
        let startYear = req.body.startDate;
        let endYear = req.body.endDate;
        let years = [];
        for (let year = startYear; year <= endYear; year++) {
          years.push({
            _id: year.toString(),
            total: 0,
          });
        }
        console.log(startYear);
        console.log(endYear);
        const sales = await orderModel.aggregate([
          {
            $match: {
              orderedAt: {
                $gte: new Date(startYear, 0, 1),
                $lte: new Date(endYear, 11, 31, 23, 59, 59, 999),
              },
              isCanceled: false,
              orderStatus: "confirmed",
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y",
                  date: "$orderedAt",
                },
              },
              total: {
                $sum: {
                  $add: ["$grandTotal", { $ifNull: ["$walletMoney", 0] }],
                },
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);
        years.forEach((item) => {
          sales.forEach((sale) => {
            if (item._id === sale._id) {
              item.total = sale.total;
            }
          });
        });

        // console.log(sales);
        // console.log(years);
        res.json(years);
      }
    } catch (error) {
      console.log(error);
    }
  },

  downloadReportPdf: async (req, res) => {
    try {
      console.log(req.body);
      const basis = req.body.basis;
      const sales = req.body.salesData;

      const doc = new PDF();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Sales-Report-on-${basis}-Basis.pdf`
      );
      doc.pipe(res);

      // Add content to the PDF
      doc.fontSize(18).text(`StopShoppers`, {
        align: "center",
      });

      doc.fontSize(18).text(`Sales Report on ${basis} Basis`, {
        align: "center",
      });

      doc.moveDown();
      doc.fontSize(12).text("Sales Data:", {
        underline: true,
      });

      sales.forEach((item) => {
        doc.text(`${item._id}: $${item.total.toFixed(2)}`);
      });

      doc.end();
    } catch (error) {
      console.log(error);
    }
  },

  downloadAsExcel: async (req, res) => {
    try {
      const sales = req.body.salesData;
      const basis = req.body.basis;
      console.log(req.body);

      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Stop Shoppers Sales Data");
      worksheet.columns = [
        { header: "Date/Year", key: "_id", width: 15 },
        { header: "Total", key: "total", width: 15 },
      ];

      sales.forEach((item) => {
        worksheet.addRow({ _id: item._id, total: item.total });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales-report-${basis} Basis.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      console.log(error);
    }
  },

  getAddOfferPage : async(req,res)=>{
    const category = await categoryModel.find({isDeleted : false})

    res.render('admin/addOffer',{
      title : 'Add Offer',
      adminName: req.session.adminName,
      category,
      error : req.session.error ? req.session.error : ''
    })
  },
  
  getAdminOffer : async(req,res)=>{
    try{
      const offers = await offerModel.find({isDeleted : false});
      

      res.render('admin/adminOffers',{
        title : 'Admin Offers',
        adminName: req.session.adminName,
        offers,
      })
    }catch(error){
      console.log(error);

    }

  },

  doAddOffer : async(req,res)=>{
    try{
      const databody = req.body
      // console.log(databody); 
      if (!Array.isArray(databody.categoryId)) {
        databody.categoryId = [new ObjectId(databody.categoryId)];
      }else{ 
        databody.categoryId =  databody.categoryId.map((item)=>{
          return new ObjectId(item);
        })
      }
      console.log(databody.categoryId);
      const existingOffers = await offerModel.findOne({isDeleted:false,categories:{ $all : databody.categoryId}});
      console.log(existingOffers);
      
      if(existingOffers){
        req.session.error = "Offer Already Exists to the Category";
        res.redirect('/getAddOffer')
      }else if(databody.offerPercent > 100){
        req.session.error = "Offer discount cannot be more than 100%";
        res.redirect('/getAddOffer');
      }else{
        const result =  await offerModel.collection.insertOne({
          offerName : databody.offername,
          offerValue :Number(databody.offerPercent),
          categories : databody.categoryId,
          expiryDate : new Date(databody.ExpiryDate),
          isDeleted : false,
          status : 'Active'
        });
  
        const offer = await offerModel.findOne({_id : result.insertedId});
        let products = await productModel.find({isDeleted : false,
          category : {$in : offer.categories}
        });
  
        // console.log(products);
        products.forEach(async (item) => {
          const actualAmount  = Number(item.productPrice);
          const updatedPrice = (item.productPrice  - (item.productPrice * offer.offerValue) / 100).toFixed(2);
          const offerPrice = Number((item.productPrice * offer.offerValue) / 100).toFixed(2);
          
          item.productPrice = Numer(updatedPrice);
  
          if (!item.offer) {
              item.offer = {};
          }
  
          item.offer.price = offerPrice;
          item.offer.offerName = offer.offerName;
          item.offer.offerValue = offer.offerValue;
          item.offer.actualAmount = Number(actualAmount);
          
          await item.save();  
      });
      
        // console.log(products);
        res.redirect('/adminOffer');
      }
    
    }catch(error){
      console.log(error);
    }

  },

 deleteOffer : async(req,res)=>{
  try{
    // console.log('hello');
    const offerId = req.params.id ;
   
    const offer = await offerModel.findOne({_id : offerId});

    let products = await productModel.find({isDeleted : false,
          category : {$in : offer.categories}
        });
       if(products){
       for (let item of products) {
        if (item.offer) {
          const actualAmount = Number(item.offer.actualAmount);
          item.productPrice = actualAmount;

            item.set('offer', undefined, { strict: false });

          await item.save();
        }
      }
    }
      await offerModel.updateOne({_id : offerId},{ $set : {
      isDeleted : true,
    }});


    res.json('success');
  }catch(error){
    console.log(error);
  }

 },


 getSecondChart : async(req,res)=>{
  try{
    const items = await categoryModel.aggregate([
      {
        $match : {
          isDeleted : false
        }
    },
    {
      $lookup : {
        from : "products",
        localField : "_id",
        foreignField : "category",
        as : "products"
      }
    },{
      $unwind : "$products"
    },
    {
      $match: {
          "products.isDeleted": false
      }
  }
    ,{
      $group: {
        _id: "$_id",
        categoryName: { $first: "$categoryName" }, 
        count: { $sum: 1 }
    }
    },
    {
      $project :{
        _id : 0,
        categoryName : 1,
        count : 1
      }
    }

  ]);
  // console.log(items);
  res.json(items);
  }catch(error){
  console.log(error);
  }
}
};
