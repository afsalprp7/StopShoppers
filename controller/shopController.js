const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const cartModel = require('../models/cartModel');
const { ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const flash = require("connect-flash");
const orderModel = require('../models/orderModel');
module.exports = {


  getHomePage: async (req, res) => {
    try {
      const token = req.cookies.UserToken;
       
       let user ;
       if(token){
         const data = jwt.verify(token,"secretKeyUser");
         user = data.user
         
       }else{
         user = false
       }
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
        user : user,

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
    const token = req.cookies.UserToken;
      
       let user ;
       if(token){
         const data = jwt.verify(token,"secretKeyUser");
         user = data.user
         
       }else{
         user = false
       }
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
      user : user,
    });
  },

  getUserProfilePage: async (req, res) => {
    try {
      const token = req.cookies.UserToken;
      //  console.log(token);
       let user ;
       if(token){
         const data = jwt.verify(token,"secretKeyUser");
         user = data.user
        //  console.log(user);
       }else{
         user = false
       }
      const Id = req.params.id;
      const userId = new mongoose.Types.ObjectId(Id);
      console.log(userId);
      const userDetails = await userModel.findOne({ _id: userId });
       const userAddress = await addressModel.find({userId : Id})
       console.log(userAddress);
      res.render("users/userProfile", {
        title: "User Profile",
        userInfo: userDetails,
        user : user,
        userAddress: userAddress,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getAddAddressPage: (req, res) => {
    
    const token = req.cookies.UserToken;
      //  console.log(token);
       let user ;
       if(token){
         const data = jwt.verify(token,"secretKeyUser");
         user = data.user
        //  console.log(user);
       }else{
         user = false
       }
       const id = req.params.id;
    res.render("users/addAddress", {
      title: "Add Address",
      user : user,
      userid: id,
    });
  },

  doAddAddress: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      const result = await addressModel.collection.insertOne({
        userId : new ObjectId(id),
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
      // await userModel.updateOne(
      //   { _id: id },
      //   { $addToSet: { address_id: result.insertedId } }
      // );
      res.redirect(`/userProfile/${id}`);
    } catch (error) {
      console.log(error);
    }
  },

  getEditAddress: async (req, res) => {
    try {
     
      const token = req.cookies.UserToken;
      // console.log(token);
      let user ;
      if(token){
        const data = jwt.verify(token,"secretKeyUser");
        user = data.user
        // console.log(user);
      }else{
        user = false
      }
      const id = req.params.id;
      const userid = req.query.userId;
      console.log(userid);
      const addressDetails = await addressModel.findOne({ _id: id });

      res.render("users/editAddress", {
        title: "Edit Address",
        addressDetails,
        userid,
        user : user,
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
      const primaryExists = await addressModel.findOne({ isPrimary: true });//
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
      const token = req.cookies.UserToken;
      // console.log(token);
      let user ;
      if(token){
        const data = jwt.verify(token,"secretKeyUser");
        user = data.user
        // console.log(user);
      }else{
        user = false
      }
      const userId = req.params.id;
      const userdet = await userModel.findOne({ _id: userId });
      res.render("users/editProfile", {
        title: "Edit Profile",
        user : user,
        userDetails: userdet,
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
        const result = await productModel.find({ $or:[
          {productName:{$regex : string, $options :'i'}},
          {description : {$regex : string,$options : 'i'}}
        ] });

        

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
      const token = req.cookies.UserToken;
      // console.log(token);
      let user ;
      if(token){
        const data = jwt.verify(token,"secretKeyUser");
        user = data.user
        // console.log(user);
      }else{
        user = false
      }
      const categories = await categoryModel.find({
        isDeleted : false   
       });
       console.log(categories);
      const products = await productModel.find({isDeleted : false});
      res.render('users/shopPage',{
        title : 'Shop',
        allProducts : products,
        user : user,
        category : categories
      })




    }catch(error){
      console.log(error);
    }

  },


getCartPage : async(req,res)=>{
  try{
    const token = req.cookies.UserToken;
    
    let user ;
    if(token){
      const data = jwt.verify(token,"secretKeyUser");
      user = data.user
    }else{
      user = false
    }
    const cart = await cartModel.find();
    const productDetails = await cartModel.aggregate([{$match:{userId : new ObjectId(user._id)}},{$unwind : "$products"},
    {$lookup:{
      from : "products",
      localField :"products.productId",
      foreignField : "_id",
      as: "productDetails"
    }},{$unwind: "$productDetails"},
  ]);


   // Calculate the total price for each product in the cart
  productDetails.forEach(cartItem => {
      const quantity = cartItem.products.quantity;
      const price = cartItem.productDetails.productPrice;
      console.log("Quantity:", quantity);
      console.log("Price:", price);
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
  console.log(grandTotal);
  
    
    // console.log(productDetails);
      res.render('users/cartPage',
      {
      title : 'Cart',
      user : user,
      carts : productDetails,
      grandTotal
    })
  }catch(error){
    console.log(error);
  }
},


AddToCart : async(req,res)=>{
    try{
      if(!req.cookies.UserToken){
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
      console.log(existingCart);
      if(existingCart){
        console.log('first');

          const pExists = await cartModel.findOne({
            "products.productId" : product._id,
            "products.color" : product.color,
            "products.size" : body.size
          })
          
          
         if(pExists){
          const pId = product._id
          const index = pExists.products.findIndex((product) => {
            return (
              product.productId.equals(new ObjectId(pId)) &&
              product.size === body.size
            );
          });
          console.log(index);
          console.log('quantity');
          await cartModel.updateOne({userId : userId},{
            $inc:{
              [`products.${index}.quantity`] : 1
            }
          });  
        }else{
          console.log('fourth');
          await cartModel.updateOne({userId : userId},{$push: {products : {
            productId : product._id,
            quantity : quantity,
            color : product.color,
            size : body.size
          }}})
        }
      }else{
        await cartModel.updateOne({userId : userId}, 
          {$push :{products :{  productId: product._id,color: product.color,quantity: quantity,size: body.size}}},{upsert : true})
      }
      res.redirect('/cartPage');
      }
      
    }catch(error){
      console.log(error);
    }

  },

  cartUpdateFetch : async(req,res)=>{
   

  try {
    const { productId, userId } = req.params;
    const { quantity, size } = req.body;
    console.log(req.body);
    // Find the cart item 
    let cartItem = await cartModel.findOne({ userId: userId, 'products.productId': productId });
    // console.log(cartItem);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    // Update the quantity of the product in the cart
    const productIndex = cartItem.products.findIndex((product) => {
      return(
        product.productId.equals(new ObjectId(productId)) &&
              product.size === size
      );
         });
      
      
    // console.log();
    console.log(productIndex);
    cartItem.products[productIndex].quantity = quantity;

    // Save the updated cart item it is an mongoose function.
    await cartItem.save();

   
  } catch (error) {
    console.error(error);
    
  }


  },

  removeFromCart : async (req,res)=>{
    try{
      req.session.productInfo = '';

      req.session.productDetails ='';
      req.session.grandTotal = '' ;

      const {productId,size} = req.body;
      const userId = req.params.id;
      console.log(userId);
      console.log(productId);
      console.log(size);
      const cartItem = await cartModel.findOne({userId : userId , "products.productId" : productId });
      console.log(cartItem);
      if(!cartItem){
        console.log('Cart Item Not Found');
      }

     const index =  cartItem.products.findIndex((product)=>{
        return(
          product.productId.equals(new ObjectId(productId)) &&
                product.size === size
        );
      })
console.log(index);
      cartItem.products.splice(index,1);
      cartItem.save();

    }catch(error){
      console.log(error);
    }

  },

  getCheckoutPage : async(req,res)=>{
    try{
      const token = req.cookies.UserToken;
      let user ;
      if(token){
        const data = jwt.verify(token,"secretKeyUser");
        user = data.user
      }else{
        user = false
      }
      // console.log(user._id);
      //function route starts
      
      
      // console.log(products);
      const addressPrimary = await addressModel.findOne({
      userId : user._id,
      isPrimary : true
     });
    

     console.log(req.flash('productDetails'));
     console.log(req.flash('grandTotal'));

      res.render('users/checkoutPage',{
        title : 'Checkout',
        user : user,
        addressPrimary,
        grandTotal : req.session.grandTotal ? req.session.grandTotal : false,
        cartProducts : req.session.productDetails ? req.session.productDetails : false,
        productInfo : req.session.productInfo ? req.session.productInfo : false

      });


    }catch(error){
      console.log(error);

    }

  },

  doAddAddressCheckout : async(req,res)=>{
    try{
      const data = req.body
      const id = req.params.id
      console.log(id);
       const result = await addressModel.collection.insertOne({
        userId : new ObjectId(id),
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
      
      const primaryExists = await addressModel.findOne({ userId : new ObjectId(id),isPrimary:true});
      console.log(primaryExists);
      if(primaryExists){
        await addressModel.updateOne({ _id : primaryExists._id},{$set :{isPrimary : false}});
        await addressModel.updateOne({ _id : result.insertedId },{$set :{isPrimary : true}});
        res.json('success');
      }else{
        await addressModel.updateOne({ _id : result.insertedId },{$set :{isPrimary : true}});
        res.json('success');
      }
      
    }catch(error){
      console.log(error);
    }

  },

  checkoutDirectFromDetailPage : async(req,res)=>{
    try{
      const productId = req.params.id 
      const size = req.query.size;
      
      const productInfo = await productModel.aggregate([
        { $match: { _id :new ObjectId(productId)  } },{$unwind : "$sizes"},{$match:{sizes : size}}
      ]);
      
      
      console.log(productInfo);
      
      req.session.productDetails = '';
     req.session.grandTotal = '';
      req.session.productInfo = productInfo
      res.redirect('/checkoutPage');
    }catch(error){
      console.log(error);
    }

  },

  checkoutFromCart : async(req,res)=>{
    try{
      const userId = req.params.id
      const productDetails = await cartModel.aggregate([{$match:{userId : new ObjectId(userId)}},{$unwind : "$products"},
      {$lookup:{
        from : "products",
        localField :"products.productId",
        foreignField : "_id",
        as: "productDetails"
      }},{$unwind: "$productDetails"},
    ]);
       // console.log(addressPrimary);
 
       productDetails.forEach(cartItem => {
         const quantity = cartItem.products.quantity;
         const price = cartItem.productDetails.productPrice;
         console.log("Quantity:", quantity);
         console.log("Price:", price);
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

    
     req.session.productInfo = '';

     req.session.productDetails = productDetails
     req.session.grandTotal = grandTotal
     res.redirect('/checkoutPage');
     


    }catch(error){
      console.log(error);
    }

  },


  doPlaceOrder : async(req,res)=>{
    try{
      const databody = req.body
      const userId = req.params.id;

      console.log(databody);
      const deliveryAddress = await addressModel.findOne({_id : userId,isPrimary : true});

      res.redirect('/orderDetails')
    }catch(error){
      console.log(error);
    }
  },

getOrderDetailpage : async(req,res)=>{
  try{
    const token = req.cookies.UserToken;
      let user ;
      if(token){
        const data = jwt.verify(token,"secretKeyUser");
        user = data.user
      }else{
        user = false
      }


      res.render('users/orderDetailsPage',{
        title : 'Order Details',
        user,

      })
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
