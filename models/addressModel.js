const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

firstname : {
  type : String,
  required : true,
},
lastname : {
  type : String,
  required : true,
},
address : {
  type : String,
  required : true,
},
state : {
  type : String,
  required : true,
},
district : {
  type : String,
  required : true,
},
city : {
  type : String,
  required : true,
},
locality : {
  type : String,
  required : true,
},
postalcode : {
  type : Number,
  required : true,
},

 phone : {
  type : Number,
  required : true,
},


});




const addressModel = new mongoose.model('address',addressSchema);


module.exports = addressModel;