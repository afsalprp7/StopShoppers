
const productModel = require('../models/productModel');
const offerModel = require('../models/offerModel');




const updateExpiredOffers = async (req, res, next) => {
  try {
      const currentDate = new Date();
      const Offers = await offerModel.find({isDeleted : false , expiryDate : {$lte : currentDate}});
      const catIds = Offers.map(offer => offer.categories).flat();

    if(Offers){
      for(let offer of Offers){
        offer.status = 'Expired';
        await offer.save();
      }
    }
    const products = await productModel.find({isDeleted : false ,category :{$in : catIds},offer:{$exists : true}});
      
      if(products){
        for (let item of products) {
          if (item.offer) {
            const actualAmount = Number(item.offer.actualAmount);
            item.productPrice = actualAmount;
  
              item.set('offer', undefined, { strict: false });
  
            await item.save();
          }
        }
        
      }
      next();
  } catch (error) {
      console.error('Error updating expired offers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = updateExpiredOffers;