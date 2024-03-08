
const express = require('express');
const router= express.Router();
const shopController = require('../controller/shopController');
const {validateUser} = require('../middleware/authMiddleware');


router.get('/',shopController.getLandingPage);
router.get('/home',validateUser,shopController.getHomePage);
router.get('/productDetail/:id',shopController.getProductDetailpage);

router.get('/userProfile/:id',shopController.getUserProfilePage);


router.get('/addAddress/:id',shopController.getAddAddressPage);
router.post('/addAddress/:id',shopController.doAddAddress);
router.get('/editAddress/:id',shopController.getEditAddress);
router.patch('/editAddress/:id',shopController.doEditAddress);
router.delete('/deleteAddress/:id',shopController.doDeleteAddress);
router.patch('/setPrimary/:id',shopController.setAsPrimary);


router.get('/editProfile/:id',shopController.getEditProfilePage);
router.patch('/editProfile/:id',shopController.doPatchEditProfile);

router.post('/searchProduct',shopController.searchProductHome);




router.get('/shopPage',shopController.getShopPage);
router.get('/userLogout',shopController.userLogout);
router.get('/cartPage',shopController.getCartPage);
router.post('/addToCart/:id',shopController.AddToCartpage);
module.exports = router;
