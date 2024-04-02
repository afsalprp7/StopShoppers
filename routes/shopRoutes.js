
const express = require('express');
const router= express.Router();
const shopController = require('../controller/shopController');
const {validateUser} = require('../middleware/authMiddleware');
const checkExpiryOffer = require('../middleware/offerValidtyMiddleware');

router.get('/',shopController.getHomePage);
router.get('/home',validateUser,checkExpiryOffer,shopController.getHomePage);
router.get('/productDetail/:id',checkExpiryOffer,shopController.getProductDetailpage);

router.get('/userProfile/:id',validateUser,shopController.getUserProfilePage);


router.get('/addAddress/:id',validateUser,shopController.getAddAddressPage);
router.post('/addAddress/:id',shopController.doAddAddress);
router.get('/editAddress/:id',validateUser,shopController.getEditAddress);
router.patch('/editAddress/:id',shopController.doEditAddress);
router.delete('/deleteAddress/:id',validateUser,shopController.doDeleteAddress);
router.patch('/setPrimary/:id',shopController.setAsPrimary);


router.get('/editProfile/:id',validateUser,shopController.getEditProfilePage);
router.patch('/editProfile/:id',shopController.doPatchEditProfile);

router.post('/searchProduct',shopController.searchProductHome);
router.post('/searchFromShopPage',shopController.searchProductHome);




router.get('/shopPage',validateUser,checkExpiryOffer,shopController.getShopPage);
router.get('/userLogout',validateUser,shopController.userLogout);
router.get('/cartPage',validateUser,checkExpiryOffer,shopController.getCartPage);
router.post('/addToCart/:id',shopController.AddToCart);
router.post('/updateCartQuantity/:productId/:userId',shopController.cartUpdateFetch);
router.post('/removeFromCart/:id',shopController.removeFromCart);




router.get('/checkoutPage',validateUser,shopController.getCheckoutPage);
router.post('/addAddressCheckout/:id',shopController.doAddAddressCheckout);
router.get('/checkoutDirect/:id',validateUser,shopController.checkoutDirectFromDetailPage);
router.get('/checkoutFromCart/:id',validateUser,shopController.checkoutFromCart);
router.post('/placeOrder/:id',shopController.doPlaceOrder);


router.get('/orderDetails/:id',validateUser,shopController.getOrderDetailpage);



router.post('/filterCategory',shopController.filterCategory);

router.get('/confirmOrder/:id',validateUser,shopController.getOrderConfirmationPage);
router.get('/myOrders/:id',validateUser,shopController.getUserMyOrders);

router.patch('/cancelOrder/:id',validateUser,shopController.orderCancelationRequest);

router.get('/wishlist/:id',validateUser,checkExpiryOffer,shopController.getWishlistPage);
router.post('/addToWishlist/:id',validateUser,shopController.addToWishlist);
router.patch('/removeFromWishlist/:id',validateUser,shopController.removeFromWishlist);
router.post('/createOrderRzp',validateUser,shopController.createOrderRzp);
router.patch('/verifyOrderRzp/:id',validateUser,shopController.razorpayVerifyPaymentAndUpdateOrder)

router.get('/myWallet/:id',validateUser,shopController.getUserWallet);

router.post('/createOrderRzpFromWallet',validateUser,shopController.createOrderRzp)
router.patch('/addMoneyToWallet/:id',validateUser,shopController.addMoneyToWallet);

router.post('/applyCoupon/:id',validateUser,shopController.applyCoupon);

router.get('/offers',shopController.getOfferPage);

module.exports = router;
