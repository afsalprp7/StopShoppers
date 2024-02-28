const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const usModel = require('../models/userModel');

module.exports = {

getHomePage : async(req,res)=>{
  try{
    const products = await productModel.find({ isDeleted : false});
    res.render('users/userHome',{allProducts : products , title : 'Home', user : req.session.user});
  }catch(error){
  console.log(error);
  }
},

getProductDetailpage : async(req,res)=>{
  const id = req.params.id ;
  const allProducts = await productModel.find({_id :{ $ne: id},category : "outer wear"});
  const productInfo = await productModel.findOne({_id : id});

  res.render('users/productDetailPage',{title : 'Product Detail' ,product : productInfo,allProducts : allProducts , user : req.session.user});
},

getUserProfilePage : async(req,res)=>{
  try{
    const userId = req.params.id;
    const userDetails = await userModel.findOne({_id : userId});
    res.render('users/userProfile',{title : 'User Profile',userInfo : userDetails,user : req.session.user});
  }catch(error){
    console.log(error);
  }
  




}

}