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
    type : [mongoose.Schema.Types.ObjectId]
  },

  products : {
    type : [mongoose.Schema.Types.ObjectId] 
  }



});

const offerModel = new mongoose.model('offers',offerSchema);

module.exports = offerModel;