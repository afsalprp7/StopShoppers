const productModel = require("../models/productModel");

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

  res.render('users/productDetailPage',{title : 'Product Detail' ,product : productInfo,allProducts : allProducts});
}

}