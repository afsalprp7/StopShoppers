const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({

  offerName : {
    type : String,
    required : true 
  },

  offerValue :{
    type : Number,
  },

  categories :{
    type : [mongoose.Schema.Types.ObjectId],
    required : true
  },

  expiryDate :{
    type : Date,
    require : true
  },
  
  isDeleted :{
    type : Boolean,
    required : true,
    default : false
  },
  status :{
    type : String,
    required : true
  }

});

const offerModel = new mongoose.model('offers',offerSchema);

module.exports = offerModel;