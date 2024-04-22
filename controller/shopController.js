const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const cartModel = require("../models/cartModel");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const flash = require("connect-flash");
const orderModel = require("../models/orderModel");
const wishlistModel = require('../models/wishlistModel');
const {v4} = require('uuid');
const Razorpay = require('razorpay');
require('dotenv').config();
const crypto = require('crypto');
const walletModel = require('../models/walletModel');
const couponModel = require("../models/couponModel");
const offerModel  = require('../models/offerModel');
const PDF = require('pdfkit');


async function userValidation(token){

      let user;
      let cartCount;
      let wishlistCount;
      if (token) {
        const data = jwt.verify(token, process.env.SECRET_KEY_USERTOKEN );
        
        user = data.user;
       
        const  cart = await cartModel.findOne({userId : user._id});

        if(cart){
          cartCount = cart.products.length
        }

        const wishlist = await wishlistModel.findOne({userId : user._id});
        if(wishlist){
          wishlistCount = wishlist.productDetails.length ;
        }
      } else {
        user = false;
      }
      
      return {user : user ? user : '', cartCount : cartCount ? cartCount : 0 ,wishlistCount : wishlistCount ? wishlistCount : 0}
    }
   


module.exports = {
  getHomePage: async (req, res , next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);

      // Pagination parameters
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 8;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Fetch products with pagination
      const products = await productModel
        .find({ isDeleted: false })
        .skip(skip)
        .limit(limit);

      // Count total number of products (for pagination)
      const totalCount = await productModel.countDocuments({
        isDeleted: false,
      });

      const categories = await categoryModel.find({isDeleted : false});
      

      // Render the view with products and pagination data
      res.render("users/userHome", {
        allProducts: products,
        title: "Home",
        user: user,
        cartCount,
        wishlistCount,
        category : categories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getProductDetailpage: async (req, res ,next) => {
    try{
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);
  
      const id = req.params.id;
      const allProducts = await productModel.find({
        _id: { $ne: id },
        isDeleted: false,
      }).limit(8);
      const productInfo = await productModel.findOne({ _id: id });
      if(productInfo){
        if (productInfo.quantity <= 0) {
          req.session.detailpageError = true;
        } else {
          req.session.detailpageError = false;
        }
      }
      res.render("users/productDetailPage", {
        title: "Product Detail",
        product: productInfo,
        allProducts: allProducts,
        user: user,
        cartCount,
        wishlistCount,
        error: req.session.detailpageError ? req.session.detailpageError : false,
      });
      req.session.quantityError = false;
    }catch(error){
      console.log(error);
      next(error);
    }
  },

  getUserProfilePage: async (req, res , next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);

      const Id = req.params.id;
      const userId = new mongoose.Types.ObjectId(Id);
      
      const userDetails = await userModel.findOne({ _id: userId });
      const userAddress = await addressModel.find({ userId: Id });
      
      res.render("users/userProfile", {
        title: "User Profile",
        userInfo: userDetails,
        user: user,
        cartCount,
        wishlistCount,
        userAddress: userAddress,
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  getAddAddressPage: async(req, res , next) => {
    try{
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);
      const id = req.params.id;
      res.render("users/addAddress", {
        title: "Add Address",
        user: user,
        cartCount,
        wishlistCount,
        userid: id,
      });
    }catch(error){
      console.log(error);
      next(error);
    }
  },

  doAddAddress: async (req, res , next) => {
    try {
      const id = req.params.id;
      console.log(id);
      const {
        firstname,
        lastname,
        address,
        state,
        district,
        city,
        locality,
        postalCode,
        phone,
      } = req.body;
      
      const result = await addressModel.collection.insertOne({
        userId: new ObjectId(id),
        firstname,
        lastname,
        address, 
        state,
        district,
        city,
        locality,
        postalcode: postalCode, 
        phone,
      });
      res.redirect(`/userProfile/${id}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getEditAddress: async (req, res , next) => {
    try {
      const token = req.cookies.UserToken;
    const {user,cartCount,wishlistCount} = await userValidation(token);

      const id = req.params.id;
      const userid = req.query.userId;
      console.log(userid);
      const addressDetails = await addressModel.findOne({ _id: id });

      res.render("users/editAddress", {
        title: "Edit Address",
        addressDetails,
        userid,
        wishlistCount,
        cartCount,
        user: user,
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  doEditAddress: async (req, res, next) => {
    try {
      const userid = req.query.id;
      const id = req.params.id;
      
      const {
        firstname,
        lastname,
        address,
        state,
        district,
        city,
        locality,
        postalCode,
        phone,
      } = req.body;
    
      const updateFields = {
        firstname: firstname !== "" ? firstname : undefined,
        lastname: lastname !== "" ? lastname : undefined,
        address: address !== "" ? address : undefined,
        state: state !== "" ? state : undefined,
        district: district !== "" ? district : undefined,
        city: city !== "" ? city : undefined,
        locality: locality !== "" ? locality : undefined,
        postalcode: postalCode !== "" ? postalCode : undefined,
        phone: phone !== "" ? phone : undefined,
      };
    
      await addressModel.updateOne({ _id: id }, { $set: updateFields });
      
      res.redirect(`/userProfile/${userid}`);
    } catch (error) {
      console.log(error);
      next(error)
    }    
  },

  doDeleteAddress: async (req, res , next) => {
    try {
      const id = req.params.id;
      const userId = req.query.userId;

      await addressModel.deleteOne({ _id: id });

      res.redirect(`/userProfile/${userId}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  setAsPrimary: async (req, res, next) => {
    try {
      const id = req.params.id;
      const userid = req.query.userId;


    await addressModel.updateMany({}, { $set: { isPrimary: false } });

    await addressModel.updateOne({ _id: id }, { $set: { isPrimary: true } });
      
      res.redirect(`/userProfile/${userid}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getEditProfilePage: async (req, res , next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);
      const userId = req.params.id;
      const userdet = await userModel.findOne({ _id: userId });
      res.render("users/editProfile", {
        title: "Edit Profile",
        user: user,
        cartCount,
        wishlistCount,
        userDetails: userdet,
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  doPatchEditProfile: async (req, res ,next) => {
    try {
      const id = req.params.id;
      const {
        firstname = "",
        lastname = "",
        email = "",
        phone = "",
      } = req.body;
    
      const updateFields = {
        firstname: firstname !== "" ? firstname : undefined,
        lastname: lastname !== "" ? lastname : undefined,
        email: email !== "" ? email : undefined,
        phone: phone !== "" ? phone : undefined,
      };
    
      await userModel.updateOne({ _id: id }, { $set: updateFields });
    
      res.redirect(`/userProfile/${id}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
    
  },

  //search product
  searchProductHome: async (req, res ,next) => {
    try {
      const string = req.body.string;

      const result = await productModel.find({
        $or: [
          {productName: { $regex: string, $options: "i" } },
          {description: { $regex: string, $options: "i" } },
          {color : {$regex : string , $options : "i"}},
          {userType : {$regex : string , $options : "i"}},
        ],
      });
      res.json({
        result,
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  getShopPage: async (req, res ,next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);
      // Pagination parameters
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 16;
      const totalCount = await productModel.countDocuments({
        isDeleted: false,
      });
      // Calculate skip
      const skip = (page - 1) * limit;

      // Fetch products with pagination
      const products = await productModel
        .find({ isDeleted: false })
        .skip(skip)
        .limit(limit);

      const categories = await categoryModel.find({
        isDeleted: false,
      });
      // console.log(categories);
      res.render("users/shopPage", {
        title: "Shop",
        allProducts: products,
        user: user,
        cartCount,
        wishlistCount,
        category: categories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  getCartPage: async (req, res ,next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);
      const productDetails = await cartModel.aggregate([
        { $match: { userId: new ObjectId(user._id) } },
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
      ]);
      
      // Calculate the total price for each product in the cart
      productDetails.forEach((cartItem) => {
        const quantity = cartItem.products.quantity;
        const price = cartItem.productDetails.productPrice;
       
        if (isNaN(quantity) || isNaN(price)) {
          cartItem.totalPrice = "Not a Number";
        } else {
          cartItem.totalPrice = quantity * price;
        }
      });
      const grandTotal = productDetails.reduce((total, item) => {
        return total + item.totalPrice;
      }, 0);
      
      res.render("users/cartPage", {
        title: "Cart",
        user: user,
        carts: productDetails,
        grandTotal,
        wishlistCount,
        cartCount
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  AddToCart: async (req, res,next) => {
    try {
      const { size } = req.body;
      const productid = req.params.id;
      const userId = new ObjectId(req.query.userId);
    
      const product = await productModel.findOne({ _id: productid });
      const existingCart = await cartModel.findOne({ userId });
    
      if (existingCart) {
        const pExists = existingCart.products.find(
          (prod) =>
            prod.productId.equals(new ObjectId(productid)) && prod.size === size
        );
    
        if (pExists) {
          const index = existingCart.products.findIndex(
            (prod) =>
              prod.productId.equals(new ObjectId(productid)) && prod.size === size
          );
          const checkQuantity = product.quantity - pExists.quantity;
          
          if (checkQuantity <= 0) {
            return res.json({ message: "failed" });
          }
    
          await cartModel.updateOne(
            { userId },
            { $inc: { [`products.${index}.quantity`]: 1 } }
          );
          return res.json({ message: "success" });
        }
    
        const productAlreadyIn = existingCart.products.some(
          (prod) => prod.productId.equals(new ObjectId(productid))
        );
    
        const checkQuantity = product.quantity - 1;
        if (productAlreadyIn && checkQuantity <= 0) {
          return res.json({ message: "failed" });
        }
    
        await cartModel.updateOne(
          { userId },
          {
            $push: {
              products: {
                productId: productid,
                quantity: 1,
                color: product.color,
                size,
              },
            },
          }
        );
        return res.json({ message: "success" });
      }
    
      await cartModel.updateOne(
        { userId },
        {
          $push: {
            products: {
              productId: productid,
              color: product.color,
              quantity: 1,
              size,
            },
          },
        },
        { upsert: true }
      );
      return res.json({ message: "success" });
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  },

  cartUpdateFetch: async (req, res,next) => {
    try {
      const { productId, userId } = req.params;
      const { quantity, size } = req.body;
    
      const cartItem = await cartModel.findOne({
        userId,
        "products.productId": productId,
      });
    
      if (!cartItem) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
      }
    
      const productInfo = await productModel.findOne({ _id: productId });
    
      if (productInfo.quantity < quantity) {
        return res.json('error');
      }
    
      const productIndex = cartItem.products.findIndex(
        (product) => product.productId.equals(new ObjectId(productId)) && product.size === size
      );
    
      if (productIndex === -1) {
        return res.status(404).json({ success: false, message: "Product not found in cart" });
      }
    
      cartItem.products[productIndex].quantity = quantity;
      await cartItem.save();
    
      return res.json('success');
    
    } catch (error) {
      console.error(error);
      next(error);
    }
    
  },

  removeFromCart: async (req, res,next) => {
    try {
      req.session.productInfo = "";
      req.session.productDetails = "";
      req.session.grandTotal = "";
    
      const { productId, size } = req.body;
      const userId = req.params.id;
    
      const cartItem = await cartModel.findOne({
        userId,
        "products.productId": productId,
      });
    
      if (!cartItem) {
        console.log("Cart Item Not Found");
        return res.status(404).json({ success: false, message: "Cart item not found" });
      }
    
      const index = cartItem.products.findIndex(
        (product) => product.productId.equals(new ObjectId(productId)) && product.size === size
      );
    
      if (index === -1) {
        console.log("Product Not Found in Cart");
        return res.status(404).json({ success: false, message: "Product not found in cart" });
      }
    
      cartItem.products.splice(index, 1);
      await cartItem.save();
    
      return res.json('success');
    
    } catch (error) {
      console.error(error);
      next(error);
    }
    
  },

  getCheckoutPage: async (req, res,next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);
      
      const addressPrimary = await addressModel.findOne({
        userId: user._id,
        isPrimary: true,
      });

      const wallet = await walletModel.findOne({userId : user._id});
      let coupon ;
      if(req.session.productInfo ){
        const currentDateUTC = new Date().toISOString();
        coupon = await couponModel.find({
        isDeleted : false,
        expiresAt :{$gte : currentDateUTC} ,
        eligibleCategory  : {$in: new ObjectId(req.session.productInfo[0].category)}});

      }else if(req.session.productDetails){
        const details = req.session.productDetails ;
        const currentDateUTC = new Date().toISOString();
        let eligibleCategories = details.map(item => new ObjectId(item.productDetails.category));
          coupon = await couponModel.find({
          isDeleted: false,
          expiresAt: { $gte: currentDateUTC },
          eligibleCategory: { $in: eligibleCategories }
      });
        
        
      }

      res.render("users/checkoutPage", {
        title: "Checkout",
        user: user,
        addressPrimary,
        grandTotal: req.session.grandTotal ? req.session.grandTotal : false,
        cartProducts: req.session.productDetails ? req.session.productDetails : false,
        productInfo: req.session.productInfo ? req.session.productInfo : false,
        wallet,
        error : req.session.warning ? req.session.warning : '',
        cartCount,
        wishlistCount,
        coupons : coupon ? coupon : [] 
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  doAddAddressCheckout: async (req, res, next) => {
    try {
      const {
        firstname,
        lastname,
        address,
        state,
        district,
        city,
        locality,
        postalCode,
        phone,
      } = req.body;
      
      const userId = req.params.id;
    
      const result = await addressModel.collection.insertOne({
        userId: new ObjectId(userId),
        firstname,
        lastname,
        address,
        state,
        district,
        city,
        locality,
        postalcode: postalCode, 
        phone,
      });
    
      const primaryExists = await addressModel.findOne({
        userId: new ObjectId(userId),
        isPrimary: true,
      });
    
      if (primaryExists) {
        await addressModel.updateOne(
          { _id: primaryExists._id },
          { $set: { isPrimary: false } }
        );
      }
    
      await addressModel.updateOne(
        { _id: result.insertedId },
        { $set: { isPrimary: true } }
      );
    
      res.json("success");
    
    } catch (error) {
      console.error(error);
      next(error);
    }
    
  },

  checkoutDirectFromDetailPage: async (req, res ,next) => {
    try {
      const productId = req.params.id;
      const size = req.query.size;

      const productInfo = await productModel.aggregate([
        { $match: { _id: new ObjectId(productId) } },
        { $unwind: "$sizes" },
        { $match: { sizes: size } },
      ]);

      req.session.productDetails = "";
      req.session.grandTotal = "";
      req.session.productInfo = productInfo;
      res.redirect("/checkoutPage");
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  checkoutFromCart: async (req, res ,next) => {
    try {
      const userId = req.params.id;
      const productDetails = await cartModel.aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
      ]);
     
      productDetails.forEach((cartItem) => {
        const quantity = cartItem.products.quantity;
        const price = cartItem.productDetails.productPrice;
        if (isNaN(quantity) || isNaN(price)) {
          console.log("Error: Quantity or price is not a number");
          cartItem.totalPrice = "Not a Number";
        } else {
          cartItem.totalPrice = quantity * price;
        }
      });
      const grandTotal = productDetails.reduce((total, item) => {
        return total + item.totalPrice;
      }, 0);

      req.session.productInfo = "";
      req.session.productDetails = productDetails;
      req.session.grandTotal = grandTotal;
      res.redirect("/checkoutPage");
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

  doPlaceOrder: async (req, res,next) => {
    try {
      let result;
      const databody = req.body;
      const userId = req.params.id;
      const walletAmount = Number(req.query.walletAmount) ;
      const couponDiscount = Number(req.query.couponDiscount);
     
      const deliveryAddress = await addressModel.findOne({
        userId: userId,
        isPrimary: true,
      });
      const paymentDetails = {
        method : "COD"
      }
      
      if (Object.keys(req.body).length > 0) {
        
      const product = await productModel.findOne({_id : databody.productName});
     
     
        if(couponDiscount && !walletAmount){
          const price = (databody.price - couponDiscount).toFixed(2) ;
          if(price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutDirect/${databody.productName}?size=${databody.size}`)
          }
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(deliveryAddress._id),
            orderStatus: "confirmed",
            productsDetails: [
              {
                productId: new ObjectId(databody.productName),
                quantity: 1,
                size: databody.size,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails : paymentDetails ,
            grandTotal: Number(price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            // walletMoney : Number(walletAmount),
            couponDiscount : Number(couponDiscount)
          });
         
          //ordered product
          await productModel.updateOne(
            { _id: databody.productName },
            {
              $inc: {
                quantity: -1,
                salesCount : 1
              },
              
            }
          );

          await categoryModel.updateOne({
            _id : product.category
          },{$inc : {salesCount : 1 }});

        }else if(walletAmount && couponDiscount){
          const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
          const price = (databody.price - subamount).toFixed(2) ;
          if(price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutDirect/${databody.productName}?size=${databody.size}`)
          }
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(deliveryAddress._id),
            orderStatus: "confirmed",
            productsDetails: [
              {
                productId: new ObjectId(databody.productName),
                quantity: 1,
                size: databody.size,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails : paymentDetails ,
            grandTotal: Number(price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount),
            couponDiscount : Number(couponDiscount)
          });
          // console.log(result);
          await walletModel.updateOne({userId : userId},
            {$inc :{balance : -Number(walletAmount)},
              $push :{
                transactionDetails : {
                  paymentType : "debited",
                  date : new Date(),
                  amount : Number(walletAmount)
                } 
              }
            })

          //ordered product
          await productModel.updateOne(
            { _id: databody.productName },
            {
              $inc: {
                quantity: -1,
                salesCount : 1
              },
              
            }
          );

          await categoryModel.updateOne({
            _id : product.category
          },{$inc : {salesCount : 1 }});

        }else if(walletAmount && !couponDiscount){
          const price = databody.price - walletAmount ;
          if(price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutDirect/${databody.productName}?size=${databody.size}`)
          }
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(deliveryAddress._id),
            orderStatus: "confirmed",
            productsDetails: [
              {
                productId: new ObjectId(databody.productName),
                quantity: 1,
                size: databody.size,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails : paymentDetails ,
            grandTotal: Number(price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount)
          });
          // console.log(result);
          await walletModel.updateOne({userId : userId},
            {$inc :{balance : -Number(walletAmount)},
              $push :{
                transactionDetails : {
                  paymentType : "debited",
                  date : new Date(),
                  amount : Number(walletAmount)
                } 
              }
            })

          //ordered product
          await productModel.updateOne(
            { _id: databody.productName },
            {
              $inc: {
                quantity: -1,
                salesCount : 1
              },
              
            }
          );
          await categoryModel.updateOne({
            _id : product.category
          },{$inc : {salesCount : 1 }});

        }else{
          if(databody.price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutDirect/${databody.productName}?size=${databody.size}`)
          }
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(deliveryAddress._id),
            orderStatus: "confirmed",
            productsDetails: [
              {
                productId: new ObjectId(databody.productName),
                quantity: 1,
                size: databody.size,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails : paymentDetails ,
            grandTotal: Number(databody.price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false
          });
          // console.log(result);
          //ordered product
          await productModel.updateOne(
            { _id: databody.productName },
            {
              $inc: {
                quantity: -1,
                salesCount : 1
              },
              
            }
          );

          await categoryModel.updateOne({
            _id : product.category
          },{$inc : {salesCount : 1 }});
        }
      } else {
        //cart products
        


        if(walletAmount && couponDiscount){
          const subtotal = parseFloat(walletAmount) + parseFloat(couponDiscount)
          const price = (req.session.grandTotal - subtotal).toFixed(2) ;
          if(price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutFromCart/${userId}`);
          }
          const cartProducts = await cartModel.findOne({ userId: userId });
          // console.log(cartProducts);
          const productDetails = cartProducts.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            size: product.size,
          }));
  
          const totalProducts = cartProducts.products.reduce((total,current)=>{
            return total = total + current.quantity;
          },0)
  
          console.log(productDetails);
            result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(deliveryAddress._id),
            orderStatus: "confirmed",
            productsDetails: productDetails,
            paymentDetails : paymentDetails ,
            grandTotal: Number(price),
            totalQuantity : totalProducts,
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount),
            couponDiscount : Number(couponDiscount)
          });
  
  
          await walletModel.updateOne({userId : userId},
            {$inc :{balance : -Number(walletAmount)},
              $push : {
                transactionDetails : {
                  paymentType : "debited",
                  date : new Date(),
                  amount : Number(walletAmount)
                }
              }
            });
  
          await cartModel.updateOne(
            { userId: userId },
            {
              $set: {
                products: [],
              },
            }
          );
  
          for (const item of productDetails) {
            console.log(item.quantity);
            await productModel.updateOne(
              { _id: item.productId },
              {
                $inc: {
                  quantity: -Number(item.quantity),
                  salesCount: Number(item.quantity)
                },
              }
            );
          }

          for(const item of productDetails){
           const currentProduct =  await productModel.findOne({_id : item.productId});
           await categoryModel.updateOne({
            _id :  currentProduct.category
           },{
            $inc :{salesCount : Number(item.quantity)}
           })
          }
        
        
        }else if(couponDiscount&& !walletAmount){

          const price = (req.session.grandTotal - couponDiscount).toFixed(2)
          if(price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutFromCart/${userId}`);
          }
          const cartProducts = await cartModel.findOne({ userId: userId });
        // console.log(cartProducts);
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        console.log(productDetails);
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(deliveryAddress._id),
          orderStatus: "confirmed",
          productsDetails: productDetails,
          paymentDetails : paymentDetails ,
          grandTotal: Number(price),
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false,
          // walletMoney : Number(walletAmount)
          couponDiscount : Number(couponDiscount)
        });


        // await walletModel.updateOne({userId : userId},
        //   {$inc :{balance : -Number(walletAmount)},
        //     $push : {
        //       transactionDetails : {
        //         paymentType : "debited",
        //         date : new Date(),
        //         amount : Number(walletAmount)
        //       }
        //     }
        //   });

        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        for (const item of productDetails) {
          console.log(item.quantity);
          await productModel.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: -Number(item.quantity),
                salesCount: Number(item.quantity)
              },
            }
          );
        }

        for(const item of productDetails){
          const currentProduct =  await productModel.findOne({_id : item.productId});
          await categoryModel.updateOne({
           _id :  currentProduct.category
          },{
           $inc :{salesCount : Number(item.quantity)}
          })
         }


        }else if(walletAmount && !couponDiscount){
          const price = req.session.grandTotal - walletAmount ;
          if(price > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutFromCart/${userId}`);
          }
          const cartProducts = await cartModel.findOne({ userId: userId });
        // console.log(cartProducts);
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        console.log(productDetails);
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(deliveryAddress._id),
          orderStatus: "confirmed",
          productsDetails: productDetails,
          paymentDetails : paymentDetails ,
          grandTotal: Number(price),
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false,
          walletMoney : Number(walletAmount)
        });


        await walletModel.updateOne({userId : userId},
          {$inc :{balance : -Number(walletAmount)},
            $push : {
              transactionDetails : {
                paymentType : "debited",
                date : new Date(),
                amount : Number(walletAmount)
              }
            }
          });

        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        for (const item of productDetails) {
          console.log(item.quantity);
          await productModel.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: -Number(item.quantity),
                salesCount: Number(item.quantity)
              },
            }
          );
        }

        for(const item of productDetails){
          const currentProduct =  await productModel.findOne({_id : item.productId});
          await categoryModel.updateOne({
           _id :  currentProduct.category
          },{
           $inc :{salesCount : Number(item.quantity)}
          })
         }

        }else{
          if(req.session.grandTotal > 1000){
            req.session.warning = '! Cannot Use Cash on Delivery for the Orders Above 1000rs';
            return res.redirect(`/checkoutFromCart/${userId}`);
          }
          const cartProducts = await cartModel.findOne({ userId: userId });
        // console.log(cartProducts);
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        console.log(productDetails);
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(deliveryAddress._id),
          orderStatus: "confirmed",
          productsDetails: productDetails,
          paymentDetails : paymentDetails ,
          grandTotal: req.session.grandTotal,
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false
        });

        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        for (const item of productDetails) {
            console.log(item.quantity);
            await productModel.updateOne(
              { _id: item.productId },
              {
                $inc: {
                  quantity: -Number(item.quantity),
                  salesCount: Number(item.quantity)
                },
              }
            );
          }

          for(const item of productDetails){
            const currentProduct =  await productModel.findOne({_id : item.productId});
            await categoryModel.updateOne({
             _id :  currentProduct.category
            },{
             $inc :{salesCount : Number(item.quantity)}
            })
           }

        }
        
      }

      res.redirect(`/confirmOrder/${result.insertedId}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getOrderDetailpage: async (req, res ,next) => {
    try {
      const token = req.cookies.UserToken;
      const {user,cartCount,wishlistCount} = await userValidation(token);

      const orderId = new ObjectId (req.params.id);
      const orderDetails = await orderModel.aggregate ([{
        $match : {
          _id : orderId
        }
      },{$unwind : "$productsDetails"},
      {$lookup:{
        from : "products",
        localField : "productsDetails.productId",
        foreignField : "_id",
        as : "productInfo"
      }},{$unwind : "$productInfo"},
      {$lookup:{
        from : "addresses",
        localField : "deliveryAddress",
        foreignField : "_id",
        as : "address",

      }},{$unwind : "$address"},


    ]);
      res.render("users/orderDetailsPage", {
        title: "Order Details",
        user,
        order : orderDetails,
        cartCount,
        wishlistCount
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  filterCategory: async (req, res,next) => {
    try {
      const criteria = req.body.categoryValue;
      let priceSort = req.body.priceSortvalue === "low to high" ? 1 : -1;
      const colors = req.body.colorValues;
      let products;
      if (priceSort) {
        products = await productModel
          .find({ isDeleted: false })
          .sort({ productPrice: priceSort });
      }
      if (criteria.length !== 0) {
        products = await productModel.find({
          category: { $in: criteria },
          isDeleted: false,
        });
      }
      if (criteria.length > 0 && priceSort) {
        products = await productModel
          .find({ category: { $in: criteria }, isDeleted: false })
          .sort({ productPrice: priceSort });
      }

      if(colors.length > 0){
        products = await productModel.find({color : {$in: colors}});
      }
      
      if(criteria.length > 0 && priceSort && colors.length > 0){
        products = await productModel.find({color : {$in: colors},category: { $in: criteria }}).sort({ productPrice: priceSort });
      }


      if(colors.length > 0 && priceSort){
        products = await productModel.find({color : {$in: colors}}).sort({ productPrice: priceSort });

      }

      if(colors.length > 0 && criteria.length > 0){
        products = await productModel.find({color : {$in: colors},category: { $in: criteria }});

      }
        res.json({
          result: products,
        });
     
    
    } catch (error) {
      console.log(error);
      next(error)
    }
  },

getOrderConfirmationPage :async(req,res,next)=>{
  try{
    const token = req.cookies.UserToken;
    const {user,cartCount,wishlistCount} = await userValidation(token);

      const orderId = req.params.id ; 
      const orderDetails = await orderModel.aggregate([{$match :{ _id : new ObjectId(orderId)}},
        {$unwind : "$productsDetails"},
        {$lookup:{
          from : "products",
          localField : "productsDetails.productId",
          foreignField : "_id",
          as : "productInfo"
        }},{$unwind : "$productInfo"},
        {$lookup:{
          from : "addresses",
          localField : "deliveryAddress",
          foreignField : "_id",
          as : "address",

        }},{$unwind : "$address"},

      ]);
    res.render('users/productConfirmPage',
    {
      title : 'Confirm Order',
      user : user,
      order : orderDetails ? orderDetails : false ,
      cartCount,
      wishlistCount
    }
    
    )
  }catch(error){
    console.log(error);
    next(error)
  }

},
getUserMyOrders :async(req,res,next)=>{
  try{
    const token = req.cookies.UserToken;
    const {user,cartCount,wishlistCount} = await userValidation(token);

      

      const orders = await orderModel.find({userId : user._id});
      

      res.render('users/userMyOrders',{
        title : 'Orders',
        orders,
        user,
        cartCount,
        wishlistCount
      })


  }catch(error){
    console.log(error);
    next(error)
  }

},

orderCancelationRequest : async(req,res,next)=>{
  try{
    const orderId = req.params.id ; 
    const reason = req.body.reason ;
    await orderModel.updateOne({_id : orderId},{ $set : 
      { cancelRequested : true , cancellationReason : reason,orderStatus : "pending"}});
      
        res.json('success')
      

  }catch(error){
    console.log(error);
    next(error)
  }

},

getWishlistPage : async(req,res,next)=>{
try{
  const token = req.cookies.UserToken;
  const {user,cartCount,wishlistCount} = await userValidation(token);
  const userId = new ObjectId(user._id)
  const wishProducts = await wishlistModel.aggregate([{$match :{
    userId : userId
  }},
  {
    $unwind : "$productDetails"
  },
  {$lookup :{
    from : "products",
    localField : "productDetails.productId",
    foreignField : "_id",
    as : "productInfo"
  }},{
    $unwind : "$productInfo"
  }
])





  res.render('users/userwishlist',{
    title : 'Wishlist',
    user,
    wishlist : wishProducts,
    wishlistCount,
    cartCount
  })
}catch(error){
  console.log(error);
  next(error)
}
},

addToWishlist: async (req, res,next) => {
  try {
    const productId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.body.userId);

    const exists = await wishlistModel.findOne({ userId: userId });

    if (exists) {
      let isProductAlreadyAdded = false;
     exists.productDetails.forEach((product)=>{
        if (product.productId.equals(productId)) {
         return isProductAlreadyAdded = true; 
        }
      });

      if (isProductAlreadyAdded) {
        return res.json('error');
      } else {
        exists.productDetails.push({
          productId: productId
        });
        await exists.save();
        return res.json('success');
      }
    } else {
        await wishlistModel.create({
        userId: userId,
        productDetails: [{ productId: productId }]
      });
      return res.json('success');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
},

removeFromWishlist : async(req,res,next)=>{
  try{
    const productId = new ObjectId(req.params.id);
    
    const userId = new ObjectId(req.body.userId);
    const wishlist = await wishlistModel.findOne({userId : userId});
    
   
    const index = wishlist.productDetails.findIndex((product)=>{
      return product.productId.equals(new ObjectId(productId))
    })


    
    wishlist.productDetails.splice(index,1);
    await wishlist.save();
    
    res.json('success');

  }catch(error){
    console.log(error);
    next(error)
  }

},

createOrderRzp : async(req,res,next)=>{
  try{
    const totalAmount = Number(req.body.totalAmount);
    // console.log(totalAmount);
    const instance = new Razorpay({
      key_id : process.env.RAZORPAY_KEY_ID,
      key_secret : process.env.RAZORPAY_SECRET_KEY
    });
    const options = {
      amount : totalAmount * 100,
      currency : "INR",
      receipt : crypto.randomBytes(10).toString("hex")
    }

    instance.orders.create(options,(error,order)=>{
      if(error){
        console.log(error);
        return res.status(500).json({message : "something went wrong"})
      }
      res.json({data : order, rzpId: instance.key_id});
    })
  }catch(error){
    console.log(error);
    next(error)
  }

},

razorpayVerifyPaymentAndUpdateOrder : async(req,res,next)=>{
  try{
    let result ;
    const userId = req.params.id

    const address = await addressModel.findOne({userId : userId,isPrimary : true})
    const {
      productId,
      productSize,
      productPrice,
      rzpOrderId ,
      rzpPaymentId,
      rzpSignature,
      walletAmount,
      couponDiscount
    } = req.body;


      //payment success
      const sign = rzpOrderId + "|" + rzpPaymentId;
      const expectedSign = crypto.createHmac("sha256",process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString()).digest("hex");

      if(rzpSignature === expectedSign){
        if(productId || productSize || productPrice){
        const product = await productModel.findOne({_id : productId});

          //as single product
          if(couponDiscount && !walletAmount){
            let price = (productPrice - couponDiscount).toFixed(2);
            result =  await orderModel.collection.insertOne({
              userId: new ObjectId(userId),
              orderId : v4(),
              deliveryAddress: new ObjectId(address._id),
              orderStatus: "confirmed",
              productsDetails: [
                {
                  productId: new ObjectId(productId),
                  quantity: 1,
                  size: productSize,
                },
              ],
              totalQuantity : 1 ,
              paymentDetails :  {
                method : "razorpay",
                paymentId : rzpPaymentId,
                orderId : rzpOrderId
  
              },
              grandTotal: Number(price),
              cancellationReason: null,
              orderedAt: new Date(),
              updatedAt: new Date(),
              isCanceled : false,
              cancelRequested : false,
              couponDiscount : Number(couponDiscount)
            });
            await productModel.updateOne({_id : productId}, {
              $inc: {
                quantity: -1,
                salesCount: 1
              }
            });
            await categoryModel.updateOne({
              _id : product.category
            },{$inc : {salesCount : 1 }});
  
            
            return res.status(200).json({message : result.insertedId});

          }else if(couponDiscount && walletAmount){
            
            const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
            let price = (productPrice - subamount).toFixed(2)
            result =  await orderModel.collection.insertOne({
              userId: new ObjectId(userId),
              orderId : v4(),
              deliveryAddress: new ObjectId(address._id),
              orderStatus: "confirmed",
              productsDetails: [
                {
                  productId: new ObjectId(productId),
                  quantity: 1,
                  size: productSize,
                },
              ],
              totalQuantity : 1 ,
              paymentDetails :  {
                method : "razorpay",
                paymentId : rzpPaymentId,
                orderId : rzpOrderId
  
              },
              grandTotal: Number(price),
              cancellationReason: null,
              orderedAt: new Date(),
              updatedAt: new Date(),
              isCanceled : false,
              cancelRequested : false,
              walletMoney : Number(walletAmount),
              couponDiscount : Number(couponDiscount)
            });
            await productModel.updateOne({_id : productId}, {
              $inc: {
                quantity: -1,
                salesCount: 1
              }
            });
            await categoryModel.updateOne({
              _id : product.category
            },{$inc : {salesCount : 1 }});
  
            
            await walletModel.updateOne({userId : userId},{$inc :{balance : - Number(walletAmount)},
            $push :{
              transactionDetails : {
                paymentType : "debited",
                date : new Date(),
                amount : Number(walletAmount)
              }
            }
          })
            return res.status(200).json({message : result.insertedId});

          }else if(walletAmount && !couponDiscount){
            //subtract wallet amount from total amount
            let price = productPrice - walletAmount

            result =  await orderModel.collection.insertOne({
              userId: new ObjectId(userId),
              orderId : v4(),
              deliveryAddress: new ObjectId(address._id),
              orderStatus: "confirmed",
              productsDetails: [
                {
                  productId: new ObjectId(productId),
                  quantity: 1,
                  size: productSize,
                },
              ],
              totalQuantity : 1 ,
              paymentDetails :  {
                method : "razorpay",
                paymentId : rzpPaymentId,
                orderId : rzpOrderId
  
              },
              grandTotal: Number(price),
              cancellationReason: null,
              orderedAt: new Date(),
              updatedAt: new Date(),
              isCanceled : false,
              cancelRequested : false,
              walletMoney : Number(walletAmount)
            });
            await productModel.updateOne({_id : productId}, {
              $inc: {
                quantity: -1,
                salesCount: 1
              }
            });
            await categoryModel.updateOne({
              _id : product.category
            },{$inc : {salesCount : 1 }});
  
            // console.log('updated');
            await walletModel.updateOne({userId : userId},{$inc :{balance : - Number(walletAmount)},
            $push :{
              transactionDetails : {
                paymentType : "debited",
                date : new Date(),
                amount : Number(walletAmount)
              }
            }
          })
            return res.status(200).json({message : result.insertedId});

          }else{
            result =  await orderModel.collection.insertOne({
              userId: new ObjectId(userId),
              orderId : v4(),
              deliveryAddress: new ObjectId(address._id),
              orderStatus: "confirmed",
              productsDetails: [
                {
                  productId: new ObjectId(productId),
                  quantity: 1,
                  size: productSize,
                },
              ],
              totalQuantity : 1 ,
              paymentDetails :  {
                method : "razorpay",
                paymentId : rzpPaymentId,
                orderId : rzpOrderId
  
              },
              grandTotal: Number(productPrice),
              cancellationReason: null,
              orderedAt: new Date(),
              updatedAt: new Date(),
              isCanceled : false,
              cancelRequested : false
            });
            await productModel.updateOne({_id : productId}, {
              $inc: {
                quantity: -1,
                salesCount: 1
              }
            });
            await categoryModel.updateOne({
              _id : product.category
            },{$inc : {salesCount : 1 }});
  
            // console.log('updated');
            return res.status(200).json({message : result.insertedId});
          }
        }else{
          //from cart with walletamount and  couponAmound
          if(couponDiscount && walletAmount){  
            const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
            let price = (req.session.grandTotal - subamount).toFixed(2);
            console.log(price);
            const cartProducts = await cartModel.findOne({ userId: userId });
          
          const productDetails = cartProducts.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            size: product.size,
          }));
  
          const totalProducts = cartProducts.products.reduce((total,current)=>{
            return total = total + current.quantity;
          },0)
  
          
            result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "confirmed",
            productsDetails: productDetails,
            paymentDetails : {
              method : "razorpay",
              paymentId : rzpPaymentId,
              orderId : rzpOrderId
            },
            grandTotal: Number(price),
            totalQuantity : totalProducts,
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount),
            couponDiscount : Number(couponDiscount)
          });

          //subtract the amount from wallet and add the details
          await  walletModel.updateOne({userId : userId},{$inc:{
            balance : - Number(walletAmount)},
            $push : {
              transactionDetails :{
                paymentType : "debited",
                date : new Date(),
                amount : Number(walletAmount)
              }
            }
          })
          //clear products from cart
          await cartModel.updateOne(
            { userId: userId },
            {
              $set: {
                products: [],
              },
            }
          );

          //updating or decrementing the product quantity
          for (const item of productDetails) {
            console.log(item.quantity);
            await productModel.updateOne(
              { _id: item.productId },
              {
                $inc: {
                  quantity: -Number(item.quantity),
                  salesCount : Number(item.quantity)
                },
              }
            );
          }

          for(const item of productDetails){
            const currentProduct =  await productModel.findOne({_id : item.productId});
            await categoryModel.updateOne({
             _id :  currentProduct.category
            },{
             $inc :{salesCount : Number(item.quantity)}
            })
           }

          return res.status(200).json({message : result.insertedId});
          }else if(!walletAmount && couponDiscount){
            let price = (req.session.grandTotal - couponDiscount).toFixed(2);
            
            const cartProducts = await cartModel.findOne({ userId: userId });
          
          const productDetails = cartProducts.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            size: product.size,
          }));
  
          const totalProducts = cartProducts.products.reduce((total,current)=>{
            return total = total + current.quantity;
          },0)
  
          
            result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "confirmed",
            productsDetails: productDetails,
            paymentDetails : {
              method : "razorpay",
              paymentId : rzpPaymentId,
              orderId : rzpOrderId
            },
            grandTotal: Number(price),
            totalQuantity : totalProducts,
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            couponDiscount : Number(couponDiscount)
          });

         
          await cartModel.updateOne(
            { userId: userId },
            {
              $set: {
                products: [],
              },
            }
          );

          
          for (const item of productDetails) {
            console.log(item.quantity);
            await productModel.updateOne(
              { _id: item.productId },
              {
                $inc: {
                  quantity: -Number(item.quantity),
                  salesCount : Number(item.quantity)
                },
              }
            );
          }

          for(const item of productDetails){
            const currentProduct =  await productModel.findOne({_id : item.productId});
            await categoryModel.updateOne({
             _id :  currentProduct.category
            },{
             $inc :{salesCount : Number(item.quantity)}
            })
           }

          return res.status(200).json({message : result.insertedId});

          }else if(walletAmount && !couponDiscount){
            const price = req.session.grandTotal - walletAmount;
            const cartProducts = await cartModel.findOne({ userId: userId });
          
          const productDetails = cartProducts.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            size: product.size,
          }));
  
          const totalProducts = cartProducts.products.reduce((total,current)=>{
            return total = total + current.quantity;
          },0)
  
          
            result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "confirmed",
            productsDetails: productDetails,
            paymentDetails : {
              method : "razorpay",
              paymentId : rzpPaymentId,
              orderId : rzpOrderId
            },
            grandTotal: Number(price),
            totalQuantity : totalProducts,
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount)
          });

          //subtract the amount from wallet and add the details
          await  walletModel.updateOne({userId : userId},{$inc:{
            balance : - Number(walletAmount)},
            $push : {
              transactionDetails :{
                paymentType : "debited",
                date : new Date(),
                amount : Number(walletAmount)
              }
            }
          })
          //clear products from cart
          await cartModel.updateOne(
            { userId: userId },
            {
              $set: {
                products: [],
              },
            }
          );

          //updating or decrementing the product quantity
          for (const item of productDetails) {
            console.log(item.quantity);
            await productModel.updateOne(
              { _id: item.productId },
              {
                $inc: {
                  quantity: -Number(item.quantity),
                  salesCount : Number(item.quantity)
                },
              }
            );
          }

          for(const item of productDetails){
            const currentProduct =  await productModel.findOne({_id : item.productId});
            await categoryModel.updateOne({
             _id :  currentProduct.category
            },{
             $inc :{salesCount : Number(item.quantity)}
            })
           }

          return res.status(200).json({message : result.insertedId});
          }else{
            //if no wallet amount

            const cartProducts = await cartModel.findOne({ userId: userId });
          // console.log(cartProducts);
          const productDetails = cartProducts.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            size: product.size,
          }));
  
          const totalProducts = cartProducts.products.reduce((total,current)=>{
            return total = total + current.quantity;
          },0)
  
          console.log(productDetails);
            result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "confirmed",
            productsDetails: productDetails,
            paymentDetails : {
              method : "razorpay",
              paymentId : rzpPaymentId,
              orderId : rzpOrderId
            },
            grandTotal: req.session.grandTotal,
            totalQuantity : totalProducts,
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false
          });

          //clear products from cart
          await cartModel.updateOne(
            { userId: userId },
            {
              $set: {
                products: [],
              },
            }
          );

          //updating or decrementing the product quantity
          for (const item of productDetails) {
            console.log(item.quantity);
            await productModel.updateOne(
              { _id: item.productId },
              {
                $inc: {
                  quantity: -Number(item.quantity),
                  salesCount : Number(item.quantity)
                },
              }
            );
          }

          for(const item of productDetails){
            const currentProduct =  await productModel.findOne({_id : item.productId});
            await categoryModel.updateOne({
             _id :  currentProduct.category
            },{
             $inc :{salesCount : Number(item.quantity)}
            })
           }

          return res.status(200).json({message : result.insertedId});
          }
        
        }
      }else{
        
        return res.status(400).json({message : "invalid signature sent!"});
      }
    
  }catch(error){
    console.log(error);
    next(error);

  }

},


getUserWallet :async(req,res,next)=>{
  try{
    const token = req.cookies.UserToken;
    const {user,cartCount,wishlistCount} = await userValidation(token);
    const userId = req.params.id ;
    const wallet = await walletModel.findOne({userId : userId});

if (wallet && wallet.transactionDetails && wallet.transactionDetails.length > 0) {
  wallet.transactionDetails.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
  });
}



    res.render('users/userWallet',{
      title : 'User Wallet',
      wallet : wallet ? wallet : false,
      user,
      cartCount,
      wishlistCount
    })
  }catch(error){
    console.log(error);
    next(error);
  }
},

