const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const categorySchema = new Schema({
  categoryName: { 
    type: String, 
    required: true 
  },

  image: { 
    type: String, 
    required: true 
  },
isDeleted : {
  type : Boolean
},
salesCount :{
  type : Number
}
});

const categoryModel = new mongoose.model('Category', categorySchema);

module.exports =  categoryModel;