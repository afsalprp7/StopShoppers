const mongoose = require('mongoose');


const wishlistSchema = new mongoose.Schema({
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  },

  productDetails :[{
    productId :{
      type : mongoose.Schema.Types.ObjectId,
      required : true
    } 
  }]


});

const wishlistModel = new mongoose.model('wishlists',wishlistSchema);

module.exports = wishlistModel;