const { ObjectId } = require("mongodb");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const flash = require("connect-flash");
const fs = require("fs");
const adminModel = require("../models/adminModel");
const orderModel = require("../models/orderModel");
const walletModel = require('../models/walletModel');
const couponModel = require('../models/couponModel');

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
                  editData.Quantity !== "" ? Number(editData.Quantity) : undefined,
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
                editData.Quantity !== "" ? Number(editData.Quantity) : undefined,
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
      console.log(orders);

      let productCount = 0;
      
        orders.reduce((total, current) => {
          productCount = current.productsDetails.reduce((subtotal,subcurrent)=>{
            return subtotal += subcurrent.quantity;
        },0)
         return 0;
       }, 0);
      

      orders.productCount = productCount;
      console.log(orders);
      res.render("admin/adminOrders", {
        title: "Admin Orders",
        orders : orders ? orders : false,
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
        { $unwind: "$productsDetails"},
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

  acceptCancelOrder : async(req,res)=>{
    try{
      const orderId = req.params.id ;
      console.log(orderId);
      
      //finding the order
      const order = await orderModel.findOne({ _id: orderId });
      console.log('fetched order',order);
     
      if (order && order.productsDetails) {
        const productDetails = order.productsDetails;
        console.log(productDetails);

        // Increment the quantity of each product back to the product collection
        const bulkOperations = productDetails.map(product => ({
            updateOne: {
                filter: { _id: product.productId },
                update: { $inc: { quantity: product.quantity } }
            }
        }));

       
        await productModel.bulkWrite(bulkOperations);

        await orderModel.updateOne ({_id : orderId},{
          cancelRequested : false ,
          isCanceled : true,
          orderStatus : 'canceled'
        });


        if(order.paymentDetails.method === 'razorpay'){
          const price = parseFloat(order.grandTotal) + parseFloat(order.walletMoney);
          await walletModel.updateOne({
            userId : new ObjectId(order.userId)
          },
          {$inc :{balance : Number(price)},$push :{
            transactionDetails : {
              paymentType : "credited",
              date : new Date(),
              amount : Number(price)
            }
          }},
          {upsert : true})
        }else if(order.paymentDetails.method === 'COD'){
          if(order.walletMoney){
            await walletModel.updateOne({
              userId : new ObjectId(order.userId)
            },
            {$inc :{balance : order.walletMoney},$push :{
              transactionDetails : {
                paymentType : "credited",
                date : new Date(),
                amount : Number(order.walletMoney)
              }
            }},
            {upsert : true})

          }
        }

        res.json('success');
        
      }else{
        console.log("cannot found data");
      }

    }catch(error){
      console.log(error);
    }

  },

  declineCancelOrder :async(req,res)=>{
    try{
      const orderId = req.params.id ;


      await orderModel.updateOne({_id : orderId},{
        cancelRequested : false,
        orderStatus : 'confirmed',
        cancelRequestDeclined : true,
        declineRequestReason : req.body.reason,
      });

      res.json('success');

   } catch(error){
    console.log(error);
  }
  },

  getAdminCouponPage : async(req,res)=>{
    try{

      const coupons = await couponModel.find({isDeleted : false});
      console.log(req.session.success);
      res.render('admin/adminCoupon',{
        title : 'Admin Coupon',
        adminName: req.session.adminName,
        coupons, 
        success : req.session.success ? true : false
      })
      delete req.session.success;
    }catch(error){
      console.log(error);
    }
  },
  getAddCouponForm : async(req,res)=>{
    try{
      const category = await categoryModel.find({isDeleted : false});
      
      res.render('admin/addCoupon',{
        title : 'Add Coupon',
        adminName: req.session.adminName,
        category ,
  
      });  
    }catch(error){
      console.log(error);
    }
   
  },


  doAddCouponForm : async(req,res)=>{
    try{
      const databody = req.body;
      console.log(databody);
      if(!Array.isArray(databody.categoryId)){
        databody.categoryId = [databody.categoryId]
      }
      const catId =  databody.categoryId.map((item)=>{
        return new ObjectId(item)
      });

      await couponModel.collection.insertOne({
        code : databody.couponCode.toLowerCase(),
        value : Number(databody.couponPercent),
        expiresAt : new Date(databody.ExpiryDate),
        eligibleCategory : catId,
        isDeleted : false
      });

      req.session.success = true
      res.redirect('/adminCoupon');

    }catch(error){
      console.log(error);
    }
  },

  deleteCoupon : async(req,res)=>{
    try{
      const couponId = req.params.id;
      await couponModel.updateOne({_id : couponId},{
      isDeleted : true
      });
      res.json('success');
    }catch(error){
      console.log(error);
    }
  },

  getEditCoupon : async(req,res)=>{
    try{
      const couponId = req.params.id;
      const coupon = await couponModel.findOne();
      const category = await categoryModel.find({isDeleted : false});
      console.log(coupon);
      console.log(category);
      res.render('admin/editCoupon',{
        title: 'Edit Coupon',
        coupon,
        adminName: req.session.adminName,
        category

      })



    }catch(error){
      console.log(error);
    }

  },
  doEditCoupon : async(req,res)=>{
    try{
      const couponId = req.params.id
      const dataBody = req.body
      // console.log(couponId);
      // console.log(dataBody);
      const categories = dataBody.category.map((cat)=>{
        return new ObjectId(cat)
      })

      // console.log(typeof dataBody.date);
      const dateValue = new Date(dataBody.date)
     const result= await couponModel.updateOne({_id : couponId},{
        code : dataBody.couponCode,
        value : Number(dataBody.couponPerctg),
        expiresAt : dateValue,
        eligibleCategory : categories
      });
      // console.log(result);
      res.json('success');
     }catch(error){
     console.log(error);
    }
  }
};
