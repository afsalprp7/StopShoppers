
const express = require('express');
const router= express.Router();
const shopController = require('../controller/shopController');
const {validateUser} = require('../middleware/authMiddleware');


router.get('/',shopController.getHomePage);
router.get('/home',validateUser,shopController.getHomePage);
router.get('/productDetail/:id',shopController.getProductDetailpage);

router.get('/userProfile/:id',shopController.getUserProfilePage);


router.get('/addAddress/:id',validateUser,shopController.getAddAddressPage);
router.post('/addAddress/:id',shopController.doAddAddress);
router.get('/editAddress/:id',validateUser,shopController.getEditAddress);
router.patch('/editAddress/:id',shopController.doEditAddress);
router.delete('/deleteAddress/:id',validateUser,shopController.doDeleteAddress);
router.patch('/setPrimary/:id',shopController.setAsPrimary);


router.get('/editProfile/:id',validateUser,shopController.getEditProfilePage);
router.patch('/editProfile/:id',shopController.doPatchEditProfile);

router.post('/searchProduct',shopController.searchProductHome);




router.get('/shopPage',shopController.getShopPage);
router.get('/userLogout',shopController.userLogout);
router.get('/cartPage',shopController.getCartPage);
router.post('/addToCart/:id',shopController.AddToCart);
router.post('/updateCartQuantity/:productId/:userId',shopController.cartUpdateFetch);
router.post('/removeFromCart/:id',shopController.removeFromCart)
module.exports = router;