addMoneyToWallet : async(req,res,next)=>{
  try{
    const userId = req.params.id ;
    const amount = req.body.amount;
    await walletModel.updateOne({ userId : userId},{
      $inc:{
        balance : Number(amount)
      },
      $push :{
        transactionDetails :{
              paymentType : "credited",
              date : new Date(),
              amount : Number(amount)
        }
      }
    },{upsert : true});

    const wallet = await walletModel.findOne({userId : userId});

    res.json(wallet.balance);
    // console.log('finished');
  }catch(error){
    console.log(error);
    next(error);
  }
},

applyCoupon: async (req, res,next) => {
  try {
    const { code, product: pId, walletAmount } = req.body;
    const userId = req.params.id;
    const couponCode = code.toLowerCase();
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const coupon = await couponModel.findOne({
      code: couponCode,
      isDeleted: false,
      expiresAt: { $gt: currentDate }
    });

    if (!coupon) {
      return res.json('errorCode');
    }

    let totalDiscount = 0;

    if (pId) {
      const product = await productModel.findOne({ _id: pId });

      if (!product) {
        return res.json('productError');
      }

      if (!coupon.eligibleCategory.some(item => item.equals(product.category))) {
        return res.json('productError');
      }

      const percentage = Number(coupon.value);
      const discountPrice = (Number(product.productPrice) * (percentage / 100)).toFixed(2);
      totalDiscount = Number(discountPrice);
      product.productPrice -= totalDiscount;

      return res.json({
        product,
        totalDiscount
      });
    } else {
      const cart = await cartModel.aggregate([
        {
          $match: { userId: new ObjectId(userId) }
        },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        {
          $unwind: "$productInfo"
        }
      ]);

      const percent = Number(coupon.value);
      let maxDiscount = 0;

      cart.forEach((cartItem) => {
        coupon.eligibleCategory.forEach((item) => {
          if (item.equals(cartItem.productInfo.category)) {
            const discount = (Number(cartItem.productInfo.productPrice) * (percent / 100)).toFixed(2);
            if (Number(discount) > maxDiscount) {
              maxDiscount = Number(discount);
            }
          }
        });
      });

      totalDiscount = maxDiscount;

      return res.json({
        totalDiscount
      });
    }

  } catch (error) {
    console.error(error);
    next(error);
  }
},

