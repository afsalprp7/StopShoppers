const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({





});




const addressModel = new mongoose.model('address',addressSchema);


module.exports = addressModel;