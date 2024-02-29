const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

const addressModel = require('../models/addressModel');
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
    res.render('users/userProfile',{title : 'User Profile', userInfo : userDetails,user : req.session.user});
  }catch(error){
    console.log(error);
  }
},

getAddAddressPage : (req,res)=>{
  const id = req.params.id
  res.render('users/addAddress',
  {
    title : 'Add Address',
    user : req.session.user,
    userid: id
});
},

doAddAddress : async(req,res)=>{
  try{
    const id = req.params.id;
    console.log(id);
    const data = req.body;
    const result = await addressModel.collection.insertOne({
      firstname : data.firstname,
      lastname : data.lastname,
      address : data.address, //street/home address
      state : data.state,
      district : data.district,
      city  : data.city,
      locality : data.locality,
      postalcode : data.postalCode,
      phone : data.phone
    });
    console.log(result);
    await userModel.updateOne({_id : id} , { $addToSet : {address_id : result.insertedId }});
    res.redirect(`/userProfile/${id}`);
  }catch(error){
    console.log(error);
  }

},

  getEditProfilePage : async(req,res)=>{
    try{
      const userId = req.params.id;
      const user = await userModel.findOne({_id : userId});
      res.render('users/editProfile',
      {
        title : 'Edit Profile',
        user : req.session.user,
        userDetails : user
      }
      
      );
    }catch(error){
      console.log(error);

    }

  },

  doPatchEditProfile : async(req,res)=>{
    try{
      const id = req.params.id;
      const formData = req.body;
      console.log(formData);
      await userModel.updateOne({_id : id },{$set :{
        firstname : formData.firstname !== '' ? formData.firstname : undefined,
        lastname : formData.lastname !== '' ? formData.lastname : undefined,
        email : formData.email !== '' ? formData.email : undefined,
        phone : formData.phone !== '' ? formData.phone : undefined
      }});
      res.redirect(`/userProfile/${id}`);
    }catch(error){
      console.log(error);
    }

  }



}