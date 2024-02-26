

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

  firstname: {
    type:String,
    required:true
  },

  lastname : {
    type : String,
    required:true
  },

  email: {
    type : String,
    require : true,
    unique : true
  },

  password: {
    type:String,
    require:true,
  },

  phone : {
    type:Number,
    required:true
  },

  is_blocked: {
    type:Boolean,
    require:true,
  },


  address_id:[{
    type : mongoose.Schema.Types.ObjectId,
  }],

  cart_id:{
    type : mongoose.Schema.Types.ObjectId ,
  },
  
  wishlist_id:{
    type : mongoose.Schema.Types.ObjectId ,
  },
  
});

const otSchema = new mongoose.Schema({
  otp_id :{
    

  },

  otpNumber : {
    
  }
})

const userModel = new mongoose.model('Users',userSchema); //collection name and schema.

module.exports = userModel;