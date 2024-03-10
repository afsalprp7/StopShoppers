const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({

  productName : {
    type:String,
    required:true
  },
  description : {
    type:String,
    required:true
  },
  category:{
    type : mongoose.Schema.Types.ObjectId,
    required:true
  },

  color: { 
    type: String, 
    required: true 
   },

   sizes: {
    type: Array, 
    required: true 
   },
  
   quantity: { type: Number, 
    required: true 
  },

  productPrice: { 
    type: Number, 
    required: true 
  },

  userType: { 
    type: String,
     required: true 
    },

  image : {
    type: Array, 
    required : true ,
    
  },
     
  isDeleted : {
      type : Boolean,
      default : false
    }
});


const productModel = new mongoose.model('products',productSchema);

module.exports = productModel;