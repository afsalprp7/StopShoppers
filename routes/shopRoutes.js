
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
router.post('/addAddress/:id',validateUser,shopController.doAddAddress);
router.get('/editAddress/:id',validateUser,shopController.getEditAddress);
router.patch('/editAddress/:id',validateUser,shopController.doEditAddress);
router.delete('/deleteAddress/:id',validateUser,shopController.doDeleteAddress);
router.patch('/setPrimary/:id',validateUser,shopController.setAsPrimary);


router.get('/editProfile/:id',validateUser,shopController.getEditProfilePage);
router.patch('/editProfile/:id',validateUser,shopController.doPatchEditProfile);

router.post('/searchProduct',shopController.searchProductHome);
router.post('/searchFromShopPage',validateUser,shopController.searchProductHome);




router.get('/shopPage',validateUser,checkExpiryOffer,shopController.getShopPage);
router.get('/userLogout',validateUser,shopController.userLogout);
router.get('/cartPage',validateUser,checkExpiryOffer,shopController.getCartPage);
router.post('/addToCart/:id',validateUser,shopController.AddToCart);
router.post('/updateCartQuantity/:productId/:userId',validateUser,shopController.cartUpdateFetch);
router.post('/removeFromCart/:id',validateUser,shopController.removeFromCart);




router.get('/checkoutPage',validateUser,shopController.getCheckoutPage);
router.post('/addAddressCheckout/:id',validateUser,shopController.doAddAddressCheckout);
router.get('/checkoutDirect/:id',validateUser,shopController.checkoutDirectFromDetailPage);
router.get('/checkoutFromCart/:id',validateUser,shopController.checkoutFromCart);
router.post('/placeOrder/:id',validateUser,shopController.doPlaceOrder);


router.get('/orderDetails/:id',validateUser,shopController.getOrderDetailpage);



router.post('/filterCategory',validateUser,shopController.filterCategory);

router.get('/confirmOrder/:id',validateUser,shopController.getOrderConfirmationPage);
router.get('/myOrders/:id',validateUser,shopController.getUserMyOrders);

router.patch('/cancelOrder/:id',validateUser,shopController.orderCancelationRequest);

router.get('/wishlist',validateUser,checkExpiryOffer,shopController.getWishlistPage);
router.post('/addToWishlist/:id',validateUser,shopController.addToWishlist);
router.patch('/removeFromWishlist/:id',validateUser,shopController.removeFromWishlist);
router.post('/createOrderRzp',validateUser,shopController.createOrderRzp);
router.patch('/verifyOrderRzp/:id',validateUser,shopController.razorpayVerifyPaymentAndUpdateOrder)

router.get('/myWallet/:id',validateUser,shopController.getUserWallet);

router.post('/createOrderRzpFromWallet',validateUser,shopController.createOrderRzp)
router.patch('/addMoneyToWallet/:id',validateUser,shopController.addMoneyToWallet);

router.post('/applyCoupon/:id',validateUser,shopController.applyCoupon);

router.get('/offers',shopController.getOfferPage);
router.post('/createOrderInFailure/:id',validateUser,shopController.createOrderInPaymentFailure);

router.post('/createOrderFromOrderDetail',validateUser,shopController.createOrderRzp);
router.patch('/updateOrderFromOrderDetail/:id',validateUser,shopController.updateOrderFromOrderDetailPage);

router.get('/downloadInvoiceAsPdf/:id',validateUser,shopController.downloadInvoiceAsPdf);


router.patch('/cancelProductIndividually',validateUser,shopController.cancelProductIndividually)

module.exports = router;