getOfferPage : async(req,res,next)=>{
  try{
    const token = req.cookies.UserToken;
    const {user,cartCount,wishlistCount} = await userValidation(token);

    const currentDate = new Date()

    const offers = await offerModel.aggregate([
      {
        $match: {
          isDeleted: false,
          expiryDate: { $gt: currentDate }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "categories",
          foreignField: "category",
          as: "productInfo"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: "$categoryInfo"
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "productInfo.isDeleted": false
        }
      },
      {
        $group: {
          _id: "$_id",
          offerName: { $first: "$offerName" },
          offerValue: { $first: "$offerValue" },
          categories: { $addToSet: "$categories" },
          expiryDate: { $first: "$expiryDate" },
          isDeleted: { $first: "$isDeleted" },
          status: { $first: "$status" },
          productInfo: { $push: "$productInfo" },
          categoryInfo: { $first: "$categoryInfo" }
        }
      }
    ]);
    
    
   

  res.render('users/offerPage',{
    title : 'Offers',
    user,
    offers,
    cartCount,
    wishlistCount
  })
  }catch(error){
    console.log(error);
    next(error)
  }

},


createOrderInPaymentFailure : async(req,res,next)=>{
  try{
    let result ;
    const userId = req.params.id;
    const address = await addressModel.findOne({userId : userId,isPrimary : true});
    const {
      productId,
      productSize,
      productPrice,
      walletAmount,
      couponDiscount
    } = req.body;


    
      //from buy now
      if(productId || productSize || productPrice){
        const product = await productModel.findOne({_id : productId});
        //as single product
        if(couponDiscount && !walletAmount){
          let price = (productPrice - couponDiscount).toFixed(2);
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "pending",
            productsDetails: [
              {
                productId: new ObjectId(productId),
                quantity: 1,
                size: productSize,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails :  {
              method : "razorpay",
              paymentId : "Payment Pending",
              orderId : "Payment Pending"

            },
            grandTotal: Number(price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            couponDiscount : Number(couponDiscount)
          });
          await productModel.updateOne({_id : productId}, {
            $inc: {
              quantity: -1,
              salesCount: 1
            }
          });
          
          await categoryModel.updateOne({
            _id : product.category
          },{$inc : {salesCount : 1 }});

          return res.status(200).json({message : result.insertedId});

        }else if(couponDiscount && walletAmount){
            
          const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
          let price = (productPrice - subamount).toFixed(2)
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "pending",
            productsDetails: [
              {
                productId: new ObjectId(productId),
                quantity: 1,
                size: productSize,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails :  {
              method : "razorpay",
              paymentId : "Payment Pending",
              orderId : "Payment Pending"

            },
            grandTotal: Number(price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount),
            couponDiscount : Number(couponDiscount)
          });
          await productModel.updateOne({_id : productId}, {
            $inc: {
              quantity: -1,
              salesCount: 1
            }
          });
          
          await walletModel.updateOne({userId : userId},{$inc :{balance : - Number(walletAmount)},
          $push :{
            transactionDetails : {
              paymentType : "debited",
              date : new Date(),
              amount : Number(walletAmount)
            }
          }
        });
        await categoryModel.updateOne({
          _id : product.category
        },{$inc : {salesCount : 1 }});

        return res.status(200).json({message : result.insertedId});

        }else if(walletAmount && !couponDiscount){
          //subtract wallet amount from total amount
          let price = productPrice - walletAmount

          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "pending",
            productsDetails: [
              {
                productId: new ObjectId(productId),
                quantity: 1,
                size: productSize,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails :  {
              method : "razorpay",
              paymentId : "Payment Pending",
              orderId : "Payment Pending"

            },
            grandTotal: Number(price),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false,
            walletMoney : Number(walletAmount)
          });
          await productModel.updateOne({_id : productId}, {
            $inc: {
              quantity: -1,
              salesCount: 1
            }
          });
          
          await walletModel.updateOne({userId : userId},{$inc :{balance : - Number(walletAmount)},
          $push :{
            transactionDetails : {
              paymentType : "debited",
              date : new Date(),
              amount : Number(walletAmount)
            }
          }
        });

        await categoryModel.updateOne({
          _id : product.category
        },{$inc : {salesCount : 1 }});

          return res.status(200).json({message : result.insertedId});
        }else{
          result =  await orderModel.collection.insertOne({
            userId: new ObjectId(userId),
            orderId : v4(),
            deliveryAddress: new ObjectId(address._id),
            orderStatus: "pending",
            productsDetails: [
              {
                productId: new ObjectId(productId),
                quantity: 1,
                size: productSize,
              },
            ],
            totalQuantity : 1 ,
            paymentDetails :  {
              method : "razorpay",
              paymentId : "Payment Pending",
              orderId : "Payment Pending"

            },
            grandTotal: Number(productPrice),
            cancellationReason: null,
            orderedAt: new Date(),
            updatedAt: new Date(),
            isCanceled : false,
            cancelRequested : false
          });
          await productModel.updateOne({_id : productId}, {
            $inc: {
              quantity: -1,
              salesCount: 1
            }
          });
          
          await categoryModel.updateOne({
            _id : product.category
          },{$inc : {salesCount : 1 }});

        return res.status(200).json({message : result.insertedId});
        }
      }else{
        //from cart
        if(couponDiscount && walletAmount){
          const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
          let price = (req.session.grandTotal - subamount).toFixed(2);
          console.log(price);
          const cartProducts = await cartModel.findOne({ userId: userId });
        
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(address._id),
          orderStatus: "pending",
          productsDetails: productDetails,
          paymentDetails : {
            method : "razorpay",
            paymentId : "payment pending",
            orderId : "payment pending"
          },
          grandTotal: Number(price),
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false,
          walletMoney : Number(walletAmount),
          couponDiscount : Number(couponDiscount)
        });

        //subtract the amount from wallet and add the details
        await  walletModel.updateOne({userId : userId},{$inc:{
          balance : - Number(walletAmount)},
          $push : {
            transactionDetails :{
              paymentType : "debited",
              date : new Date(),
              amount : Number(walletAmount)
            }
          }
        })
        //clear products from cart
        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        //updating or decrementing the product quantity
        for (const item of productDetails) {
          console.log(item.quantity);
          await productModel.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: -Number(item.quantity),
                salesCount : Number(item.quantity)
              },
            }
          );
        }
        
        for(const item of productDetails){
          const currentProduct =  await productModel.findOne({_id : item.productId});
          await categoryModel.updateOne({
           _id :  currentProduct.category
          },{
           $inc :{salesCount : Number(item.quantity)}
          })
         };

        return res.status(200).json({message : result.insertedId});
        }else if(!walletAmount && couponDiscount){
          let price = (req.session.grandTotal - couponDiscount).toFixed(2);
          
          const cartProducts = await cartModel.findOne({ userId: userId });
        
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(address._id),
          orderStatus: "pending",
          productsDetails: productDetails,
          paymentDetails : {
            method : "razorpay",
            paymentId : "payment pending",
            orderId : "payment pending"
          },
          grandTotal: Number(price),
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false,
          couponDiscount : Number(couponDiscount)
        });
        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        //updating or decrementing the product quantity
        for (const item of productDetails) {
          
          await productModel.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: -Number(item.quantity),
                salesCount : Number(item.quantity)
              },
            }
          );
        }

        for(const item of productDetails){
          const currentProduct =  await productModel.findOne({_id : item.productId});
          await categoryModel.updateOne({
           _id :  currentProduct.category
          },{
           $inc :{salesCount : Number(item.quantity)}
          })
         }
        
        return res.status(200).json({message : result.insertedId});

        }else if(walletAmount && !couponDiscount){
          const price = req.session.grandTotal - walletAmount;
          const cartProducts = await cartModel.findOne({ userId: userId });
        
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(address._id),
          orderStatus: "pending",
          productsDetails: productDetails,
          paymentDetails : {
            method : "razorpay",
            paymentId : "payment pending",
            orderId : "payment pending"
          },
          grandTotal: Number(price),
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false,
          walletMoney : Number(walletAmount)
        });

        //subtract the amount from wallet and add the details
        await  walletModel.updateOne({userId : userId},{$inc:{
          balance : - Number(walletAmount)},
          $push : {
            transactionDetails :{
              paymentType : "debited",
              date : new Date(),
              amount : Number(walletAmount)
            }
          }
        })
        //clear products from cart
        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        //updating or decrementing the product quantity
        for (const item of productDetails) {
          console.log(item.quantity);
          await productModel.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: -Number(item.quantity),
                salesCount : Number(item.quantity)
              },
            }
          );
        }
        
        for(const item of productDetails){
          const currentProduct =  await productModel.findOne({_id : item.productId});
          await categoryModel.updateOne({
           _id :  currentProduct.category
          },{
           $inc :{salesCount : Number(item.quantity)}
          })
         }

        return res.status(200).json({message : result.insertedId});
        }else{
          //if no wallet amount

          const cartProducts = await cartModel.findOne({ userId: userId });
        // console.log(cartProducts);
        const productDetails = cartProducts.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          size: product.size,
        }));

        const totalProducts = cartProducts.products.reduce((total,current)=>{
          return total = total + current.quantity;
        },0)

        console.log(productDetails);
          result =  await orderModel.collection.insertOne({
          userId: new ObjectId(userId),
          orderId : v4(),
          deliveryAddress: new ObjectId(address._id),
          orderStatus: "pending",
          productsDetails: productDetails,
          paymentDetails : {
            method : "razorpay",
            paymentId : "payment pending",
            orderId : "payment pending"
          },
          grandTotal: req.session.grandTotal,
          totalQuantity : totalProducts,
          cancellationReason: null,
          orderedAt: new Date(),
          updatedAt: new Date(),
          isCanceled : false,
          cancelRequested : false
        });

        //clear products from cart
        await cartModel.updateOne(
          { userId: userId },
          {
            $set: {
              products: [],
            },
          }
        );

        //updating or decrementing the product quantity
        for (const item of productDetails) {
          console.log(item.quantity);
          await productModel.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: -Number(item.quantity),
                salesCount : Number(item.quantity)
              },
            }
          );
        }
        
        //updating the 
        for(const item of productDetails){
            const currentProduct =  await productModel.findOne({_id : item.productId});
            await categoryModel.updateOne({
             _id :  currentProduct.category
            },{
             $inc :{salesCount : Number(item.quantity)}
            })
           };

        return res.status(200).json({message : result.insertedId});
        }
      }
  }catch(error){
    console.log(error);
    next(error);
  }
},

