const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
 
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  orderId :{
    type : String,
    required : true
  },

  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  },


  productsDetails :[{
    productId :{
      type :  mongoose.Schema.Types.ObjectId,
      required : true
    },


    quantity : {
      type : Number,
      required : true
    },


    size :{
      type : String,
      required :true

    }
  }],

    paymentDetails :{
      method : {
        type : String,
        required : true
      },
      paymentId : {
        type : String
      },
      orderId : {
        type : String
      }
    },

    grandTotal : {
      type : Number,
      required : true
    },

    totalQuantity : {
      type : Number,
      required : true
    },


  cancellationReason: {
    type: String,
    
     
  },

  orderedAt : {
    type : Date,
    required : true,
   
  },


  updatedAt : {
    type : Date,
    required : true,
    
  },

  isCanceled :{
    type : Boolean,
    default : false
  },

  cancelRequested : {
    type : Boolean,
    default : false
  },

  cancelRequestDeclined :{
    type : Boolean,
    default :false

  },

 declineRequestReason :{
  type : String,
  default : null
 },

  walletMoney :{
    type : Number,
    required : true,
    default : 0
  },
  couponDiscount :{
    type : Number,
  }
});

  


const orderModel = new mongoose.model('orders',orderSchema);

module.exports = orderModel;