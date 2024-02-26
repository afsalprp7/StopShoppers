
const express = require('express');
const router= express.Router();
const shopController = require('../controller/shopController');
const {validateUser} = require('../middleware/authMiddleware');



router.get('/',validateUser,shopController.getHomePage);
router.get('/productDetail/:id',shopController.getProductDetailpage);


module.exports = router;
