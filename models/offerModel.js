const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({

});

const offerModel = new mongoose.model('offers',offerSchema);

module.exports = offerModel;