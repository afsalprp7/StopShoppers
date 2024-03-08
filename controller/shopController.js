const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const cartModel = require('../models/cartModel');
const { ObjectId } = require("mongodb");
module.exports = {

  getLandingPage :async (req,res) =>{
    try{
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
      res.render('users/userHome',{
      title : 'Home',
      user : req.session.user ? req.session.user : false,
      allProducts : products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      }

    });
    }catch(error){
      console.log(error);
    }

  },
  getHomePage: async (req, res) => {
    try {
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

      // Render the view with products and pagination data
      res.render("users/userHome", {
        allProducts: products,
        title: "Home",
        user : req.session.user ? req.session.user : false,

        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },

  getProductDetailpage: async (req, res) => {
    const id = req.params.id;
    const allProducts = await productModel.collection.find({
      _id: { $ne: id },
      category: "outer wear",
      isDeleted: false,
    });
    const productInfo = await productModel.findOne({ _id: id });

    res.render("users/productDetailPage", {
      title: "Product Detail",
      product: productInfo,
      allProducts: allProducts,
      user : req.session.user ? req.session.user : false,
    });
  },

  getUserProfilePage: async (req, res) => {
    try {
      const Id = req.params.id;
      const userId = new mongoose.Types.ObjectId(Id);
      console.log(userId);
      const userDetails = await userModel.findOne({ _id: userId });
      const userAddress = await userModel.aggregate([
        {
          $match: {
            _id: userId,
          },
        },

        {
          $lookup: {
            from: "addresses",
            localField: "address_id",
            foreignField: "_id",
            as: "userAddress",
          },
        },

        {
          $unwind: "$userAddress", //unwinding the created array.
        },
      ]);

      res.render("users/userProfile", {
        title: "User Profile",
        userInfo: userDetails,
        user : req.session.user ? req.session.user : false,
        userAddress: userAddress,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getAddAddressPage: (req, res) => {
    const id = req.params.id;
    res.render("users/addAddress", {
      title: "Add Address",
      user : req.session.user ? req.session.user : false,
      userid: id,
    });
  },

  doAddAddress: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      const result = await addressModel.collection.insertOne({
        firstname: data.firstname,
        lastname: data.lastname,
        address: data.address, //street/home address
        state: data.state,
        district: data.district,
        city: data.city,
        locality: data.locality,
        postalcode: data.postalCode,
        phone: data.phone,
      });
      console.log(result);
      await userModel.updateOne(
        { _id: id },
        { $addToSet: { address_id: result.insertedId } }
      );
      res.redirect(`/userProfile/${id}`);
    } catch (error) {
      console.log(error);
    }
  },

  getEditAddress: async (req, res) => {
    try {
      const id = req.params.id;
      const userid = req.query.userId;
      console.log(userid);
      const addressDetails = await addressModel.findOne({ _id: id });

      res.render("users/editAddress", {
        title: "Edit Address",
        addressDetails,
        userid,
        user : req.session.user ? req.session.user : false,
      });
    } catch (error) {
      console.log(error);
    }
  },

  doEditAddress: async (req, res) => {
    try {
      const userid = req.query.id;
      const id = req.params.id;
      const adrress = addressModel.findOne({ _id: id });
      const data = req.body; //coming data

      await addressModel.updateOne(
        { _id: id },
        {
          $set: {
            firstname: data.firstname !== "" ? data.firstname : undefined,
            lastname: data.lastname !== "" ? data.lastname : undefined,
            address: data.address !== "" ? data.address : undefined,
            state: data.state !== "" ? data.state : undefined,
            district: data.district !== "" ? data.district : undefined,
            city: data.city !== "" ? data.city : undefined,
            locality: data.locality !== "" ? data.locality : undefined,
            postalcode: data.postalCode !== "" ? data.postalCode : undefined,
            phone: data.phone !== "" ? data.phone : undefined,
          },
        }
      );
      res.redirect(`/userProfile/${userid}`);
    } catch (error) {
      console.log(error);
    }
  },

  doDeleteAddress: async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.query.userId;
      await addressModel.deleteOne({ _id: id });
      res.redirect(`/userProfile/${userId}`);
    } catch (error) {
      console.log(error);
    }
  },

  setAsPrimary: async (req, res) => {
    try {
      const id = req.params.id;
      const userid = req.query.userId;
      const primaryExists = await addressModel.findOne({ isPrimary: true });
      console.log(id);
      if (primaryExists) {
        console.log("exists");
        await addressModel.updateOne(
          { _id: primaryExists._id },
          { $set: { isPrimary: false } }
        );
        await addressModel.updateOne(
          { _id: id },
          { $set: { isPrimary: true } }
        );
      } else {
        await addressModel.updateOne(
          { _id: id },
          { $set: { isPrimary: true } }
        );
      }
      console.log("hi");
      res.redirect(`/userProfile/${userid}`);
    } catch (error) {
      console.log(error);
    }
  },

  getEditProfilePage: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userModel.findOne({ _id: userId });
      res.render("users/editProfile", {
        title: "Edit Profile",
        user : req.session.user ? req.session.user : false,
        userDetails: user,
      });
    } catch (error) {
      console.log(error);
    }
  },

  doPatchEditProfile: async (req, res) => {
    try {
      const id = req.params.id;
      const formData = req.body;
      console.log(formData);
      await userModel.updateOne(
        { _id: id },
        {
          $set: {
            firstname:
              formData.firstname !== "" ? formData.firstname : undefined,
            lastname: formData.lastname !== "" ? formData.lastname : undefined,
            email: formData.email !== "" ? formData.email : undefined,
            phone: formData.phone !== "" ? formData.phone : undefined,
          },
        }
      );
      res.redirect(`/userProfile/${id}`);
    } catch (error) {
      console.log(error);
    }
  },

  //search product
  searchProductHome: async (req, res) => {
    try {
      const string = req.body.string.toLowerCase();

      if (string !== "") {
        const result = await productModel.find({ productName: string });

        if (result.length !== 0) {
          res.json({
            result,
          });
        } else {
          res.json({
            result: "Nothing Found",
          });
        }
      } else {
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
        res.json({
          result: products,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },


  getShopPage : async(req,res)=>{
    try{
      const categories = await categoryModel.find({
        isDeleted : false   
       });
       console.log(categories);
      const products = await productModel.find({isDeleted : false});
      res.render('users/shopPage',{
        title : 'Shop',
        allProducts : products,
        user : req.session.user ? req.session.user : false,
        category : categories
      })




    }catch(error){
      console.log(error);
    }

  },


getCartPage : async(req,res)=>{
  try{
    const cart = await cartModel.find();
      res.render('users/cartPage',
      {
      title : 'Cart',
      user : req.session.user ? req.session.user : false,
      cart 
    })
  }catch(error){
    console.log(error);
  }
},


AddToCartpage : async(req,res)=>{
  
    try{
      if(!req.cookies.UserToken || !req.session.user){
        return res.redirect('/login')
      }else{
      let quantity = 1;
      //body
      const body = req.body;
      console.log(body);
      const productid = req.params.id
      const user = req.query.userId;
      const userId = new ObjectId(user);
      


      const product = await productModel.findOne({_id : productid});
      const existingCart = await cartModel.findOne({ userId: userId });
      if(existingCart){
       existingCart.products.forEach(async(obj)=>{
        if(obj.productId === productid){
          console.log(obj.productId,productid);

        }else{
          await cartModel.updateOne({_id : existingCart._id},{products : {$addToSet : {
            productId : productid ,
            quantity : quantity,
            color : product.color,
            size : body.size
          }}})
        }

       })

        
      }else{
        await cartModel.collection.insertOne({
          userId : userId,
          products : 
          {productId: product._id,color: product.color,quantity: quantity,size: body.size}
        })
      }
      res.redirect('/cartPage');
      }
      
    }catch(error){
      console.log(error);
    }

  },

  userLogout : (req,res)=>{
    delete req.session.user
    res.clearCookie("UserToken");
    res.redirect('/');
  }
};
