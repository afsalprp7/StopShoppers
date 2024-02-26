const mongoose = require('mongoose');
require('dotenv').config();


async function connectToDatabase(){
  try{
    const databaseURL = process.env.DB_URL;
    await mongoose.connect(databaseURL);
    console.log('Database connected');
  }catch (error){
    console.log(error);
  }
}

module.exports = connectToDatabase();
