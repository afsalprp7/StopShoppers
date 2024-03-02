
const express = require('express');
const router= express.Router();
const shopController = require('../controller/shopController');
const {validateUser} = require('../middleware/authMiddleware');



router.get('/',validateUser,shopController.getHomePage);
router.get('/productDetail/:id',shopController.getProductDetailpage);

router.get('/userProfile/:id',shopController.getUserProfilePage);


router.get('/addAddress/:id',shopController.getAddAddressPage);
router.post('/addAddress/:id',shopController.doAddAddress);
router.get('/editAddress/:id',shopController.getEditAddress);
router.patch('/editAddress/:id',shopController.doEditAddress);



router.get('/editProfile/:id',shopController.getEditProfilePage);
router.patch('/editProfile/:id',shopController.doPatchEditProfile);


module.exports = router;