updateOrderFromOrderDetailPage: async(req,res,next)=>{
  try{
    const orderId = req.params.id;
    const dataBody = req.body;
    const payment = {
      method : "razorpay",
      paymentId : dataBody.rzpPaymentId,
      orderId : dataBody.rzpOrderId
    }
    
    await orderModel.updateOne({_id : orderId},{$set :{
    grandTotal : Number(dataBody.amount),
    paymentDetails : payment,   
    orderStatus : "confirmed"
    }});


    res.json('success');

  }catch(error){
    console.log(error);
    next(error);
  }
},

downloadInvoiceAsPdf : async(req,res,next)=>{
  try {
    const orderId =new ObjectId(req.params.id) ;
    const order =  await orderModel.aggregate ([{
      $match : {
        _id : orderId
      }
    },{$unwind : "$productsDetails"},
    {$lookup:{
      from : "products",
      localField : "productsDetails.productId",
      foreignField : "_id",
      as : "productInfo"
    }},{$unwind : "$productInfo"},
    {$lookup:{
      from : "addresses",
      localField : "deliveryAddress",
      foreignField : "_id",
      as : "address",

    }},{$unwind : "$address"},


  ]);
    if (!order) {
        return res.status(404).send('Order not found');
    }

    // Create a new PDF document
    const doc = new PDF();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    doc.fontSize(16).text('Order Details', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Delivery Address:`, { underline: true });
    doc.text(`Name: ${order[0].address.firstname} ${order[0].address.lastname}`);
    doc.text(`Street Address: ${order[0].address.address}`);
    doc.text(`State,District: ${order[0].address.state},${order[0].address.district}`);
    doc.text(`City,Locality: ${order[0].address.city},${order[0].address.locality}`);
    doc.text(`PostalCode: ${order[0].address.postalcode}`);
    doc.text(`Phone: ${order[0].address.phone}`);
    doc.moveDown();

    doc.fontSize(12).text(`Product Details:`, { underline: true });
    order.forEach((item) => {
        doc.text(`Qty: ${item.productsDetails.quantity}`);
        doc.text(`Product Name: ${item.productInfo.productName}`);
        doc.text(`Size: ${item.productsDetails.size}`);
        doc.text(`Price: ₹${item.productInfo.productPrice * item.productsDetails.quantity}`);
        doc.moveDown();
    });

    doc.fontSize(12).text(`Payment Details:`, { underline: true });
    doc.text(`Payment Method: ${order[0].paymentDetails.method}`);
    doc.text(`Payment Id: ${order[0].paymentDetails.paymentId}`);
    doc.text(`Total Amount: ₹${order[0].grandTotal}`);

    if (order[0].walletMoney) {
        doc.text(`Payed From wallet: ₹${order[0].walletMoney}`);
    }
    if (order[0].couponDiscount) {
        doc.text(`Coupon Discount: ₹${order[0].couponDiscount}`);
    }

    doc.end();

} catch (error) {
    console.error(error);
    next(error);
}

},

cancelProductIndividually : async (req,res,next)=>{
  try{
    let {pId , pSize , orderId , productQuanity , productPrice , pNumber} = req.body;
    orderId = new ObjectId(orderId);
    pId = new ObjectId(pId);
    productPrice = Number(productPrice)
    const order = await orderModel.findOne({_id : orderId});
    const product = await productModel.findOne({_id : pId});
    const category = await categoryModel.findOne({_id : product.category});
  
    if(order.paymentDetails.method === 'razorpay'){
      if(order.walletMoney){
        if(order.walletMoney >= productPrice){
          await walletModel.updateOne({userId : order.userId},{
            $inc :{
              balance : productPrice
            },
            $push:{
              transactionDetails :{
                paymentType : 'credited',
                date : new Date(),
                amount : productPrice
              }
            }
          });
          const walletMoneyLeft = Number(order.walletMoney) - productPrice ;
          order.walletMoney = walletMoneyLeft.toFixed(2);

          const index =  order.productsDetails.findIndex((item)=>{
            return (item.size === pSize && item.productId.toString() === pId.toString());
          });

          order.productsDetails.splice(index,1);
          await order.save();
           
          product.quantity += 1;
          product.salesCount -= 1;
          await product.save();
          category.salesCount -=1
          await category.save();
        }else{
          await walletModel.updateOne({userId : order.userId},{
            $inc :{
              balance : productPrice
            },
            $push:{
              transactionDetails :{
                paymentType : 'credited',
                date : new Date(),
                amount : productPrice
              }
            }
          });
          const balance = productPrice - Number(order.walletMoney) ;
          order.grandTotal -= balance;
          order.walletMoney = 0;

          const index =  order.productsDetails.findIndex((item)=>{
            return (item.size === pSize && item.productId.toString() === pId.toString());
          });

          order.productsDetails.splice(index,1);
          await order.save();


          //updating prdouct quantity
          product.quantity += 1;
          product.salesCount -= 1
          await product.save();
          category.salesCount -=1
          await category.save();
        }
      }else{
          order.grandTotal -= productPrice;

          await walletModel.updateOne({userId : order.userId},{
            $inc :{
              balance : productPrice
            },
            $push:{
              transactionDetails :{
                paymentType : 'credited',
                date : new Date(),
                amount : productPrice
              }
            }
          });

          const index =  order.productsDetails.findIndex((item)=>{
            return (item.size === pSize && item.productId.toString() === pId.toString());
          });
          order.productsDetails.splice(index,1);
          await order.save();
          product.quantity += 1;
          product.salesCount -= 1
          await product.save();
          category.salesCount -=1
          await category.save();

      }
    }else{
      if(order.walletMoney){
        if(order.walletMoney >= productPrice){
          await walletModel.updateOne({userId : order.userId},{
            $inc :{
              balance : productPrice
            },
            $push:{
              transactionDetails :{
                paymentType : 'credited',
                date : new Date(),
                amount : productPrice
              }
            }
          });
          const walletMoneyLeft = Number(order.walletMoney) - productPrice ;
          order.walletMoney = walletMoneyLeft.toFixed(2);

          const index =  order.productsDetails.findIndex((item)=>{
            return (item.size === pSize && item.productId.toString() === pId.toString());
          });

          order.productsDetails.splice(index,1);
          await order.save();
           
          product.quantity += 1;
          product.salesCount -= 1
          await product.save();
          category.salesCount -=1
          await category.save();
        }else{
          await walletModel.updateOne({userId : order.userId},{
            $inc :{
              balance : Number(order.walletMoney)
            },
            $push:{
              transactionDetails :{
                paymentType : 'credited',
                date : new Date(),
                amount : Number(order.walletMoney)
              }
            }
          });
          const balance = productPrice - Number(order.walletMoney) ;
          order.grandTotal -= balance;
          order.walletMoney = 0;

          const index =  order.productsDetails.findIndex((item)=>{
            return (item.size === pSize && item.productId.toString() === pId.toString());
          });

          order.productsDetails.splice(index,1);
          await order.save();


          //updating prdouct quantity
          product.quantity += 1;
          product.salesCount -= 1
          await product.save();
          category.salesCount -=1
          await category.save();
        }
      }else{
        //if no payment from wallet
        order.grandTotal -= productPrice ;
        const index =  order.productsDetails.findIndex((item)=>{
          return (item.size === pSize && item.productId.toString() === pId.toString());
        });

        order.productsDetails.splice(index,1);
        await order.save(); 
        product.quantity += 1;
        product.salesCount -= 1
        await product.save();
        category.salesCount -=1
        await category.save();
      }
    }
    res.json('success');
  }catch(error){
    console.log(error);
    next(error);
  }
},


userLogout: (req, res,next) => {
  try {
    delete req.session.user;
    res.clearCookie("UserToken");
    res.redirect("/");
  } catch (error) {
    console.log(error);
    next(error);
  }
   
  },
};
