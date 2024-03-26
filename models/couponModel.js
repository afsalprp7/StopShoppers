const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  eligibleCategory :[{
    type: mongoose.Schema.Types.ObjectId,
    required : true
  }],
  isDeleted :{
    type : Boolean,
    required : true,
    default : false
  }
});

const couponModel = new mongoose.model('coupons', couponSchema);

module.exports = couponModel;
